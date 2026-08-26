import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { createCartWorkflow, updateCartWorkflow } from "@medusajs/medusa/core-flows"
import { z } from "zod"
import { BULK_ORDER } from "../../../../../modules/bulk-order"
import type BulkOrderService from "../../../../../modules/bulk-order/service"
import { CORPORATE_ACCOUNT } from "../../../../../modules/corporate-account"
import type CorporateService from "../../../../../modules/corporate-account/service"
import { TROPHY_CUSTOMIZATION } from "../../../../../modules/trophy-customization"
import type DesignService from "../../../../../modules/trophy-customization/service"
import { PreviewGenerationService } from "../../../../../modules/trophy-customization/preview-generation"
import { getActorId } from "../../../../../lib/auth-context"
import { buildBulkLineDesignState } from "../../../../../lib/bulk-design"

const ConfirmSchema = z.object({
  payment_terms: z.enum(["prepaid", "net_30", "net_60"]).optional().default("prepaid"),
})

/**
 * POST /store/bulk-orders/:id/confirm — generate a Design (+ preview) per valid
 * line and convert them into cart line items (API 05.2). Fails with 409 if any
 * line still has validation errors. Net-terms carts are stamped with corporate
 * metadata and gated by verification + credit limit (FR-BULK-5/6).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const bulkService = req.scope.resolve<BulkOrderService>(BULK_ORDER)
  const designService = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)

  const bulk_order = await bulkService.retrieveBulkOrder(req.params.id).catch(() => null)
  if (!bulk_order) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Bulk order not found." } })
  }
  const customerId = getActorId(req)
  if (bulk_order.customer_id !== customerId) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not the owner." } })
  }

  const parsed = ConfirmSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid confirm payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }
  const paymentTerms = parsed.data.payment_terms

  let netTerms = false
  if (paymentTerms !== "prepaid") {
    if (!bulk_order.corporate_profile_id) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Net terms require a corporate profile on the bulk order.",
        },
      })
    }
    const corporate = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
    const termsCheck = await corporate.canUsePaymentTerms(
      bulk_order.corporate_profile_id,
      paymentTerms
    )
    if (!termsCheck.ok) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: termsCheck.reason },
      })
    }
    netTerms = true
  }

  if (bulk_order.status === "confirmed") {
    return res.json({
      cart_id: bulk_order.cart_id,
      line_item_ids: [],
      payment_terms: paymentTerms,
      net_terms: netTerms,
    })
  }

  const lines = await bulkService.listBulkOrderLines(
    { bulk_order_id: bulk_order.id },
    { order: { row_number: "ASC" } }
  )
  const invalid = lines.filter(
    (l) => Array.isArray(l.validation_errors) && l.validation_errors.length > 0
  )
  if (invalid.length > 0) {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: `${invalid.length} row(s) still have validation errors. Fix them before confirming.`,
      },
    })
  }
  if (lines.length === 0) {
    return res.status(409).json({ error: { code: "CONFLICT", message: "No rows to confirm." } })
  }

  if (netTerms && bulk_order.corporate_profile_id) {
    const corporate = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
    let estimate = 0
    if (bulk_order.variant_id) {
      const productModule = req.scope.resolve(Modules.PRODUCT)
      const variant = await productModule
        .retrieveProductVariant(bulk_order.variant_id, { relations: ["prices"] })
        .catch(() => null)
      const amounts = ((variant as { prices?: Array<{ currency_code: string; amount: number }> } | null)
        ?.prices ?? [])
        .filter((p) => p.currency_code === "inr")
        .map((p) => p.amount)
      const unit = amounts.length ? Math.min(...amounts) : 0
      estimate = unit * lines.length
    }
    const credit = await corporate.assertWithinCreditLimit(
      bulk_order.corporate_profile_id,
      estimate
    )
    if (!credit.ok) {
      return res.status(403).json({
        error: { code: "CREDIT_LIMIT_EXCEEDED", message: credit.reason },
      })
    }
  }

  const previews = new PreviewGenerationService()

  // 1) Generate a design + preview per line.
  for (const line of lines) {
    const state = buildBulkLineDesignState({
      name: line.name,
      designation: line.designation,
      award_category: line.award_category,
    })
    const design = await designService.createDesigns({
      customer_id: customerId,
      name: `${bulk_order.po_number ?? "Bulk"} — ${line.name}`,
      mode: "2d",
      product_id: bulk_order.product_id,
      variant_id: bulk_order.variant_id,
      state_json: state as unknown as Record<string, unknown>,
      status: "draft",
      is_template: false,
    })

    let previewUrl: string | null = null
    try {
      const rendered = await previews.renderDesign2D(state, { width: 400 })
      if ("dataUrl" in rendered) {
        previewUrl = rendered.dataUrl
      } else {
        const fileModule = req.scope.resolve(Modules.FILE)
        const [file] = await fileModule.createFiles([
          {
            filename: `bulk-${design.id}.png`,
            mimeType: rendered.contentType,
            content: rendered.buffer.toString("binary"),
          },
        ])
        previewUrl = file.url
      }
      await designService.updateDesigns({ id: design.id, preview_url: previewUrl })
    } catch {
      // preview is best-effort
    }

    await bulkService.updateBulkOrderLines({
      id: line.id,
      design_id: design.id,
      preview_url: previewUrl,
    })
  }

  // 2) Build a cart with one line item per recipient (referencing the design).
  let cartId: string | null = bulk_order.cart_id ?? null
  const lineItemIds: string[] = []
  let cartTotal = 0
  try {
    const regionModule = req.scope.resolve(Modules.REGION)
    const regions = await regionModule.listRegions({}, { take: 20 })
    const regionId =
      regions.find((r) => r.currency_code === "inr")?.id ?? regions[0]?.id

    if (bulk_order.variant_id && regionId) {
      const refreshed = await bulkService.listBulkOrderLines({ bulk_order_id: bulk_order.id })
      const cartMetadata: Record<string, unknown> = {
        bulk_order_id: bulk_order.id,
        po_number: bulk_order.po_number,
        payment_terms: paymentTerms,
        net_terms: netTerms,
      }
      if (bulk_order.corporate_profile_id) {
        cartMetadata.corporate_profile_id = bulk_order.corporate_profile_id
      }

      const { result } = await createCartWorkflow(req.scope).run({
        input: {
          region_id: regionId,
          customer_id: customerId ?? undefined,
          metadata: cartMetadata,
          items: refreshed.map((l) => ({
            variant_id: bulk_order.variant_id as string,
            quantity: 1,
            metadata: {
              design_id: l.design_id,
              design_name: l.name,
              bulk_order_id: bulk_order.id,
            },
          })),
        },
      })
      cartId = result.id
      cartTotal = Number(result.total ?? 0)
      for (const item of result.items ?? []) lineItemIds.push(item.id)

      // Ensure metadata sticks even if create workflow drops custom fields.
      await updateCartWorkflow(req.scope).run({
        input: { id: result.id, metadata: cartMetadata },
      })
    }
  } catch (e) {
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: `Could not assemble cart: ${(e as Error).message}`,
      },
    })
  }

  if (!cartId) {
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Cart could not be created for this bulk order." },
    })
  }

  if (netTerms && bulk_order.corporate_profile_id && cartId) {
    const corporate = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
    const credit = await corporate.assertWithinCreditLimit(
      bulk_order.corporate_profile_id,
      cartTotal
    )
    if (!credit.ok) {
      return res.status(403).json({
        error: { code: "CREDIT_LIMIT_EXCEEDED", message: credit.reason },
      })
    }
  }

  await bulkService.updateBulkOrders({
    id: bulk_order.id,
    status: "confirmed",
    cart_id: cartId,
  })

  res.json({
    cart_id: cartId,
    line_item_ids: lineItemIds,
    payment_terms: paymentTerms,
    net_terms: netTerms,
  })
}

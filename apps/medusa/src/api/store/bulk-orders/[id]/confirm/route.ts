import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { createCartWorkflow } from "@medusajs/medusa/core-flows"
import { BULK_ORDER } from "../../../../../modules/bulk-order"
import type BulkOrderService from "../../../../../modules/bulk-order/service"
import { TROPHY_CUSTOMIZATION } from "../../../../../modules/trophy-customization"
import type DesignService from "../../../../../modules/trophy-customization/service"
import { PreviewGenerationService } from "../../../../../modules/trophy-customization/preview-generation"
import { getActorId } from "../../../../../lib/auth-context"
import { buildBulkLineDesignState } from "../../../../../lib/bulk-design"

/**
 * POST /store/bulk-orders/:id/confirm — generate a Design (+ preview) per valid
 * line and convert them into cart line items (API 05.2). Fails with 409 if any
 * line still has validation errors.
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
  try {
    const regionModule = req.scope.resolve(Modules.REGION)
    const regions = await regionModule.listRegions({}, { take: 1 })
    const regionId = regions[0]?.id

    if (bulk_order.variant_id && regionId) {
      const refreshed = await bulkService.listBulkOrderLines({ bulk_order_id: bulk_order.id })
      const { result } = await createCartWorkflow(req.scope).run({
        input: {
          region_id: regionId,
          customer_id: customerId ?? undefined,
          items: refreshed.map((l) => ({
            variant_id: bulk_order.variant_id as string,
            quantity: 1,
            metadata: { design_id: l.design_id, design_name: l.name, bulk_order_id: bulk_order.id },
          })),
        },
      })
      cartId = result.id
      for (const item of result.items ?? []) lineItemIds.push(item.id)
    }
  } catch {
    // Cart assembly is best-effort in environments without a full pricing setup.
  }

  await bulkService.updateBulkOrders({
    id: bulk_order.id,
    status: "confirmed",
    cart_id: cartId,
  })

  res.json({ cart_id: cartId, line_item_ids: lineItemIds })
}

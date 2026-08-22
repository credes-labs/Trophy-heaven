import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { BULK_ORDER } from "../../../modules/bulk-order"
import type BulkOrderService from "../../../modules/bulk-order/service"
import { CORPORATE_ACCOUNT } from "../../../modules/corporate-account"
import type CorporateService from "../../../modules/corporate-account/service"
import { getActorId } from "../../../lib/auth-context"

const CreateBulkOrderSchema = z.object({
  product_id: z.string().min(1),
  variant_id: z.string().optional(),
  po_number: z.string().max(60).optional(),
  corporate_profile_id: z.string().optional(),
})

/** POST /store/bulk-orders — create an empty bulk order (API 05.2). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }
  const parsed = CreateBulkOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid bulk order payload.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }

  const corporateProfileId = parsed.data.corporate_profile_id ?? null
  if (corporateProfileId) {
    const corporate = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
    const profile = await corporate.retrieveCorporateProfile(corporateProfileId).catch(() => null)
    if (!profile) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Corporate profile not found." },
      })
    }
    const members = await corporate.listTeamMembers({
      corporate_profile_id: corporateProfileId,
      customer_id: customerId,
      status: "active",
    })
    const isOwner = profile.customer_id === customerId
    if (!isOwner && members.length === 0) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Not a member of this corporate account." },
      })
    }
  }

  const service = req.scope.resolve<BulkOrderService>(BULK_ORDER)
  const bulk_order = await service.createBulkOrders({
    customer_id: customerId,
    product_id: parsed.data.product_id,
    variant_id: parsed.data.variant_id ?? null,
    po_number: parsed.data.po_number ?? null,
    corporate_profile_id: corporateProfileId,
    status: "draft",
    total_items: 0,
  })

  res.status(201).json({ bulk_order })
}

/** GET /store/bulk-orders — list the caller's bulk orders. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = getActorId(req)
  if (!customerId) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in required." } })
  }
  const service = req.scope.resolve<BulkOrderService>(BULK_ORDER)
  const [bulk_orders, count] = await service.listAndCountBulkOrders(
    { customer_id: customerId },
    { order: { created_at: "DESC" }, take: 50 }
  )
  res.json({ bulk_orders, count })
}

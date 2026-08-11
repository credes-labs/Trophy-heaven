import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { getActorId } from "../../../../../lib/auth-context"
import { evaluateReturnEligibility } from "../../../../../lib/returns-policy"

/**
 * GET /store/orders/:id/return-eligibility — per-line RMA eligibility under the
 * returns policy (custom = non-returnable; standard = 7-day window) (FR-RET-1).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderModule = req.scope.resolve(Modules.ORDER)
  const order = await orderModule
    .retrieveOrder(req.params.id, { relations: ["items", "fulfillments"] })
    .catch(() => null)
  if (!order) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found." } })
  }

  const customerId = getActorId(req)
  if (order.customer_id && order.customer_id !== customerId) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not your order." } })
  }

  const lines = (order.items ?? []).map((i) => ({
    line_item_id: i.id,
    title: i.title,
    is_custom: Boolean((i.metadata as Record<string, unknown> | undefined)?.design_id),
  }))

  const fulfillments = (order as unknown as { fulfillments?: { delivered_at?: string | Date | null }[] })
    .fulfillments
  const deliveredRaw = fulfillments?.find((f) => f.delivered_at)?.delivered_at ?? null
  const deliveredAt = deliveredRaw ? new Date(deliveredRaw) : null

  const eligibility = evaluateReturnEligibility(lines, deliveredAt)
  res.json({ order_id: order.id, ...eligibility })
}

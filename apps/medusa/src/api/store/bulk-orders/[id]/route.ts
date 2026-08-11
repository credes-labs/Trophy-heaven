import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BULK_ORDER } from "../../../../modules/bulk-order"
import type BulkOrderService from "../../../../modules/bulk-order/service"
import { getActorId } from "../../../../lib/auth-context"

/** GET /store/bulk-orders/:id — details + parsed lines (API 05.2). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BulkOrderService>(BULK_ORDER)
  const bulk_order = await service.retrieveBulkOrder(req.params.id).catch(() => null)
  if (!bulk_order) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Bulk order not found." } })
  }
  if (bulk_order.customer_id !== getActorId(req)) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not the owner." } })
  }
  const lines = await service.listBulkOrderLines(
    { bulk_order_id: bulk_order.id },
    { order: { row_number: "ASC" } }
  )
  res.json({ bulk_order, lines })
}

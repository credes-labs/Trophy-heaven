import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { BULK_ORDER } from "../../../../../modules/bulk-order"
import type BulkOrderService from "../../../../../modules/bulk-order/service"
import { getActorId } from "../../../../../lib/auth-context"
import { MAX_BULK_ROWS } from "../../../../../lib/bulk-validation"

const UploadSchema = z.object({
  // The client parses the spreadsheet with SheetJS and posts rows as JSON; the
  // server re-parses + re-validates so trust never rests on the client (API 05.2).
  rows: z
    .array(
      z.object({
        name: z.unknown().optional(),
        designation: z.unknown().optional(),
        award_category: z.unknown().optional(),
      })
    )
    .max(MAX_BULK_ROWS),
  upload_file_url: z.string().url().optional(),
})

/** POST /store/bulk-orders/:id/upload — re-validate uploaded rows (API 05.2). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BulkOrderService>(BULK_ORDER)
  const bulk_order = await service.retrieveBulkOrder(req.params.id).catch(() => null)
  if (!bulk_order) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Bulk order not found." } })
  }
  if (bulk_order.customer_id !== getActorId(req)) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not the owner." } })
  }

  const parsed = UploadSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({
      error: {
        code: "UNPROCESSABLE",
        message: "Could not read the uploaded rows.",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
      },
    })
  }
  if (parsed.data.rows.length > MAX_BULK_ROWS) {
    return res.status(413).json({
      error: { code: "PAYLOAD_TOO_LARGE", message: `Max ${MAX_BULK_ROWS} rows per upload.` },
    })
  }

  if (parsed.data.upload_file_url) {
    await service.updateBulkOrders({ id: bulk_order.id, upload_file_url: parsed.data.upload_file_url })
  }

  const result = await service.replaceLines(bulk_order.id, parsed.data.rows)
  const lines = await service.listBulkOrderLines(
    { bulk_order_id: bulk_order.id },
    { order: { row_number: "ASC" } }
  )

  res.json({
    parsed: { total: result.total, valid: result.valid, invalid: result.invalid },
    lines,
    errors: result.errors,
  })
}

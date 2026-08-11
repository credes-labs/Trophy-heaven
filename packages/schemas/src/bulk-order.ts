import { z } from "zod"
import { zId, zTimestamps } from "./shared.js"

/** An uploaded bulk order (see docs/kit/06 §6.6). */
export const BulkOrderSchema = z
  .object({
    id: zId,
    customer_id: zId,
    product_id: zId,
    variant_id: zId.nullable(),
    po_number: z.string().nullable(),
    upload_file_url: z.string().url().nullable(),
    status: z
      .enum(["draft", "uploaded", "validated", "confirmed", "cancelled"])
      .default("draft"),
    total_items: z.number().int().nonnegative().default(0),
  })
  .merge(zTimestamps)
export type BulkOrder = z.infer<typeof BulkOrderSchema>

/** One recipient row within a bulk order (see docs/kit/06 §6.6). */
export const BulkOrderLineSchema = z.object({
  id: zId,
  bulk_order_id: zId,
  row_number: z.number().int().positive(),
  name: z.string().min(1),
  designation: z.string().nullable(),
  award_category: z.string().nullable(),
  design_id: zId.nullable(), // set after generation
  order_id: zId.nullable(), // set after checkout
  validation_errors: z
    .array(
      z.object({
        field: z.string(),
        issue: z.string(),
      })
    )
    .default([]),
})
export type BulkOrderLine = z.infer<typeof BulkOrderLineSchema>

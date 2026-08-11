import { z } from "zod"
import { zId, zTimestamps } from "./shared.js"

/** Production job lifecycle (see docs/kit/06 §6.4). */
export const ProductionJobStatus = z.enum([
  "pending_design_approval",
  "design_approved",
  "queued",
  "in_production",
  "quality_check",
  "packed",
  "completed",
  "on_hold",
  "cancelled",
])
export type ProductionJobStatus = z.infer<typeof ProductionJobStatus>

/** A fulfillment task created per custom line item, routed by complexity + material. */
export const ProductionJobSchema = z
  .object({
    id: zId,
    order_id: zId,
    order_line_item_id: zId,
    design_id: zId,
    status: ProductionJobStatus.default("pending_design_approval"),
    complexity: z.enum(["simple", "medium", "complex"]),
    material: z.string(), // routing key
    assigned_workshop: z.string().nullable(),
    estimated_completion: z.string().datetime().nullable(),
    started_at: z.string().datetime().nullable(),
    completed_at: z.string().datetime().nullable(),
    notes: z
      .array(
        z.object({
          author_id: zId,
          body: z.string(),
          at: z.string().datetime(),
        })
      )
      .default([]),
  })
  .merge(zTimestamps)
export type ProductionJob = z.infer<typeof ProductionJobSchema>

import { z } from "zod"
import { zId, zTimestamps } from "./shared.js"

/** A review record + feedback for a submitted design (see docs/kit/06 §6.5). */
export const DesignApprovalSchema = z
  .object({
    id: zId,
    design_id: zId,
    reviewer_id: zId.nullable(),
    status: z.enum(["pending", "approved", "rejected", "changes_requested"]).default("pending"),
    feedback: z.string().nullable(), // required when rejected/changes_requested
    annotated_image_url: z.string().url().nullable(),
    resolved_at: z.string().datetime().nullable(),
  })
  .merge(zTimestamps)
export type DesignApproval = z.infer<typeof DesignApprovalSchema>

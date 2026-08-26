import { z } from "zod"
import { zId, zTimestamps } from "./shared.js"

/** Design lifecycle status (see docs/kit/06 §6.1 and FR-DESIGN-5). */
export const DesignStatus = z.enum([
  "draft",
  "submitted_for_review",
  "changes_requested",
  "approved",
  "rejected_with_feedback",
])
export type DesignStatus = z.infer<typeof DesignStatus>

/**
 * A saved 2D/3D design. `state_json` is validated by Design2DState / Design3DState
 * (or the DesignEnvelope when a design has been edited in both modes).
 */
export const DesignSchema = z
  .object({
    id: zId,
    customer_id: zId.nullable(), // null = guest/session-owned
    name: z.string().min(1).max(120),
    mode: z.enum(["2d", "3d"]),
    product_id: zId,
    variant_id: zId.nullable(),
    state_json: z.unknown(), // validated by Design2DState / Design3DState (§6.7/§6.8)
    preview_url: z.string().url().nullable(),
    status: DesignStatus.default("draft"),
    is_template: z.boolean().default(false),
    share_token: z.string().nullable(),
    owner_token: z.string().nullable().optional(),
    complexity: z.enum(["simple", "medium", "complex"]).nullable(),
  })
  .merge(zTimestamps)
export type Design = z.infer<typeof DesignSchema>

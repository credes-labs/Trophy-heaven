import { z } from "zod"
import { zId, zTimestamps } from "./shared.js"

/** A template a customer can clone and modify (see docs/kit/06 §6.2). */
export const DesignPresetSchema = z
  .object({
    id: zId,
    name: z.string().min(1).max(120),
    category: z.string(), // e.g. "sports", "corporate", "academic"
    occasion: z.string().nullable(),
    mode: z.enum(["2d", "3d", "both"]),
    base_product_id: zId, // product this preset customizes
    default_state_json: z.unknown(), // seed design state to clone
    preview_url: z.string().url(),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().default(0),
  })
  .merge(zTimestamps)
export type DesignPreset = z.infer<typeof DesignPresetSchema>

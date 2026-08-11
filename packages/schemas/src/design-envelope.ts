import { z } from "zod"
import { Design2DState, Material2D } from "./design-state-2d.js"
import { Design3DState, Material3D } from "./design-state-3d.js"

/**
 * When a design has been edited in both modes, `state_json` uses an envelope so
 * each mode's state is preserved and shared fields stay in sync (see docs/kit/14 §E).
 *
 * The `material` in `shared` uses the 3D material vocabulary as the canonical value;
 * the 2D<->3D sync mapping in the engine translates between Material2D and Material3D.
 */
export const DesignSharedFields = z.object({
  engravingText: z.string().optional(),
  logoUrl: z.string().url().optional(),
  material: z.union([Material2D, Material3D]).optional(),
})
export type DesignSharedFields = z.infer<typeof DesignSharedFields>

export const DesignEnvelope = z.object({
  shared: DesignSharedFields,
  "2d": Design2DState.optional(),
  "3d": Design3DState.optional(),
})
export type DesignEnvelope = z.infer<typeof DesignEnvelope>

/**
 * The full accepted shape of a design's `state_json`: either a single-mode 2D/3D
 * state, or the dual-mode envelope. Use this to validate on read/write.
 */
export const DesignStateJson = z.union([DesignEnvelope, Design2DState, Design3DState])
export type DesignStateJson = z.infer<typeof DesignStateJson>

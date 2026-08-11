import { z } from "zod"
import { zId } from "./shared.js"

/** Version-history snapshot of a design (see docs/kit/06 §6.3). */
export const DesignRevisionSchema = z.object({
  id: zId,
  design_id: zId,
  state_json: z.unknown(),
  revision_number: z.number().int().nonnegative(),
  created_by: zId.nullable(), // user or system (autosave)
  created_at: z.string().datetime(),
})
export type DesignRevision = z.infer<typeof DesignRevisionSchema>

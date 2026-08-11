import { z } from "zod"

/** A non-empty identifier. Custom entities use uuidv7() (Postgres 18) for time-ordered keys. */
export const zId = z.string().min(1)

/** created_at / updated_at ISO-8601 timestamps shared by most entities. */
export const zTimestamps = z.object({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

/** Design/production complexity, used for production routing + analytics tagging. */
export const Complexity = z.enum(["simple", "medium", "complex"])
export type Complexity = z.infer<typeof Complexity>

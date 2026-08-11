import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { TROPHY_CUSTOMIZATION } from "../../../../../modules/trophy-customization"
import type DesignService from "../../../../../modules/trophy-customization/service"
import { getActorId } from "../../../../../lib/auth-context"

const CloneSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  from_preset: z.boolean().optional(),
})

/** POST /store/designs/:id/clone — clone a design or preset into a new draft. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = CloneSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid clone payload." },
    })
  }
  const service = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const design = await service
    .cloneDesign({
      sourceId: req.params.id,
      fromPreset: parsed.data.from_preset ?? false,
      customerId: getActorId(req),
      name: parsed.data.name,
    })
    .catch(() => null)

  if (!design) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Source not found." } })
  }
  res.status(201).json({ design })
}

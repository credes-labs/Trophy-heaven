import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import crypto from "node:crypto"
import { TROPHY_CUSTOMIZATION } from "../../../../../modules/trophy-customization"
import type DesignService from "../../../../../modules/trophy-customization/service"
import { getActorId } from "../../../../../lib/auth-context"
import { canCloneDesign, ownerTokenFromRequest } from "../../../../../lib/design-ownership"

const CloneSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  from_preset: z.boolean().optional(),
})

/** POST /store/designs/:id/clone — clone own design, a template, or a preset. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = CloneSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid clone payload." },
    })
  }
  const service = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const fromPreset = parsed.data.from_preset ?? false
  const actorId = getActorId(req)

  if (!fromPreset) {
    const source = await service.retrieveDesign(req.params.id).catch(() => null)
    if (!source) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Source not found." } })
    }
    if (
      !canCloneDesign({
        fromPreset: false,
        isTemplate: source.is_template,
        customerId: source.customer_id,
        actorId,
        ownerToken: (source as { owner_token?: string | null }).owner_token,
        presentedOwnerToken: ownerTokenFromRequest(req),
      })
    ) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Source not found." } })
    }
  }

  const design = await service
    .cloneDesign({
      sourceId: req.params.id,
      fromPreset,
      customerId: actorId,
      ownerToken: actorId ? null : crypto.randomBytes(24).toString("base64url"),
      name: parsed.data.name,
    })
    .catch(() => null)

  if (!design) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Source not found." } })
  }
  res.status(201).json({ design })
}

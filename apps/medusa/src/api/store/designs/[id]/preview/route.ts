import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import { TROPHY_CUSTOMIZATION } from "../../../../../modules/trophy-customization"
import type DesignService from "../../../../../modules/trophy-customization/service"
import { PreviewGenerationService } from "../../../../../modules/trophy-customization/preview-generation"
import { validateDesignState } from "../../../../../lib/design-validation"
import { getActorId } from "../../../../../lib/auth-context"
import type { Design2DState } from "@trophy-heaven/schemas"
import { isDesignOwner, ownerTokenFromRequest } from "../../../../../lib/design-ownership"

const PreviewSchema = z.object({
  format: z.literal("png").optional(),
  width: z.number().int().min(200).max(2000).optional(),
})

/**
 * POST /store/designs/:id/preview — (re)generate the preview. 2D designs render
 * synchronously to PNG (uploaded via the File module → R2/CDN). 3D previews are
 * uploaded screenshots captured in the viewer (Phase 3).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = PreviewSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid options." } })
  }

  const service = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const design = await service.retrieveDesign(req.params.id).catch(() => null)
  if (!design) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Design not found." } })
  }
  const isOwner = isDesignOwner({
    customerId: design.customer_id,
    actorId: getActorId(req),
    ownerToken: (design as { owner_token?: string | null }).owner_token,
    presentedOwnerToken: ownerTokenFromRequest(req),
  })
  if (!isOwner) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not the design owner." } })
  }

  if (design.mode !== "2d") {
    return res.status(422).json({
      error: { code: "UNPROCESSABLE", message: "3D previews are uploaded from the viewer." },
    })
  }

  const check = validateDesignState("2d", design.state_json)
  if (!check.success) {
    return res.status(422).json({
      error: { code: "UNPROCESSABLE", message: "Design state is invalid.", details: check.issues },
    })
  }

  const previews = new PreviewGenerationService()
  const rendered = await previews.renderDesign2D(check.data as Design2DState, {
    width: parsed.data.width,
  })

  let previewUrl: string
  if ("buffer" in rendered) {
    const fileModule = req.scope.resolve(Modules.FILE)
    const [file] = await fileModule.createFiles([
      {
        filename: `design-${design.id}.png`,
        mimeType: rendered.contentType,
        content: rendered.buffer.toString("binary"),
      },
    ])
    previewUrl = file.url
  } else {
    previewUrl = rendered.dataUrl
  }

  await service.updateDesigns({ id: design.id, preview_url: previewUrl })
  res.json({ preview_url: previewUrl })
}

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TROPHY_CUSTOMIZATION } from "../../../../../modules/trophy-customization"
import type DesignService from "../../../../../modules/trophy-customization/service"
import { getActorId } from "../../../../../lib/auth-context"
import { isDesignOwner, ownerTokenFromRequest } from "../../../../../lib/design-ownership"

function assertOwner(
  design: { customer_id: string | null; owner_token?: string | null },
  req: MedusaRequest
): boolean {
  return isDesignOwner({
    customerId: design.customer_id,
    actorId: getActorId(req),
    ownerToken: design.owner_token,
    presentedOwnerToken: ownerTokenFromRequest(req),
  })
}

/** POST /store/designs/:id/share — generate a view-only share link. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const design = await service.retrieveDesign(req.params.id).catch(() => null)
  if (!design) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Design not found." } })
  }
  if (!assertOwner(design, req)) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not the design owner." } })
  }
  const token = await service.generateShareToken(design.id)
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  res.json({ share_token: token, share_url: `${base}/shared/design/${design.id}?share_token=${token}` })
}

/** DELETE /store/designs/:id/share — revoke the share link. */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<DesignService>(TROPHY_CUSTOMIZATION)
  const design = await service.retrieveDesign(req.params.id).catch(() => null)
  if (!design) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Design not found." } })
  }
  if (!assertOwner(design, req)) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not the design owner." } })
  }
  await service.revokeShareToken(design.id)
  res.status(204).send()
}

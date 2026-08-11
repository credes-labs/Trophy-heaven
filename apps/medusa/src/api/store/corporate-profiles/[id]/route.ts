import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CORPORATE_ACCOUNT } from "../../../../modules/corporate-account"
import type CorporateService from "../../../../modules/corporate-account/service"
import { getActorId } from "../../../../lib/auth-context"

/** GET /store/corporate-profiles/:id — profile + team members (API 05.4). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
  const corporate_profile = await service.retrieveCorporateProfile(req.params.id).catch(() => null)
  if (!corporate_profile) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Corporate profile not found." } })
  }

  const customerId = getActorId(req)
  const members = await service.listTeamMembers({ corporate_profile_id: corporate_profile.id })
  const isOwner = corporate_profile.customer_id === customerId
  const isMember = members.some((m) => m.customer_id === customerId)
  if (!isOwner && !isMember) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not a member of this account." } })
  }

  res.json({ corporate_profile, team_members: members })
}

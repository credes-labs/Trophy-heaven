import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CORPORATE_ACCOUNT } from "../../../../../modules/corporate-account"
import type CorporateService from "../../../../../modules/corporate-account/service"
import { canAccessCorporateProfile, corporateActorIds, orderMatchesCorporateProfile } from "../../../../../lib/corporate-access"
import { getActorId } from "../../../../../lib/auth-context"

/** GET /store/corporate-profiles/:id/orders — corporate order history (API 05.4). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CorporateService>(CORPORATE_ACCOUNT)
  const profile = await service.retrieveCorporateProfile(req.params.id).catch(() => null)
  if (!profile) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Corporate profile not found." } })
  }

  const customerId = getActorId(req)
  const members = await service.listTeamMembers({ corporate_profile_id: profile.id })
  if (!canAccessCorporateProfile(profile, members, customerId)) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not a member of this account." } })
  }

  const { limit = "20", offset = "0", status } = req.query as Record<string, string>
  const take = Math.min(Math.max(Number(limit) || 20, 1), 50)
  const skip = Math.max(Number(offset) || 0, 0)
  const actorIds = corporateActorIds(profile, members)
  if (!actorIds.length) {
    return res.json({ orders: [], count: 0 })
  }

  const orderModule = req.scope.resolve(Modules.ORDER)
  const filters: Record<string, unknown> = { customer_id: actorIds }
  if (status) filters.status = status

  // Nested metadata filters are not supported on order JSONB — list by member,
  // then keep rows stamped with this corporate profile.
  const [listed] = await orderModule.listAndCountOrders(filters, {
    take: 200,
    skip: 0,
    order: { created_at: "DESC" },
  })
  const matching = listed.filter((order) => orderMatchesCorporateProfile(order, profile.id))
  res.json({ orders: matching.slice(skip, skip + take), count: matching.length })
}

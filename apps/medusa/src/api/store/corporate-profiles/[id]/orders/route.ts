import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CORPORATE_ACCOUNT } from "../../../../../modules/corporate-account"
import type CorporateService from "../../../../../modules/corporate-account/service"
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
  const memberCustomerIds = members.map((m) => m.customer_id).filter(Boolean) as string[]
  const isOwner = profile.customer_id === customerId
  if (!isOwner && !memberCustomerIds.includes(customerId ?? "")) {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not a member of this account." } })
  }

  const { limit = "20", offset = "0", status } = req.query as Record<string, string>
  const customerIds = Array.from(new Set([profile.customer_id, ...memberCustomerIds]))

  const orderModule = req.scope.resolve(Modules.ORDER)
  const filters: Record<string, unknown> = { customer_id: customerIds }
  if (status) filters.status = status

  const [orders, count] = await orderModule.listAndCountOrders(filters, {
    take: Number(limit),
    skip: Number(offset),
    order: { created_at: "DESC" },
  })

  res.json({ orders, count })
}

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { IPromotionModuleService } from "@medusajs/framework/types"

/**
 * GET /store/promotions — active, customer-facing promo codes.
 *
 * Medusa v2's store API has no public promotions listing, so the storefront's
 * coupons page reads from this route. Only code-based promotions whose
 * campaign window includes "now" are returned; automatic promotions and
 * expired/upcoming campaigns are hidden.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const promotionModule = req.scope.resolve<IPromotionModuleService>(Modules.PROMOTION)
    const promotions = await promotionModule.listPromotions(
      {},
      { relations: ["application_method", "campaign"] }
    )

    const now = new Date()
    const active = promotions.filter((p) => {
      if (!p.code || p.is_automatic) return false
      if (p.status && p.status !== "active") return false
      const startsAt = p.campaign?.starts_at ? new Date(p.campaign.starts_at) : null
      if (startsAt && startsAt > now) return false
      const endsAt = p.campaign?.ends_at ? new Date(p.campaign.ends_at) : null
      if (endsAt && endsAt < now) return false
      return true
    })

    res.json({
      promotions: active.map((p) => ({
        code: p.code,
        type: p.application_method?.type ?? null,
        value: p.application_method?.value ?? null,
        ends_at: p.campaign?.ends_at ?? null,
        description: p.campaign?.description ?? p.campaign?.name ?? null,
      })),
    })
  } catch (e) {
    res.status(500).json({
      error: { code: "PROMOTIONS_UNAVAILABLE", message: (e as Error).message },
    })
  }
}

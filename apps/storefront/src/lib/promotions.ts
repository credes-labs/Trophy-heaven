import { BACKEND_URL, PUBLISHABLE_KEY } from "./medusa"
import { formatMoney } from "./format"

export type StorePromotion = {
  code: string
  type: string | null
  value: number | null
  ends_at: string | null
  description: string | null
}

/**
 * Active promo codes from the backend's custom `GET /store/promotions` route
 * (Medusa v2's store API does not expose a public promotions listing).
 */
export async function listActivePromotions(): Promise<StorePromotion[]> {
  const res = await fetch(`${BACKEND_URL}/store/promotions`, {
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to list promotions: ${res.status}`)
  }
  const body = (await res.json()) as { promotions?: StorePromotion[] }
  return body.promotions ?? []
}

export function promotionLabel(promotion: StorePromotion): string {
  if (promotion.type === "percentage" && promotion.value != null) {
    return `${promotion.value}% OFF`
  }
  if (promotion.type === "fixed" && promotion.value != null) {
    return `${formatMoney(promotion.value, "inr")} OFF`
  }
  return "Special offer"
}

export function promotionExpiry(promotion: StorePromotion): string | null {
  if (!promotion.ends_at) return null
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(promotion.ends_at))
}

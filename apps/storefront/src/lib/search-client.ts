import { CUSTOMIZATION_LABELS } from "./format"
import { BACKEND_URL, PUBLISHABLE_KEY } from "./medusa"

export type SearchHit = {
  id: string
  title: string
  handle: string
  description: string
  thumbnail: string | null
  category: string[]
  material: string | null
  customization_level: string
  price: number
  price_tier: string
}

export const FACET_LABELS: Record<string, string> = {
  category: "Category",
  material: "Material",
  customization_level: "Customization",
  price_tier: "Price",
}

export const PRICE_TIER_LABELS: Record<string, string> = {
  under_1000: "Under ₹1,000",
  "1000_5000": "₹1,000–₹5,000",
  "5000_15000": "₹5,000–₹15,000",
  "15000_plus": "₹15,000+",
}

function humanizeKey(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

/** Facet checkbox copy. Customization uses the catalog label map. */
export function facetValueLabel(attr: string, value: string): string {
  if (attr === "price_tier") return PRICE_TIER_LABELS[value] ?? humanizeKey(value)
  if (attr === "customization_level") return CUSTOMIZATION_LABELS[value] ?? humanizeKey(value)
  if (attr === "material") return humanizeKey(value)
  return value
}

export type SearchResponse = {
  available: boolean
  hits: SearchHit[]
  facets: Record<string, Record<string, number>>
  estimatedTotalHits: number
}

export async function searchProducts(params: {
  q?: string
  facets?: Record<string, string[]>
  limit?: number
  offset?: number
}): Promise<SearchResponse> {
  const usp = new URLSearchParams()
  if (params.q) usp.set("q", params.q)
  if (params.limit) usp.set("limit", String(params.limit))
  if (params.offset) usp.set("offset", String(params.offset))
  for (const [k, values] of Object.entries(params.facets ?? {})) {
    if (values.length) usp.set(k, values.join(","))
  }

  const res = await fetch(`${BACKEND_URL}/store/search?${usp.toString()}`, {
    headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
  })
  if (!res.ok) return { available: false, hits: [], facets: {}, estimatedTotalHits: 0 }
  return (await res.json()) as SearchResponse
}

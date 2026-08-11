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

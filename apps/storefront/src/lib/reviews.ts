import { BACKEND_URL, PUBLISHABLE_KEY, medusa } from "./medusa"

/**
 * Client for the backend reviews module (apps/medusa/src/api/store/reviews).
 * GET is public (publishable key); POST requires a signed-in customer JWT.
 */

export type ReviewSort = "newest" | "highest" | "lowest" | "helpful"

export type StoreReview = {
  id: string
  product_id: string
  customer_id: string
  rating: number
  title: string | null
  body: string | null
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
}

export type ReviewsResponse = {
  reviews: StoreReview[]
  count: number
  average_rating: number
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>
}

function baseHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
  }
}

/** List approved reviews + aggregate for a product (client-side use). */
export async function listReviews(params: {
  productId: string
  sort?: ReviewSort
  limit?: number
  offset?: number
}): Promise<ReviewsResponse> {
  const search = new URLSearchParams({ product_id: params.productId })
  if (params.sort) search.set("sort", params.sort)
  if (params.limit != null) search.set("limit", String(params.limit))
  if (params.offset != null) search.set("offset", String(params.offset))

  const res = await fetch(`${BACKEND_URL}/store/reviews?${search.toString()}`, {
    headers: baseHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to load reviews: ${res.status}`)
  return (await res.json()) as ReviewsResponse
}

/** Aggregate only — for RSC (JSON-LD, rating summary). Cached with the page's ISR. */
export async function getReviewSummary(
  productId: string
): Promise<{ average_rating: number; count: number } | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/reviews?product_id=${encodeURIComponent(productId)}&limit=1`,
      {
        headers: baseHeaders(),
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return null
    const body = (await res.json()) as Pick<ReviewsResponse, "average_rating" | "count">
    return { average_rating: body.average_rating ?? 0, count: body.count ?? 0 }
  } catch {
    return null
  }
}

/** Submit a review. Requires an authenticated customer (JWT attached when present). */
export async function createReview(input: {
  product_id: string
  rating: number
  title?: string
  body?: string
}): Promise<StoreReview> {
  const headers: Record<string, string> = { ...baseHeaders() }
  const token = await medusa.client.getToken?.().catch?.(() => null)
  if (typeof token === "string" && token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BACKEND_URL}/store/reviews`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body?.error?.message || `Could not submit review: ${res.status}`)
  }
  return (body as { review: StoreReview }).review
}

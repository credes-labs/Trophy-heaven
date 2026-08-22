import { BACKEND_URL, PUBLISHABLE_KEY, medusa } from "./medusa"

export type WishlistItemRecord = {
  id: string
  customer_id: string
  product_id: string
  variant_id: string | null
  added_at: string
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
  }
  const token = await medusa.client.getToken?.().catch?.(() => null)
  if (typeof token === "string" && token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { ...(await authHeaders()), ...(init.headers ?? {}) },
    credentials: "include",
  })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(
      body?.error?.message || `Request failed: ${res.status}`
    ) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return body as T
}

export const wishlistApi = {
  list: () =>
    request<{ items: WishlistItemRecord[]; count: number }>("/store/wishlist", {
      method: "GET",
    }),

  add: (input: { product_id: string; variant_id?: string | null; toggle?: boolean }) =>
    request<{ item?: WishlistItemRecord; action?: "added" | "removed" }>("/store/wishlist", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    request<void>(`/store/wishlist/${id}`, {
      method: "DELETE",
    }),
}

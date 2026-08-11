import { medusa } from "./medusa"
import { BACKEND_URL, PUBLISHABLE_KEY } from "./medusa"
import type { Design2DState, Design3DState } from "@legacy-crafts/schemas"

type DesignRecord = {
  id: string
  name: string
  mode: "2d" | "3d"
  product_id: string
  state_json: Design2DState | Design3DState | Record<string, unknown>
  preview_url: string | null
  status: string
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
  }
  // Attach the customer JWT when present so designs bind to the account.
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
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `Request failed: ${res.status}`)
  }
  return (init.method === "DELETE" ? (undefined as T) : ((await res.json()) as T))
}

export const designApi = {
  create: (input: {
    name: string
    mode: "2d" | "3d"
    product_id: string
    variant_id?: string
    state_json: unknown
  }) => request<{ design: DesignRecord }>("/store/designs", { method: "POST", body: JSON.stringify(input) }),

  update: (id: string, input: { name?: string; state_json?: unknown }) =>
    request<{ design: DesignRecord }>(`/store/designs/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  list: () => request<{ designs: DesignRecord[]; count: number }>("/store/designs", { method: "GET" }),

  get: (id: string, shareToken?: string) =>
    request<{ design: DesignRecord }>(
      `/store/designs/${id}${shareToken ? `?share_token=${shareToken}` : ""}`,
      { method: "GET" }
    ),

  preview: (id: string, width?: number) =>
    request<{ preview_url: string }>(`/store/designs/${id}/preview`, {
      method: "POST",
      body: JSON.stringify({ width }),
    }),

  clone: (id: string, fromPreset = false, name?: string) =>
    request<{ design: DesignRecord }>(`/store/designs/${id}/clone`, {
      method: "POST",
      body: JSON.stringify({ from_preset: fromPreset, name }),
    }),

  share: (id: string) =>
    request<{ share_token: string; share_url: string }>(`/store/designs/${id}/share`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
}

export type { DesignRecord }

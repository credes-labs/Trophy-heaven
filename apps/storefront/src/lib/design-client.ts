import { medusa } from "./medusa"
import { BACKEND_URL, PUBLISHABLE_KEY } from "./medusa"
import type { Design2DState, Design3DState } from "@trophy-heaven/schemas"

type DesignRecord = {
  id: string
  name: string
  mode: "2d" | "3d"
  product_id: string
  state_json: Design2DState | Design3DState | Record<string, unknown>
  preview_url: string | null
  status: string
  owner_token?: string | null
}

const OWNER_TOKEN_KEY = "lc_design_owner_tokens"

function readOwnerTokens(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(OWNER_TOKEN_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function rememberOwnerToken(id: string, token?: string | null) {
  if (!token || typeof window === "undefined") return
  const next = { ...readOwnerTokens(), [id]: token }
  localStorage.setItem(OWNER_TOKEN_KEY, JSON.stringify(next))
}

function ownerHeaders(id?: string): Record<string, string> {
  if (!id) return {}
  const token = readOwnerTokens()[id]
  return token ? { "x-design-owner-token": token } : {}
}

async function authHeaders(designId?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
    ...ownerHeaders(designId),
  }
  const token = await medusa.client.getToken?.().catch?.(() => null)
  if (typeof token === "string" && token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function request<T>(path: string, init: RequestInit, designId?: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { ...(await authHeaders(designId)), ...(init.headers ?? {}) },
    credentials: "include",
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message || `Request failed: ${res.status}`)
  }
  return (init.method === "DELETE" ? (undefined as T) : ((await res.json()) as T))
}

export const designApi = {
  create: async (input: {
    name: string
    mode: "2d" | "3d"
    product_id: string
    variant_id?: string
    state_json: unknown
  }) => {
    const result = await request<{ design: DesignRecord }>("/store/designs", {
      method: "POST",
      body: JSON.stringify(input),
    })
    rememberOwnerToken(result.design.id, result.design.owner_token)
    return result
  },

  update: (id: string, input: { name?: string; state_json?: unknown }) =>
    request<{ design: DesignRecord }>(
      `/store/designs/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
      id
    ),

  list: () => request<{ designs: DesignRecord[]; count: number }>("/store/designs", { method: "GET" }),

  get: (id: string, shareToken?: string) =>
    request<{ design: DesignRecord }>(
      `/store/designs/${id}${shareToken ? `?share_token=${shareToken}` : ""}`,
      { method: "GET" },
      id
    ),

  preview: (id: string, width?: number) =>
    request<{ preview_url: string }>(
      `/store/designs/${id}/preview`,
      {
        method: "POST",
        body: JSON.stringify({ width }),
      },
      id
    ),

  clone: async (id: string, fromPreset = false, name?: string) => {
    const result = await request<{ design: DesignRecord }>(
      `/store/designs/${id}/clone`,
      {
        method: "POST",
        body: JSON.stringify({ from_preset: fromPreset, name }),
      },
      id
    )
    rememberOwnerToken(result.design.id, result.design.owner_token)
    return result
  },

  share: (id: string) =>
    request<{ share_token: string; share_url: string }>(
      `/store/designs/${id}/share`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
      id
    ),
}

export type { DesignRecord }

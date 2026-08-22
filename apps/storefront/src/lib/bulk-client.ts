import { BACKEND_URL, PUBLISHABLE_KEY, medusa } from "./medusa"

export type BulkOrderRecord = {
  id: string
  product_id: string
  variant_id: string | null
  po_number: string | null
  status: "draft" | "uploaded" | "validated" | "confirmed" | "cancelled"
  total_items: number
  cart_id: string | null
}

export type BulkOrderLineRecord = {
  id: string
  row_number: number
  name: string
  designation: string | null
  award_category: string | null
  design_id: string | null
  preview_url: string | null
  validation_errors: { field: string; issue: string }[] | null
}

export type CorporateProfileRecord = {
  id: string
  company_name: string
  tax_id: string
  credit_limit: number
  payment_terms: "prepaid" | "net_30" | "net_60"
  account_manager_id: string | null
  is_verified: boolean
}

export type TeamMemberRecord = {
  id: string
  email: string
  role: "member" | "manager"
  status: "invited" | "active" | "revoked"
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
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error?.message || `Request failed: ${res.status}`)
  return body as T
}

export const bulkApi = {
  create: (input: { product_id: string; variant_id?: string; po_number?: string; corporate_profile_id?: string }) =>
    request<{ bulk_order: BulkOrderRecord }>("/store/bulk-orders", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  upload: (id: string, rows: { name?: string; designation?: string; award_category?: string }[]) =>
    request<{
      parsed: { total: number; valid: number; invalid: number }
      lines: BulkOrderLineRecord[]
      errors: { row: number; field: string; issue: string }[]
    }>(`/store/bulk-orders/${id}/upload`, { method: "POST", body: JSON.stringify({ rows }) }),

  get: (id: string) =>
    request<{ bulk_order: BulkOrderRecord; lines: BulkOrderLineRecord[] }>(`/store/bulk-orders/${id}`, {
      method: "GET",
    }),

  confirm: (id: string, input?: { payment_terms?: "prepaid" | "net_30" | "net_60" }) =>
    request<{
      cart_id: string | null
      line_item_ids: string[]
      payment_terms: "prepaid" | "net_30" | "net_60"
      net_terms: boolean
    }>(`/store/bulk-orders/${id}/confirm`, {
      method: "POST",
      body: JSON.stringify(input ?? {}),
    }),
}

export const corporateApi = {
  create: (input: { company_name: string; tax_id: string; billing_address?: Record<string, unknown> }) =>
    request<{ corporate_profile: CorporateProfileRecord }>("/store/corporate-profiles", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  list: () => request<{ corporate_profiles: CorporateProfileRecord[] }>("/store/corporate-profiles", { method: "GET" }),

  get: (id: string) =>
    request<{ corporate_profile: CorporateProfileRecord; team_members: TeamMemberRecord[] }>(
      `/store/corporate-profiles/${id}`,
      { method: "GET" }
    ),

  addMember: (id: string, email: string, role: "member" | "manager" = "member") =>
    request<{ team_member: TeamMemberRecord }>(`/store/corporate-profiles/${id}/team-members`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),

  orders: (id: string) =>
    request<{ orders: unknown[]; count: number }>(`/store/corporate-profiles/${id}/orders`, { method: "GET" }),
}

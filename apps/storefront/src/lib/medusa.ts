import Medusa from "@medusajs/js-sdk"

/**
 * Medusa Store SDK client. Server Components fetch catalog data directly via
 * this SDK (no client fetch for PDPs — see docs/kit/03 §3.2). Client surfaces
 * (cart, account) reuse the same instance.
 */
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export const medusa = new Medusa({
  baseUrl: BACKEND_URL,
  publishableKey: PUBLISHABLE_KEY,
  auth: { type: "jwt" },
})

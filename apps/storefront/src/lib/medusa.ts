import Medusa from "@medusajs/js-sdk"

/**
 * Medusa Store SDK client. Server Components fetch catalog data directly via
 * this SDK (no client fetch for PDPs — see docs/kit/03 §3.2). Client surfaces
 * (cart, account) reuse the same instance.
 */
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * Server-rendered pages all reach Medusa from the storefront's one IP, so Medusa's
 * per-IP rate limit would throttle every visitor together. Server-side requests carry
 * `STOREFRONT_SERVER_KEY` (not NEXT_PUBLIC, so never in the browser bundle) and
 * Medusa skips the limit for them; browser requests stay limited per visitor.
 */
export function serverOnlyHeaders(): Record<string, string> {
  const key = typeof window === "undefined" ? process.env.STOREFRONT_SERVER_KEY : undefined
  return key ? { "x-storefront-key": key } : {}
}

export const medusa = new Medusa({
  baseUrl: BACKEND_URL,
  publishableKey: PUBLISHABLE_KEY,
  auth: { type: "jwt" },
  globalHeaders: serverOnlyHeaders(),
})

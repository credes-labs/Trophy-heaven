import { MedusaError } from "@medusajs/framework/utils"
import { checkOrderDesigns } from "./order-files"

export type CartCompleteSnapshot = {
  total: number
  metadata?: Record<string, unknown> | null
  /** Line items, when loaded; used to check customer designs against quantities. */
  items?: Array<{ title?: string | null; quantity?: unknown; metadata?: Record<string, unknown> | null }>
  paymentSessions?: Array<{ provider_id?: string | null; status?: string | null }>
}

export function claimedNetTerms(
  metadata?: Record<string, unknown> | null
): "net_30" | "net_60" | null {
  const meta = metadata ?? {}
  if (meta.net_terms === true || meta.net_terms === "true") {
    return meta.payment_terms === "net_60" ? "net_60" : "net_30"
  }
  if (meta.payment_terms === "net_30" || meta.payment_terms === "net_60") {
    return meta.payment_terms
  }
  return null
}

/**
 * Prepaid carts cannot complete on the system provider when Razorpay is
 * configured. Net-terms require a corporate profile that the caller already
 * authorized on the cart metadata — verified by `verifyNetTerms`.
 */
export async function assertCartMayComplete(
  snapshot: CartCompleteSnapshot,
  deps: {
    razorpayConfigured: boolean
    verifyNetTerms?: (
      profileId: string,
      terms: "net_30" | "net_60",
      amount: number
    ) => Promise<{ ok: true } | { ok: false; reason: string }>
  }
): Promise<void> {
  if (snapshot.items?.length) {
    const designProblem = checkOrderDesigns(snapshot.metadata, snapshot.items)
    if (designProblem) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, designProblem)
  }

  const terms = claimedNetTerms(snapshot.metadata)
  if (terms) {
    const profileId = String(snapshot.metadata?.corporate_profile_id ?? "")
    if (!profileId || !deps.verifyNetTerms) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Net terms require a verified corporate account on this cart."
      )
    }
    const check = await deps.verifyNetTerms(profileId, terms, snapshot.total)
    if (!check.ok) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, check.reason)
    }
    return
  }

  if (!deps.razorpayConfigured) return

  const rzp = snapshot.paymentSessions?.find((s) => s.provider_id?.includes("razorpay"))
  const status = rzp?.status
  if (status !== "authorized" && status !== "captured") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Payment has not been authorized. Complete Razorpay checkout before placing the order."
    )
  }
}

/**
 * Partial-advance checkout: the customer pays 10% online (Razorpay) and the
 * remaining 90% in cash on delivery. Amounts are computed server-side from the
 * cart total so the client can only choose the plan, never the amount.
 * Keep in sync with apps/storefront/src/lib/payment-plan.ts.
 */
export const ADVANCE_COD_PLAN = "advance_cod"
export const ADVANCE_RATE = 0.1

export type PaymentPlan = "full" | typeof ADVANCE_COD_PLAN

export function parsePaymentPlan(value: unknown): PaymentPlan {
  return value === ADVANCE_COD_PLAN ? ADVANCE_COD_PLAN : "full"
}

/** Splits a total in the smallest unit (paise): advance rounds up, COD gets the rest. */
export function splitAdvance(totalPaise: number): { advancePaise: number; codPaise: number } {
  const total = Math.max(0, Math.round(totalPaise))
  const advancePaise = Math.ceil(total * ADVANCE_RATE)
  return { advancePaise, codPaise: total - advancePaise }
}

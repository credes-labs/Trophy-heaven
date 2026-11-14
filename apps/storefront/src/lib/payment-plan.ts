import { fromSmallestUnit, toSmallestUnit } from "./currency"

/**
 * Partial-advance checkout: 10% paid online now, 90% cash on delivery.
 * Display-side mirror of apps/medusa/src/lib/payment-plan.ts — the backend
 * recomputes the split from the cart total, so this only drives the UI.
 */
export const ADVANCE_COD_PLAN = "advance_cod"
export const ADVANCE_PERCENT = 10

export type PaymentPlan = "full" | typeof ADVANCE_COD_PLAN

/** Advance rounds up to the paisa; the COD balance is the exact remainder. */
export function splitAdvance(
  total: number,
  currency = "inr"
): { advance: number; balance: number } {
  const totalMinor = Math.max(0, toSmallestUnit(total, currency))
  const advanceMinor = Math.ceil((totalMinor * ADVANCE_PERCENT) / 100)
  return {
    advance: fromSmallestUnit(advanceMinor, currency),
    balance: fromSmallestUnit(totalMinor - advanceMinor, currency),
  }
}

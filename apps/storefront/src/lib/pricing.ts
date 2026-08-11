/**
 * Bulk pricing tiers (docs/kit/05.2, FR-CORP-2). Volume discounts are applied to
 * the per-unit base price; the calculator is illustrative and mirrored by the
 * server at checkout via Medusa price lists.
 */
export const BULK_TIERS: { min: number; max: number | null; discount: number; label: string }[] = [
  { min: 1, max: 9, discount: 0, label: "1–9" },
  { min: 10, max: 24, discount: 0.05, label: "10–24" },
  { min: 25, max: 49, discount: 0.1, label: "25–49" },
  { min: 50, max: 99, discount: 0.15, label: "50–99" },
  { min: 100, max: 249, discount: 0.2, label: "100–249" },
  { min: 250, max: null, discount: 0.25, label: "250+" },
]

export function tierFor(qty: number) {
  return BULK_TIERS.find((t) => qty >= t.min && (t.max === null || qty <= t.max)) ?? BULK_TIERS[0]
}

export type BulkQuote = {
  quantity: number
  unitPrice: number
  discount: number
  discountedUnit: number
  subtotal: number
  savings: number
  tierLabel: string
}

/** Compute a bulk quote for a given quantity + unit base price (in major units). */
export function computeBulkQuote(quantity: number, unitBasePrice: number): BulkQuote {
  const qty = Math.max(0, Math.floor(quantity))
  const tier = tierFor(qty || 1)
  const discountedUnit = unitBasePrice * (1 - tier.discount)
  const subtotal = discountedUnit * qty
  const savings = unitBasePrice * qty - subtotal
  return {
    quantity: qty,
    unitPrice: unitBasePrice,
    discount: tier.discount,
    discountedUnit,
    subtotal,
    savings,
    tierLabel: tier.label,
  }
}

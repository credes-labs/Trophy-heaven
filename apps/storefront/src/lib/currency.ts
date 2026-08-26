/**
 * Convert between Medusa major currency units (₹, $) and the integer smallest
 * unit payment APIs expect (paise, cents). INR is ×100.
 */
const ZERO_DECIMAL = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
])

const THREE_DECIMAL = new Set(["BHD", "IQD", "JOD", "KWD", "OMR", "TND"])

export function getCurrencyMultiplier(currency: string): number {
  const code = currency.toUpperCase()
  if (ZERO_DECIMAL.has(code)) return 1
  if (THREE_DECIMAL.has(code)) return 1000
  return 100
}

export function toSmallestUnit(amount: number, currency: string): number {
  const multiplier = getCurrencyMultiplier(currency)
  let numeric = Math.round(amount * multiplier)
  if (multiplier === 1000) {
    numeric = Math.ceil(numeric / 10) * 10
  }
  return numeric
}

export function fromSmallestUnit(amount: number, currency: string): number {
  return amount / getCurrencyMultiplier(currency)
}

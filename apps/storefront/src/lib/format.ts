/**
 * Money formatting. Medusa v2 stores amounts in the major unit as decimals for
 * display via the SDK's calculated prices; we format using Intl with the
 * region's currency. India (INR) is the default market (docs/kit/13 §13.2).
 */
export function formatMoney(amount: number, currencyCode = "inr"): string {
  const locale = currencyCode.toLowerCase() === "inr" ? "en-IN" : "en-US"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Customization level → human label + whether the customize CTA shows. */
export const CUSTOMIZATION_LABELS: Record<string, string> = {
  none: "Standard product",
  text_only: "Text engraving",
  text_and_logo: "Text + logo",
  full_3d: "Full 2D & 3D customization",
}

export function isCustomizable(level?: string | null): boolean {
  return level === "text_only" || level === "text_and_logo" || level === "full_3d"
}

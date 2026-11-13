/**
 * Single source of truth for brand facts used across homepage, about, shipping
 * copy, and trust strips. Unverified figures are marked TODO(ops) — do not invent
 * replacements; lean on structural claims until ops confirms numbers.
 */

export const BRAND = {
  name: "Trophy Heaven",
  shortName: "Trophy Heaven",
  city: "Bengaluru",
  cityAlt: "Bangalore",
  country: "India",
  /** Confirmed by about/constants founding line; craftsmanship-story "decade" claim retired. */
  foundedYear: 2022,
  tagline: "Crafted with intention. Built to last.",
  disciplines: ["trophies"] as const,
} as const

/**
 * Homepage / about stats. Prefer structural captions over inflated counts until
 * ops confirms. Values marked TODO(ops) must not be treated as marketing truth.
 */
export const BRAND_STATS = [
  {
    value: "100%",
    caption: "Hand-finished before it leaves the workshop",
  },
  {
    // TODO(ops): confirm artisan headcount
    value: "40+",
    caption: "Guild artisans across crystal, metal, and timber",
  },
  {
    // TODO(ops): confirm lifetime delivery count
    value: "5k+",
    caption: "Honours and suites delivered across India",
  },
] as const

/**
 * Shipping aligned to Medusa seed (Standard ₹99 / Express ₹249). Marketing no
 * longer claims free shipping above ₹5,000 or Express ₹299 until ops updates seed.
 */
export const SHIPPING = {
  standard: {
    label: "Standard",
    amountInr: 99,
    window: "3–5 business days",
  },
  express: {
    label: "Express",
    amountInr: 249,
    window: "1–2 business days",
  },
  customTrophyLead: "Custom trophies typically ship within 7 days of design approval",
  coverage: "Shipped across India, tracked end to end",
} as const

export const PAYMENTS = {
  methods: "UPI, cards, net banking, or EMI",
  gst: "GST invoice on every order",
} as const

export const TRUST_POINTS = [
  `Pay by ${PAYMENTS.methods}`,
  SHIPPING.coverage,
  PAYMENTS.gst,
  "Engraving approved by you before we cut",
] as const

export const ANNOUNCEMENT_MESSAGES = [
  `Handcrafted in ${BRAND.city}, shipped across ${BRAND.country}`,
  "Custom trophies, designed in your browser",
  "UPI, cards, net banking, EMI",
] as const

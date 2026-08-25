export const HERO_COPY =
  "Curated furniture blends bold design with everyday comfort. At Legacy, each piece transforms rooms into expressive spaces reflecting your unique taste. Discover furniture built to inspire and elevate your living."

export const HERO_CTA = "Explore our products"

export const HERO_NAV_COL_1 = [
  { label: "COLLECTION", href: "/shop" },
  { label: "CATALOG", href: "/shop" },
  { label: "INFO", href: "/about" },
] as const

export const HERO_NAV_COL_2 = [
  { label: "NEWS", href: "/blog" },
  { label: "CONTACT", href: "/contact" },
  { label: "FAVORITES", href: "/account/wishlist" },
] as const

export const HERO_NAV_LINKS = [...HERO_NAV_COL_1, ...HERO_NAV_COL_2]

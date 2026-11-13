import { BRAND } from "@/lib/brand-facts"

export const HERO_EYEBROW = "//trophies · awards · plaques"

export const HERO_HEADLINE = BRAND.tagline

/** Visual stack of HERO_HEADLINE. Three lines, same words. */
export const HERO_HEADLINE_LINES = ["Crafted with", "intention.", "Built to last."] as const

export const HERO_COPY =
  `${BRAND.name} is a ${BRAND.city} trophy atelier — crystal, metal, and hardwood awards made to mark a moment and engraved to the name.`

export const HERO_CTA = "Browse the collection"
export const HERO_CTA_HREF = "/shop"

export const HERO_CTA_SECONDARY = "Design a trophy"
export const HERO_CTA_SECONDARY_HREF = "/customize"

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

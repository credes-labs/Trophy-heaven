import { BRAND } from "@/lib/brand-facts"

export const HERO_EYEBROW = "//trophies · furniture · artwork"

export const HERO_HEADLINE = BRAND.tagline

export const HERO_COPY =
  `${BRAND.name} is a ${BRAND.city} atelier that makes three things well — trophies that mark a moment, furniture that outlives a trend, and artwork that quiets a room.`

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

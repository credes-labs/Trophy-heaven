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
  { label: "SHOP", href: "/shop" },
  { label: "INFO", href: "/about" },
] as const

export const HERO_NAV_COL_2 = [
  { label: "NEWS", href: "/blog" },
  { label: "CONTACT", href: "/contact" },
  { label: "FAVORITES", href: "/account/wishlist" },
] as const

export const HERO_NAV_LINKS = [...HERO_NAV_COL_1, ...HERO_NAV_COL_2]

/* ── Editorial poster hero (white, Urbanist, cut-out trophies) ── */

export const HERO_TAGLINE = {
  lead: "Trophies designed",
  rest: "as objects of recognition.",
} as const

/** Tiny caps row under the wordmark; `col` places each label on the 12-col grid. */
export const HERO_FEATURES = [
  { label: "Form & finish", href: "/shop", col: "col-span-3" },
  { label: "Material & craft", href: "/about#story", col: "col-start-4 col-span-2" },
  { label: "Engraving", href: "/customize", col: "col-start-6 col-span-2" },
  { label: "Presentation", href: "/corporate", col: "col-start-10 col-span-2" },
  { label: "Our story", href: "/about", col: "col-start-12 text-right" },
] as const

/**
 * Cut-outs (backgrounds removed) of the workshop's own pieces, from the owner's photos
 * (`public/images/cutouts/collection/`). Heights are % of the stage.
 */
export const HERO_TROPHIES = [
  { src: "/images/cutouts/collection/royal-lidded-cup.webp", width: 514, intrinsicHeight: 1200, height: "72%" },
  { src: "/images/cutouts/collection/rising-star-award.webp", width: 504, intrinsicHeight: 1200, height: "100%" },
  { src: "/images/cutouts/collection/grace-figure-award.webp", width: 425, intrinsicHeight: 1200, height: "82%" },
] as const

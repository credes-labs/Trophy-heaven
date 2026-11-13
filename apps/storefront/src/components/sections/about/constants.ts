import { BRAND, BRAND_STATS } from "@/lib/brand-facts"

/** Figma About copy. Sizes live as em on the section so they scale with viewport. */

export const ABOUT_EYEBROW = "The atelier"

export const ABOUT_HEADLINE =
  "A workshop that keeps its own time."

export const ABOUT_STATS_KICKER = "//Trophy Heaven in numbers"

export const ABOUT_STATS = BRAND_STATS

export const ABOUT_BODY = [
  `${BRAND.name} began in a ${BRAND.city} workshop with a simple preference: do fewer things, and do them until they are right. One discipline — trophies — and one unhurried standard for every award that leaves the bench.`,
  "We name our materials because they matter. Optical crystal and cast brass. Solid walnut plinths and honed marble. Hand-rubbed oil instead of spray lacquer.",
] as const

export const ABOUT_CTA_LABEL = "More about us"
export const ABOUT_CTA_HREF = "/about"

export const ABOUT_FILM_TITLE = "From Concept to Ceremony"

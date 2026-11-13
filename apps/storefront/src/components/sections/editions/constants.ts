import { EXPLORE_PRODUCTS, type ExploreProduct } from "@/components/sections/explore/constants"

/** Background-removed catalog photos, shown on the light-grey product tiles. */
export const CUTOUTS = {
  "ascent-figure-award": { src: "/images/cutouts/figure-award.webp", width: 590, height: 1604 },
  "achievement-statuette": { src: "/images/cutouts/statuette.webp", width: 314, height: 772 },
  "engraved-wooden-plaque": { src: "/images/cutouts/plaque.webp", width: 1021, height: 1177 },
} as const

export type CutoutId = keyof typeof CUTOUTS

export type HomeCategory = {
  label: string
  href: string
  cutout?: CutoutId
}

export const HOME_CATEGORIES: HomeCategory[] = [
  { label: "Figure awards", href: "/trophies?sub=Metal", cutout: "ascent-figure-award" },
  { label: "Statuettes", href: "/trophies?sub=Corporate", cutout: "achievement-statuette" },
  { label: "Engraved plaques", href: "/search?q=plaque", cutout: "engraved-wooden-plaque" },
  { label: "Design your own", href: "/customize" },
]

export const EDITIONS_HEADLINE = "Selected Editions"

export const EDITION_SORTS = [
  { id: "featured", label: "Sort by" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const

export type EditionSortId = (typeof EDITION_SORTS)[number]["id"]

export type EditionProduct = ExploreProduct & { id: CutoutId }

export const EDITION_PRODUCTS: EditionProduct[] = EXPLORE_PRODUCTS.filter(
  (p): p is EditionProduct => p.id in CUTOUTS
)

export const ALL_PIECES = "All Pieces"

export const EDITION_FILTERS: string[] = [
  ALL_PIECES,
  ...new Set(EDITION_PRODUCTS.map((p) => p.category)),
]

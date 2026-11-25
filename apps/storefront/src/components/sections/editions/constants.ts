/**
 * Background-removed photos, shown on the light-grey tiles. `cutouts/collection/` holds the
 * workshop's own pieces (owner photography); the two figures are the 3D studio awards.
 * Handles must match `apps/medusa/src/scripts/trophy-collection.ts`.
 */
export const CUTOUTS = {
  "rising-star-award": { src: "/images/cutouts/collection/rising-star-award.webp", width: 504, height: 1200 },
  "royal-lidded-cup": { src: "/images/cutouts/collection/royal-lidded-cup.webp", width: 514, height: 1200 },
  "crown-crystal-trophy": { src: "/images/cutouts/collection/crown-crystal-trophy.webp", width: 160, height: 511 },
  "heritage-silver-cup": { src: "/images/cutouts/collection/heritage-silver-cup.webp", width: 756, height: 1190 },
  "cricket-batsman-trophy": { src: "/images/cutouts/collection/cricket-batsman-trophy.webp", width: 175, height: 612 },
  "handshake-memento": { src: "/images/cutouts/collection/handshake-memento.webp", width: 1003, height: 1024 },
  "gold-statuette": { src: "/images/cutouts/collection/gold-statuette.webp", width: 439, height: 1200 },
  "diamond-crown-trophy": { src: "/images/cutouts/collection/diamond-crown-trophy.webp", width: 169, height: 569 },
  "ascent-figure-award": { src: "/images/cutouts/figure-award.webp", width: 590, height: 1604 },
} as const

export type CutoutId = keyof typeof CUTOUTS

export type HomeCategory = {
  label: string
  href: string
  cutout?: CutoutId
}

export const HOME_CATEGORIES: HomeCategory[] = [
  { label: "Cups", href: "/search?q=cup", cutout: "royal-lidded-cup" },
  { label: "Crystal awards", href: "/trophies?sub=Crystal", cutout: "diamond-crown-trophy" },
  { label: "Figures & statuettes", href: "/trophies?sub=Corporate", cutout: "gold-statuette" },
  { label: "Design your own", href: "/customize" },
]

export const EDITIONS_HEADLINE = "Selected Editions"

export const EDITION_SORTS = [
  { id: "featured", label: "Sort by" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const

export type EditionSortId = (typeof EDITION_SORTS)[number]["id"]

export type EditionProduct = {
  id: CutoutId
  name: string
  category: string
  /** INR, matching the seeded variant price. */
  amount: number
  price: string
  alt: string
  href: string
}

const edition = (
  id: CutoutId,
  name: string,
  category: string,
  amount: number,
  alt: string
): EditionProduct => ({
  id,
  name,
  category,
  amount,
  price: formatInr(amount),
  alt,
  href: `/products/${id}`,
})

export const EDITION_PRODUCTS: EditionProduct[] = [
  edition("rising-star-award", "Rising Star Award", "Figures", 1450, "Gilt figure lifting a gold star on a round black base"),
  edition("royal-lidded-cup", "Royal Lidded Cup", "Cups", 2400, "Lidded gold cup with swept handles on a rosewood base"),
  edition("crown-crystal-trophy", "Crown Crystal Trophy", "Crystal", 1750, "Gold crown holding a crystal sphere over a gold column"),
  edition("heritage-silver-cup", "Heritage Silver Cup", "Cups", 1950, "Silver cup with ornate handles on a round black base"),
  edition("cricket-batsman-trophy", "Cricket Batsman Trophy", "Sports", 1350, "Gilt cricket batsman above a red ball on a black base"),
  edition("handshake-memento", "Handshake Memento", "Mementos", 1350, "Wooden memento with a gold plate, handshake emblem and star"),
  edition("ascent-figure-award", "Ascent Figure Award", "Figures", 20400, "Gilt figure award rising through a ring on a mahogany base"),
]

export const ALL_PIECES = "All Pieces"

function formatInr(amount: number): string {
  const paise = Number.isInteger(amount) ? 0 : 2
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: paise, maximumFractionDigits: 2 })}`
}

/** Name and price the owner set in the admin, keyed by product handle. */
export type LiveEdition = { title: string; amount: number | null }

/**
 * Tiles and photos stay where the design puts them; names and prices come from
 * the admin. `live` null = backend unreachable, so the coded values are kept. A
 * handle missing from `live` was deleted or unpublished, so its tile is dropped.
 */
export function withLiveDetails(
  products: readonly EditionProduct[],
  live: Readonly<Record<string, LiveEdition>> | null | undefined
): EditionProduct[] {
  if (!live) return [...products]
  return products.flatMap((p) => {
    const row = live[p.id]
    if (!row) return []
    const amount = row.amount ?? p.amount
    return [{ ...p, name: row.title || p.name, amount, price: formatInr(amount) }]
  })
}

export function editionFilters(products: readonly EditionProduct[]): string[] {
  return [ALL_PIECES, ...new Set(products.map((p) => p.category))]
}

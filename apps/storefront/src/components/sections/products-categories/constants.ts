export const CATALOG_EYEBROW = "//products"

export const PRODUCT_TABS = [
  { id: "new-arrivals", label: "New arrival", count: 3 },
  { id: "bestsellers", label: "Bestsellers", count: 3 },
  { id: "customisable", label: "Customisable", count: 1 },
] as const

export type ProductTabId = (typeof PRODUCT_TABS)[number]["id"]

export type CatalogProduct = {
  id: string
  name: string
  status: "AVAILABLE" | "SOLD"
  price: string
  image: string
  alt: string
  href: string
}

/**
 * Trophy photography in `public/images/catalog/`. Every card opens a PDP the
 * seed creates — handles here must match `apps/medusa/src/scripts/seed.ts` and
 * `trophy-collection.ts`. Extend this as new trophy photography lands.
 */
const IMG = {
  statuette: "/images/catalog/trophy-achievement-statuette.webp",
  figure: "/images/catalog/trophy-figure-award.webp",
  plaque: "/images/catalog/plaque-studio.webp",
} as const

const PDP = {
  statuette: "/products/achievement-statuette",
  figure: "/products/ascent-figure-award",
  plaque: "/products/engraved-wooden-plaque",
} as const

const AVAILABLE = "AVAILABLE" as const

const STATUETTE: Omit<CatalogProduct, "id"> = {
  name: "Achievement Statuette",
  status: AVAILABLE,
  price: "₹15,300",
  image: IMG.statuette,
  alt: "Gilded figure statuette on a black marble plinth",
  href: PDP.statuette,
}

const FIGURE: Omit<CatalogProduct, "id"> = {
  name: "Ascent Figure Award",
  status: AVAILABLE,
  price: "₹20,400",
  image: IMG.figure,
  alt: "Gilt figure award rising through a ring on a mahogany base",
  href: PDP.figure,
}

const PLAQUE: Omit<CatalogProduct, "id"> = {
  name: "Engraved Wooden Plaque",
  status: AVAILABLE,
  price: "₹8,499",
  image: IMG.plaque,
  alt: "Engraved wooden award plaque",
  href: PDP.plaque,
}

export const PRODUCTS_BY_TAB: Record<ProductTabId, CatalogProduct[]> = {
  "new-arrivals": [
    { id: "ascent-figure", ...FIGURE },
    { id: "achievement-statuette", ...STATUETTE },
    { id: "engraved-plaque", ...PLAQUE },
  ],
  bestsellers: [
    { id: "bs-plaque", ...PLAQUE },
    { id: "bs-statuette", ...STATUETTE },
    { id: "bs-figure", ...FIGURE },
  ],
  customisable: [{ id: "c-plaque", ...PLAQUE }],
}

/**
 * Trophy collections on the category stage. Each slot shows a procedural 3D
 * model based on its corresponding product photograph.
 */
export type DisciplineId = "awards" | "plaques" | "corporate"

export type ProductKind = "statuette" | "figure" | "plaque"

export const PRODUCT_LABELS: Record<ProductKind, string> = {
  statuette: "Gold achievement statuette",
  figure: "Gold ring figure award",
  plaque: "Arched walnut award plaque",
}

export type Discipline = {
  id: DisciplineId
  label: string
  count: number
  href: string
  pieces: readonly [ProductKind, ProductKind, ProductKind]
  images: readonly [string, string, string]
  alts: readonly [string, string, string]
}

const ALT = {
  statuette: "Gilded figure statuette on a black marble plinth",
  figure: "Gilt figure award on an octagonal mahogany base",
  plaque: "Engraved wooden award plaque",
} as const

export const DISCIPLINES: Discipline[] = [
  {
    id: "awards",
    label: "Awards",
    count: 3,
    href: "/trophies",
    // Same order as STUDIO_PIECES: the studio piece picker reuses this set.
    pieces: ["statuette", "figure", "plaque"],
    images: [IMG.statuette, IMG.figure, IMG.plaque],
    alts: [ALT.statuette, ALT.figure, ALT.plaque],
  },
  {
    id: "plaques",
    label: "Plaques",
    count: 1,
    href: "/trophies?sub=Academic",
    pieces: ["plaque", "figure", "statuette"],
    images: [IMG.plaque, IMG.figure, IMG.statuette],
    alts: [ALT.plaque, ALT.figure, ALT.statuette],
  },
  {
    id: "corporate",
    label: "Corporate",
    count: 2,
    href: "/trophies?sub=Corporate",
    pieces: ["statuette", "plaque", "figure"],
    images: [IMG.statuette, IMG.plaque, IMG.figure],
    alts: [ALT.statuette, ALT.plaque, ALT.figure],
  },
]

export const CATEGORY_EYEBROW = "//collections"

export const DEFAULT_DISCIPLINE_ID: DisciplineId = "awards"

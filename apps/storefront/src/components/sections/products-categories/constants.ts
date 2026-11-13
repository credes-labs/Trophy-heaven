export const CATALOG_EYEBROW = "//products"

export const PRODUCT_TABS = [
  { id: "new-arrivals", label: "New arrival", count: 8 },
  { id: "bestsellers", label: "Bestsellers", count: 8 },
  { id: "sculptures", label: "Sculptures", count: 12 },
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
 * Product photography added in October 2026. Every card opens a PDP the seed
 * creates — handles here must match `apps/medusa/src/scripts/*-collection.ts`.
 */
const IMG = {
  nesting: "/images/catalog/table-brass-nesting-1.webp",
  side: "/images/catalog/table-marble-side.webp",
  hex: "/images/catalog/table-brass-hex-glass.webp",
  octagon: "/images/catalog/table-marble-octagon.webp",
  statuette: "/images/catalog/trophy-achievement-statuette.webp",
  figure: "/images/catalog/trophy-figure-award.webp",
  plaque: "/images/catalog/plaque-studio.webp",
  loop: "/images/catalog/sculpture-loop-verdigris-1.webp",
  disc: "/images/catalog/sculpture-disc-pierced-1.webp",
  splitRib: "/images/catalog/sculpture-split-rib.webp",
  sunburst: "/images/catalog/sculpture-sunburst-disc.webp",
  gilt: "/images/catalog/sculpture-gold-burst.webp",
  reef: "/images/catalog/sculpture-reef-totem-1.webp",
  wave: "/images/catalog/sculpture-verdigris-wave.webp",
  ripple: "/images/catalog/sculpture-ripple-disc.webp",
  rings: "/images/catalog/sculpture-interlocking-rings.webp",
  oval: "/images/catalog/sculpture-fluted-oval.webp",
  obsidian: "/images/catalog/sculpture-black-totem.webp",
  wreath: "/images/catalog/sculpture-green-wreath.webp",
} as const

const PDP = {
  nesting: "/products/brass-nesting-tables",
  side: "/products/marble-top-side-table",
  hex: "/products/brass-hex-glass-table",
  octagon: "/products/marble-octagon-coffee-table",
  statuette: "/products/achievement-statuette",
  figure: "/products/ascent-figure-award",
  plaque: "/products/engraved-wooden-plaque",
  loop: "/products/verdigris-loop-sculpture",
  disc: "/products/pierced-bronze-disc",
  splitRib: "/products/split-rib-sculpture",
  sunburst: "/products/sunburst-disc-sculpture",
  gilt: "/products/gilt-burst-objet",
  reef: "/products/reef-totem-sculpture",
  wave: "/products/verdigris-wave-sculpture",
  ripple: "/products/ripple-disc-sculpture",
  rings: "/products/interlocking-rings-sculpture",
  oval: "/products/fluted-oval-objet",
  obsidian: "/products/obsidian-totem-sculpture",
  wreath: "/products/verdigris-wreath-sculpture",
} as const

const AVAILABLE = "AVAILABLE" as const

export const PRODUCTS_BY_TAB: Record<ProductTabId, CatalogProduct[]> = {
  "new-arrivals": [
    {
      id: "brass-nesting",
      name: "Brass Nesting Tables",
      status: AVAILABLE,
      price: "₹54,400",
      image: IMG.nesting,
      alt: "Pair of brass pedestal nesting tables with tray tops on a marble floor",
      href: PDP.nesting,
    },
    {
      id: "marble-side",
      name: "Marble-Top Side Table",
      status: AVAILABLE,
      price: "₹66,300",
      image: IMG.side,
      alt: "Honed marble side table on a slim brass column",
      href: PDP.side,
    },
    {
      id: "brass-hex",
      name: "Brass Hex Glass Table",
      status: AVAILABLE,
      price: "₹78,200",
      image: IMG.hex,
      alt: "Hexagonal glass table on a brass frame",
      href: PDP.hex,
    },
    {
      id: "marble-octagon",
      name: "Marble Octagon Coffee Table",
      status: AVAILABLE,
      price: "₹97,750",
      image: IMG.octagon,
      alt: "Octagonal marble coffee table on a brass base",
      href: PDP.octagon,
    },
    {
      id: "achievement-statuette",
      name: "Achievement Statuette",
      status: AVAILABLE,
      price: "₹15,300",
      image: IMG.statuette,
      alt: "Gilded figure statuette on a black marble plinth",
      href: PDP.statuette,
    },
    {
      id: "ascent-figure",
      name: "Ascent Figure Award",
      status: AVAILABLE,
      price: "₹20,400",
      image: IMG.figure,
      alt: "Gilt figure award rising through a ring on a mahogany base",
      href: PDP.figure,
    },
    {
      id: "engraved-plaque",
      name: "Engraved Wooden Plaque",
      status: AVAILABLE,
      price: "₹8,499",
      image: IMG.plaque,
      alt: "Engraved wooden award plaque",
      href: PDP.plaque,
    },
    {
      id: "reef-totem",
      name: "Reef Totem Sculpture",
      status: AVAILABLE,
      price: "₹44,200",
      image: IMG.reef,
      alt: "Openwork bronze reef totem sculpture",
      href: PDP.reef,
    },
  ],
  bestsellers: [
    {
      id: "bs-loop",
      name: "Verdigris Loop Sculpture",
      status: AVAILABLE,
      price: "₹35,700",
      image: IMG.loop,
      alt: "Verdigris bronze loop sculpture on a marble plinth",
      href: PDP.loop,
    },
    {
      id: "bs-nesting",
      name: "Brass Nesting Tables",
      status: AVAILABLE,
      price: "₹54,400",
      image: IMG.nesting,
      alt: "Pair of brass pedestal nesting tables with tray tops",
      href: PDP.nesting,
    },
    {
      id: "bs-disc",
      name: "Pierced Bronze Disc",
      status: AVAILABLE,
      price: "₹32,300",
      image: IMG.disc,
      alt: "Pierced bronze disc sculpture with almond apertures",
      href: PDP.disc,
    },
    {
      id: "bs-hex",
      name: "Brass Hex Glass Table",
      status: AVAILABLE,
      price: "₹78,200",
      image: IMG.hex,
      alt: "Hexagonal glass table on a brass frame",
      href: PDP.hex,
    },
    {
      id: "bs-statuette",
      name: "Achievement Statuette",
      status: AVAILABLE,
      price: "₹15,300",
      image: IMG.statuette,
      alt: "Gilded figure statuette on a black marble plinth",
      href: PDP.statuette,
    },
    {
      id: "bs-sunburst",
      name: "Sunburst Disc Sculpture",
      status: AVAILABLE,
      price: "₹33,575",
      image: IMG.sunburst,
      alt: "Bronze sunburst disc sculpture on a mahogany console",
      href: PDP.sunburst,
    },
    {
      id: "bs-octagon",
      name: "Marble Octagon Coffee Table",
      status: AVAILABLE,
      price: "₹97,750",
      image: IMG.octagon,
      alt: "Octagonal marble coffee table on a brass base",
      href: PDP.octagon,
    },
    {
      id: "bs-rings",
      name: "Interlocking Rings Sculpture",
      status: AVAILABLE,
      price: "₹28,050",
      image: IMG.rings,
      alt: "Interlocking gilt-bronze rings on a marble foot",
      href: PDP.rings,
    },
  ],
  sculptures: [
    {
      id: "s-loop",
      name: "Verdigris Loop Sculpture",
      status: AVAILABLE,
      price: "₹35,700",
      image: IMG.loop,
      alt: "Verdigris bronze loop sculpture on a marble plinth",
      href: PDP.loop,
    },
    {
      id: "s-disc",
      name: "Pierced Bronze Disc",
      status: AVAILABLE,
      price: "₹32,300",
      image: IMG.disc,
      alt: "Pierced bronze disc sculpture with almond apertures",
      href: PDP.disc,
    },
    {
      id: "s-split-rib",
      name: "Split Rib Sculpture",
      status: AVAILABLE,
      price: "₹28,900",
      image: IMG.splitRib,
      alt: "Split ribbed bronze disc sculpture",
      href: PDP.splitRib,
    },
    {
      id: "s-sunburst",
      name: "Sunburst Disc Sculpture",
      status: AVAILABLE,
      price: "₹33,575",
      image: IMG.sunburst,
      alt: "Bronze sunburst disc sculpture on a mahogany console",
      href: PDP.sunburst,
    },
    {
      id: "s-gilt",
      name: "Gilt Burst Objet",
      status: AVAILABLE,
      price: "₹38,250",
      image: IMG.gilt,
      alt: "Gilded burst sculpture with a centre hole on a marble plinth",
      href: PDP.gilt,
    },
    {
      id: "s-reef",
      name: "Reef Totem Sculpture",
      status: AVAILABLE,
      price: "₹44,200",
      image: IMG.reef,
      alt: "Openwork bronze reef totem sculpture",
      href: PDP.reef,
    },
    {
      id: "s-wave",
      name: "Verdigris Wave Sculpture",
      status: AVAILABLE,
      price: "₹34,850",
      image: IMG.wave,
      alt: "Verdigris wave crescent sculpture on a walnut drawer unit",
      href: PDP.wave,
    },
    {
      id: "s-ripple",
      name: "Ripple Disc Sculpture",
      status: AVAILABLE,
      price: "₹30,600",
      image: IMG.ripple,
      alt: "Ripple-textured bronze disc sculpture on a marble plinth",
      href: PDP.ripple,
    },
    {
      id: "s-rings",
      name: "Interlocking Rings Sculpture",
      status: AVAILABLE,
      price: "₹28,050",
      image: IMG.rings,
      alt: "Interlocking gilt-bronze rings on a marble foot",
      href: PDP.rings,
    },
    {
      id: "s-oval",
      name: "Fluted Oval Objet",
      status: AVAILABLE,
      price: "₹25,500",
      image: IMG.oval,
      alt: "Green fluted oval sculpture on a brass tray table",
      href: PDP.oval,
    },
    {
      id: "s-obsidian",
      name: "Obsidian Totem Sculpture",
      status: AVAILABLE,
      price: "₹40,800",
      image: IMG.obsidian,
      alt: "Black textured totem sculpture on a marble base",
      href: PDP.obsidian,
    },
    {
      id: "s-wreath",
      name: "Verdigris Wreath Sculpture",
      status: AVAILABLE,
      price: "₹37,400",
      image: IMG.wreath,
      alt: "Green organic wreath sculpture on a walnut sideboard",
      href: PDP.wreath,
    },
  ],
}

/**
 * The three disciplines the workshop works in. Each stage slot shows a
 * procedural 3D model based on its corresponding product photograph.
 */
export type DisciplineId = "tables" | "trophies" | "sculptures"

export type ProductKind =
  "nesting" | "octagon" | "hex" | "statuette" | "figure" | "plaque" | "loop" | "sunburst" | "rings"

export const PRODUCT_LABELS: Record<ProductKind, string> = {
  nesting: "Brass pedestal nesting tables",
  octagon: "Octagonal marble coffee table",
  hex: "Hexagonal glass tables with brass frames",
  statuette: "Gold achievement statuette",
  figure: "Gold ring figure award",
  plaque: "Arched walnut award plaque",
  loop: "Verdigris bronze loop sculpture",
  sunburst: "Bronze sunburst disc",
  rings: "Interlocking bronze rings",
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

export const DISCIPLINES: Discipline[] = [
  {
    id: "tables",
    label: "Tables",
    count: 4,
    href: "/shop?category=furniture",
    pieces: ["nesting", "octagon", "hex"],
    images: [IMG.nesting, IMG.octagon, IMG.hex],
    alts: [
      "Pair of brass pedestal nesting tables with tray tops",
      "Octagonal marble coffee table on a brass base",
      "Hexagonal glass table on a brass frame",
    ],
  },
  {
    id: "trophies",
    label: "Trophies",
    count: 3,
    href: "/shop?category=trophies",
    pieces: ["statuette", "figure", "plaque"],
    images: [IMG.statuette, IMG.figure, IMG.plaque],
    alts: [
      "Gilded figure statuette on a black marble plinth",
      "Gilt figure award on an octagonal mahogany base",
      "Engraved wooden award plaque",
    ],
  },
  {
    id: "sculptures",
    label: "Sculptures",
    count: 12,
    href: "/artwork",
    pieces: ["loop", "sunburst", "rings"],
    images: [IMG.loop, IMG.sunburst, IMG.rings],
    alts: [
      "Verdigris bronze loop sculpture on a marble plinth",
      "Bronze sunburst disc sculpture",
      "Interlocking gilt-bronze rings on a marble foot",
    ],
  },
]

export const CATEGORY_EYEBROW = "//categories"

export const DEFAULT_DISCIPLINE_ID: DisciplineId = "tables"

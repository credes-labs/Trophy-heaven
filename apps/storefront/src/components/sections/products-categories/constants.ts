export const CATALOG_EYEBROW = "//products"

export const PRODUCT_TABS = [
  { id: "new-arrivals", label: "New arrival", count: 9 },
  { id: "bestsellers", label: "Bestsellers", count: 12 },
  { id: "on-sale", label: "Discounted", count: 6 },
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

const IMG = {
  lounge: "/images/catalog/seating-lounge.jpg",
  armchair: "/images/catalog/seating-armchair.jpg",
  coffee: "/images/catalog/tables-coffee.jpg",
  dining: "/images/catalog/tables-dining.jpg",
  side: "/images/catalog/tables-side.jpg",
  shelf: "/images/catalog/storage-shelf.jpg",
} as const

export const PRODUCTS_BY_TAB: Record<ProductTabId, CatalogProduct[]> = {
  "new-arrivals": [
    {
      id: "luno-210",
      name: "Luno 210 lounge chair",
      status: "AVAILABLE",
      price: "$ 1,980.00",
      image: IMG.lounge,
      alt: "Walnut lounge chair with oatmeal bouclé upholstery",
      href: "/shop",
    },
    {
      id: "verra-dining",
      name: "Verra wooden dining table",
      status: "SOLD",
      price: "$ 3,450.00",
      image: IMG.dining,
      alt: "Oval walnut dining table with gold-capped chairs",
      href: "/shop",
    },
    {
      id: "noir-armchair",
      name: "Noir leather armchair",
      status: "AVAILABLE",
      price: "$ 2,250.00",
      image: IMG.armchair,
      alt: "Walnut armchair with taupe bouclé cushions",
      href: "/shop",
    },
    {
      id: "aura-sideboard",
      name: "Aura minimal sideboard",
      status: "SOLD",
      price: "$ 1,720.00",
      image: IMG.shelf,
      alt: "Lit walnut bookshelf with brass posts",
      href: "/shop",
    },
    {
      id: "sola-coffee",
      name: "Sola oval coffee table",
      status: "AVAILABLE",
      price: "$ 1,280.00",
      image: IMG.coffee,
      alt: "Low oval wood coffee table with brass inlay",
      href: "/shop",
    },
    {
      id: "orbit-side",
      name: "Orbit glass side table",
      status: "AVAILABLE",
      price: "$ 890.00",
      image: IMG.side,
      alt: "Round fluted-glass side table with walnut legs",
      href: "/shop",
    },
    {
      id: "kino-lounge",
      name: "Kino bouclé lounge",
      status: "AVAILABLE",
      price: "$ 2,140.00",
      image: IMG.lounge,
      alt: "Walnut lounge chair in a warm plaster interior",
      href: "/shop",
    },
    {
      id: "halo-shelf",
      name: "Halo walnut shelf",
      status: "AVAILABLE",
      price: "$ 1,640.00",
      image: IMG.shelf,
      alt: "Four-tier walnut shelf with brass legs",
      href: "/shop",
    },
    {
      id: "mara-chair",
      name: "Mara dining chair",
      status: "SOLD",
      price: "$ 740.00",
      image: IMG.armchair,
      alt: "Dining armchair with brass-tipped legs",
      href: "/shop",
    },
  ],
  bestsellers: [
    {
      id: "bs-1",
      name: "Luno 210 lounge chair",
      status: "AVAILABLE",
      price: "$ 1,980.00",
      image: IMG.lounge,
      alt: "Walnut lounge chair with oatmeal bouclé upholstery",
      href: "/shop",
    },
    {
      id: "bs-2",
      name: "Noir leather armchair",
      status: "AVAILABLE",
      price: "$ 2,250.00",
      image: IMG.armchair,
      alt: "Walnut armchair with taupe bouclé cushions",
      href: "/shop",
    },
    {
      id: "bs-3",
      name: "Sola oval coffee table",
      status: "AVAILABLE",
      price: "$ 1,280.00",
      image: IMG.coffee,
      alt: "Low oval wood coffee table with brass inlay",
      href: "/shop",
    },
    {
      id: "bs-4",
      name: "Verra wooden dining table",
      status: "SOLD",
      price: "$ 3,450.00",
      image: IMG.dining,
      alt: "Oval walnut dining table in an olive dining room",
      href: "/shop",
    },
    {
      id: "bs-5",
      name: "Orbit glass side table",
      status: "AVAILABLE",
      price: "$ 890.00",
      image: IMG.side,
      alt: "Round fluted-glass side table with walnut legs",
      href: "/shop",
    },
    {
      id: "bs-6",
      name: "Halo walnut shelf",
      status: "AVAILABLE",
      price: "$ 1,640.00",
      image: IMG.shelf,
      alt: "Lit walnut bookshelf with brass posts",
      href: "/shop",
    },
    {
      id: "bs-7",
      name: "Aura minimal sideboard",
      status: "SOLD",
      price: "$ 1,720.00",
      image: IMG.shelf,
      alt: "Walnut storage cabinet with brass handles",
      href: "/shop",
    },
    {
      id: "bs-8",
      name: "Kino bouclé lounge",
      status: "AVAILABLE",
      price: "$ 2,140.00",
      image: IMG.lounge,
      alt: "Walnut lounge chair in a warm plaster interior",
      href: "/shop",
    },
    {
      id: "bs-9",
      name: "Mara dining chair",
      status: "AVAILABLE",
      price: "$ 740.00",
      image: IMG.armchair,
      alt: "Dining armchair with brass-tipped legs",
      href: "/shop",
    },
    {
      id: "bs-10",
      name: "Nera dining table",
      status: "AVAILABLE",
      price: "$ 3,120.00",
      image: IMG.dining,
      alt: "Walnut dining table with gold-capped chairs",
      href: "/shop",
    },
    {
      id: "bs-11",
      name: "Pebble coffee table",
      status: "SOLD",
      price: "$ 1,150.00",
      image: IMG.coffee,
      alt: "Sculptural wood coffee table on a navy rug",
      href: "/shop",
    },
    {
      id: "bs-12",
      name: "Lumen side table",
      status: "AVAILABLE",
      price: "$ 640.00",
      image: IMG.side,
      alt: "Glass and walnut side table with olive branch",
      href: "/shop",
    },
  ],
  "on-sale": [
    {
      id: "os-1",
      name: "Orbit glass side table",
      status: "AVAILABLE",
      price: "$ 890.00",
      image: IMG.side,
      alt: "Round fluted-glass side table with walnut legs",
      href: "/shop",
    },
    {
      id: "os-2",
      name: "Mara dining chair",
      status: "SOLD",
      price: "$ 740.00",
      image: IMG.armchair,
      alt: "Dining armchair with brass-tipped legs",
      href: "/shop",
    },
    {
      id: "os-3",
      name: "Pebble coffee table",
      status: "AVAILABLE",
      price: "$ 1,150.00",
      image: IMG.coffee,
      alt: "Sculptural wood coffee table on a navy rug",
      href: "/shop",
    },
    {
      id: "os-4",
      name: "Halo walnut shelf",
      status: "AVAILABLE",
      price: "$ 1,640.00",
      image: IMG.shelf,
      alt: "Lit walnut bookshelf with brass posts",
      href: "/shop",
    },
    {
      id: "os-5",
      name: "Kino bouclé lounge",
      status: "SOLD",
      price: "$ 2,140.00",
      image: IMG.lounge,
      alt: "Walnut lounge chair in a warm plaster interior",
      href: "/shop",
    },
    {
      id: "os-6",
      name: "Nera dining table",
      status: "AVAILABLE",
      price: "$ 3,120.00",
      image: IMG.dining,
      alt: "Walnut dining table with gold-capped chairs",
      href: "/shop",
    },
  ],
}

export type CatalogCategory = {
  id: string
  label: string
  count: number
  href: string
  images: readonly [string, string, string]
  alts: readonly [string, string, string]
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    id: "seating",
    label: "Seating",
    count: 48,
    href: "/shop?category=furniture",
    images: [IMG.lounge, IMG.armchair, IMG.side],
    alts: [
      "Walnut lounge chair in a plaster living room",
      "Bouclé armchair against a navy panelled wall",
      "Glass side table beside a lounge chair",
    ],
  },
  {
    id: "storage",
    label: "Storage",
    count: 32,
    href: "/shop?category=furniture",
    images: [IMG.shelf, IMG.side, IMG.dining],
    alts: [
      "Brass-framed walnut bookshelf",
      "Walnut cabinet behind a glass side table",
      "Dining room credenza with a gold lamp",
    ],
  },
  {
    id: "bedroom",
    label: "Bedroom",
    count: 27,
    href: "/shop?category=furniture",
    images: [IMG.side, IMG.lounge, IMG.armchair],
    alts: [
      "Quiet bedside table with fluted glass",
      "Lounge chair in a warm, low-lit room",
      "Armchair as a bedroom reading seat",
    ],
  },
  {
    id: "outdoor",
    label: "Outdoor",
    count: 21,
    href: "/shop?category=furniture",
    images: [IMG.dining, IMG.coffee, IMG.lounge],
    alts: [
      "Dining setting with olive branches",
      "Low table styled with a planter",
      "Lounge chair beside an indoor tree",
    ],
  },
  {
    id: "tables",
    label: "Tables",
    count: 15,
    href: "/shop?category=furniture",
    images: [IMG.coffee, IMG.dining, IMG.side],
    alts: [
      "Oval coffee table on a navy rug",
      "Walnut dining table for eight",
      "Round glass side table with brass clips",
    ],
  },
]

export const CATEGORY_EYEBROW = "//categories"

/** Figma default: Bedroom is the large, fully opaque row. */
export const DEFAULT_CATEGORY_ID = "bedroom"

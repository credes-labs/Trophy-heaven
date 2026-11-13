/** Figma Explore copy. Sizes live as em on the section so they scale. */

export const EXPLORE_HEADLINE = "Explore the collection"

export const EXPLORE_BODY =
  "Trophies, tables, and cast sculpture from the same Bengaluru workshop. Filter by discipline, price, and finish."

export const EXPLORE_FILTER_LABEL = "filter"
export const EXPLORE_SORT_LABEL = "sort by"
export const EXPLORE_CLEAR_LABEL = "clear filters"

export const EXPLORE_FILTERS = [
  { id: "category", label: "category" },
  { id: "price", label: "price" },
  { id: "color", label: "Colors" },
  { id: "brand", label: "brand" },
  { id: "rating", label: "rating" },
] as const

export type ExploreFilterId = (typeof EXPLORE_FILTERS)[number]["id"]

export const EXPLORE_SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Rating" },
] as const

export type ExploreSortId = (typeof EXPLORE_SORTS)[number]["id"]

export type ExploreProduct = {
  id: string
  category: string
  name: string
  price: string
  amount: number
  rating: number
  reviews: number
  reviewsLabel: string
  image: string
  alt: string
  href: string
  color: string
  brand: string
}

export const EXPLORE_HERO = {
  src: "/images/explore/hero-atelier.webp",
  alt: "Walnut sideboard and leather armchair in a dark, gold-lit atelier",
} as const

export const EXPLORE_PRODUCTS: ExploreProduct[] = [
  {
    id: "brass-nesting-tables",
    category: "Nesting Tables",
    name: "Brass Nesting Tables",
    price: "₹54,400",
    amount: 54400,
    rating: 4.9,
    reviews: 125,
    reviewsLabel: "4.9 (125 reviews)",
    image: "/images/catalog/table-brass-nesting-1.webp",
    alt: "Pair of brass pedestal nesting tables with tray tops on a marble floor",
    href: "/products/brass-nesting-tables",
    color: "Brass",
    brand: "Legacy Crafts",
  },
  {
    id: "marble-top-side-table",
    category: "Side Table",
    name: "Marble-Top Side Table",
    price: "₹66,300",
    amount: 66300,
    rating: 4.8,
    reviews: 89,
    reviewsLabel: "4.8 (89 reviews)",
    image: "/images/catalog/table-marble-side.webp",
    alt: "Honed marble side table on a slim brass column",
    href: "/products/marble-top-side-table",
    color: "Marble",
    brand: "Legacy Crafts",
  },
  {
    id: "brass-hex-glass-table",
    category: "Coffee Table",
    name: "Brass Hex Glass Table",
    price: "₹78,200",
    amount: 78200,
    rating: 5,
    reviews: 102,
    reviewsLabel: "5.0 (102 reviews)",
    image: "/images/catalog/table-brass-hex-glass.webp",
    alt: "Hexagonal glass table on a brass frame",
    href: "/products/brass-hex-glass-table",
    color: "Brass",
    brand: "Legacy Crafts",
  },
  {
    id: "marble-octagon-coffee-table",
    category: "Coffee Table",
    name: "Marble Octagon Coffee Table",
    price: "₹97,750",
    amount: 97750,
    rating: 4.7,
    reviews: 76,
    reviewsLabel: "4.7 (76 reviews)",
    image: "/images/catalog/table-marble-octagon.webp",
    alt: "Octagonal marble coffee table on a brass base",
    href: "/products/marble-octagon-coffee-table",
    color: "Marble",
    brand: "Legacy Crafts",
  },
  {
    id: "achievement-statuette",
    category: "Statuette",
    name: "Achievement Statuette",
    price: "₹15,300",
    amount: 15300,
    rating: 4.6,
    reviews: 64,
    reviewsLabel: "4.6 (64 reviews)",
    image: "/images/catalog/trophy-achievement-statuette.webp",
    alt: "Gilded figure statuette on a black marble plinth",
    href: "/products/achievement-statuette",
    color: "Gold",
    brand: "Legacy Crafts",
  },
  {
    id: "ascent-figure-award",
    category: "Award",
    name: "Ascent Figure Award",
    price: "₹20,400",
    amount: 20400,
    rating: 4.9,
    reviews: 55,
    reviewsLabel: "4.9 (55 reviews)",
    image: "/images/catalog/trophy-figure-award.webp",
    alt: "Gilt figure award rising through a ring on a mahogany base",
    href: "/products/ascent-figure-award",
    color: "Gold",
    brand: "Legacy Crafts",
  },
  {
    id: "verdigris-loop-sculpture",
    category: "Sculpture",
    name: "Verdigris Loop Sculpture",
    price: "₹35,700",
    amount: 35700,
    rating: 4.8,
    reviews: 110,
    reviewsLabel: "4.8 (110 reviews)",
    image: "/images/catalog/sculpture-loop-verdigris-1.webp",
    alt: "Verdigris bronze loop sculpture on a marble plinth",
    href: "/products/verdigris-loop-sculpture",
    color: "Verdigris",
    brand: "Legacy Crafts",
  },
  {
    id: "pierced-bronze-disc",
    category: "Sculpture",
    name: "Pierced Bronze Disc",
    price: "₹32,300",
    amount: 32300,
    rating: 4.7,
    reviews: 80,
    reviewsLabel: "4.7 (80 reviews)",
    image: "/images/catalog/sculpture-disc-pierced-1.webp",
    alt: "Pierced bronze disc sculpture with almond apertures",
    href: "/products/pierced-bronze-disc",
    color: "Bronze",
    brand: "Legacy Crafts",
  },
]

export const FILTER_OPTIONS: Record<ExploreFilterId, readonly string[]> = {
  category: [...new Set(EXPLORE_PRODUCTS.map((item) => item.category))],
  price: ["Under ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000+"],
  color: ["Brass", "Marble", "Gold", "Bronze", "Verdigris"],
  brand: ["Legacy Crafts"],
  rating: ["4.5 & up", "4.8 & up"],
}

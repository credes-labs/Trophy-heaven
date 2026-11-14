/** Figma Explore copy. Sizes live as em on the section so they scale. */

export const EXPLORE_HEADLINE = "Explore the collection"

export const EXPLORE_BODY =
  "Figure awards, statuettes, and engraved plaques from one Bengaluru workshop. Filter by collection, price, and finish."

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
  src: "/images/brand/gold-cup.webp",
  alt: "Gold Trophy Heaven cup on a marbled burgundy base in warm light",
} as const

export const EXPLORE_PRODUCTS: ExploreProduct[] = [
  {
    id: "ascent-figure-award",
    category: "Figure Awards",
    name: "Ascent Figure Award",
    price: "₹20,400",
    amount: 20400,
    rating: 4.9,
    reviews: 64,
    reviewsLabel: "4.9 (64 reviews)",
    image: "/images/catalog/trophy-figure-award.webp",
    alt: "Gilt figure award rising through a ring on a mahogany base",
    href: "/products/ascent-figure-award",
    color: "Gold",
    brand: "Trophy Heaven",
  },
  {
    id: "achievement-statuette",
    category: "Statuettes",
    name: "Achievement Statuette",
    price: "₹15,300",
    amount: 15300,
    rating: 4.8,
    reviews: 92,
    reviewsLabel: "4.8 (92 reviews)",
    image: "/images/catalog/trophy-achievement-statuette.webp",
    alt: "Gilded figure statuette on a black marble plinth",
    href: "/products/achievement-statuette",
    color: "Gold",
    brand: "Trophy Heaven",
  },
  {
    id: "engraved-wooden-plaque",
    category: "Plaques",
    name: "Engraved Wooden Plaque",
    price: "₹8,499",
    amount: 8499,
    rating: 4.7,
    reviews: 118,
    reviewsLabel: "4.7 (118 reviews)",
    image: "/images/catalog/plaque-engraved.webp",
    alt: "Engraved wooden award plaque with a brass plate",
    href: "/products/engraved-wooden-plaque",
    color: "Walnut",
    brand: "Trophy Heaven",
  },
]

export const PRICE_OPTIONS = ["Under ₹10,000", "₹10,000 – ₹20,000", "₹20,000+"] as const

export const FILTER_OPTIONS: Record<ExploreFilterId, readonly string[]> = {
  category: [...new Set(EXPLORE_PRODUCTS.map((item) => item.category))],
  price: PRICE_OPTIONS,
  color: [...new Set(EXPLORE_PRODUCTS.map((item) => item.color))],
  brand: ["Trophy Heaven"],
  rating: ["4.5 & up", "4.8 & up"],
}

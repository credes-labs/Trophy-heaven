/** Figma Explore copy. Sizes live as em on the section so they scale. */

export const EXPLORE_HEADLINE = "Explore Our Curated Furniture Collection"

export const EXPLORE_BODY =
  "Legacy pieces are designed for comfort and quality. Explore our range to find furniture that reflects your style."

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
  src: "/images/explore/hero-atelier.jpg",
  alt: "Walnut sideboard and leather armchair in a dark, gold-lit atelier",
} as const

export const EXPLORE_PRODUCTS: ExploreProduct[] = [
  {
    id: "oslo-leather",
    category: "Lounge Chair",
    name: "Oslo Leather",
    price: "$1,250.00",
    amount: 1250,
    rating: 4.9,
    reviews: 125,
    reviewsLabel: "4.9 (125 reviews)",
    image: "/images/explore/oslo-leather.jpg",
    alt: "Walnut lounge chair with cream bouclé in a plaster living room",
    href: "/shop",
    color: "Walnut",
    brand: "Legacy",
  },
  {
    id: "nova-oak",
    category: "Coffee Table",
    name: "Nova Oak",
    price: "$720.00",
    amount: 720,
    rating: 4.8,
    reviews: 89,
    reviewsLabel: "4.8 (89 reviews)",
    image: "/images/explore/nova-oak.jpg",
    alt: "Oval oak coffee table with brass inlay against a navy wall",
    href: "/shop",
    color: "Oak",
    brand: "Legacy",
  },
  {
    id: "aria-minimal",
    category: "Bookshelf",
    name: "Aria Minimal",
    price: "$980.00",
    amount: 980,
    rating: 5,
    reviews: 102,
    reviewsLabel: "5.0 (102 reviews)",
    image: "/images/explore/aria-minimal.jpg",
    alt: "Walnut bookshelf with brass posts and warm shelf lighting",
    href: "/shop",
    color: "Walnut",
    brand: "Legacy",
  },
  {
    id: "eclipse-maple",
    category: "Dining Table",
    name: "Eclipse Maple",
    price: "$860.00",
    amount: 860,
    rating: 4.7,
    reviews: 76,
    reviewsLabel: "4.7 (76 reviews)",
    image: "/images/explore/eclipse-maple.jpg",
    alt: "Oval walnut dining table with cream chairs in an olive room",
    href: "/shop",
    color: "Walnut",
    brand: "Legacy",
  },
  {
    id: "sierra-fabric",
    category: "Armchair",
    name: "Sierra Fabric",
    price: "$1,420.00",
    amount: 1420,
    rating: 4.6,
    reviews: 64,
    reviewsLabel: "4.6 (64 reviews)",
    image: "/images/explore/sierra-fabric.jpg",
    alt: "Bouclé armchair with walnut frame against a navy panelled wall",
    href: "/shop",
    color: "Navy",
    brand: "Legacy",
  },
  {
    id: "vertex-glass",
    category: "Side Table",
    name: "Vertex Glass",
    price: "$230.00",
    amount: 230,
    rating: 4.9,
    reviews: 55,
    reviewsLabel: "4.9 (55 reviews)",
    image: "/images/explore/vertex-glass.jpg",
    alt: "Fluted-glass side table with walnut legs and brass clips",
    href: "/shop",
    color: "Brass",
    brand: "Legacy",
  },
  {
    id: "luna-brass",
    category: "Floor Lamp",
    name: "Luna Brass",
    price: "$890.00",
    amount: 890,
    rating: 4.8,
    reviews: 110,
    reviewsLabel: "4.8 (110 reviews)",
    image: "/images/explore/luna-brass.jpg",
    alt: "Brass floor lamp beside a walnut sideboard in a dark panelled room",
    href: "/shop",
    color: "Brass",
    brand: "Legacy",
  },
  {
    id: "woven-jute",
    category: "Area Rug",
    name: "Woven Jute",
    price: "$530.00",
    amount: 530,
    rating: 4.7,
    reviews: 80,
    reviewsLabel: "4.7 (80 reviews)",
    image: "/images/explore/woven-jute.jpg",
    alt: "Woven jute rug in a forest-green living room",
    href: "/shop",
    color: "Cream",
    brand: "Legacy",
  },
  {
    id: "haven-pine",
    category: "Nightstand",
    name: "Haven Pine",
    price: "$780.00",
    amount: 780,
    rating: 4.9,
    reviews: 95,
    reviewsLabel: "4.9 (95 reviews)",
    image: "/images/explore/haven-pine.jpg",
    alt: "Walnut nightstand with a brass mushroom lamp beside a cream bed",
    href: "/shop",
    color: "Walnut",
    brand: "Legacy",
  },
]

export const FILTER_OPTIONS: Record<ExploreFilterId, readonly string[]> = {
  category: [...new Set(EXPLORE_PRODUCTS.map((item) => item.category))],
  price: ["Under $500", "$500 – $1,000", "$1,000+"],
  color: ["Walnut", "Oak", "Brass", "Navy", "Cream"],
  brand: ["Legacy"],
  rating: ["4.5 & up", "4.8 & up"],
}

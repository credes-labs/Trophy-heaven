/** Figma Explore copy. Sizes live as em on the section so they scale. */

export const EXPLORE_HEADLINE = "Explore the collection"

export const EXPLORE_BODY =
  "Trophies, furniture, and artwork from the same Bengaluru workshop. Filter by discipline, price, and finish."

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
    price: "₹1,06,250",
    amount: 106250,
    rating: 4.9,
    reviews: 125,
    reviewsLabel: "4.9 (125 reviews)",
    image: "/images/explore/oslo-leather.jpg",
    alt: "Walnut lounge chair with cream bouclé in a plaster living room",
    href: "/products/oslo-leather",
    color: "Walnut",
    brand: "Legacy Crafts",
  },
  {
    id: "nova-oak",
    category: "Coffee Table",
    name: "Nova Oak",
    price: "₹61,200",
    amount: 61200,
    rating: 4.8,
    reviews: 89,
    reviewsLabel: "4.8 (89 reviews)",
    image: "/images/explore/nova-oak.jpg",
    alt: "Oval oak coffee table with brass inlay against a navy wall",
    href: "/products/nova-oak",
    color: "Oak",
    brand: "Legacy Crafts",
  },
  {
    id: "aria-minimal",
    category: "Bookshelf",
    name: "Aria Minimal",
    price: "₹83,300",
    amount: 83300,
    rating: 5,
    reviews: 102,
    reviewsLabel: "5.0 (102 reviews)",
    image: "/images/explore/aria-minimal.jpg",
    alt: "Walnut bookshelf with brass posts and warm shelf lighting",
    href: "/products/aria-minimal",
    color: "Walnut",
    brand: "Legacy Crafts",
  },
  {
    id: "eclipse-maple",
    category: "Dining Table",
    name: "Eclipse Maple",
    price: "₹73,100",
    amount: 73100,
    rating: 4.7,
    reviews: 76,
    reviewsLabel: "4.7 (76 reviews)",
    image: "/images/explore/eclipse-maple.jpg",
    alt: "Oval walnut dining table with cream chairs in an olive room",
    href: "/products/eclipse-maple",
    color: "Walnut",
    brand: "Legacy Crafts",
  },
  {
    id: "sierra-fabric",
    category: "Armchair",
    name: "Sierra Fabric",
    price: "₹1,20,700",
    amount: 120700,
    rating: 4.6,
    reviews: 64,
    reviewsLabel: "4.6 (64 reviews)",
    image: "/images/explore/sierra-fabric.jpg",
    alt: "Bouclé armchair with walnut frame against a navy panelled wall",
    href: "/products/sierra-fabric",
    color: "Navy",
    brand: "Legacy Crafts",
  },
  {
    id: "vertex-glass",
    category: "Side Table",
    name: "Vertex Glass",
    price: "₹19,550",
    amount: 19550,
    rating: 4.9,
    reviews: 55,
    reviewsLabel: "4.9 (55 reviews)",
    image: "/images/explore/vertex-glass.jpg",
    alt: "Fluted-glass side table with walnut legs and brass clips",
    href: "/products/vertex-glass",
    color: "Brass",
    brand: "Legacy Crafts",
  },
  {
    id: "luna-brass",
    category: "Floor Lamp",
    name: "Luna Brass",
    price: "₹75,650",
    amount: 75650,
    rating: 4.8,
    reviews: 110,
    reviewsLabel: "4.8 (110 reviews)",
    image: "/images/explore/luna-brass.jpg",
    alt: "Brass floor lamp beside a walnut sideboard in a dark panelled room",
    href: "/products/luna-brass",
    color: "Brass",
    brand: "Legacy Crafts",
  },
  {
    id: "woven-jute",
    category: "Area Rug",
    name: "Woven Jute",
    price: "₹45,050",
    amount: 45050,
    rating: 4.7,
    reviews: 80,
    reviewsLabel: "4.7 (80 reviews)",
    image: "/images/explore/woven-jute.jpg",
    alt: "Woven jute rug in a forest-green living room",
    href: "/products/woven-jute",
    color: "Cream",
    brand: "Legacy Crafts",
  },
  {
    id: "haven-pine",
    category: "Nightstand",
    name: "Haven Pine",
    price: "₹66,300",
    amount: 66300,
    rating: 4.9,
    reviews: 95,
    reviewsLabel: "4.9 (95 reviews)",
    image: "/images/explore/haven-pine.jpg",
    alt: "Walnut nightstand with a brass mushroom lamp beside a cream bed",
    href: "/products/haven-pine",
    color: "Walnut",
    brand: "Legacy Crafts",
  },
]

export const FILTER_OPTIONS: Record<ExploreFilterId, readonly string[]> = {
  category: [...new Set(EXPLORE_PRODUCTS.map((item) => item.category))],
  price: ["Under ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000+"],
  color: ["Walnut", "Oak", "Brass", "Navy", "Cream"],
  brand: ["Legacy Crafts"],
  rating: ["4.5 & up", "4.8 & up"],
}

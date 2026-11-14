/** Shop browse layout copy. Visual language matches the Figma homepage (Outfit, cream, hairlines). */

export const SHOP_RECENT_HEADING = "Recent pieces"
export const SHOP_LOAD_MORE = "Load more"
export const SHOP_FILTER_LABEL = "filter"
export const SHOP_HIDE_FILTERS_LABEL = "hide filters"
export const SHOP_TESTIMONIALS_HEADING = "Testimonial"
export const SHOP_PAGE_SIZE = 12
export const SHOP_CLEAR_LABEL = "clear filters"

export const SHOP_FEATURED_FALLBACK = [
  {
    title: "Ascent Figure Award",
    href: "/products/ascent-figure-award",
    image: "/images/catalog/trophy-figure-award.webp",
    alt: "Gilt figure award rising through a ring on a mahogany base",
  },
  {
    title: "Achievement Statuette",
    href: "/products/achievement-statuette",
    image: "/images/catalog/trophy-achievement-statuette.webp",
    alt: "Gilded figure statuette on a black marble plinth",
  },
] as const

export const SHOP_BANNER = {
  src: "/images/brand/banner-ribbon.webp",
  alt: "Trophy Heaven ribbon award on a cream pedestal with burgundy velvet",
} as const

export const SHOP_QUOTES = [
  {
    quote:
      "The custom trophy we commissioned for our annual awards was stunning. Guests still talk about the craftsmanship.",
    name: "Priya Mehta",
    location: "Mumbai",
  },
  {
    quote:
      "We ordered forty acrylic awards for our cricket league. Every name was spelled right, and they arrived two days before the final.",
    name: "Arjun Desai",
    location: "Bengaluru",
  },
  {
    quote:
      "Trophy Heaven handled our sales-kickoff awards end to end — proofs, GST invoice, and split delivery to three offices. Flawless.",
    name: "Sarah Chen",
    location: "Delhi",
  },
  {
    quote:
      "Engraving our founder's name on the plaque took minutes online, and the finished piece looked like it came from a museum shop.",
    name: "Rohan Kapoor",
    location: "Pune",
  },
] as const

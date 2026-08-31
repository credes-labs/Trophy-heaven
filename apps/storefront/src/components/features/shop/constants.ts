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
    title: "Luno 210 lounge chair",
    href: "/products/luno-210-lounge-chair",
    image: "/images/catalog/seating-lounge.jpg",
    alt: "Walnut lounge chair with oatmeal bouclé upholstery",
  },
  {
    title: "Brass Table Lamp",
    href: "/products/brass-table-lamp",
    image: "/images/products/art-brass-lamp.jpg",
    alt: "Brass table lamp with warm metallic patina",
  },
] as const

export const SHOP_BANNER = {
  src: "/images/catalog/tables-dining.jpg",
  alt: "Walnut dining table with cream-upholstered chairs in a sunlit room",
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
      "Our walnut dining table arrived perfectly finished. It feels like an heirloom already — warm, solid, and beautifully made.",
    name: "Arjun Desai",
    location: "Bengaluru",
  },
  {
    quote:
      "Legacy Crafts helped us source artwork for our office lobby. The curation was thoughtful and the pieces elevate the space.",
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

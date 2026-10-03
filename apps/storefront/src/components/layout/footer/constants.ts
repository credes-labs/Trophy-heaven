/** Figma CTA & Footer copy. Sizes live as em on the footer so they scale. */

export const FOOTER_HEADLINE = "Begin with a single piece."

export const FOOTER_BODY =
  "A trophy for Friday's ceremony, or a table you will still own in 2050. Both start the same way."

export const FOOTER_CTA_LABEL = "Shop the collection"
export const FOOTER_CTA_HREF = "/shop"

export const FOOTER_WORDMARK = "legacy"

export const FOOTER_NAV = [
  {
    title: "Shop",
    links: [
      { label: "Collection", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Trophies", href: "/trophies" },
      { label: "Furniture", href: "/furniture" },
      { label: "Artwork", href: "/artwork" },
      { label: "Design studio", href: "/customize" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Story", href: "/about#story" },
      { label: "Sustainability", href: "/about#sustainability" },
      { label: "Journal", href: "/blog" },
      { label: "Press", href: "/press" },
      { label: "Careers", href: "/careers" },
      { label: "Corporate", href: "/corporate" },
      { label: "Trade", href: "/trade" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
      { label: "Track order", href: "/track" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Start a return", href: "/returns" },
      { label: "Guides", href: "/guides/care" },
      { label: "Gift cards", href: "/gift-cards" },
      { label: "Sitemap", href: "/sitemap" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
] as const

/** Polaroid stills — paint order (later cards sit on top). Positions are Figma px/16. */
export const FOOTER_POLAROIDS = [
  {
    src: "/images/footer/lounge-chair.jpg",
    alt: "Walnut lounge chair with cream bouclé in a plaster living room",
    widthEm: 20.5,
    leftEm: 65.625,
    topEm: 0.5,
    transform: "matrix(-1, 0.03, 0.03, 1, 0, 0)",
  },
  {
    src: "/images/footer/coffee-table.jpg",
    alt: "Round oak coffee table with brass accents on a navy rug",
    widthEm: 21.375,
    leftEm: 1.961875,
    topEm: 3.66,
    transform: "matrix(-1, -0.07, -0.07, 1, 0, 0)",
  },
  {
    src: "/images/footer/bookshelf.jpg",
    alt: "Walnut and brass bookshelf with warm integrated lighting",
    widthEm: 21.75,
    leftEm: 13.375,
    topEm: 10.5,
    transform: "rotate(12deg)",
  },
  {
    src: "/images/footer/dining-set.jpg",
    alt: "Walnut oval dining table with cream-upholstered chairs",
    widthEm: 21.375,
    leftEm: 30.6875,
    topEm: 2.1875,
    transform: "matrix(-1, -0.07, -0.07, 1, 0, 0)",
  },
  {
    src: "/images/footer/armchair.jpg",
    alt: "Bouclé armchair with walnut frame against a navy panelled wall",
    widthEm: 20.5,
    leftEm: 45.625,
    topEm: 4.3125,
    transform: "matrix(-0.99, 0.1, 0.1, 0.99, 0, 0)",
  },
] as const

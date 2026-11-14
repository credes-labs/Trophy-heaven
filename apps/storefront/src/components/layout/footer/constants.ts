/** Figma CTA & Footer copy. Sizes live as em on the footer so they scale. */

export const FOOTER_HEADLINE = "Begin with a single piece."

export const FOOTER_BODY =
  "A trophy for Friday's ceremony, or a hundred for the annual awards. Both start the same way."

export const FOOTER_CTA_LABEL = "Shop the collection"
export const FOOTER_CTA_HREF = "/shop"

export const FOOTER_NAV = [
  {
    title: "Shop",
    links: [
      { label: "Collection", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Trophies", href: "/trophies" },
      { label: "Corporate awards", href: "/corporate" },
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

/**
 * Transparent cutouts on the footer orbit, in ring order: one of each award
 * style, from the same cut-outs as the homepage hero (public/images/cutouts),
 * padded onto 451:553 cards with the piece standing on the card floor.
 */
export const FOOTER_ORBIT = [
  { src: "/images/footer/ring-cup.webp", alt: "Gold cup trophy on a mahogany base" },
  { src: "/images/footer/ring-figure-award.webp", alt: "Gilt figure award on an octagonal mahogany base" },
  { src: "/images/footer/ring-ribbon-award.webp", alt: "Gold and red ribbon award on a maroon base" },
  { src: "/images/footer/ring-statuette.webp", alt: "Gilded figure statuette on a black plinth" },
  { src: "/images/footer/ring-plaque.webp", alt: "Engraved wooden plaque" },
] as const

/** Seconds for one revolution of the footer orbit. */
export const FOOTER_ORBIT_PERIOD = 36

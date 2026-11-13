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
 * Transparent cutouts on the footer orbit, in ring order: the award pieces
 * that make up the current collection, cut from the studio photography. The
 * two trophy cutouts alternate until more trophy photography lands; four
 * cards keep the ring readable at footer width.
 */
const STATUETTE = {
  src: "/images/footer/orbit-statuette.webp",
  alt: "Gilded figure statuette on a black marble plinth",
} as const
const FIGURE = {
  src: "/images/footer/orbit-figure-award.webp",
  alt: "Gilt figure award on an octagonal mahogany base",
} as const

export const FOOTER_ORBIT = [STATUETTE, FIGURE, STATUETTE, FIGURE] as const

/** Seconds for one revolution of the footer orbit. */
export const FOOTER_ORBIT_PERIOD = 36

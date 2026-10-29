/** Figma CTA & Footer copy. Sizes live as em on the footer so they scale. */

export const FOOTER_HEADLINE = "Begin with a single piece."

export const FOOTER_BODY =
  "A trophy for Friday's ceremony, or a table you will still own in 2050. Both start the same way."

export const FOOTER_CTA_LABEL = "Shop the collection"
export const FOOTER_CTA_HREF = "/shop"

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

/**
 * Transparent cutouts on the footer orbit, in ring order: the sculpture and
 * award pieces that make up the current collection, cut from the studio
 * photography. Five cards keep the ring readable at footer width.
 */
export const FOOTER_ORBIT = [
  {
    src: "/images/footer/orbit-loop-sculpture.png",
    alt: "Verdigris bronze loop sculpture",
  },
  {
    src: "/images/footer/orbit-statuette.png",
    alt: "Gilded figure statuette on a black marble plinth",
  },
  {
    src: "/images/footer/orbit-sunburst-sculpture.png",
    alt: "Bronze sunburst disc on a marble base",
  },
  {
    src: "/images/footer/orbit-rings-sculpture.png",
    alt: "Interlocking gilt-bronze rings on a marble foot",
  },
  {
    src: "/images/footer/orbit-fluted-sculpture.png",
    alt: "Fluted bronze oval ring",
  },
] as const

/** Seconds for one revolution of the footer orbit. */
export const FOOTER_ORBIT_PERIOD = 36

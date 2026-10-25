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

/**
 * Transparent cutouts on the footer orbit, in ring order. File names do not all
 * match their subjects (`coffee-table.png` is the dining set and vice versa);
 * the alt text follows the picture.
 */
export const FOOTER_ORBIT = [
  {
    src: "/images/footer/longue-chair.png",
    alt: "Walnut lounge chair with oatmeal upholstery and brass-capped legs",
  },
  {
    src: "/images/footer/dining-set.png",
    alt: "Round oak coffee table with a brass tray and stacked books",
  },
  {
    src: "/images/footer/bookshelf.png",
    alt: "Walnut and brass bookshelf with lit shelves and a cabinet base",
  },
  {
    src: "/images/footer/coffee-table.png",
    alt: "Walnut oval dining table with three cream-seated chairs",
  },
  {
    src: "/images/footer/armchair.png",
    alt: "Bouclé armchair with a walnut frame and brass feet",
  },
] as const

/** Seconds for one revolution of the footer orbit. */
export const FOOTER_ORBIT_PERIOD = 36

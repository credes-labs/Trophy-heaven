import { hrefForCategoryHandle } from "@/lib/category-config"

export type SiteNavChild = {
  label: string
  href: string
}

export type SiteNavItem = {
  id: string
  label: string
  href: string
  children?: SiteNavChild[]
}

export type NavCategory = {
  name: string
  handle: string
}

const DEFAULT_DEPARTMENTS: SiteNavChild[] = [
  { label: "Trophies", href: "/trophies" },
  { label: "Furniture", href: "/furniture" },
  { label: "Artwork", href: "/artwork" },
]

export const CATALOG_CHILDREN: SiteNavChild[] = [
  { label: "Chairs", href: "/shop?category=furniture&sub=chairs" },
  { label: "Tables", href: "/shop?category=furniture&sub=tables" },
  { label: "Shelves", href: "/shop?category=furniture&sub=shelves" },
  { label: "Cabinets", href: "/shop?category=furniture&sub=cabinets" },
  { label: "Stools", href: "/shop?category=furniture&sub=stools" },
  { label: "Trophies", href: "/trophies" },
  { label: "Furniture", href: "/furniture" },
  { label: "Artwork", href: "/artwork" },
  { label: "Design studio", href: "/customize" },
]

export const INFO_CHILDREN: SiteNavChild[] = [
  { label: "About us", href: "/about" },
  { label: "Our story", href: "/about#story" },
  { label: "Sustainability", href: "/about#sustainability" },
  { label: "Careers", href: "/careers" },
  { label: "Trade", href: "/trade" },
]

export const NEWS_CHILDREN: SiteNavChild[] = [
  { label: "Journal", href: "/blog" },
  { label: "Press", href: "/press" },
]

export const CONTACT_CHILDREN: SiteNavChild[] = [
  { label: "Contact us", href: "/contact" },
  { label: "FAQs", href: "/faq" },
  { label: "Track order", href: "/track" },
  { label: "Shipping & delivery", href: "/shipping-returns" },
  { label: "Returns & exchanges", href: "/returns" },
  { label: "Guides", href: "/guides/care" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
]

export const FAVORITES_CHILDREN: SiteNavChild[] = [
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Account", href: "/account" },
]

export function collectionChildren(categories?: NavCategory[]): SiteNavChild[] {
  const departments =
    categories && categories.length > 0
      ? categories.map((category) => ({
          label: category.name,
          href: hrefForCategoryHandle(category.handle),
        }))
      : DEFAULT_DEPARTMENTS

  return [
    { label: "Shop all", href: "/shop" },
    { label: "New arrivals", href: "/shop?sort=newest" },
    ...departments,
    { label: "Corporate", href: "/corporate" },
  ]
}

export function siteNavColumns(categories?: NavCategory[]): {
  col1: SiteNavItem[]
  col2: SiteNavItem[]
} {
  return {
    col1: [
      {
        id: "collection",
        label: "COLLECTION",
        href: "/shop",
        children: collectionChildren(categories),
      },
      {
        id: "catalog",
        label: "CATALOG",
        href: "/shop",
        children: CATALOG_CHILDREN,
      },
      {
        id: "info",
        label: "INFO",
        href: "/about",
        children: INFO_CHILDREN,
      },
    ],
    col2: [
      {
        id: "news",
        label: "NEWS",
        href: "/blog",
        children: NEWS_CHILDREN,
      },
      {
        id: "contact",
        label: "CONTACT",
        href: "/contact",
        children: CONTACT_CHILDREN,
      },
      {
        id: "favorites",
        label: "FAVORITES",
        href: "/account/wishlist",
        children: FAVORITES_CHILDREN,
      },
    ],
  }
}

export function siteNavLinks(categories?: NavCategory[]): SiteNavItem[] {
  const { col1, col2 } = siteNavColumns(categories)
  return [...col1, ...col2]
}

export type CategoryAccent = "trophy"
export type CategoryKey = "trophies"

export type CategoryStory = {
  eyebrow: string
  title: string
  body: string
  features: string[]
  ctaLabel: string
  ctaHref: string
}

export type CategoryConfig = {
  key: CategoryKey
  /** Medusa product_category.handle from seed */
  medusaHandle: string
  label: string
  headline: string
  description: string
  accent: CategoryAccent
  href: string
  subcategories: string[]
  story: CategoryStory
  /** Aliases used by landing CategoryShowcase */
  slug: CategoryKey
  title: string
  colorClass: string
  textClass: string
  borderClass: string
  badgeVariant: CategoryAccent
  buttonVariant: CategoryAccent
  /** Category showcase / hero tile image under public/ */
  imageSrc: string
  imageAlt: string
}

/**
 * Storefront category map. Trophy Heaven sells one discipline — trophies —
 * backed by the seeded `trophies` Medusa category and its children.
 */
export const CATEGORY_CONFIG: Record<CategoryKey, CategoryConfig> = {
  trophies: {
    key: "trophies",
    medusaHandle: "trophies",
    label: "Trophies",
    headline: "Award-Winning Trophies",
    description:
      "Celebrate excellence with handcrafted crystal, metal, and acrylic awards",
    accent: "trophy",
    href: "/trophies",
    subcategories: ["Sports", "Corporate", "Academic", "Memorial", "Crystal", "Metal", "Acrylic"],
    story: {
      eyebrow: "WHY TROPHY HEAVEN",
      title: "Crafted for Generations",
      body: "Each trophy begins as raw material in the hands of artisans who understand that recognition deserves permanence. Crystal is cut and polished until light itself becomes part of the award; metal is cast and finished for a lifetime of display.",
      features: [
        "Crystal, metal, and acrylic finishes",
        "Engraving-ready surfaces for every occasion",
        "Corporate and sports collections in stock",
      ],
      ctaLabel: "Design Your Own Trophy",
      // Fallback; the category page overrides this with the resolved
      // customizer link for the seeded engraved wooden plaque.
      ctaHref: "/shop?category=trophies&customizable=1",
    },
    slug: "trophies",
    title: "Award-Winning Trophies",
    colorClass: "bg-trophy",
    textClass: "text-trophy",
    borderClass: "border-trophy",
    badgeVariant: "trophy",
    buttonVariant: "trophy",
    imageSrc: "/images/brand/gold-cup.webp",
    imageAlt: "Gold Trophy Heaven cup on a marbled burgundy base in warm light",
  },
}

/** @deprecated Prefer CATEGORY_CONFIG — kept for existing imports */
export const CATEGORIES = CATEGORY_CONFIG

export const CATEGORY_LIST = Object.values(CATEGORY_CONFIG)

export const SHOP_MATERIALS = [
  "Wood",
  "Metal",
  "Crystal",
  "Acrylic",
  "Marble",
  "Leather",
] as const

export const SHOP_SORT_OPTIONS = [
  { label: "Newest", value: "newest", order: "-created_at" },
  { label: "Price: Low to High", value: "price_asc", order: "variants.calculated_price" },
  { label: "Price: High to Low", value: "price_desc", order: "-variants.calculated_price" },
  { label: "Name A–Z", value: "title", order: "title" },
] as const

export const PRICE_RANGE = { min: 0, max: 50_000 } as const

export const PAGE_SIZE = 24

/** Resolve accent from Medusa category handles / names on a product. */
export function accentFromProductCategories(
  categories?: { handle?: string | null; name?: string | null }[] | null
): CategoryAccent | undefined {
  if (!categories?.length) return undefined
  for (const cat of categories) {
    const handle = (cat.handle ?? "").toLowerCase()
    const name = (cat.name ?? "").toLowerCase()
    if (
      handle === "trophies" ||
      handle.includes("trophy") ||
      name.includes("troph") ||
      ["sports", "corporate", "academic", "memorial", "crystal", "metal", "acrylic"].includes(handle)
    ) {
      return "trophy"
    }
  }
  return undefined
}

export function categoryKeyFromHandle(handle: string): CategoryKey | undefined {
  const h = handle.toLowerCase()
  if (h === "trophies") return "trophies"
  return undefined
}

/** Branded storefront path for a Medusa category handle (falls back to catch-all). */
export function hrefForCategoryHandle(handle: string): string {
  const key = categoryKeyFromHandle(handle)
  return key ? CATEGORY_CONFIG[key].href : `/categories/${handle}`
}

export function getCategoryByKey(key: CategoryKey): CategoryConfig {
  return CATEGORY_CONFIG[key]
}

export function relatedCategories(key: CategoryKey): CategoryConfig[] {
  return CATEGORY_LIST.filter((c) => c.key !== key)
}

export function sortOrderFromParam(sort?: string | null): string {
  const match = SHOP_SORT_OPTIONS.find((o) => o.value === sort)
  return match?.order ?? "-created_at"
}

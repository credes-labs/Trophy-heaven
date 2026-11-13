import { MeiliSearch } from "meilisearch"
import type { Index } from "meilisearch"

export const PRODUCT_INDEX = "products"

/** Attributes surfaced as facets in the storefront (FR-SRCH-2). */
export const FACET_ATTRIBUTES = ["category", "material", "customization_level", "price_tier"]

let client: MeiliSearch | null = null

/** Returns a Meilisearch client when configured, else null (graceful no-op). */
export function getMeili(): MeiliSearch | null {
  if (client) return client
  const host = process.env.MEILISEARCH_HOST
  if (!host) return null
  client = new MeiliSearch({ host, apiKey: process.env.MEILISEARCH_API_KEY })
  return client
}

export type ProductDoc = {
  id: string
  title: string
  handle: string
  description: string
  thumbnail: string | null
  category: string[]
  material: string | null
  customization_level: string
  price: number
  price_tier: string
  created_at: number
}

/** Idempotently ensure the index exists with the right filterable/sortable config. */
export async function ensureProductIndex(): Promise<Index | null> {
  const meili = getMeili()
  if (!meili) return null
  const index = meili.index(PRODUCT_INDEX)
  await index.updateSettings({
    searchableAttributes: ["title", "description", "category", "material"],
    filterableAttributes: FACET_ATTRIBUTES,
    sortableAttributes: ["price", "created_at"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  })
  return index
}

export function meiliFilterValue(value: string): string {
  return value.trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

export function priceTier(price: number): string {
  if (price < 1000) return "under_1000"
  if (price < 5000) return "1000_5000"
  if (price < 15000) return "5000_15000"
  return "15000_plus"
}

/** Major-unit amount. Query graph may return a number or a Medusa BigNumber. */
export function asMajorAmount(amount: unknown): number | null {
  if (typeof amount === "number" && Number.isFinite(amount)) return amount
  if (typeof amount === "string" && amount !== "" && Number.isFinite(Number(amount))) {
    return Number(amount)
  }
  if (amount && typeof amount === "object") {
    const record = amount as { numeric?: unknown; value?: unknown }
    if (typeof record.numeric === "number" && Number.isFinite(record.numeric)) return record.numeric
    if (typeof record.value === "string" && record.value !== "" && Number.isFinite(Number(record.value))) {
      return Number(record.value)
    }
  }
  return null
}

export function lowestInrPrice(
  variants: Array<{ prices?: Array<{ currency_code?: string | null; amount?: unknown }> | null }>
): number {
  const amounts = variants.flatMap((variant) =>
    (variant.prices ?? []).flatMap((price) => {
      if (price.currency_code?.toLowerCase() !== "inr") return []
      const amount = asMajorAmount(price.amount)
      return amount == null ? [] : [amount]
    })
  )
  return amounts.length ? Math.min(...amounts) : 0
}

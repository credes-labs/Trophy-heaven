import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { lowestInrPrice } from "./meilisearch"

type PriceRow = { currency_code?: string | null; amount?: unknown }

type GraphVariant = {
  prices?: PriceRow[] | null
  price_set?: { prices?: PriceRow[] | null } | null
}

type GraphProduct = {
  id?: string
  variants?: GraphVariant[] | null
}

type QueryGraph = {
  graph: (opts: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
  }) => Promise<{ data: unknown }>
}

function pricesOf(variant: GraphVariant): PriceRow[] {
  if (variant.prices?.length) return variant.prices
  return variant.price_set?.prices ?? []
}

/**
 * INR list price in major units (rupees). The product module's `variants.prices`
 * relation is empty in Medusa v2 — prices live on the pricing link, which
 * `query.graph` resolves.
 */
export async function inrPriceByProductId(
  scope: { resolve: (key: string | symbol) => unknown },
  productIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (!productIds.length) return map
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as QueryGraph
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "variants.price_set.prices.amount",
      "variants.price_set.prices.currency_code",
    ],
    filters: { id: productIds },
  })
  const products = Array.isArray(data) ? (data as GraphProduct[]) : []
  for (const product of products) {
    if (!product?.id) continue
    const variants = (product.variants ?? []).map((variant) => ({ prices: pricesOf(variant) }))
    map.set(product.id, lowestInrPrice(variants))
  }
  return map
}

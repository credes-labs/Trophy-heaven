import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import {
  ensureProductIndex,
  priceTier,
  PRODUCT_INDEX,
  getMeili,
  lowestInrPrice,
  type ProductDoc,
} from "../lib/meilisearch"
import { inrPriceByProductId } from "../lib/product-index-prices"

/**
 * Syncs the Meilisearch product index on product create/update/delete
 * (FR-SRCH-1). No-ops when Meilisearch isn't configured so dev works offline.
 */
export default async function productIndexHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const meili = getMeili()
  if (!meili) return
  const logger = container.resolve("logger")

  if (event.name === "product.deleted") {
    await meili.index(PRODUCT_INDEX).deleteDocument(event.data.id).catch(() => {})
    return
  }

  const productModule = container.resolve(Modules.PRODUCT)
  const product = await productModule
    .retrieveProduct(event.data.id, {
      relations: ["categories", "variants", "variants.prices"],
    })
    .catch(() => null)
  if (!product) return
  if (product.status && product.status !== "published") {
    await meili.index(PRODUCT_INDEX).deleteDocument(product.id).catch(() => {})
    return
  }

  let price = lowestInrPrice(
    (product.variants ?? []) as Array<{
      prices?: Array<{ currency_code: string; amount: number }>
    }>
  )
  try {
    const priced = await inrPriceByProductId(container, [product.id])
    const fromPricing = priced.get(product.id)
    if (fromPricing != null && fromPricing > 0) price = fromPricing
  } catch (err) {
    logger.warn(
      `product-index: price lookup failed for ${product.id}: ${(err as Error).message}`
    )
  }

  const doc: ProductDoc = {
    id: product.id,
    title: product.title,
    handle: product.handle ?? product.id,
    description: product.description ?? "",
    thumbnail: product.thumbnail ?? null,
    category: (product.categories ?? []).map((c) => c.name),
    material: (product.metadata?.material as string) ?? null,
    customization_level: (product.metadata?.customization_level as string) ?? "none",
    price,
    price_tier: priceTier(price),
    created_at: new Date(product.created_at ?? Date.now()).getTime(),
  }

  await ensureProductIndex()
  await meili.index(PRODUCT_INDEX).addDocuments([doc], { primaryKey: "id" })
  logger.info(`product-index: upserted ${product.id} into Meilisearch`)
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}

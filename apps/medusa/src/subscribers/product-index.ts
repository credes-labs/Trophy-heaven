import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import {
  ensureProductIndex,
  priceTier,
  PRODUCT_INDEX,
  getMeili,
  type ProductDoc,
} from "../lib/meilisearch"

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

  const prices = ((product.variants?.[0] as unknown as { prices?: { currency_code: string; amount: number }[] })
    ?.prices) ?? []
  const price = prices.find((p) => p.currency_code === "inr")?.amount ?? prices[0]?.amount ?? 0

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

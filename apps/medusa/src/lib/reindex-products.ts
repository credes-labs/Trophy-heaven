import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  ensureProductIndex,
  getMeili,
  lowestInrPrice,
  priceTier,
  PRODUCT_INDEX,
  type ProductDoc,
} from "./meilisearch"
import { inrPriceByProductId } from "./product-index-prices"

/** Rebuilds the Meilisearch product index from published products (FR-SRCH-1). */
export async function reindexProducts(
  container: MedusaContainer
): Promise<{ indexed: number; task_uid: number }> {
  const meili = getMeili()
  if (!meili) throw new Error("Meilisearch is not configured.")

  const productModule = container.resolve(Modules.PRODUCT)
  const docs: ProductDoc[] = []
  const pageSize = 100
  let skip = 0
  for (;;) {
    const [products] = await productModule.listAndCountProducts(
      { status: "published" },
      { relations: ["categories", "variants", "variants.prices"], take: pageSize, skip }
    )
    if (!products.length) break
    let priced = new Map<string, number>()
    try {
      priced = await inrPriceByProductId(
        container,
        products.map((product) => product.id)
      )
    } catch {
      priced = new Map()
    }
    for (const product of products) {
      const fromPricing = priced.get(product.id)
      const price =
        fromPricing != null && fromPricing > 0
          ? fromPricing
          : lowestInrPrice(
              (product.variants ?? []) as Array<{
                prices?: Array<{ currency_code: string; amount: number }>
              }>
            )
      docs.push({
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
      })
    }
    skip += pageSize
    if (products.length < pageSize) break
  }

  await ensureProductIndex()
  const index = meili.index(PRODUCT_INDEX)
  // Products deleted while no subscriber was listening (e.g. by a seed run) stay in the
  // index otherwise and show up as dead search results.
  const live = new Set(docs.map((doc) => doc.id))
  const indexed = await index.getDocuments({ fields: ["id"], limit: 10000 }).catch(() => null)
  const stale = (indexed?.results ?? [])
    .map((doc) => String((doc as { id: unknown }).id))
    .filter((id) => !live.has(id))
  if (stale.length) await index.deleteDocuments(stale)
  const task = await index.addDocuments(docs, { primaryKey: "id" })
  return { indexed: docs.length, task_uid: task.taskUid }
}

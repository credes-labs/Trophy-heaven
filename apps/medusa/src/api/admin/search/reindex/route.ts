import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  ensureProductIndex,
  getMeili,
  lowestInrPrice,
  priceTier,
  PRODUCT_INDEX,
  type ProductDoc,
} from "../../../../lib/meilisearch"

/** POST /admin/search/reindex — rebuild the Meilisearch product index (FR-SRCH-1). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const meili = getMeili()
  if (!meili) {
    return res.status(400).json({ error: { code: "UNPROCESSABLE", message: "Meilisearch is not configured." } })
  }

  const productModule = req.scope.resolve(Modules.PRODUCT)
  const docs: ProductDoc[] = []
  const pageSize = 100
  let skip = 0
  for (;;) {
    const [products] = await productModule.listAndCountProducts(
      { status: "published" },
      { relations: ["categories", "variants", "variants.prices"], take: pageSize, skip }
    )
    if (!products.length) break
    for (const product of products) {
      const price = lowestInrPrice(
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
  const task = await meili.index(PRODUCT_INDEX).addDocuments(docs, { primaryKey: "id" })
  res.json({ indexed: docs.length, task_uid: task.taskUid })
}

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  ensureProductIndex,
  getMeili,
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
  const [products] = await productModule.listAndCountProducts(
    { status: "published" },
    { relations: ["categories", "variants", "variants.prices"], take: 1000 }
  )

  const docs: ProductDoc[] = products.map((product) => {
    const prices =
      ((product.variants?.[0] as unknown as { prices?: { currency_code: string; amount: number }[] })
        ?.prices) ?? []
    const price = prices.find((p) => p.currency_code === "inr")?.amount ?? prices[0]?.amount ?? 0
    return {
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
  })

  await ensureProductIndex()
  const task = await meili.index(PRODUCT_INDEX).addDocuments(docs, { primaryKey: "id" })
  res.json({ indexed: docs.length, task_uid: task.taskUid })
}

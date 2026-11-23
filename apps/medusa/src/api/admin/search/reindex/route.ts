import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getMeili } from "../../../../lib/meilisearch"
import { reindexProducts } from "../../../../lib/reindex-products"

/** POST /admin/search/reindex — rebuild the Meilisearch product index (FR-SRCH-1). */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  if (!getMeili()) {
    return res.status(400).json({ error: { code: "UNPROCESSABLE", message: "Meilisearch is not configured." } })
  }
  res.json(await reindexProducts(req.scope))
}

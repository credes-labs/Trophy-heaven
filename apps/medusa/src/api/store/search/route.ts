import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getMeili, PRODUCT_INDEX, FACET_ATTRIBUTES, meiliFilterValue } from "../../../lib/meilisearch"

/**
 * GET /store/search — typo-tolerant faceted product search (FR-SRCH-2/3). Backed
 * by Meilisearch when configured; returns hits + facet distribution. When
 * Meilisearch is unavailable the client should fall back to the catalog list.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const meili = getMeili()
  const { q = "", limit = "24", offset = "0", ...rest } = req.query as Record<string, string>

  if (!meili) {
    return res.status(200).json({ available: false, hits: [], facets: {}, estimatedTotalHits: 0 })
  }

  // Build facet filters from query params matching known facet attributes.
  const filters: string[] = []
  for (const attr of FACET_ATTRIBUTES) {
    const val = rest[attr]
    if (val) {
      const values = val
        .split(",")
        .map((v) => meiliFilterValue(v))
        .filter(Boolean)
        .map((v) => `${attr} = "${v}"`)
      if (values.length) filters.push(`(${values.join(" OR ")})`)
    }
  }

  try {
    const result = await meili.index(PRODUCT_INDEX).search(q, {
      limit: Number(limit),
      offset: Number(offset),
      facets: FACET_ATTRIBUTES,
      filter: filters.length ? filters.join(" AND ") : undefined,
    })
    res.json({
      available: true,
      hits: result.hits,
      facets: result.facetDistribution ?? {},
      estimatedTotalHits: result.estimatedTotalHits ?? result.hits.length,
    })
  } catch {
    res.status(200).json({ available: false, hits: [], facets: {}, estimatedTotalHits: 0 })
  }
}

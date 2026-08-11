import type { MetadataRoute } from "next"
import { listProducts, listCategories } from "@/lib/data/catalog"

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

/** Dynamic sitemap (NFR-3, FR-SRCH-7). Expanded with pagination in Phase 6. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/corporate`, changeFrequency: "weekly", priority: 0.7 },
  ]

  try {
    const [{ products }, categories] = await Promise.all([
      listProducts({ limit: 100 }),
      listCategories(),
    ])
    return [
      ...staticRoutes,
      ...categories.map((c) => ({
        url: `${BASE}/categories/${c.handle}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...products.map((p) => ({
        url: `${BASE}/products/${p.handle}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ]
  } catch {
    return staticRoutes
  }
}

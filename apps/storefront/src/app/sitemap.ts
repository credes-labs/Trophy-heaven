import type { MetadataRoute } from "next"
import { listProducts, listCategories } from "@/lib/data/catalog"
import { listPosts } from "@/lib/blog"
import { getSiteUrl } from "@/lib/site-url"

const BASE = getSiteUrl()

/** Dynamic sitemap (NFR-3, FR-SRCH-7). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/trophies`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/furniture`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/artwork`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/customize`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/shipping-returns`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/returns`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/track`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/gift-cards`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/corporate`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/corporate/quote`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/corporate/bulk`, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE}/press`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/careers`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/trade`, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE}/guides/size`, changeFrequency: "monthly", priority: 0.45 },
    { url: `${BASE}/guides/care`, changeFrequency: "monthly", priority: 0.45 },
    { url: `${BASE}/guides/customization`, changeFrequency: "monthly", priority: 0.45 },
    { url: `${BASE}/sitemap`, changeFrequency: "monthly", priority: 0.3 },
  ]

  try {
    const [{ products }, categories, { posts }] = await Promise.all([
      listProducts({ limit: 100 }),
      listCategories(),
      listPosts({ limit: 100 }).catch(() => ({ posts: [], count: 0 })),
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
      ...posts.map((post) => ({
        url: `${BASE}/blog/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ]
  } catch {
    return staticRoutes
  }
}

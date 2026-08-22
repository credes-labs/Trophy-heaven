import type { MetadataRoute } from "next"
import { listProducts, listCategories } from "@/lib/data/catalog"
import { listPosts } from "@/lib/blog"

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

/** Dynamic sitemap (NFR-3, FR-SRCH-7). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/trophies`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/furniture`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/artwork`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/shipping-returns`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/corporate`, changeFrequency: "weekly", priority: 0.7 },
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

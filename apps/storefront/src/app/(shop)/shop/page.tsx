import type { Metadata } from "next"
import { Suspense } from "react"
import {
  countProductsByCategory,
  getCategoryByHandle,
  listCategories,
  listProducts,
} from "@/lib/data/catalog"
import { getRegion } from "@/lib/regions"
import {
  CATEGORY_CONFIG,
  PAGE_SIZE,
  type CategoryKey,
} from "@/lib/category-config"
import { ShopClient, type ShopCategoryOption } from "@/components/features/shop/shop-client"
import { Skeleton } from "@/components/ui/skeleton"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Shop All Products — Legacy Crafts",
  description:
    "Browse our collection of handcrafted trophies, artisan furniture, and curated artwork.",
  alternates: { canonical: "/shop" },
}

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "")

async function resolveShopCategories(): Promise<ShopCategoryOption[]> {
  const all = await listCategories().catch(() => [])
  const options: ShopCategoryOption[] = []

  for (const key of Object.keys(CATEGORY_CONFIG) as CategoryKey[]) {
    const cfg = CATEGORY_CONFIG[key]
    const fromList = all.find((c) => c.handle === cfg.medusaHandle)
    const category =
      fromList ?? (await getCategoryByHandle(cfg.medusaHandle).catch(() => null))
    if (!category) continue
    const children = (category.category_children ?? [])
      .filter((c) => c.id && c.handle && c.name)
      .map((c) => ({ id: c.id, handle: c.handle, name: c.name }))
    options.push({
      key,
      id: category.id,
      childIds: children.map((c) => c.id),
      children,
      label: cfg.label,
    })
  }
  return options
}

async function ShopContent() {
  const region = await getRegion().catch(() => undefined)
  const [productResult, shopCategories] = await Promise.all([
    listProducts({ limit: PAGE_SIZE, offset: 0, order: "-created_at" }).catch(() => ({
      products: [],
      count: 0,
    })),
    resolveShopCategories(),
  ])

  const categoryCounts = await countProductsByCategory(
    Object.fromEntries(
      shopCategories.map((c) => [c.key, [c.id, ...c.childIds]])
    )
  ).catch(() => ({}) as Record<string, number>)

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: productResult.products.slice(0, 10).map((p, i) => {
      const price = p.variants?.[0]?.calculated_price
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.title,
          url: `${BASE_URL}/products/${p.handle}`,
          image: p.thumbnail ?? undefined,
          ...(price?.calculated_amount != null
            ? {
                offers: {
                  "@type": "Offer",
                  priceCurrency: price.currency_code?.toUpperCase() ?? "INR",
                  price: price.calculated_amount,
                },
              }
            : {}),
        },
      }
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ShopClient
        initialProducts={productResult.products}
        initialCount={productResult.count}
        categories={shopCategories}
        categoryCounts={categoryCounts}
        regionId={region?.id}
      />
    </>
  )
}

function ShopFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-8 h-10 w-48" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent />
    </Suspense>
  )
}

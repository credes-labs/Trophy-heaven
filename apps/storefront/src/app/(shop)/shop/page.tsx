import type { Metadata } from "next"
import { Suspense } from "react"
import {
  countProductsByCategory,
  getCategoryByHandle,
  listCategories,
  listProducts,
} from "@/lib/data/catalog"
import { getRegion } from "@/lib/regions"
import { CATEGORY_CONFIG, type CategoryKey } from "@/lib/category-config"
import { SHOP_PAGE_SIZE } from "@/components/features/shop/constants"
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
    listProducts({ limit: SHOP_PAGE_SIZE, offset: 0, order: "-created_at" }).catch(() => ({
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
    <div className="bg-[#F2F1EF] font-outfit text-[#131111]">
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2rem,4vw,3.5em)] pb-[clamp(3rem,6vw,5.5em)]">
        <Skeleton className="mb-4 h-4 w-32 bg-[#D9D9D9]" />
        <Skeleton className="mb-10 h-12 w-64 bg-[#D9D9D9]" />
        <div className="grid grid-cols-1 gap-x-[1.5em] gap-y-[2.625em] sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[302/374] rounded-[0.125em] bg-[#D9D9D9]" />
          ))}
        </div>
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

import type { Metadata } from "next"
import { Suspense } from "react"
import {
  collectCategoryIds,
  getCategoryByHandle,
  getProductByHandle,
  listProducts,
} from "@/lib/data/catalog"
import { getRegion } from "@/lib/regions"
import {
  CATEGORY_CONFIG,
  PAGE_SIZE,
  type CategoryKey,
} from "@/lib/category-config"
import { CategoryPageClient } from "@/components/features/catalog/category-page-client"
import { Skeleton } from "@/components/ui/skeleton"

export async function buildCategoryMetadata(key: CategoryKey): Promise<Metadata> {
  const config = CATEGORY_CONFIG[key]
  const titles: Record<CategoryKey, string> = {
    trophies: "Custom Trophies & Awards — Legacy Crafts",
    furniture: "Handcrafted Furniture — Legacy Crafts",
    artwork: "Artwork & Home Decor — Legacy Crafts",
  }
  return {
    title: titles[key],
    description: config.description,
    alternates: { canonical: config.href },
  }
}

async function CategoryContent({ categoryKey }: { categoryKey: CategoryKey }) {
  const config = CATEGORY_CONFIG[categoryKey]
  const region = await getRegion().catch(() => undefined)
  const category = await getCategoryByHandle(config.medusaHandle).catch(() => null)

  const subcategoryIds: Record<string, string> = {}
  for (const child of category?.category_children ?? []) {
    if (child.name) subcategoryIds[child.name] = child.id
  }

  const categoryIds = collectCategoryIds(category)
  const { products, count } = await listProducts({
    categoryIds: categoryIds.length ? categoryIds : undefined,
    limit: PAGE_SIZE,
    offset: 0,
    order: "-created_at",
  }).catch(() => ({ products: [], count: 0 }))

  // Trophies story CTA points at the remaining customizable plaque.
  let storyCtaHref: string | undefined
  if (categoryKey === "trophies") {
    const flagship = await getProductByHandle("engraved-wooden-plaque").catch(() => null)
    if (flagship) storyCtaHref = `/customize/${flagship.id}/2d`
  }

  return (
    <CategoryPageClient
      config={config}
      initialProducts={products}
      initialCount={count}
      parentCategoryId={category?.id ?? null}
      subcategoryIds={subcategoryIds}
      regionId={region?.id}
      storyCtaHref={storyCtaHref}
    />
  )
}

function CategoryFallback() {
  return (
    <div>
      <Skeleton className="h-[40vh] w-full rounded-none" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function CategoryPage({ categoryKey }: { categoryKey: CategoryKey }) {
  return (
    <Suspense fallback={<CategoryFallback />}>
      <CategoryContent categoryKey={categoryKey} />
    </Suspense>
  )
}

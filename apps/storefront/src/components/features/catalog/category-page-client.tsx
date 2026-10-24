"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { Check } from "lucide-react"
import { CategoryHero } from "@/components/features/catalog/category-hero"
import { SubcategoryNav } from "@/components/features/catalog/subcategory-nav"
import { ProductCard } from "@/components/features/catalog/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PAGE_SIZE,
  SHOP_MATERIALS,
  SHOP_SORT_OPTIONS,
  relatedCategories,
  sortOrderFromParam,
  type CategoryConfig,
} from "@/lib/category-config"
import { listProductsClient } from "@/lib/data/catalog"
import { matchesMaterial, productPrice } from "@/lib/product-filters"
import { fadeUp, staggerGrid } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

const PRICE_BUCKETS = [
  { value: "under-5k", label: "Under ₹5,000", min: 0, max: 5000 },
  { value: "5k-25k", label: "₹5,000 – ₹25,000", min: 5000, max: 25000 },
  { value: "25k-plus", label: "₹25,000+", min: 25000, max: Number.POSITIVE_INFINITY },
] as const

export type CategoryPageClientProps = {
  config: CategoryConfig
  initialProducts: HttpTypes.StoreProduct[]
  initialCount: number
  parentCategoryId: string | null
  /** Subcategory name → Medusa category id */
  subcategoryIds: Record<string, string>
  regionId?: string
  /** Overrides the story CTA href (e.g. resolved customizer product link) */
  storyCtaHref?: string
}

export function CategoryPageClient({
  config,
  initialProducts,
  initialCount,
  parentCategoryId,
  subcategoryIds,
  regionId,
  storyCtaHref,
}: CategoryPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const sub = searchParams.get("sub")
  const sort = searchParams.get("sort") || "newest"
  const priceBucket = searchParams.get("price")
  const material = searchParams.get("material")
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const [products, setProducts] = useState(initialProducts)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const activeCategoryIds = useMemo(() => {
    if (sub) {
      const matchKey = Object.keys(subcategoryIds).find(
        (k) => k.toLowerCase() === sub.toLowerCase()
      )
      if (matchKey) return [subcategoryIds[matchKey]]
    }
    if (!parentCategoryId) return undefined
    const childIds = Object.values(subcategoryIds)
    return [parentCategoryId, ...childIds]
  }, [sub, parentCategoryId, subcategoryIds])

  const setParam = useCallback(
    (patch: Record<string, string | null>, resetPage = true) => {
      const usp = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") usp.delete(k)
        else usp.set(k, v)
      }
      if (resetPage) usp.delete("page")
      const qs = usp.toString()
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  const fetchPage = useCallback(
    async (p: number, append: boolean) => {
      if (!activeCategoryIds?.length && !parentCategoryId) {
        setProducts([])
        setCount(0)
        return
      }
      setLoading(true)
      try {
        const { products: next, count: total } = await listProductsClient({
          categoryIds: activeCategoryIds,
          limit: PAGE_SIZE,
          offset: (p - 1) * PAGE_SIZE,
          order: sortOrderFromParam(sort),
          regionId,
        })
        setProducts((prev) => (append ? [...prev, ...next] : next))
        setCount(total)
      } catch {
        if (!append) setProducts([])
      } finally {
        setLoading(false)
      }
    },
    [activeCategoryIds, parentCategoryId, regionId, sort]
  )

  const filterKey = `${sub ?? ""}|${sort}`
  const prevFilterKey = useRef(filterKey)

  useEffect(() => {
    const filtersChanged = prevFilterKey.current !== filterKey
    prevFilterKey.current = filterKey

    const isDefault = !sub && sort === "newest" && page === 1
    if (isDefault) {
      setProducts(initialProducts)
      setCount(initialCount)
      return
    }

    const append = !filtersChanged && page > 1
    void fetchPage(page, append)
  }, [sub, sort, filterKey, page, fetchPage, initialProducts, initialCount])

  // Price/material are client-side filters over the fetched page (the store
  // API can't express metadata.material or a calculated-price range query).
  // A rating filter is intentionally skipped: /store/reviews only aggregates
  // per product_id, so listings have no bulk rating data to filter by.
  const visibleProducts = useMemo(() => {
    let out = products
    const bucket = PRICE_BUCKETS.find((b) => b.value === priceBucket)
    if (bucket) {
      out = out.filter((p) => {
        const price = productPrice(p)
        if (price == null) return true
        return price >= bucket.min && price < bucket.max
      })
    }
    if (material) {
      out = out.filter((p) => matchesMaterial(p, material))
    }
    return out
  }, [products, priceBucket, material])

  const mid = Math.min(12, visibleProducts.length)
  const firstBatch = visibleProducts.slice(0, mid)
  const secondBatch = visibleProducts.slice(mid)
  const remaining = Math.max(0, count - products.length)
  const related = relatedCategories(config.key)

  function loadMore() {
    setParam({ page: String(page + 1) }, false)
  }

  return (
    <div>
      <CategoryHero config={config} productCount={count} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SubcategoryNav
          items={config.subcategories}
          accent={config.accent}
          active={sub}
          onSelect={(value) => setParam({ sub: value })}
          className="mb-6"
        />

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 font-outfit text-sm text-[#6B635C]">
            Sort
            <select
              className="h-9 rounded-[0.125em] border border-[#131111]/15 bg-[#FBFBF7] px-3 font-outfit text-sm text-[#131111]"
              value={sort}
              onChange={(e) => setParam({ sort: e.target.value === "newest" ? null : e.target.value })}
            >
              {SHOP_SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 font-outfit text-sm text-[#6B635C]">
            Price
            <select
              className="h-9 rounded-[0.125em] border border-[#131111]/15 bg-[#FBFBF7] px-3 font-outfit text-sm text-[#131111]"
              value={priceBucket ?? ""}
              onChange={(e) => setParam({ price: e.target.value || null })}
            >
              <option value="">Any price</option>
              {PRICE_BUCKETS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 font-outfit text-sm text-[#6B635C]">
            Material
            <select
              className="h-9 rounded-[0.125em] border border-[#131111]/15 bg-[#FBFBF7] px-3 font-outfit text-sm text-[#131111]"
              value={material ?? ""}
              onChange={(e) => setParam({ material: e.target.value || null })}
            >
              <option value="">All materials</option>
              {SHOP_MATERIALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          {(priceBucket || material) && (
            <button
              type="button"
              onClick={() => setParam({ price: null, material: null })}
              className="font-outfit text-sm font-medium text-[#131111] underline underline-offset-2"
            >
              Clear
            </button>
          )}
          <span className="font-outfit text-sm text-[#6B635C]">
            {loading || pending
              ? "Updating…"
              : priceBucket || material
                ? `${visibleProducts.length} of ${count} products`
                : `${count} products`}
          </span>
        </div>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center font-outfit text-[#6B635C] text-pretty">
            No products in this category yet.
          </p>
        ) : (
          <>
            <motion.div
              key={`first|${filterKey}`}
              className="grid grid-cols-2 gap-4 md:grid-cols-4"
              variants={staggerGrid}
              initial="hidden"
              animate="visible"
            >
              {firstBatch.map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProductCard product={p} accent={config.accent} />
                </motion.div>
              ))}
            </motion.div>

            <section className="my-16 grid items-center gap-10 md:grid-cols-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl md:col-span-3">
                <Image
                  src={config.imageSrc}
                  alt={config.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-walnut/30 to-transparent" />
              </div>
              <div className="md:col-span-2">
                <p className={cn("text-xs font-semibold uppercase tracking-wider", config.textClass)}>
                  {config.story.eyebrow}
                </p>
                <h2 className="mt-2 font-outfit text-3xl font-semibold whitespace-pre-line text-balance text-[#131111]">
                  {config.story.title}
                </h2>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-[#6B635C]">
                  {config.story.body}
                </p>
                <ul className="mt-4 space-y-2">
                  {config.story.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={cn("mt-0.5 h-4 w-4 shrink-0", config.textClass)} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={storyCtaHref ?? config.story.ctaHref}
                  className={cn(
                    "mt-6 inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium transition-colors",
                    config.accent === "trophy" && "bg-trophy text-trophy-foreground hover:bg-trophy-dark",
                    config.accent === "furniture" && "bg-furniture text-white hover:bg-furniture-dark",
                    config.accent === "artwork" && "bg-artwork text-white hover:bg-artwork-dark"
                  )}
                >
                  {config.story.ctaLabel}
                </Link>
              </div>
            </section>

            {secondBatch.length > 0 && (
              <motion.div
                key={`second|${filterKey}`}
                className="grid grid-cols-2 gap-4 md:grid-cols-4"
                variants={staggerGrid}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                {secondBatch.map((p) => (
                  <motion.div key={p.id} variants={fadeUp}>
                    <ProductCard product={p} accent={config.accent} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {remaining > 0 && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  loading={loading}
                  onClick={loadMore}
                  className="min-h-11 rounded-full border-0 bg-[#131111] text-[#F2F1EF] hover:bg-[#131111]"
                >
                  Show more ({remaining} remaining)
                </Button>
              </div>
            )}
          </>
        )}

        <section className="mt-20 border-t border-border pt-12">
          <h2 className="mb-6 font-outfit text-2xl font-semibold text-balance text-[#131111]">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((cat) => (
              <Link
                key={cat.key}
                href={cat.href}
                className={cn(
                  "group overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-lg",
                  cat.borderClass
                )}
                style={{ borderBottomWidth: 4 }}
              >
                <div className={cn("relative aspect-[21/9]", cat.colorClass)}>
                  <Image
                    src={cat.imageSrc}
                    alt={cat.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-walnut/70 via-walnut/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-outfit text-xl text-balance text-cream">{cat.headline}</h3>
                    <p className="mt-1 text-pretty text-sm text-cream/80">{cat.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

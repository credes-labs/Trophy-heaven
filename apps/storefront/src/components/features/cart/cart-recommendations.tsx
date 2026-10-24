"use client"

import { useEffect, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { EditorialProductCard } from "@/components/features/shop/editorial-product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { listProductsClient } from "@/lib/data/catalog"

const LIMIT = 4

async function fetchPopular(regionId?: string): Promise<HttpTypes.StoreProduct[]> {
  const { products } = await listProductsClient({
    limit: LIMIT,
    order: "-created_at",
    regionId,
  })
  return products
}

/**
 * "Complete the look" (cart cross-sell) / "Popular right now" (empty cart).
 * Cross-sell: products sharing categories with the cart's items, excluding
 * what's already in the cart; falls back to newest products.
 */
export function CartRecommendations({
  items,
  regionId,
  variant,
}: {
  items: HttpTypes.StoreCartLineItem[]
  regionId?: string
  variant: "cross-sell" | "popular"
}) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const itemKey = items
    .map((i) => i.product_id)
    .filter(Boolean)
    .sort()
    .join(",")

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function load() {
      const cartProductIds = itemKey ? itemKey.split(",") : []
      if (variant === "cross-sell" && cartProductIds.length) {
        const { products: cartProducts } = await listProductsClient({
          ids: cartProductIds,
          limit: cartProductIds.length,
          regionId,
        })
        const categoryIds = [
          ...new Set(
            cartProducts.flatMap((p) => (p.categories ?? []).map((c) => c.id))
          ),
        ]
        if (categoryIds.length) {
          const { products: sameCategory } = await listProductsClient({
            categoryIds,
            limit: 12,
            regionId,
          })
          const picks = sameCategory
            .filter((p) => !cartProductIds.includes(p.id))
            .slice(0, LIMIT)
          if (picks.length) return picks
        }
      }
      return fetchPopular(regionId)
    }

    load()
      .then((p) => {
        if (!cancelled) setProducts(p)
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [itemKey, regionId, variant])

  const heading = variant === "cross-sell" ? "Complete the look" : "Popular right now"

  if (!loading && products.length === 0) return null

  return (
    <section aria-label={heading} className="mt-[4em]">
      <h2 className="m-0 font-outfit text-[clamp(1.35rem,2.8vw,1.75em)] font-normal tracking-[0.08em] text-balance text-[#131111] uppercase">
        {heading}
      </h2>
      <div className="cart-recs mt-[1.5em]">
        {loading
          ? Array.from({ length: LIMIT }).map((_, i) => (
              <Skeleton key={i} className="aspect-[302/374] w-full rounded-[0.125em] bg-[#D9D9D9]" />
            ))
          : products.map((p) => <EditorialProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}

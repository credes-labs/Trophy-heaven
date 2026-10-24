"use client"

import { useCallback, useEffect, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { EditorialProductCard } from "@/components/features/shop/editorial-product-card"
import { medusa } from "@/lib/medusa"
import { wishlistApi, type WishlistItemRecord } from "@/lib/wishlist"

const PRODUCT_FIELDS =
  "*variants,*variants.calculated_price,*variants.options,*options,*options.values,*categories,*images,+metadata,+thumbnail"

type WishlistRow = {
  item: WishlistItemRecord
  product: HttpTypes.StoreProduct | null
}

function addedLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value))
}

export default function WishlistPage() {
  const [rows, setRows] = useState<WishlistRow[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { items } = await wishlistApi.list()
      if (!items.length) {
        setRows([])
        return
      }
      const ids = [...new Set(items.map((i) => i.product_id))]
      let products: HttpTypes.StoreProduct[] = []
      try {
        const res = await medusa.store.product.list({
          id: ids,
          limit: ids.length,
          fields: PRODUCT_FIELDS,
        })
        products = res.products ?? []
      } catch {
        products = []
      }
      const byId = new Map(products.map((p) => [p.id, p]))
      setRows(items.map((item) => ({ item, product: byId.get(item.product_id) ?? null })))
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleRemove(id: string) {
    setRemoving(id)
    try {
      await wishlistApi.remove(id)
      setRows((prev) => prev.filter((r) => r.item.id !== id))
    } catch {
      // keep item
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div>
      <header className="relative overflow-hidden">
        <EditorialWatermark>saved</EditorialWatermark>
        <EditorialEyebrow>Saved</EditorialEyebrow>
        <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,4vw,3em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
          Wishlist
        </h1>
        <p className="relative mt-[1em] m-0 max-w-[28em] font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
          {loading
            ? "Pieces you’ve saved for later."
            : rows.length > 0
              ? `${rows.length} saved ${rows.length === 1 ? "piece" : "pieces"}.`
              : "Pieces you’ve saved for later."}
        </p>
      </header>

      {loading ? (
        <div className="mt-[2.5em] grid gap-[2em] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[302/374] w-full rounded-[0.125em] bg-[#D9D9D9]"
              aria-hidden
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-[2.5em]">
          <p className="m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            Your wishlist is empty.
          </p>
          <div className="mt-[1.75em]">
            <EditorialCtaLink href="/shop">Explore the shop</EditorialCtaLink>
          </div>
        </div>
      ) : (
        <ul className="mt-[2.5em] m-0 grid list-none gap-[2em] p-0 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ item, product }) => (
            <li key={item.id}>
              {product ? (
                <EditorialProductCard product={product} />
              ) : (
                <p className="m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
                  Product unavailable
                </p>
              )}
              <div className="mt-[0.75em] flex flex-wrap items-baseline gap-x-[1.25em] gap-y-[0.35em]">
                <p className="m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C] uppercase">
                  Added {addedLabel(item.added_at)}
                </p>
                <button
                  type="button"
                  aria-label="Remove from wishlist"
                  disabled={removing === item.id}
                  onClick={() => void handleRemove(item.id)}
                  className="cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] disabled:opacity-50"
                >
                  {removing === item.id ? "Removing" : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

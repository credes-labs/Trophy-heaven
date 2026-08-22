"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { X } from "lucide-react"
import { medusa } from "@/lib/medusa"
import { wishlistApi, type WishlistItemRecord } from "@/lib/wishlist"
import { ProductCard } from "@/components/features/catalog/product-card"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const PRODUCT_FIELDS =
  "*variants,*variants.calculated_price,*variants.options,*options,*options.values,*categories,*images,+metadata,+thumbnail"

type WishlistRow = {
  item: WishlistItemRecord
  product: HttpTypes.StoreProduct | null
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
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Wishlist
          {!loading && rows.length > 0 ? (
            <span className="ml-2 text-lg font-normal text-muted-foreground">
              ({rows.length})
            </span>
          ) : null}
        </h1>
        <p className="mt-1 text-muted-foreground">Pieces you’ve saved for later.</p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 py-12">
            <p className="text-muted-foreground">Your wishlist is empty.</p>
            <Link href="/shop" className={cn(buttonVariants())}>
              Explore the shop
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ item, product }) => (
            <li key={item.id} className="relative">
              <button
                type="button"
                aria-label="Remove from wishlist"
                disabled={removing === item.id}
                onClick={() => void handleRemove(item.id)}
                className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/95 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
              {product ? (
                <ProductCard product={product} showWishlist={false} />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    Product unavailable
                    <p className="mt-1 text-xs">{item.product_id}</p>
                  </CardContent>
                </Card>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Added{" "}
                {new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                }).format(new Date(item.added_at))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

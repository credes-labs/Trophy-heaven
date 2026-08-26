"use client"

import Link from "next/link"
import Image from "next/image"
import { localizeImageUrl } from "@/lib/images"
import { useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatMoney, CUSTOMIZATION_LABELS, isCustomizable } from "@/lib/format"
import {
  accentFromProductCategories,
  type CategoryAccent,
} from "@/lib/category-config"
import { useCartStore } from "@/stores/cart-store"
import { useWishlist } from "@/hooks/use-wishlist"
import { track } from "@/lib/analytics"
import { cheapestInStockVariant } from "@/lib/product-filters"
import { cn } from "@/lib/utils"

function lowestPrice(product: HttpTypes.StoreProduct): {
  amount: number
  currency: string
  original?: number
} | null {
  const prices = (product.variants ?? [])
    .map((v) => v.calculated_price)
    .filter(Boolean) as NonNullable<HttpTypes.StoreProductVariant["calculated_price"]>[]
  if (!prices.length) return null
  const min = prices.reduce((a, b) =>
    (a.calculated_amount ?? Infinity) < (b.calculated_amount ?? Infinity) ? a : b
  )
  const amount = min.calculated_amount ?? 0
  const original = min.original_amount ?? undefined
  return {
    amount,
    currency: min.currency_code ?? "inr",
    original: original != null && original > amount ? original : undefined,
  }
}

function defaultVariantId(product: HttpTypes.StoreProduct): string | undefined {
  return cheapestInStockVariant(product)?.id
}

function categoryLabel(
  product: HttpTypes.StoreProduct,
  accent?: CategoryAccent
): string | undefined {
  const primary = product.categories?.[0]
  if (primary?.name) return primary.name
  if (accent === "trophy") return "Trophies"
  if (accent === "furniture") return "Furniture"
  if (accent === "artwork") return "Artwork"
  return undefined
}

export type ProductCardProps = {
  product: HttpTypes.StoreProduct
  accent?: CategoryAccent
  layout?: "grid" | "list"
  className?: string
  showWishlist?: boolean
}

export function ProductCard({
  product,
  accent: accentProp,
  layout = "grid",
  className,
  showWishlist = true,
}: ProductCardProps) {
  const price = lowestPrice(product)
  const level = (product.metadata?.customization_level as string) ?? "none"
  const accent = accentProp ?? accentFromProductCategories(product.categories)
  const label = categoryLabel(product, accent)
  const onSale = Boolean(price?.original)
  const salePct =
    onSale && price?.original
      ? Math.round(((price.original - price.amount) / price.original) * 100)
      : 0
  const addItem = useCartStore((s) => s.addItem)
  const loading = useCartStore((s) => s.loading)
  const { wishlisted, toggle: toggleWishlist, busy: wishlistBusy } = useWishlist(product.id)
  const [added, setAdded] = useState(false)
  const variantId = defaultVariantId(product)
  const href = `/products/${product.handle}`

  async function handleQuickAdd() {
    if (!variantId) return
    try {
      await addItem(variantId, 1)
      track("add_to_cart", { item_id: product.id, variant_id: variantId })
      setAdded(true)
      setTimeout(() => setAdded(false), 1600)
    } catch {
      setAdded(false)
    }
  }

  if (layout === "list") {
    return (
      <article
        className={cn(
          "group flex gap-4 overflow-hidden rounded-lg border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
          className
        )}
      >
        <Link href={href} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:h-36 sm:w-36">
          {product.thumbnail ? (
            <Image
              src={localizeImageUrl(product.thumbnail)}
              alt={product.title}
              fill
              sizes="144px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="font-serif text-xl opacity-40">LC</span>
            </div>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
          {label && (
            <Badge variant={accent ?? "default"} className="w-fit">
              {label}
            </Badge>
          )}
          <Link href={href} className="line-clamp-1 font-medium hover:underline">
            {product.title}
          </Link>
          {product.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
            <span className="text-sm font-semibold">
              {price ? formatMoney(price.amount, price.currency) : "—"}
            </span>
            {price?.original != null && (
              <span className="text-sm text-muted-foreground line-through">
                {formatMoney(price.original, price.currency)}
              </span>
            )}
            <Button
              size="sm"
              variant={accent ?? "default"}
              loading={loading && added}
              onClick={handleQuickAdd}
              disabled={!variantId}
            >
              {added ? "Added" : "Add to cart"}
            </Button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={href} className="absolute inset-0 block">
          {product.thumbnail ? (
            <Image
              src={localizeImageUrl(product.thumbnail)}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="font-serif text-2xl opacity-40">LC</span>
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col gap-1.5">
          {onSale && salePct > 0 && <Badge variant="sale">-{salePct}%</Badge>}
          {isCustomizable(level) && (
            <Badge className="bg-accent/90 text-accent-foreground">Customizable</Badge>
          )}
        </div>

        {showWishlist && (
          <button
            type="button"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            disabled={wishlistBusy}
            onClick={() => void toggleWishlist()}
            className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm transition-colors hover:bg-card disabled:opacity-60"
          >
            <Heart
              className={cn("h-4 w-4", wishlisted && "fill-destructive text-destructive")}
            />
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-walnut/80 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            size="sm"
            className="w-full"
            variant={accent ?? "default"}
            loading={loading && added}
            onClick={handleQuickAdd}
            disabled={!variantId}
          >
            {added ? "Added ✓" : "Quick add"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {label && (
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-wide",
              accent === "trophy" && "text-trophy",
              accent === "furniture" && "text-furniture",
              accent === "artwork" && "text-artwork",
              !accent && "text-muted-foreground"
            )}
          >
            {label}
          </span>
        )}
        <Link href={href} className="line-clamp-2 text-sm font-medium hover:underline">
          {product.title}
        </Link>
        <p className="text-xs text-muted-foreground">
          {CUSTOMIZATION_LABELS[level] ?? "Product"}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-sm font-semibold">
            {price ? `From ${formatMoney(price.amount, price.currency)}` : "—"}
          </span>
          {price?.original != null && (
            <span className="text-xs text-muted-foreground line-through">
              {formatMoney(price.original, price.currency)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

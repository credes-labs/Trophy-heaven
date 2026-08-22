"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import type { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip } from "@/components/ui/tooltip"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { StickyAtc } from "@/components/features/catalog/sticky-atc"
import { ShareButtons } from "@/components/features/blog/share-buttons"
import { cn } from "@/lib/utils"
import { formatMoney, isCustomizable } from "@/lib/format"
import { variantInStock } from "@/lib/product-filters"
import { useCartStore } from "@/stores/cart-store"
import { useWishlist } from "@/hooks/use-wishlist"
import { track } from "@/lib/analytics"

export function ProductActions({
  product,
  accent = "trophy",
}: {
  product: HttpTypes.StoreProduct
  accent?: "trophy" | "furniture" | "artwork"
}) {
  const options = product.options ?? []
  const variants = product.variants ?? []
  const addItem = useCartStore((s) => s.addItem)
  const loading = useCartStore((s) => s.loading)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { wishlisted, toggle: toggleWishlist, busy: wishlistBusy } = useWishlist(product.id)
  const atcRef = useRef<HTMLDivElement>(null)

  const activeVariant = useMemo(() => {
    if (!options.length) return variants[0]
    if (!options.every((o) => selected[o.id])) return undefined
    return variants.find((v) =>
      (v.options ?? []).every((o) => selected[o.option_id ?? ""] === o.value)
    )
  }, [options, variants, selected])

  // An option value is unavailable when every variant carrying it is out of
  // stock (manage_inventory on, no backorders, zero stock).
  const outOfStockValues = useMemo(() => {
    const set = new Set<string>()
    for (const option of options) {
      for (const val of option.values ?? []) {
        const withValue = variants.filter((v) =>
          (v.options ?? []).some(
            (o) => o.option_id === option.id && o.value === val.value
          )
        )
        if (withValue.length > 0 && !withValue.some(variantInStock)) {
          set.add(`${option.id}:${val.value}`)
        }
      }
    }
    return set
  }, [options, variants])

  const price = activeVariant?.calculated_price
  const salePct =
    price?.original_amount != null &&
    price.calculated_amount != null &&
    price.original_amount > price.calculated_amount
      ? Math.round(
          ((price.original_amount - price.calculated_amount) / price.original_amount) * 100
        )
      : 0
  const emiAmount =
    price?.calculated_amount != null && price.calculated_amount > 5000
      ? Math.round(price.calculated_amount / 12)
      : null
  const level = (product.metadata?.customization_level as string) ?? "none"
  const customizable = isCustomizable(level)
  const canAdd = Boolean(activeVariant)

  async function handleAdd() {
    if (!activeVariant) return
    await addItem(activeVariant.id, quantity)
    track("add_to_cart", {
      item_id: product.id,
      variant_id: activeVariant.id,
      value: price?.calculated_amount,
      currency: price?.currency_code,
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-6">
      {options.map((option) => (
        <div key={option.id}>
          <p className="mb-2 text-sm font-medium">{option.title}</p>
          <div className="flex flex-wrap gap-2">
            {(option.values ?? []).map((val) => {
              const isActive = selected[option.id] === val.value
              const isOos = outOfStockValues.has(`${option.id}:${val.value}`)
              return (
                <button
                  key={val.id}
                  type="button"
                  data-touch-target
                  disabled={isOos}
                  title={isOos ? "Out of stock" : undefined}
                  onClick={() => setSelected((s) => ({ ...s, [option.id]: val.value }))}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm transition-colors",
                    isActive
                      ? cn(
                          "text-foreground",
                          accent === "trophy" && "border-trophy bg-trophy/10",
                          accent === "furniture" && "border-furniture bg-furniture/10",
                          accent === "artwork" && "border-artwork bg-artwork/10"
                        )
                      : "border-border hover:bg-muted",
                    isOos &&
                      "cursor-not-allowed border-dashed text-muted-foreground/60 line-through hover:bg-transparent"
                  )}
                >
                  {val.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div>
        <div className="flex items-center gap-3">
          <p className="text-2xl font-semibold tabular-nums">
            {price
              ? formatMoney(price.calculated_amount ?? 0, price.currency_code ?? "inr")
              : options.length
                ? "Select options"
                : "—"}
          </p>
          {salePct > 0 && price?.original_amount != null && (
            <>
              <span className="text-lg text-muted-foreground line-through tabular-nums">
                {formatMoney(price.original_amount, price.currency_code ?? "inr")}
              </span>
              <Badge variant="sale">-{salePct}% OFF</Badge>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
        {emiAmount != null && price && (
          <p className="mt-1 text-xs text-muted-foreground">
            <Tooltip content="No-cost EMI available on Razorpay at checkout" side="top">
              <span className="cursor-help underline decoration-dotted underline-offset-2">
                EMI from {formatMoney(emiAmount, price.currency_code ?? "inr")}/mo
              </span>
            </Tooltip>
          </p>
        )}
        {activeVariant?.sku && (
          <p className="mt-1 text-xs text-muted-foreground">SKU: {activeVariant.sku}</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Quantity</p>
        <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={99} />
      </div>

      <div ref={atcRef} className="flex flex-col gap-3 sm:flex-row">
        {customizable && (
          <Link
            href={`/customize/${product.id}${level === "full_3d" ? "/3d" : "/2d"}`}
            className={cn(
              "flex flex-1 items-center justify-center rounded-md border border-border px-5 py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
            )}
          >
            Customize this design
          </Link>
        )}
        <Button
          onClick={handleAdd}
          disabled={!canAdd || loading}
          loading={loading}
          variant={accent}
          className="flex-1"
        >
          {added ? "Added ✓" : canAdd ? "Add to cart" : "Select options"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void toggleWishlist()}
          disabled={wishlistBusy}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn("h-4 w-4", wishlisted && "fill-trophy text-trophy")}
            aria-hidden
          />
          {wishlisted ? "Saved" : "Wishlist"}
        </Button>
        <ShareButtons title={product.title} slug="" path={`/products/${product.handle}`} />
      </div>

      <ul className="space-y-2 text-xs text-muted-foreground">
        <li>Free shipping on orders above ₹5,000</li>
        <li>7-day easy returns on non-custom items</li>
        <li>Handmade in India · Secure checkout</li>
      </ul>

      <StickyAtc
        targetRef={atcRef}
        price={price?.calculated_amount ?? null}
        currency={price?.currency_code ?? "inr"}
        disabled={!canAdd || loading}
        loading={loading}
        onAdd={handleAdd}
        label={added ? "Added ✓" : "Add to cart"}
      />
    </div>
  )
}

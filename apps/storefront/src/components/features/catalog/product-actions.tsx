"use client"

import { studioPieceForHandle } from "@/lib/configurator/studio-pieces"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import type { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { StickyAtc } from "@/components/features/catalog/sticky-atc"
import { ShareButtons } from "@/components/features/blog/share-buttons"
import "../../../app/(shop)/products/[handle]/pdp.css"
import { cn } from "@/lib/utils"
import { formatMoney, isCustomizable } from "@/lib/format"
import { cheapestInStockVariant, variantInStock } from "@/lib/product-filters"
import { useCartStore } from "@/stores/cart-store"
import { useWishlist } from "@/hooks/use-wishlist"
import { track } from "@/lib/analytics"
import { LINE_DESIGN_KEY, type DesignFile } from "@/lib/design-uploads"
import { DesignDropzone } from "@/components/features/cart/design-dropzone"

function firstOptionSelection(
  options: HttpTypes.StoreProductOption[],
  variants: HttpTypes.StoreProductVariant[]
): Record<string, string> {
  const selected: Record<string, string> = {}
  for (const option of options) {
    if (!option.id) continue
    const values = option.values ?? []
    const preferred =
      values.find((val) => {
        const matching = variants.filter((v) =>
          (v.options ?? []).some((o) => o.option_id === option.id && o.value === val.value)
        )
        return matching.length === 0 || matching.some(variantInStock)
      }) ?? values[0]
    if (preferred?.value) selected[option.id] = preferred.value
  }
  return selected
}

export function ProductActions({ product }: { product: HttpTypes.StoreProduct }) {
  const options = product.options ?? []
  const variants = product.variants ?? []
  const addItem = useCartStore((s) => s.addItem)
  const loading = useCartStore((s) => s.loading)
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    firstOptionSelection(options, variants)
  )
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [design, setDesign] = useState<DesignFile | null>(null)
  const { wishlisted, toggle: toggleWishlist, busy: wishlistBusy } = useWishlist(product.id)
  const atcRef = useRef<HTMLDivElement>(null)

  const activeVariant = useMemo(() => {
    if (!options.length) return cheapestInStockVariant(product) ?? variants[0]
    if (!options.every((o) => o.id && selected[o.id])) return undefined
    return variants.find((v) =>
      (v.options ?? []).every((o) => selected[o.option_id ?? ""] === o.value)
    )
  }, [options, variants, selected, product])

  const outOfStockValues = useMemo(() => {
    const set = new Set<string>()
    for (const option of options) {
      for (const val of option.values ?? []) {
        const withValue = variants.filter((v) =>
          (v.options ?? []).some((o) => o.option_id === option.id && o.value === val.value)
        )
        if (withValue.length > 0 && !withValue.some(variantInStock)) {
          set.add(`${option.id}:${val.value}`)
        }
      }
    }
    return set
  }, [options, variants])

  const priced = activeVariant ?? variants[0]
  const price = priced?.calculated_price
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
  const level = studioPieceForHandle(product.handle)
    ? "full_3d"
    : ((product.metadata?.customization_level as string) ?? "none")
  const customizable = isCustomizable(level)
  const canAdd = Boolean(activeVariant && variantInStock(activeVariant))
  const lineTotal = price?.calculated_amount != null ? price.calculated_amount * quantity : null

  async function handleAdd() {
    if (!activeVariant || !variantInStock(activeVariant)) return
    try {
      await addItem(
        activeVariant.id,
        quantity,
        design ? { [LINE_DESIGN_KEY]: design } : undefined
      )
      track("add_to_cart", {
        item_id: product.id,
        variant_id: activeVariant.id,
        value: price?.calculated_amount,
        currency: price?.currency_code,
        quantity,
      })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      setAdded(false)
    }
  }

  return (
    <div className="flex flex-col gap-[1.5em]">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-[0.75em] gap-y-[0.25em]">
          <p className="pdp-price">
            {price
              ? formatMoney(price.calculated_amount ?? 0, price.currency_code ?? "inr")
              : options.length
                ? "Select options"
                : "—"}
          </p>
          {salePct > 0 && price?.original_amount != null ? (
            <span className="font-outfit text-[1em] text-[#6B635C] line-through tabular-nums">
              {formatMoney(price.original_amount, price.currency_code ?? "inr")}
            </span>
          ) : null}
        </div>
        <p className="pdp-price-meta">Inclusive of all taxes</p>
      </div>

      {options.length > 0 ? (
        <div>
          <p className="pdp-options-rule">
            <span>Options</span>
          </p>
          <div className="mt-[1em] flex flex-col gap-[1.25em]">
            {options.map((option) => (
              <div key={option.id}>
                <p className="mb-[0.6em] m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111]">
                  {option.title}
                </p>
                <div className="pdp-pills">
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
                        className={cn("pdp-pill", isActive && "is-active")}
                      >
                        {val.value}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div ref={atcRef} className="pdp-buy-row">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={99}
          disabled={loading}
          className="h-[2.75em] rounded-[0.125em] border-[#131111]/20 [&_button]:h-full [&_button]:w-[2.75em] [&_span]:h-full [&_span]:border-[#131111]/20"
        />
        <Button
          onClick={handleAdd}
          disabled={!canAdd || loading}
          loading={loading}
          className="pdp-atc"
          style={{ backgroundColor: "#131111", color: "#F2F1EF" }}
        >
          {added
            ? "Added"
            : canAdd
              ? "Add to cart"
              : activeVariant
                ? "Out of stock"
                : "Select options"}
        </Button>
        <button
          type="button"
          onClick={() => void toggleWishlist()}
          disabled={wishlistBusy}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="pdp-wish"
        >
          <Heart
            className={cn("size-[1.125em]", wishlisted && "fill-[#131111] text-[#131111]")}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>
        {lineTotal != null && quantity > 1 && price ? (
          <p className="ml-auto m-0 w-full font-outfit text-[0.9375em] tracking-[-0.02em] text-[#131111] tabular-nums sm:w-auto">
            {formatMoney(lineTotal, price.currency_code ?? "inr")}
          </p>
        ) : null}
      </div>

      {customizable ? (
        <Link
          href={`/customize/${product.id}${level === "full_3d" ? "/3d" : "/2d"}${
            activeVariant?.id ? `?variant=${encodeURIComponent(activeVariant.id)}` : ""
          }`}
          className="pdp-customize"
        >
          Customize this design
        </Link>
      ) : null}

      <DesignDropzone
        label="Your design"
        description="Upload your logo, artwork or sticker design. It goes with this piece when you add it to the cart."
        files={design ? [design] : []}
        onAdd={(f) => setDesign(f)}
        onRemove={() => setDesign(null)}
        disabled={loading}
      />

      <ShareButtons
        title={product.title}
        slug=""
        path={`/products/${product.handle}`}
        className="[&_a]:rounded-[0.125em] [&_button]:rounded-[0.125em]"
      />

      <ul className="pdp-trust">
        {activeVariant?.sku ? <li>SKU: {activeVariant.sku}</li> : null}
        {emiAmount != null && price ? (
          <li>
            <Tooltip content="No-cost EMI available on Razorpay at checkout" side="top">
              <span className="cursor-help underline decoration-dotted underline-offset-2 tabular-nums">
                EMI from {formatMoney(emiAmount, price.currency_code ?? "inr")}/mo
              </span>
            </Tooltip>
          </li>
        ) : null}
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
        label={added ? "Added" : "Add to cart"}
      />
    </div>
  )
}

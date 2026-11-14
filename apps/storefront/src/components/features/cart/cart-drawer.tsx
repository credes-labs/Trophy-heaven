"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Upload, X } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { CartThumb } from "@/components/features/cart/cart-thumb"
import { DesignUploadButton } from "@/components/features/cart/design-upload-button"
import { OrderDesignPanel } from "@/components/features/cart/order-design-panel"
import { formatMoney } from "@/lib/format"
import {
  LINE_DESIGN_KEY,
  ORDER_DESIGN_NOTES_KEY,
  STICKER_DESIGN_KEY,
  readDesignFile,
  readOrderDocuments,
} from "@/lib/design-uploads"

const stepperClass =
  "rounded-[0.125em] border-[#131111]/25 [&_button]:h-9 [&_button]:w-9 [&_button]:text-[1.05rem] [&_button]:hover:bg-[#131111]/5 [&_span]:h-9 [&_span]:min-w-[2.25rem] [&_span]:border-[#131111]/25 [&_span]:font-outfit [&_span]:text-[0.875em]"

export function CartDrawer() {
  const cart = useCartStore((s) => s.cart)
  const drawerOpen = useCartStore((s) => s.drawerOpen)
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  const updateItem = useCartStore((s) => s.updateItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const loading = useCartStore((s) => s.loading)
  const pendingLineIds = useCartStore((s) => s.pendingLineIds)
  const updateItemMetadata = useCartStore((s) => s.updateItemMetadata)
  const [designsOpen, setDesignsOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [drawerOpen, setDrawerOpen])

  if (!drawerOpen) return null

  const items = cart?.items ?? []
  const currency = cart?.currency_code ?? "inr"
  const cartMeta = (cart?.metadata ?? {}) as Record<string, unknown>
  const hasOrderDesign = Boolean(
    readOrderDocuments(cartMeta).length || cartMeta[ORDER_DESIGN_NOTES_KEY]
  )

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className="absolute inset-0 bg-[#131111]/40"
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col bg-white text-[#131111] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#131111]/12 px-5 py-4">
          <h2 className="m-0 font-outfit text-[1.125em] font-normal tracking-[0.14em] text-balance uppercase">
            Your cart
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDesignsOpen((v) => !v)}
              aria-expanded={designsOpen}
              aria-controls="cart-order-designs"
              className="flex h-9 items-center gap-1.5 rounded-[0.125em] border border-[#131111]/25 px-3 font-outfit text-[0.6875em] tracking-[0.12em] text-[#131111] uppercase transition-colors hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            >
              <Upload className="size-3.5" strokeWidth={1.5} aria-hidden />
              Upload your designs
              {hasOrderDesign ? (
                <span className="size-1.5 rounded-full bg-[#131111]" aria-label="(added)" />
              ) : null}
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close cart"
              className="flex h-11 w-11 items-center justify-center text-[#6B635C] hover:text-[#131111]"
            >
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
        {designsOpen ? (
          <div id="cart-order-designs" className="border-b border-[#131111]/12 px-5 py-4">
            <OrderDesignPanel />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-8 text-center font-outfit text-[0.875em] tracking-[-0.02em] text-pretty text-[#6B635C]">
              Your cart is empty.
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-[#131111]/12 p-0">
              {items.map((item) => {
                const thumb =
                  item.thumbnail || (item.metadata?.preview_url as string | undefined)
                const title = item.product_title ?? "Item"
                const qty = item.quantity ?? 1
                const lineTotal = item.subtotal ?? (item.unit_price ?? 0) * qty
                return (
                  <li key={item.id} className="flex gap-3 py-4 first:pt-0">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${title} from cart`}
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center text-[#6B635C] hover:text-[#131111]"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                    </button>
                    <CartThumb src={thumb} alt={title} className="h-[4.75em] w-[4.75em]" />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 font-outfit text-[0.875em] leading-[1.35] font-medium tracking-[-0.02em]">
                        {title}
                      </p>
                      {item.variant_title ? (
                        <p className="mt-[0.15em] m-0 font-outfit text-[0.75em] text-[#6B635C]">
                          {item.variant_title} / x{qty}
                        </p>
                      ) : null}
                      {item.metadata?.design_id ? (
                        <p className="mt-0.5 m-0 font-outfit text-[0.75em] text-[#6B635C]">
                          Customized design
                        </p>
                      ) : null}
                      {typeof item.metadata?.[STICKER_DESIGN_KEY] === "string" &&
                      item.metadata[STICKER_DESIGN_KEY] ? (
                        <p className="mt-0.5 m-0 line-clamp-2 font-outfit text-[0.75em] text-[#6B635C]">
                          Sticker: {String(item.metadata[STICKER_DESIGN_KEY])}
                        </p>
                      ) : null}
                      <DesignUploadButton
                        className="mt-1.5"
                        value={readDesignFile(item.metadata?.[LINE_DESIGN_KEY])}
                        disabled={pendingLineIds.includes(item.id)}
                        label="Upload design for this item"
                        onUploaded={(f) => updateItemMetadata(item.id, { [LINE_DESIGN_KEY]: f })}
                        onRemove={() => updateItemMetadata(item.id, { [LINE_DESIGN_KEY]: null })}
                      />
                      <div className="mt-2">
                        <QuantityStepper
                          value={qty}
                          onChange={(q) => updateItem(item.id, q)}
                          min={1}
                          max={99}
                          disabled={loading || pendingLineIds.includes(item.id)}
                          className={stepperClass}
                        />
                      </div>
                    </div>
                    <p className="m-0 shrink-0 font-outfit text-[0.875em] font-medium tabular-nums">
                      {formatMoney(lineTotal, currency)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-[#131111]/12 px-5 py-4">
          <dl className="mb-4 space-y-[0.65em] font-outfit text-[0.8125em] tracking-[-0.02em]">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[#6B635C]">Shipping (3–5 business days)</dt>
              <dd className="m-0 shrink-0 tabular-nums text-[#131111]">
                {(cart?.shipping_total ?? 0) <= 0
                  ? "Free"
                  : formatMoney(cart?.shipping_total ?? 0, currency)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[#6B635C]">TAX (estimated)</dt>
              <dd className="m-0 shrink-0 tabular-nums text-[#131111]">
                {formatMoney(cart?.tax_total ?? 0, currency)}
              </dd>
            </div>
            {(cart?.discount_total ?? 0) > 0 ? (
              <div className="flex items-start justify-between gap-3">
                <dt className="text-[#6B635C]">Discount</dt>
                <dd className="m-0 shrink-0 tabular-nums text-[#131111]">
                  −{formatMoney(cart?.discount_total ?? 0, currency)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[#6B635C]">Subtotal</dt>
              <dd className="m-0 shrink-0 tabular-nums text-[#131111]">
                {formatMoney(cart?.item_subtotal ?? 0, currency)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-[#131111]/15 pt-[0.75em]">
              <dt className="text-[0.9375em] text-[#131111]">Total</dt>
              <dd className="m-0 text-[1.0625em] font-medium tabular-nums text-[#131111]">
                {formatMoney(cart?.total ?? cart?.item_subtotal ?? 0, currency)}
              </dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            onClick={() => setDrawerOpen(false)}
            aria-disabled={items.length === 0}
            className={`flex h-[3.15em] w-full items-center justify-center rounded-[0.125em] bg-[#131111] font-outfit text-[0.75em] tracking-[0.16em] text-[#F2F1EF] uppercase no-underline transition-opacity hover:opacity-85 ${
              items.length === 0 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Proceed to checkout
          </Link>
          <Link
            href="/cart"
            onClick={() => setDrawerOpen(false)}
            className="mt-[0.85em] block text-center font-outfit text-[0.75em] tracking-[0.14em] text-[#6B635C] uppercase no-underline hover:text-[#131111]"
          >
            View full cart
          </Link>
        </div>
      </aside>
    </div>
  )
}

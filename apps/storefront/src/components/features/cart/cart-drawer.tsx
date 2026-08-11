"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/format"

/**
 * Full-screen drawer on mobile, side sheet on desktop (FR-CART-6). Shows line
 * items with customization preview thumbs and per-item price, with a link to the
 * full cart / checkout.
 */
export function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateItem, removeItem } = useCartStore()

  if (!drawerOpen) return null

  const items = cart?.items ?? []
  const currency = cart?.currency_code ?? "inr"

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-serif text-lg font-semibold">Your cart</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
            className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-muted"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {(item.thumbnail || (item.metadata?.preview_url as string)) && (
                      <img
                        src={item.thumbnail || (item.metadata?.preview_url as string)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product_title}</p>
                    <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                    {item.metadata?.design_id ? (
                      <p className="mt-0.5 text-xs text-accent">Customized design</p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, Math.max(1, Number(e.target.value)))}
                        className="h-9 w-16 rounded-md border px-2 text-sm"
                        aria-label={`Quantity for ${item.product_title}`}
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-muted-foreground underline hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatMoney(item.unit_price ?? 0, currency)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatMoney(cart?.item_subtotal ?? 0, currency)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={() => setDrawerOpen(false)}
            aria-disabled={items.length === 0}
            className={cn(
              buttonVariants({ className: "w-full" }),
              items.length === 0 && "pointer-events-none opacity-50"
            )}
          >
            Checkout
          </Link>
          <Link
            href="/cart"
            onClick={() => setDrawerOpen(false)}
            className="mt-2 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            View full cart
          </Link>
        </div>
      </aside>
    </div>
  )
}

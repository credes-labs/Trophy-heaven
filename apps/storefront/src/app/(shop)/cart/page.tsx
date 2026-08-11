"use client"

import Link from "next/link"
import { useCartStore } from "@/stores/cart-store"
import { formatMoney } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCartStore()
  const items = cart?.items ?? []
  const currency = cart?.currency_code ?? "inr"

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold">Your cart</h1>
      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border p-10 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link href="/" className={cn(buttonVariants({ className: "mt-4" }))}>
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y rounded-lg border">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 p-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  {(item.thumbnail || (item.metadata?.preview_url as string)) && (
                    <img
                      src={item.thumbnail || (item.metadata?.preview_url as string)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product_title}</p>
                  <p className="text-sm text-muted-foreground">{item.variant_title}</p>
                  {item.metadata?.design_id ? (
                    <p className="mt-1 text-xs text-accent">Customized design attached</p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, Math.max(1, Number(e.target.value)))}
                      className="h-9 w-16 rounded-md border px-2 text-sm"
                      aria-label="Quantity"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-muted-foreground underline hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="font-medium">
                  {formatMoney((item.unit_price ?? 0) * (item.quantity ?? 1), currency)}
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-lg border p-5">
            <h2 className="font-medium">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatMoney(cart?.item_subtotal ?? 0, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{formatMoney(cart?.shipping_total ?? 0, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>{formatMoney(cart?.tax_total ?? 0, currency)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatMoney(cart?.total ?? 0, currency)}</dd>
              </div>
            </dl>
            <Link href="/checkout" className={cn(buttonVariants({ className: "mt-5 w-full" }))}>
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}

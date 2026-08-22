"use client"

import type { HttpTypes } from "@medusajs/types"
import { formatMoney } from "@/lib/format"

export function CheckoutSummary({
  cart,
  currency,
  netTermsLabel,
}: {
  cart: HttpTypes.StoreCart
  currency: string
  netTermsLabel?: string | null
}) {
  return (
    <aside className="h-fit rounded-lg border border-border bg-card p-5 lg:sticky lg:top-24">
      <h2 className="font-serif text-lg font-semibold">Order summary</h2>
      <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto text-sm">
        {(cart.items ?? []).map((i) => (
          <li key={i.id} className="flex justify-between gap-3">
            <span className="min-w-0 truncate text-muted-foreground">
              {i.product_title} × {i.quantity}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatMoney((i.unit_price ?? 0) * (i.quantity ?? 1), currency)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatMoney(cart.item_subtotal ?? 0, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums">
            {(cart.shipping_total ?? 0) <= 0
              ? "—"
              : formatMoney(cart.shipping_total ?? 0, currency)}
          </dd>
        </div>
        {(cart.tax_total ?? 0) > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="tabular-nums">{formatMoney(cart.tax_total ?? 0, currency)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatMoney(cart.total ?? 0, currency)}</dd>
        </div>
      </dl>
      {netTermsLabel && (
        <p className="mt-3 text-xs text-muted-foreground">{netTermsLabel}</p>
      )}
    </aside>
  )
}

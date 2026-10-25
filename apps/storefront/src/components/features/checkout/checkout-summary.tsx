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
    <aside className="checkout-summary" aria-label="Order summary">
      <h2>Order summary</h2>
      <ul className="checkout-summary-items">
        {(cart.items ?? []).map((i) => (
          <li key={i.id}>
            <span>
              {i.product_title} × {i.quantity}
            </span>
            <span className="checkout-money">
              {formatMoney((i.unit_price ?? 0) * (i.quantity ?? 1), currency)}
            </span>
          </li>
        ))}
      </ul>
      <dl>
        <div className="checkout-summary-row">
          <dt>Subtotal</dt>
          <dd>{formatMoney(cart.item_subtotal ?? 0, currency)}</dd>
        </div>
        <div className="checkout-summary-row">
          <dt>Shipping</dt>
          <dd>
            {(cart.shipping_total ?? 0) <= 0 ? "—" : formatMoney(cart.shipping_total ?? 0, currency)}
          </dd>
        </div>
        {(cart.tax_total ?? 0) > 0 && (
          <div className="checkout-summary-row">
            <dt>Tax</dt>
            <dd>{formatMoney(cart.tax_total ?? 0, currency)}</dd>
          </div>
        )}
        <div className="checkout-summary-total">
          <dt>Total</dt>
          <dd>{formatMoney(cart.total ?? 0, currency)}</dd>
        </div>
      </dl>
      {netTermsLabel ? <p className="checkout-summary-note">{netTermsLabel}</p> : null}
    </aside>
  )
}

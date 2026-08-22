"use client"

import type { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import type { PaymentMethod } from "./payment-step"

export function ReviewStep({
  cart,
  currency,
  shippingLabel,
  paymentLabel,
  netTerms,
  busy,
  onBack,
  onPlaceOrder,
}: {
  cart: HttpTypes.StoreCart
  currency: string
  shippingLabel: string
  paymentLabel: string
  netTerms: boolean
  busy?: boolean
  onBack: () => void
  onPlaceOrder: () => void
}) {
  const addr = cart.shipping_address
  const addressLine = addr
    ? [addr.first_name, addr.last_name].filter(Boolean).join(" ") +
      (addr.address_1 ? `, ${addr.address_1}` : "") +
      (addr.city ? `, ${addr.city}` : "") +
      (addr.postal_code ? ` ${addr.postal_code}` : "")
    : "—"

  return (
    <div className="mt-6 space-y-6">
      <h2 className="font-medium">Review your order</h2>

      <dl className="space-y-3 rounded-lg border border-border p-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Shipping to</dt>
          <dd className="mt-1">{addressLine}</dd>
          {cart.email && <dd className="text-muted-foreground">{cart.email}</dd>}
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Delivery</dt>
          <dd className="mt-1">{shippingLabel}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Payment</dt>
          <dd className="mt-1">{paymentLabel}</dd>
        </div>
      </dl>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {(cart.items ?? []).map((i) => (
          <li key={i.id} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {i.product_title} × {i.quantity}
            </span>
            <span className="tabular-nums">
              {formatMoney((i.unit_price ?? 0) * (i.quantity ?? 1), currency)}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        Custom trophy orders are non-returnable. Please review your design and details before placing
        the order.
      </p>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button type="button" variant="trophy" onClick={onPlaceOrder} loading={busy}>
          {busy
            ? "Placing order…"
            : netTerms
              ? "Place order on account"
              : `Place order · ${formatMoney(cart.total ?? 0, currency)}`}
        </Button>
      </div>
    </div>
  )
}

export function paymentMethodLabel(method: PaymentMethod, razorpayEnabled: boolean): string {
  if (method === "net_terms") return "Corporate net terms"
  if (method === "cod") return "Cash on delivery"
  return razorpayEnabled ? "Razorpay" : "Online payment (test)"
}

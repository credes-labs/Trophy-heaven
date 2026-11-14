"use client"

import type { HttpTypes } from "@medusajs/types"
import { CheckoutBack, CheckoutSubmit } from "@/components/features/checkout/checkout-actions"
import { PaymentBreakdown } from "@/components/features/checkout/payment-breakdown"
import { formatMoney } from "@/lib/format"
import { ADVANCE_PERCENT, splitAdvance } from "@/lib/payment-plan"
import type { PaymentMethod } from "./payment-step"

export function ReviewStep({
  cart,
  currency,
  shippingLabel,
  paymentLabel,
  netTerms,
  advanceCod = false,
  busy,
  onBack,
  onPlaceOrder,
}: {
  cart: HttpTypes.StoreCart
  currency: string
  shippingLabel: string
  paymentLabel: string
  netTerms: boolean
  /** 10% advance now, 90% cash on delivery. */
  advanceCod?: boolean
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
    <div className="checkout-step">
      <h2 className="checkout-section-title">Review</h2>
      <p className="checkout-help">
        Custom trophy orders are non-returnable. Please review your design and details before placing
        the order.
      </p>

      <dl className="checkout-review">
        <div>
          <dt>Shipping to</dt>
          <dd>{addressLine}</dd>
          {cart.email ? <dd>{cart.email}</dd> : null}
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{shippingLabel}</dd>
        </div>
        <div>
          <dt>Payment</dt>
          <dd>{paymentLabel}</dd>
        </div>
      </dl>

      {advanceCod ? <PaymentBreakdown total={cart.total ?? 0} currency={currency} /> : null}

      <ul className="checkout-lines">
        {(cart.items ?? []).map((i) => (
          <li key={i.id}>
            <span>
              {i.product_title} × {i.quantity}
            </span>
            <span>{formatMoney((i.unit_price ?? 0) * (i.quantity ?? 1), currency)}</span>
          </li>
        ))}
      </ul>

      <div className="checkout-actions is-follow">
        <CheckoutBack onClick={onBack} disabled={busy}>
          Back
        </CheckoutBack>
        <CheckoutSubmit type="button" onClick={onPlaceOrder} disabled={busy}>
          {busy
            ? "Placing order…"
            : netTerms
              ? "Place order on account"
              : advanceCod
                ? `Pay ${formatMoney(splitAdvance(cart.total ?? 0, currency).advance, currency)} advance · place order`
                : `Place order · ${formatMoney(cart.total ?? 0, currency)}`}
        </CheckoutSubmit>
      </div>
    </div>
  )
}

export function paymentMethodLabel(method: PaymentMethod, razorpayEnabled: boolean): string {
  if (method === "net_terms") return "Corporate net terms"
  if (method === "advance_cod")
    return `${ADVANCE_PERCENT}% advance ${razorpayEnabled ? "via Razorpay" : "(test)"} + ${100 - ADVANCE_PERCENT}% cash on delivery`
  return razorpayEnabled ? "Razorpay" : "Online payment (test)"
}

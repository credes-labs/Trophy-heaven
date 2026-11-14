"use client"

import { CheckoutBack, CheckoutSubmit } from "@/components/features/checkout/checkout-actions"
import { PaymentBreakdown } from "@/components/features/checkout/payment-breakdown"
import type { CartPaymentMeta } from "@/lib/data/checkout"
import { formatMoney } from "@/lib/format"
import { ADVANCE_PERCENT, splitAdvance } from "@/lib/payment-plan"
import { cn } from "@/lib/utils"

/** `advance_cod` = 10% paid online now, 90% cash on delivery. */
export type PaymentMethod = "razorpay" | "advance_cod" | "net_terms"

/**
 * Payment route is left open — Razorpay, COD, and net-terms stay reachable
 * after address + delivery. Do not gate or remove this step.
 */
export function PaymentStep({
  netTerms,
  paymentMeta,
  method,
  onMethodChange,
  razorpayEnabled,
  total,
  currency,
  busy,
  onBack,
  onContinue,
}: {
  netTerms: boolean
  paymentMeta: CartPaymentMeta
  method: PaymentMethod
  onMethodChange: (m: PaymentMethod) => void
  razorpayEnabled: boolean
  total: number
  currency: string
  busy?: boolean
  onBack: () => void
  onContinue: () => void
}) {
  if (netTerms) {
    return (
      <div className="checkout-step">
        <h2 className="checkout-section-title">Corporate billing</h2>
        <p className="checkout-note">
          This order will be billed on{" "}
          <strong>{paymentMeta.payment_terms === "net_60" ? "Net 60" : "Net 30"}</strong>
          {paymentMeta.po_number ? (
            <>
              {" "}
              against PO <strong>{String(paymentMeta.po_number)}</strong>
            </>
          ) : null}
          . No prepaid payment is collected at checkout.
        </p>
        <div className="checkout-actions is-follow">
          <CheckoutBack onClick={onBack} disabled={busy}>
            Back
          </CheckoutBack>
          <CheckoutSubmit type="button" onClick={onContinue} disabled={busy}>
            Continue
          </CheckoutSubmit>
        </div>
      </div>
    )
  }

  const { advance, balance } = splitAdvance(total, currency)

  return (
    <div className="checkout-step">
      <h2 className="checkout-section-title">Payment</h2>
      <p className="checkout-help">Your payment information is secure and encrypted.</p>

      <ul className="checkout-choice-list">
        <li>
          <label className={cn("checkout-choice", method === "razorpay" && "is-active")}>
            <input
              type="radio"
              name="payment"
              checked={method === "razorpay"}
              onChange={() => onMethodChange("razorpay")}
            />
            <span className="checkout-choice-body">
              <span className="checkout-choice-title">
                {razorpayEnabled ? "Pay in full online" : "Online payment"}
              </span>
              <span className="checkout-choice-help">
                {razorpayEnabled
                  ? "UPI, cards, net banking and wallets via Razorpay"
                  : "System provider (test mode) — Razorpay key not configured"}
              </span>
            </span>
            <span className="checkout-choice-price">{formatMoney(total, currency)}</span>
          </label>
        </li>
        <li>
          <label className={cn("checkout-choice", method === "advance_cod" && "is-active")}>
            <input
              type="radio"
              name="payment"
              checked={method === "advance_cod"}
              onChange={() => onMethodChange("advance_cod")}
            />
            <span className="checkout-choice-body">
              <span className="checkout-choice-title">
                {ADVANCE_PERCENT}% advance, rest cash on delivery
              </span>
              <span className="checkout-choice-help">
                Pay {formatMoney(advance, currency)} online now
                {razorpayEnabled ? " via Razorpay" : " (test mode)"}, and{" "}
                {formatMoney(balance, currency)} in cash when your order arrives.
              </span>
            </span>
            <span className="checkout-choice-price">{formatMoney(advance, currency)} now</span>
          </label>
        </li>
      </ul>

      {method === "advance_cod" ? (
        <>
          <PaymentBreakdown total={total} currency={currency} />
          <p className="checkout-note">
            The {ADVANCE_PERCENT}% advance confirms your order and starts production. Please keep{" "}
            <strong>{formatMoney(balance, currency)}</strong> ready in cash for the delivery
            partner.
          </p>
        </>
      ) : null}

      <div className="checkout-actions is-follow">
        <CheckoutBack onClick={onBack} disabled={busy}>
          Back
        </CheckoutBack>
        <CheckoutSubmit type="button" onClick={onContinue} disabled={busy}>
          Continue
        </CheckoutSubmit>
      </div>
    </div>
  )
}

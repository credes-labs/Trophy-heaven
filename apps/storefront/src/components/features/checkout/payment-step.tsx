"use client"

import { CheckoutBack, CheckoutSubmit } from "@/components/features/checkout/checkout-actions"
import type { CartPaymentMeta } from "@/lib/data/checkout"
import { cn } from "@/lib/utils"

export type PaymentMethod = "razorpay" | "cod" | "net_terms"

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
  busy,
  onBack,
  onContinue,
}: {
  netTerms: boolean
  paymentMeta: CartPaymentMeta
  method: PaymentMethod
  onMethodChange: (m: PaymentMethod) => void
  razorpayEnabled: boolean
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
                {razorpayEnabled ? "Pay with Razorpay" : "Online payment"}
              </span>
              <span className="checkout-choice-help">
                {razorpayEnabled
                  ? "UPI, cards, net banking, wallets"
                  : "System provider (test mode) — Razorpay key not configured"}
              </span>
            </span>
          </label>
        </li>
        {razorpayEnabled ? null : (
          <li>
            <label className={cn("checkout-choice", method === "cod" && "is-active")}>
              <input
                type="radio"
                name="payment"
                checked={method === "cod"}
                onChange={() => onMethodChange("cod")}
              />
              <span className="checkout-choice-body">
                <span className="checkout-choice-title">Cash on delivery</span>
                <span className="checkout-choice-help">Pay when your order arrives</span>
              </span>
            </label>
          </li>
        )}
      </ul>

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

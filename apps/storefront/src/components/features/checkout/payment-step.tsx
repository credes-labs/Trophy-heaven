"use client"

import { Button } from "@/components/ui/button"
import type { CartPaymentMeta } from "@/lib/data/checkout"
import { cn } from "@/lib/utils"

export type PaymentMethod = "razorpay" | "cod" | "net_terms"

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
      <div className="mt-6 space-y-4">
        <h2 className="font-medium">Corporate billing</h2>
        <div className="rounded-lg border border-trophy/30 bg-trophy/5 p-5">
          <p className="font-medium">Pay on account</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This order will be billed on{" "}
            <strong className="text-foreground">
              {paymentMeta.payment_terms === "net_60" ? "Net 60" : "Net 30"}
            </strong>
            {paymentMeta.po_number ? (
              <>
                {" "}
                against PO <strong className="text-foreground">{String(paymentMeta.po_number)}</strong>
              </>
            ) : null}
            . No prepaid payment is collected at checkout.
          </p>
        </div>
        <div className="flex justify-between pt-2">
          <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
            Back
          </Button>
          <Button type="button" variant="trophy" onClick={onContinue} disabled={busy}>
            Continue to review
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <h2 className="font-medium">Payment method</h2>

      <ul className="space-y-3">
        <li>
          <label
            className={cn(
              "flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors",
              method === "razorpay" ? "border-trophy bg-trophy/5" : "border-border hover:bg-muted/40"
            )}
          >
            <input
              type="radio"
              name="payment"
              checked={method === "razorpay"}
              onChange={() => onMethodChange("razorpay")}
              className="mt-1 accent-[var(--color-trophy)]"
            />
            <span>
              <span className="block font-medium">
                {razorpayEnabled ? "Pay with Razorpay" : "Online payment"}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {razorpayEnabled
                  ? "UPI · Cards · Net banking · Wallets"
                  : "System provider (test mode) — Razorpay key not configured"}
              </span>
            </span>
          </label>
        </li>
        <li>
          <label
            className={cn(
              "flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors",
              method === "cod" ? "border-trophy bg-trophy/5" : "border-border hover:bg-muted/40"
            )}
          >
            <input
              type="radio"
              name="payment"
              checked={method === "cod"}
              onChange={() => onMethodChange("cod")}
              className="mt-1 accent-[var(--color-trophy)]"
            />
            <span>
              <span className="block font-medium">Cash on delivery</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Pay when your order arrives
              </span>
            </span>
          </label>
        </li>
      </ul>

      <p className="text-xs text-muted-foreground">Your payment information is secure and encrypted.</p>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button type="button" variant="trophy" onClick={onContinue} disabled={busy}>
          Continue to review
        </Button>
      </div>
    </div>
  )
}

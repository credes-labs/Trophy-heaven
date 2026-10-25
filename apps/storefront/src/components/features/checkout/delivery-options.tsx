"use client"

import type { HttpTypes } from "@medusajs/types"
import { CheckoutBack, CheckoutSubmit } from "@/components/features/checkout/checkout-actions"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export function DeliveryOptions({
  options,
  selectedId,
  onSelect,
  currency,
  busy,
  onBack,
  onContinue,
}: {
  options: HttpTypes.StoreCartShippingOption[]
  selectedId: string
  onSelect: (id: string) => void
  currency: string
  busy?: boolean
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div className="checkout-step">
      <h2 className="checkout-section-title">Delivery</h2>
      <p className="checkout-help">Choose how this order should arrive.</p>

      {options.length === 0 ? (
        <p className="checkout-note">No shipping options configured for this region yet.</p>
      ) : (
        <ul className="checkout-choice-list">
          {options.map((o) => {
            const active = selectedId === o.id
            return (
              <li key={o.id}>
                <label className={cn("checkout-choice", active && "is-active")}>
                  <input
                    type="radio"
                    name="shipping"
                    value={o.id}
                    checked={active}
                    onChange={() => onSelect(o.id)}
                  />
                  <span className="checkout-choice-body">
                    <span className="checkout-choice-title">{o.name}</span>
                    <span className="checkout-choice-help">
                      Arrives in estimated transit time for your region
                    </span>
                  </span>
                  <span className="checkout-choice-price">
                    {(o.amount ?? 0) <= 0 ? "Free" : formatMoney(o.amount ?? 0, currency)}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}

      <div className="checkout-actions is-follow">
        <CheckoutBack onClick={onBack} disabled={busy}>
          Back
        </CheckoutBack>
        <CheckoutSubmit type="button" onClick={onContinue} disabled={busy || !selectedId}>
          {busy ? "Saving" : "Continue"}
        </CheckoutSubmit>
      </div>
    </div>
  )
}

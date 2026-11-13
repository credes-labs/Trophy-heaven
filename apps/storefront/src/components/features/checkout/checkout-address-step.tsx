"use client"

import { useEffect, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { AddressForm } from "@/components/features/checkout/address-form"
import { CheckoutSubmit } from "@/components/features/checkout/checkout-actions"
import {
  customerAddressToFormValues,
  type DeliveryAddressValues,
} from "@/lib/checkout-address"
import { medusa } from "@/lib/medusa"
import { cn } from "@/lib/utils"

export function CheckoutAddressStep({
  customerEmail,
  busy,
  onContinue,
}: {
  customerEmail: string
  busy?: boolean
  onContinue: (values: DeliveryAddressValues, options: { persist: boolean }) => void | Promise<void>
}) {
  const [addresses, setAddresses] = useState<HttpTypes.StoreCustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<"pick" | "create">("create")

  useEffect(() => {
    let cancelled = false
    medusa.store.customer
      .listAddress({ limit: 50 })
      .then(({ addresses: list }) => {
        if (cancelled) return
        const next = list ?? []
        setAddresses(next)
        if (next.length > 0) {
          const preferred = next.find((a) => a.is_default_shipping) ?? next[0]!
          setSelectedId(preferred.id)
          setMode("pick")
        } else {
          setMode("create")
        }
      })
      .catch(() => {
        if (!cancelled) setAddresses([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selected = addresses.find((a) => a.id === selectedId)

  function useSelected() {
    if (!selected) return
    void onContinue(customerAddressToFormValues(selected, customerEmail), { persist: false })
  }

  if (loading) {
    return (
      <div className="checkout-skeleton" aria-busy="true">
        <span />
        <span />
      </div>
    )
  }

  return (
    <div className="checkout-step">
      <h2 className="checkout-section-title">Delivery address</h2>
      <p className="checkout-help">
        {addresses.length
          ? "Use a saved address or add another."
          : "Add an address to continue. It is saved to your account."}
      </p>

      {addresses.length > 0 && mode === "pick" ? (
        <div>
          <ul className="checkout-saved">
            {addresses.map((address) => {
              const active = address.id === selectedId
              const label = address.address_name || "Address"
              return (
                <li key={address.id}>
                  <label className={cn("checkout-choice", active && "is-active")}>
                    <input
                      type="radio"
                      name="saved-address"
                      checked={active}
                      onChange={() => setSelectedId(address.id)}
                    />
                    <span className="checkout-choice-body">
                      <span className="checkout-label">{label}</span>
                      <span className="checkout-choice-title">
                        {[address.address_1, address.address_2, address.city, address.province, address.postal_code]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          <div className="checkout-actions is-follow">
            <CheckoutSubmit type="button" disabled={busy || !selected} onClick={useSelected}>
              {busy ? "Saving" : "Continue"}
            </CheckoutSubmit>
            <button type="button" onClick={() => setMode("create")} className="checkout-text-link">
              Add a new address
            </button>
          </div>
        </div>
      ) : (
        <>
          {addresses.length > 0 ? (
            <p className="checkout-link-row">
              <button type="button" onClick={() => setMode("pick")} className="checkout-text-link">
                Use a saved address
              </button>
            </p>
          ) : null}
          <AddressForm
            busy={busy}
            defaults={{ email: customerEmail, save_as: "Home" }}
            onSubmit={(values) => onContinue(values, { persist: true })}
          />
        </>
      )}
    </div>
  )
}

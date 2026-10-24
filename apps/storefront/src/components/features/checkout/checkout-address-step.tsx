"use client"

import { useEffect, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { AddressForm } from "@/components/features/checkout/address-form"
import { EditorialCtaButton } from "@/components/layout/editorial/editorial-cta"
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
      <div className="mt-[2em] space-y-[1em]" aria-busy="true">
        <div className="h-[1.25em] w-[10em] rounded-[0.125em] bg-[#D9D9D9]" />
        <div className="h-[6em] w-full rounded-[0.125em] bg-[#D9D9D9]" />
      </div>
    )
  }

  return (
    <div className="mt-[2em]">
      <h2 className="m-0 font-outfit text-[1.5em] leading-[1.2] font-normal tracking-[-0.03em] text-balance text-[#131111]">
        Delivery address
      </h2>
      <p className="mt-[0.5em] m-0 max-w-[68ch] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-pretty text-[#131111]/70">
        {addresses.length
          ? "Use a saved address or add another."
          : "Add an address to continue. It is saved to your account."}
      </p>

      {addresses.length > 0 && mode === "pick" ? (
        <div className="mt-[1.5em]">
          <ul className="m-0 list-none space-y-[0.75em] p-0">
            {addresses.map((address) => {
              const active = address.id === selectedId
              const label = address.address_name || "Address"
              return (
                <li key={address.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer gap-[0.85em] border-b border-[#CDCDCD] py-[0.9em]",
                      active ? "text-[#131111]" : "text-[#131111]/70"
                    )}
                  >
                    <input
                      type="radio"
                      name="saved-address"
                      checked={active}
                      onChange={() => setSelectedId(address.id)}
                      className="mt-[0.3em] accent-[#131111]"
                    />
                    <span>
                      <span className="block font-outfit text-[0.75em] tracking-[-0.02em] uppercase">
                        {label}
                      </span>
                      <span className="mt-[0.25em] block font-outfit text-[1em] leading-[1.4] tracking-[-0.02em]">
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
          <div className="mt-[1.75em] flex flex-col items-start gap-[1em]">
            <EditorialCtaButton type="button" disabled={busy || !selected} onClick={useSelected}>
              {busy ? "Saving" : "Continue"}
            </EditorialCtaButton>
            <button
              type="button"
              onClick={() => setMode("create")}
              className="cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em]"
            >
              Add a new address
            </button>
          </div>
        </div>
      ) : (
        <>
          {addresses.length > 0 ? (
            <button
              type="button"
              onClick={() => setMode("pick")}
              className="mt-[1em] cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em]"
            >
              Use a saved address
            </button>
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

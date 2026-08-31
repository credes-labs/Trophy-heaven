"use client"

import { useCallback, useEffect, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { AddressForm } from "@/components/features/checkout/address-form"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import {
  customerAddressToFormValues,
  toCustomerAddressPayload,
  type DeliveryAddressValues,
} from "@/lib/checkout-address"
import { medusa } from "@/lib/medusa"
import { useAuthStore } from "@/stores/auth-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AddressesPage() {
  const customer = useAuthStore((s) => s.customer)
  const [addresses, setAddresses] = useState<HttpTypes.StoreCustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [defaults, setDefaults] = useState<Partial<DeliveryAddressValues>>({})
  const [defaultShipping, setDefaultShipping] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const email = customer?.email ?? ""

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { addresses: list } = await medusa.store.customer.listAddress({ limit: 50 })
      setAddresses(list ?? [])
    } catch {
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  function openCreate() {
    setEditingId(null)
    setDefaults({ email, save_as: "Home" })
    setDefaultShipping(false)
    setError(null)
    setOpen(true)
  }

  function openEdit(address: HttpTypes.StoreCustomerAddress) {
    setEditingId(address.id)
    setDefaults(customerAddressToFormValues(address, email))
    setDefaultShipping(Boolean(address.is_default_shipping))
    setError(null)
    setOpen(true)
  }

  async function handleSave(values: DeliveryAddressValues) {
    setSaving(true)
    setError(null)
    const payload = {
      ...toCustomerAddressPayload(values),
      is_default_shipping: defaultShipping,
      is_default_billing: defaultShipping,
    }
    try {
      if (editingId) {
        await medusa.store.customer.updateAddress(editingId, payload)
      } else {
        await medusa.store.customer.createAddress(payload)
      }
      setOpen(false)
      await refresh()
    } catch (e) {
      setError((e as Error).message || "Could not save address")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this address?")) return
    try {
      await medusa.store.customer.deleteAddress(id)
      await refresh()
    } catch {
      // ignore
    }
  }

  async function setDefault(id: string) {
    try {
      await medusa.store.customer.updateAddress(id, {
        is_default_shipping: true,
        is_default_billing: true,
      })
      await refresh()
    } catch {
      // ignore
    }
  }

  const textBtn =
    "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] uppercase underline underline-offset-[0.15em]"

  return (
    <div>
      <header className="relative overflow-hidden">
        <EditorialWatermark>home</EditorialWatermark>
        <EditorialEyebrow>Account</EditorialEyebrow>
        <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,4vw,3em)] leading-[1.1] font-normal tracking-[-0.04em] text-[#131111]">
          Addresses
        </h1>
        <p className="relative mt-[1em] m-0 max-w-[28em] font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
          Shipping and billing locations for checkout.
        </p>
        <div className="relative mt-[1.5em]">
          <button type="button" onClick={openCreate} className={`${textBtn} text-[#131111]`}>
            Add a new address
          </button>
        </div>
      </header>

      {loading ? (
        <div className="mt-[2.5em] space-y-[1em]" aria-busy="true">
          <div className="h-[6em] w-full rounded-[0.125em] bg-[#D9D9D9]" />
          <div className="h-[6em] w-full rounded-[0.125em] bg-[#D9D9D9]" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="mt-[2.5em]">
          <p className="m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            No saved addresses yet.
          </p>
          <div className="mt-[1.75em]">
            <button type="button" onClick={openCreate} className={`${textBtn} text-[#131111]`}>
              Add an address
            </button>
          </div>
        </div>
      ) : (
        <ul className="mt-[2.5em] m-0 list-none space-y-0 p-0">
          {addresses.map((address) => {
            const label = address.address_name || "Address"
            return (
              <li key={address.id} className="border-b border-[#CDCDCD] py-[1.25em]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-[1em] gap-y-[0.35em]">
                  <p className="m-0 font-outfit text-[0.75em] tracking-[-0.02em] text-[#131111] uppercase">
                    {label}
                    {address.is_default_shipping ? " · Default" : ""}
                  </p>
                </div>
                <p className="mt-[0.5em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]">
                  {[address.first_name, address.last_name].filter(Boolean).join(" ")}
                </p>
                <p className="mt-[0.2em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
                  {[address.address_1, address.address_2, address.city, address.province, address.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {address.phone ? (
                  <p className="mt-[0.2em] m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111]/45">
                    {address.phone}
                  </p>
                ) : null}
                <div className="mt-[0.85em] flex flex-wrap gap-x-[1.25em] gap-y-[0.5em]">
                  <button
                    type="button"
                    onClick={() => openEdit(address)}
                    className={`${textBtn} text-[#131111]`}
                  >
                    Edit
                  </button>
                  {!address.is_default_shipping ? (
                    <button
                      type="button"
                      onClick={() => void setDefault(address.id)}
                      className={`${textBtn} text-[#131111]/55`}
                    >
                      Set default
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleDelete(address.id)}
                    className={`${textBtn} text-[#131111]/55`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          size="lg"
          className="max-h-[90vh] overflow-y-auto rounded-none border-0 bg-[#F2F1EF] p-[clamp(1.5rem,4vw,2.5em)] text-[#131111] shadow-none"
        >
          <DialogHeader className="mb-[0.25em]">
            <EditorialEyebrow>Account</EditorialEyebrow>
            <DialogTitle className="mt-[1em] font-outfit text-[1.75em] font-normal leading-[1.15] tracking-[-0.03em] text-[#131111]">
              {editingId ? "Edit address" : "Add address"}
            </DialogTitle>
            <DialogDescription className="mt-[0.5em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
              Used for shipping and billing at checkout.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="m-0 font-outfit text-[0.875em] leading-[1.4] tracking-[-0.02em] text-[#8A2D25]" role="alert">
              {error}
            </p>
          ) : null}
          <AddressForm
            key={editingId ?? "new"}
            idPrefix="account"
            showEmail={false}
            submitLabel="Save address"
            ariaLabel={editingId ? "Edit address" : "Add address"}
            busy={saving}
            defaults={defaults}
            onCancel={() => setOpen(false)}
            onSubmit={handleSave}
            className="mt-[1.25em]"
          >
            <label className="flex items-start gap-[0.75em] font-outfit text-[0.875em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
              <input
                type="checkbox"
                checked={defaultShipping}
                onChange={(e) => setDefaultShipping(e.target.checked)}
                className="mt-[0.2em] size-[0.875em] shrink-0 accent-[#131111]"
              />
              Set as default shipping address
            </label>
          </AddressForm>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { Plus, Star } from "lucide-react"
import { medusa } from "@/lib/medusa"
import { useAuthStore } from "@/stores/auth-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

type AddressFormState = {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone: string
  address_name: string
  is_default_shipping: boolean
}

const emptyForm = (): AddressFormState => ({
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "in",
  phone: "",
  address_name: "Home",
  is_default_shipping: false,
})

function fromAddress(a: HttpTypes.StoreCustomerAddress): AddressFormState {
  return {
    first_name: a.first_name ?? "",
    last_name: a.last_name ?? "",
    company: a.company ?? "",
    address_1: a.address_1 ?? "",
    address_2: a.address_2 ?? "",
    city: a.city ?? "",
    province: a.province ?? "",
    postal_code: a.postal_code ?? "",
    country_code: a.country_code ?? "in",
    phone: a.phone ?? "",
    address_name: a.address_name ?? "Home",
    is_default_shipping: Boolean(a.is_default_shipping),
  }
}

export default function AddressesPage() {
  const loadCustomer = useAuthStore((s) => s.loadCustomer)
  const [addresses, setAddresses] = useState<HttpTypes.StoreCustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AddressFormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { addresses: list } = await medusa.store.customer.listAddress({ limit: 50 })
      setAddresses(list ?? [])
      await loadCustomer()
    } catch {
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }, [loadCustomer])

  useEffect(() => {
    void refresh()
  }, [refresh])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setOpen(true)
  }

  function openEdit(address: HttpTypes.StoreCustomerAddress) {
    setEditingId(address.id)
    setForm(fromAddress(address))
    setError(null)
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      company: form.company || undefined,
      address_1: form.address_1,
      address_2: form.address_2 || undefined,
      city: form.city,
      province: form.province || undefined,
      postal_code: form.postal_code,
      country_code: form.country_code.toLowerCase(),
      phone: form.phone || undefined,
      address_name: form.address_name || undefined,
      is_default_shipping: form.is_default_shipping,
      is_default_billing: form.is_default_shipping,
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Addresses</h1>
          <p className="mt-1 text-muted-foreground">Shipping and billing locations.</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" /> Add new
        </Button>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 py-12">
            <p className="text-muted-foreground">No saved addresses yet.</p>
            <Button onClick={openCreate}>Add an address</Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id}>
              <Card>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">
                      {address.address_name || "Address"}
                    </p>
                    {address.is_default_shipping && (
                      <Badge variant="gold" className="gap-1">
                        <Star className="h-3 w-3" /> Default
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="text-foreground">
                      {[address.first_name, address.last_name].filter(Boolean).join(" ")}
                    </p>
                    {address.company ? <p>{address.company}</p> : null}
                    <p>{address.address_1}</p>
                    {address.address_2 ? <p>{address.address_2}</p> : null}
                    <p>
                      {[address.city, address.province, address.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {address.phone ? <p className="mt-1">Phone: {address.phone}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => openEdit(address)}>
                      Edit
                    </Button>
                    {!address.is_default_shipping && (
                      <Button variant="ghost" size="sm" onClick={() => void setDefault(address.id)}>
                        Set default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => void handleDelete(address.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit address" : "Add address"}</DialogTitle>
            <DialogDescription>Used for shipping and billing at checkout.</DialogDescription>
          </DialogHeader>
          {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto sm:grid-cols-2">
            <Input
              label="Label"
              value={form.address_name}
              onChange={(e) => setForm((f) => ({ ...f, address_name: e.target.value }))}
              placeholder="Home, Office…"
            />
            <Input
              label="Company (optional)"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            />
            <Input
              label="First name"
              required
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            />
            <Input
              label="Last name"
              required
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            />
            <div className="sm:col-span-2">
              <Input
                label="Address"
                required
                value={form.address_1}
                onChange={(e) => setForm((f) => ({ ...f, address_1: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Apartment, suite (optional)"
                value={form.address_2}
                onChange={(e) => setForm((f) => ({ ...f, address_2: e.target.value }))}
              />
            </div>
            <Input
              label="City"
              required
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <Input
              label="State / province"
              value={form.province}
              onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
            />
            <Input
              label="PIN code"
              required
              value={form.postal_code}
              onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_default_shipping}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_default_shipping: e.target.checked }))
                }
                className="rounded border-border"
              />
              Set as default shipping address
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} loading={saving}>
              Save address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type AddressFormValues = {
  email: string
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  postal_code: string
  country_code: string
  phone: string
}

export function AddressForm({
  busy,
  onSubmit,
  defaults,
}: {
  busy?: boolean
  onSubmit: (values: AddressFormValues) => void | Promise<void>
  defaults?: Partial<AddressFormValues>
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    void onSubmit({
      email: String(form.get("email") ?? ""),
      first_name: String(form.get("first_name") ?? ""),
      last_name: String(form.get("last_name") ?? ""),
      address_1: String(form.get("address_1") ?? ""),
      address_2: String(form.get("address_2") ?? "") || undefined,
      city: String(form.get("city") ?? ""),
      postal_code: String(form.get("postal_code") ?? ""),
      country_code: String(form.get("country_code") ?? "in").toLowerCase(),
      phone: String(form.get("phone") ?? ""),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Shipping address">
      <div className="sm:col-span-2">
        <Input
          name="email"
          type="email"
          required
          label="Email"
          defaultValue={defaults?.email}
          autoComplete="email"
        />
      </div>
      <Input
        name="first_name"
        required
        label="First name"
        defaultValue={defaults?.first_name}
        autoComplete="given-name"
      />
      <Input
        name="last_name"
        required
        label="Last name"
        defaultValue={defaults?.last_name}
        autoComplete="family-name"
      />
      <div className="sm:col-span-2">
        <Input
          name="phone"
          label="Phone"
          defaultValue={defaults?.phone}
          autoComplete="tel"
          placeholder="10-digit mobile"
        />
      </div>
      <div className="sm:col-span-2">
        <Input
          name="address_1"
          required
          label="Address"
          defaultValue={defaults?.address_1}
          autoComplete="address-line1"
        />
      </div>
      <div className="sm:col-span-2">
        <Input
          name="address_2"
          label="Apartment, suite, etc. (optional)"
          defaultValue={defaults?.address_2}
          autoComplete="address-line2"
        />
      </div>
      <Input
        name="city"
        required
        label="City"
        defaultValue={defaults?.city}
        autoComplete="address-level2"
      />
      <Input
        name="postal_code"
        required
        label="PIN code"
        defaultValue={defaults?.postal_code}
        autoComplete="postal-code"
      />
      <div className="sm:col-span-2">
        <Input
          name="country_code"
          required
          label="Country code"
          defaultValue={defaults?.country_code ?? "in"}
          autoComplete="country"
        />
      </div>
      <div className="sm:col-span-2 flex justify-end pt-2">
        <Button type="submit" variant="trophy" loading={busy}>
          Continue to delivery
        </Button>
      </div>
    </form>
  )
}

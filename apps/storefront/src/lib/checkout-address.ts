import { isValidIndianPincode } from "@/lib/pincode"

export type AddressSaveAs = "Home" | "Work"

export type DeliveryAddressValues = {
  email: string
  full_name: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postal_code: string
  phone?: string
  save_as: AddressSaveAs
}

export function splitFullName(full: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first_name: "", last_name: "" }
  if (parts.length === 1) return { first_name: parts[0]!, last_name: parts[0]! }
  return { first_name: parts[0]!, last_name: parts.slice(1).join(" ") }
}

export function customerAddressToFormValues(
  address: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    address_2?: string | null
    city?: string | null
    province?: string | null
    postal_code?: string | null
    phone?: string | null
    address_name?: string | null
  },
  email: string
): DeliveryAddressValues {
  const save_as: AddressSaveAs = /work|office/i.test(address.address_name ?? "") ? "Work" : "Home"
  return {
    email,
    full_name: [address.first_name, address.last_name].filter(Boolean).join(" ").trim(),
    address_1: address.address_1 ?? "",
    address_2: address.address_2 ?? "",
    city: address.city ?? "",
    state: address.province ?? "",
    postal_code: address.postal_code ?? "",
    phone: address.phone ?? "",
    save_as,
  }
}

export function toCartShippingAddress(values: DeliveryAddressValues) {
  const { first_name, last_name } = splitFullName(values.full_name)
  return {
    first_name,
    last_name,
    address_1: values.address_1,
    address_2: values.address_2 || undefined,
    city: values.city,
    province: values.state || undefined,
    postal_code: values.postal_code,
    country_code: "in",
    phone: values.phone || undefined,
  }
}

export function toCustomerAddressPayload(values: DeliveryAddressValues) {
  return {
    ...toCartShippingAddress(values),
    address_name: values.save_as,
  }
}

export type AddressFieldErrors = Partial<Record<keyof DeliveryAddressValues, string>>

const FIELD_ORDER = [
  "postal_code",
  "city",
  "state",
  "address_1",
  "address_2",
  "full_name",
  "email",
  "phone",
] as const satisfies readonly (keyof DeliveryAddressValues)[]

export function validateDeliveryAddress(
  values: DeliveryAddressValues,
  options?: { emailRequired?: boolean }
): AddressFieldErrors {
  const errors: AddressFieldErrors = {}
  const emailRequired = options?.emailRequired !== false

  if (!isValidIndianPincode(values.postal_code)) {
    errors.postal_code = "Enter a 6-digit PIN code."
  }
  if (!values.city.trim()) errors.city = "Enter the city."
  if (!values.state.trim()) errors.state = "Enter the state."
  if (!values.address_1.trim()) errors.address_1 = "Enter the flat or house number."
  if (!values.address_2?.trim()) errors.address_2 = "Enter the apartment, area, or sector."
  if (!values.full_name.trim()) errors.full_name = "Enter the full name."
  if (emailRequired) {
    const email = values.email.trim()
    if (!email) errors.email = "Enter an email address."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address."
  }

  return errors
}

export function firstAddressError(errors: AddressFieldErrors): keyof DeliveryAddressValues | null {
  return FIELD_ORDER.find((key) => errors[key]) ?? null
}

"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { CheckoutSubmit } from "@/components/features/checkout/checkout-actions"
import {
  firstAddressError,
  validateDeliveryAddress,
  type AddressFieldErrors,
  type AddressSaveAs,
  type DeliveryAddressValues,
} from "@/lib/checkout-address"
import { isValidIndianPincode, lookupIndianPincode } from "@/lib/pincode"
import { cn } from "@/lib/utils"
import "./checkout.css"

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string | null
  children: ReactNode
}) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  return (
    <div className="checkout-field">
      <label htmlFor={id} className="checkout-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="checkout-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="checkout-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function AddressForm({
  busy,
  onSubmit,
  defaults,
  idPrefix = "checkout",
  showEmail = true,
  submitLabel = "Continue",
  ariaLabel = "Add delivery address",
  onCancel,
  children,
  className,
}: {
  busy?: boolean
  onSubmit: (values: DeliveryAddressValues) => void | Promise<void>
  defaults?: Partial<DeliveryAddressValues>
  idPrefix?: string
  showEmail?: boolean
  submitLabel?: string
  ariaLabel?: string
  onCancel?: () => void
  children?: ReactNode
  className?: string
}) {
  const [postal, setPostal] = useState(defaults?.postal_code ?? "")
  const [city, setCity] = useState(defaults?.city ?? "")
  const [state, setState] = useState(defaults?.state ?? "")
  const [saveAs, setSaveAs] = useState<AddressSaveAs>(defaults?.save_as ?? "Home")
  const [lookupHint, setLookupHint] = useState<string | null>(null)
  const [errors, setErrors] = useState<AddressFieldErrors>({})
  const skipLookup = useRef(Boolean(defaults?.city && defaults?.state))

  useEffect(() => {
    if (!isValidIndianPincode(postal)) {
      setLookupHint(null)
      return
    }
    if (skipLookup.current) {
      skipLookup.current = false
      return
    }
    let cancelled = false
    setLookupHint("Looking up city and state…")
    lookupIndianPincode(postal)
      .then((place) => {
        if (cancelled) return
        if (!place) {
          setLookupHint("Could not find that PIN. Enter city and state.")
          return
        }
        setCity(place.city.toUpperCase())
        setState(place.state.toUpperCase())
        setLookupHint(null)
      })
      .catch(() => {
        if (!cancelled) setLookupHint("Could not find that PIN. Enter city and state.")
      })
    return () => {
      cancelled = true
    }
  }, [postal])

  function clearError(key: keyof AddressFieldErrors) {
    setErrors((curr) => {
      if (!curr[key]) return curr
      const next = { ...curr }
      delete next[key]
      return next
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const values: DeliveryAddressValues = {
      email: showEmail ? String(form.get("email") ?? "") : (defaults?.email ?? ""),
      full_name: String(form.get("full_name") ?? ""),
      address_1: String(form.get("address_1") ?? ""),
      address_2: String(form.get("address_2") ?? "") || undefined,
      city: String(form.get("city") ?? city),
      state: String(form.get("state") ?? state),
      postal_code: String(form.get("postal_code") ?? postal),
      phone: String(form.get("phone") ?? "") || undefined,
      save_as: saveAs,
    }
    const nextErrors = validateDeliveryAddress(values, { emailRequired: showEmail })
    setErrors(nextErrors)
    const first = firstAddressError(nextErrors)
    if (first) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    void onSubmit(values)
  }

  const pinId = `${idPrefix}-pincode`
  const cityId = `${idPrefix}-city`
  const stateId = `${idPrefix}-state`
  const line1Id = `${idPrefix}-address-1`
  const line2Id = `${idPrefix}-address-2`
  const nameId = `${idPrefix}-full-name`
  const emailId = `${idPrefix}-email`
  const phoneId = `${idPrefix}-phone`

  const described = (id: string, error?: string, hint?: string | null) =>
    error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("checkout-form", className)}
      aria-label={ariaLabel}
      noValidate
    >
      <Field
        id={pinId}
        label="Pincode"
        required
        error={errors.postal_code}
        hint={lookupHint}
      >
        <input
          id={pinId}
          name="postal_code"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={postal}
          aria-invalid={errors.postal_code ? true : undefined}
          aria-describedby={described(pinId, errors.postal_code, lookupHint)}
          onChange={(e) => {
            setPostal(e.target.value.replace(/\D/g, "").slice(0, 6))
            clearError("postal_code")
          }}
        />
      </Field>

      <div className="checkout-split">
        <Field id={cityId} label="City" required error={errors.city}>
          <input
            id={cityId}
            name="city"
            required
            autoComplete="address-level2"
            value={city}
            aria-invalid={errors.city ? true : undefined}
            aria-describedby={described(cityId, errors.city)}
            onChange={(e) => {
              setCity(e.target.value)
              clearError("city")
            }}
          />
        </Field>
        <Field id={stateId} label="State" required error={errors.state}>
          <input
            id={stateId}
            name="state"
            required
            autoComplete="address-level1"
            value={state}
            aria-invalid={errors.state ? true : undefined}
            aria-describedby={described(stateId, errors.state)}
            onChange={(e) => {
              setState(e.target.value)
              clearError("state")
            }}
          />
        </Field>
      </div>

      <Field id={line1Id} label="Flat, house no." required error={errors.address_1}>
        <input
          id={line1Id}
          name="address_1"
          required
          autoComplete="address-line1"
          defaultValue={defaults?.address_1}
          aria-invalid={errors.address_1 ? true : undefined}
          aria-describedby={described(line1Id, errors.address_1)}
          onChange={() => clearError("address_1")}
        />
      </Field>

      <Field
        id={line2Id}
        label="Apartment, area, sector, village"
        required
        error={errors.address_2}
      >
        <input
          id={line2Id}
          name="address_2"
          required
          autoComplete="address-line2"
          defaultValue={defaults?.address_2}
          aria-invalid={errors.address_2 ? true : undefined}
          aria-describedby={described(line2Id, errors.address_2)}
          onChange={() => clearError("address_2")}
        />
      </Field>

      <Field id={nameId} label="Full name" required error={errors.full_name}>
        <input
          id={nameId}
          name="full_name"
          required
          autoComplete="name"
          defaultValue={defaults?.full_name}
          aria-invalid={errors.full_name ? true : undefined}
          aria-describedby={described(nameId, errors.full_name)}
          onChange={() => clearError("full_name")}
        />
      </Field>

      {showEmail ? (
        <Field id={emailId} label="Email address" required error={errors.email}>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={defaults?.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={described(emailId, errors.email)}
            onChange={() => clearError("email")}
          />
        </Field>
      ) : null}

      <Field id={phoneId} label="Phone">
        <input
          id={phoneId}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="10-digit mobile"
          defaultValue={defaults?.phone}
        />
      </Field>

      <fieldset className="checkout-saveas">
        <legend className="checkout-label">Save address as</legend>
        <div className="checkout-chip-row">
          {(["Home", "Work"] as const).map((label) => {
            const selected = saveAs === label
            return (
              <button
                key={label}
                type="button"
                aria-pressed={selected}
                onClick={() => setSaveAs(label)}
                className={cn("checkout-chip", selected && "is-selected")}
              >
                <span className="checkout-chip-mark" aria-hidden />
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>

      {children}

      <div className="checkout-actions">
        <CheckoutSubmit disabled={busy}>{busy ? "Saving" : submitLabel}</CheckoutSubmit>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="checkout-back">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

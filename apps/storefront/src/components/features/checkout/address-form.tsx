"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  EditorialCtaButton,
  editorialFieldClass,
  editorialLabelClass,
} from "@/components/layout/editorial/editorial-cta"
import {
  type AddressSaveAs,
  type DeliveryAddressValues,
} from "@/lib/checkout-address"
import { isValidIndianPincode, lookupIndianPincode } from "@/lib/pincode"
import { cn } from "@/lib/utils"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#131111]",
)

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string
  children: string
  required?: boolean
}) {
  return (
    <label htmlFor={htmlFor} className={editorialLabelClass}>
      {children}
      {required ? <span className="text-[#8A2D25]"> *</span> : null}
    </label>
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    void onSubmit({
      email: showEmail ? String(form.get("email") ?? "") : (defaults?.email ?? ""),
      full_name: String(form.get("full_name") ?? ""),
      address_1: String(form.get("address_1") ?? ""),
      address_2: String(form.get("address_2") ?? "") || undefined,
      city: String(form.get("city") ?? city),
      state: String(form.get("state") ?? state),
      postal_code: String(form.get("postal_code") ?? postal),
      phone: String(form.get("phone") ?? "") || undefined,
      save_as: saveAs,
    })
  }

  const pinId = `${idPrefix}-pincode`
  const cityId = `${idPrefix}-city`
  const stateId = `${idPrefix}-state`
  const line1Id = `${idPrefix}-address-1`
  const line2Id = `${idPrefix}-address-2`
  const nameId = `${idPrefix}-full-name`
  const emailId = `${idPrefix}-email`
  const phoneId = `${idPrefix}-phone`

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("mt-[1.75em] space-y-[1.5em]", className)}
      aria-label={ariaLabel}
    >
      <div>
        <FieldLabel htmlFor={pinId} required>
          Pincode
        </FieldLabel>
        <input
          id={pinId}
          name="postal_code"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={postal}
          onChange={(e) => setPostal(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={fieldClass}
        />
        {lookupHint ? (
          <p className="mt-[0.35em] m-0 max-w-[68ch] font-outfit text-[0.75em] tracking-[-0.02em] text-pretty text-[#6B635C]">
            {lookupHint}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-[1.5em] sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor={cityId} required>
            City
          </FieldLabel>
          <input
            id={cityId}
            name="city"
            required
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor={stateId} required>
            State
          </FieldLabel>
          <input
            id={stateId}
            name="state"
            required
            autoComplete="address-level1"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <FieldLabel htmlFor={line1Id} required>
          Flat, House no.
        </FieldLabel>
        <input
          id={line1Id}
          name="address_1"
          required
          autoComplete="address-line1"
          defaultValue={defaults?.address_1}
          className={fieldClass}
        />
      </div>

      <div>
        <FieldLabel htmlFor={line2Id} required>
          Apartment, Area, Sector, Village
        </FieldLabel>
        <input
          id={line2Id}
          name="address_2"
          required
          autoComplete="address-line2"
          defaultValue={defaults?.address_2}
          className={fieldClass}
        />
      </div>

      <div>
        <FieldLabel htmlFor={nameId} required>
          Full Name
        </FieldLabel>
        <input
          id={nameId}
          name="full_name"
          required
          autoComplete="name"
          defaultValue={defaults?.full_name}
          className={fieldClass}
        />
      </div>

      {showEmail ? (
        <div>
          <FieldLabel htmlFor={emailId} required>
            Email Address
          </FieldLabel>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={defaults?.email}
            className={fieldClass}
          />
        </div>
      ) : null}

      <div>
        <FieldLabel htmlFor={phoneId}>Phone</FieldLabel>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="10-digit mobile"
          defaultValue={defaults?.phone}
          className={fieldClass}
        />
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className={cn(editorialLabelClass, "mb-[0.75em]")}>Save address as</legend>
        <div className="flex flex-wrap gap-[0.75em]">
          {(["Home", "Work"] as const).map((label) => {
            const selected = saveAs === label
            return (
              <button
                key={label}
                type="button"
                aria-pressed={selected}
                onClick={() => setSaveAs(label)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-[0.6em] rounded-full border bg-transparent px-[1.1em] py-[0.55em] font-outfit text-[0.875em] tracking-[-0.02em] uppercase",
                  selected
                    ? "border-[#131111] text-[#131111]"
                    : "border-[#CDCDCD] text-[#6B635C]"
                )}
              >
                <span
                  className={cn(
                    "size-[0.7em] rounded-full border",
                    selected ? "border-[#131111] bg-[#131111]" : "border-[#CDCDCD] bg-transparent"
                  )}
                  aria-hidden
                />
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>

      {children}

      <div className="flex flex-col items-start gap-[1em]">
        <EditorialCtaButton disabled={busy}>{busy ? "Saving" : submitLabel}</EditorialCtaButton>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em]"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

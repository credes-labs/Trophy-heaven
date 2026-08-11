"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { useCartStore, CART_ID_KEY } from "@/stores/cart-store"
import {
  setAddresses,
  listShippingOptions,
  setShippingMethod,
  initPayment,
  completeCart,
} from "@/lib/data/checkout"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"

type Step = "address" | "delivery" | "payment" | "review"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, init } = useCartStore()
  const [step, setStep] = useState<Step>("address")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<HttpTypes.StoreCartShippingOption[]>([])
  const [selectedOption, setSelectedOption] = useState<string>("")

  useEffect(() => {
    void init()
  }, [init])

  const currency = cart?.currency_code ?? "inr"

  async function handleAddress(form: FormData) {
    if (!cart) return
    setBusy(true)
    setError(null)
    try {
      await setAddresses(cart.id, {
        email: String(form.get("email")),
        shipping_address: {
          first_name: String(form.get("first_name")),
          last_name: String(form.get("last_name")),
          address_1: String(form.get("address_1")),
          city: String(form.get("city")),
          postal_code: String(form.get("postal_code")),
          country_code: String(form.get("country_code")).toLowerCase(),
          phone: String(form.get("phone")),
        },
        same_as_billing: true,
      })
      const options = await listShippingOptions(cart.id)
      setShippingOptions(options)
      setStep("delivery")
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelivery() {
    if (!cart || !selectedOption) return
    setBusy(true)
    setError(null)
    try {
      await setShippingMethod(cart.id, selectedOption)
      await initPayment(cart.id)
      setStep("payment")
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handlePlaceOrder() {
    if (!cart) return
    setBusy(true)
    setError(null)
    try {
      const res = await completeCart(cart.id)
      if (res.type === "order") {
        localStorage.removeItem(CART_ID_KEY)
        useCartStore.setState({ cart: null })
        router.push(`/order/confirmed/${res.order.id}`)
      } else {
        setError("Payment could not be completed. Please retry.")
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!cart) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-muted-foreground">Loading checkout…</div>
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
        <ol className="mt-4 flex gap-2 text-xs text-muted-foreground">
          {(["address", "delivery", "payment", "review"] as Step[]).map((s) => (
            <li key={s} className={step === s ? "font-semibold text-accent" : ""}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </li>
          ))}
        </ol>

        {error && (
          <p className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {step === "address" && (
          <form
            action={handleAddress}
            className="mt-6 grid grid-cols-2 gap-4"
            aria-label="Shipping address"
          >
            <input name="email" type="email" required placeholder="Email" className="col-span-2 h-11 rounded-md border px-3" />
            <input name="first_name" required placeholder="First name" className="h-11 rounded-md border px-3" />
            <input name="last_name" required placeholder="Last name" className="h-11 rounded-md border px-3" />
            <input name="address_1" required placeholder="Address" className="col-span-2 h-11 rounded-md border px-3" />
            <input name="city" required placeholder="City" className="h-11 rounded-md border px-3" />
            <input name="postal_code" required placeholder="Postal code" className="h-11 rounded-md border px-3" />
            <input name="country_code" required defaultValue="in" placeholder="Country (e.g. in)" className="h-11 rounded-md border px-3" />
            <input name="phone" placeholder="Phone" className="h-11 rounded-md border px-3" />
            <Button type="submit" disabled={busy} className="col-span-2">
              Continue to delivery
            </Button>
          </form>
        )}

        {step === "delivery" && (
          <div className="mt-6 space-y-3">
            {shippingOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No shipping options configured for this region yet.
              </p>
            )}
            {shippingOptions.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center justify-between rounded-md border p-4"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="ship"
                    value={o.id}
                    checked={selectedOption === o.id}
                    onChange={() => setSelectedOption(o.id)}
                  />
                  {o.name}
                </span>
                <span className="text-sm">{formatMoney(o.amount ?? 0, currency)}</span>
              </label>
            ))}
            <Button onClick={handleDelivery} disabled={busy || !selectedOption}>
              Continue to payment
            </Button>
          </div>
        )}

        {step === "payment" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border p-4">
              <p className="font-medium">Payment</p>
              <p className="mt-1 text-sm text-muted-foreground">
                India payments via Razorpay (UPI, cards, net banking). International via Stripe.
                In test mode the system provider is used.
              </p>
            </div>
            <Button onClick={() => setStep("review")} disabled={busy}>
              Review order
            </Button>
          </div>
        )}

        {step === "review" && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Custom trophy orders are non-returnable. Please review your design and details.
            </p>
            <Button onClick={handlePlaceOrder} disabled={busy}>
              {busy ? "Placing order…" : "Place order"}
            </Button>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-lg border p-5">
        <h2 className="font-medium">Summary</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(cart.items ?? []).map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="text-muted-foreground">
                {i.product_title} × {i.quantity}
              </span>
              <span>{formatMoney((i.unit_price ?? 0) * (i.quantity ?? 1), currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>{formatMoney(cart.total ?? 0, currency)}</span>
        </div>
      </aside>
    </div>
  )
}

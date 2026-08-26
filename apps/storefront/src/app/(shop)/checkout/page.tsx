"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { useCartStore, CART_ID_KEY } from "@/stores/cart-store"
import {
  setAddresses,
  listShippingOptions,
  setShippingMethod,
  initPayment,
  completeCart,
  isNetTermsCart,
  getCartPaymentMeta,
  getRazorpaySessionData,
  isRazorpayEnabled,
} from "@/lib/data/checkout"
import { openCheckout, verifyRazorpayPayment } from "@/lib/razorpay"
import { StepIndicator, type CheckoutStep } from "@/components/features/checkout/step-indicator"
import { AddressForm, type AddressFormValues } from "@/components/features/checkout/address-form"
import { DeliveryOptions } from "@/components/features/checkout/delivery-options"
import { PaymentStep, type PaymentMethod } from "@/components/features/checkout/payment-step"
import { ReviewStep, paymentMethodLabel } from "@/components/features/checkout/review-step"
import { CheckoutSummary } from "@/components/features/checkout/checkout-summary"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, init } = useCartStore()
  const [step, setStep] = useState<CheckoutStep>("address")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<HttpTypes.StoreCartShippingOption[]>([])
  const [selectedOption, setSelectedOption] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay")

  useEffect(() => {
    void init()
  }, [init])

  const currency = cart?.currency_code ?? "inr"
  const netTerms = isNetTermsCart(cart)
  const paymentMeta = getCartPaymentMeta(cart)
  const razorpayEnabled = isRazorpayEnabled() && !netTerms

  useEffect(() => {
    if (netTerms) setPaymentMethod("net_terms")
  }, [netTerms])

  async function handleAddress(values: AddressFormValues) {
    if (!cart) return
    setBusy(true)
    setError(null)
    try {
      const updated = await setAddresses(cart.id, {
        email: values.email,
        shipping_address: {
          first_name: values.first_name,
          last_name: values.last_name,
          address_1: values.address_1,
          address_2: values.address_2,
          city: values.city,
          postal_code: values.postal_code,
          country_code: values.country_code,
          phone: values.phone,
        },
        same_as_billing: true,
      })
      useCartStore.setState({ cart: updated })
      const options = await listShippingOptions(cart.id)
      setShippingOptions(options)
      if (options[0]) setSelectedOption(options[0].id)
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
      const updated = await setShippingMethod(cart.id, selectedOption)
      useCartStore.setState({ cart: updated })
      await initPayment(cart.id, { netTerms: isNetTermsCart(updated) })
      setStep("payment")
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function finishOrder(cartId: string) {
    const res = await completeCart(cartId)
    if (res.type === "order") {
      localStorage.removeItem(CART_ID_KEY)
      useCartStore.setState({ cart: null })
      router.push(`/order/confirmed/${res.order.id}`)
    } else {
      setError("Payment could not be completed. Please retry.")
    }
  }

  async function handlePlaceOrder() {
    if (!cart) return
    const cartId = cart.id
    setBusy(true)
    setError(null)
    try {
      if (razorpayEnabled && paymentMethod === "razorpay") {
        const paymentCollection = await initPayment(cartId, { netTerms: false })
        const sessionData = getRazorpaySessionData(paymentCollection)
        const latest = useCartStore.getState().cart
        const amountPaise =
          sessionData.amountPaise ?? Math.round((latest?.total ?? cart.total ?? 0) * 100)
        const addr = cart.shipping_address

        const result = await openCheckout({
          key: RAZORPAY_KEY,
          amount: amountPaise,
          currency: (currency || "INR").toUpperCase(),
          name: "Legacy Crafts",
          description: `Order ${cartId}`,
          order_id: sessionData.orderId,
          prefill: {
            email: cart.email ?? undefined,
            contact: addr?.phone ?? undefined,
            name: [addr?.first_name, addr?.last_name].filter(Boolean).join(" ") || undefined,
          },
          theme: { color: "#8A2D25" },
          handler: (response) => {
            void (async () => {
              const verified = await verifyRazorpayPayment(response)
              if (!verified) {
                setError(
                  "Payment could not be verified. If money was debited, contact support with your payment reference."
                )
                return
              }
              await finishOrder(cartId)
            })().finally(() => setBusy(false))
          },
          modal: {
            ondismiss: () => {
              setBusy(false)
              setError("Payment cancelled. You can try again when ready.")
            },
          },
        })

        if (result.skipped) {
          setError("Razorpay Checkout could not be opened. No order was placed.")
          setBusy(false)
        }
        return
      }

      if (paymentMethod === "cod" && isRazorpayEnabled()) {
        setError("Cash on delivery is not available. Please pay with Razorpay.")
        setBusy(false)
        return
      }

      await finishOrder(cartId)
      setBusy(false)
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  if (!cart) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-muted-foreground">Loading checkout…</div>
    )
  }

  if (!(cart.items?.length)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link href="/shop" className={cn(buttonVariants({ variant: "trophy", className: "mt-4" }))}>
          Continue shopping
        </Link>
      </div>
    )
  }

  const selectedShipping = shippingOptions.find((o) => o.id === selectedOption)
  const shippingLabel = selectedShipping?.name ?? "Selected at delivery"
  const payLabel = netTerms
    ? `Corporate ${paymentMeta.payment_terms === "net_60" ? "Net 60" : "Net 30"}`
    : paymentMethodLabel(paymentMethod, razorpayEnabled)

  const netTermsLabel = netTerms
    ? `Billed on ${paymentMeta.payment_terms === "net_60" ? "Net 60" : "Net 30"}${
        paymentMeta.po_number ? ` · PO ${String(paymentMeta.po_number)}` : ""
      }`
    : null

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
        <StepIndicator current={step} className="mt-6" />

        {error && (
          <p className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {step === "address" && (
          <AddressForm
            busy={busy}
            onSubmit={handleAddress}
            defaults={{
              email: cart.email ?? undefined,
              first_name: cart.shipping_address?.first_name ?? undefined,
              last_name: cart.shipping_address?.last_name ?? undefined,
              address_1: cart.shipping_address?.address_1 ?? undefined,
              city: cart.shipping_address?.city ?? undefined,
              postal_code: cart.shipping_address?.postal_code ?? undefined,
              country_code: cart.shipping_address?.country_code ?? "in",
              phone: cart.shipping_address?.phone ?? undefined,
            }}
          />
        )}

        {step === "delivery" && (
          <DeliveryOptions
            options={shippingOptions}
            selectedId={selectedOption}
            onSelect={setSelectedOption}
            currency={currency}
            busy={busy}
            onBack={() => setStep("address")}
            onContinue={handleDelivery}
          />
        )}

        {step === "payment" && (
          <PaymentStep
            netTerms={netTerms}
            paymentMeta={paymentMeta}
            method={paymentMethod}
            onMethodChange={setPaymentMethod}
            razorpayEnabled={razorpayEnabled}
            busy={busy}
            onBack={() => setStep("delivery")}
            onContinue={() => setStep("review")}
          />
        )}

        {step === "review" && (
          <ReviewStep
            cart={cart}
            currency={currency}
            shippingLabel={shippingLabel}
            paymentLabel={payLabel}
            netTerms={netTerms}
            busy={busy}
            onBack={() => setStep("payment")}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
      </div>

      <CheckoutSummary cart={cart} currency={currency} netTermsLabel={netTermsLabel} />
    </div>
  )
}

"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { useCartStore, CART_ID_KEY } from "@/stores/cart-store"
import { useAuthStore } from "@/stores/auth-store"
import { medusa } from "@/lib/medusa"
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
import { toCustomerAddressPayload, toCartShippingAddress, type DeliveryAddressValues } from "@/lib/checkout-address"
import { openCheckout, verifyRazorpayPayment } from "@/lib/razorpay"
import { StepIndicator, type CheckoutStep } from "@/components/features/checkout/step-indicator"
import { CheckoutAuthGate } from "@/components/features/checkout/checkout-auth-gate"
import { CheckoutAddressStep } from "@/components/features/checkout/checkout-address-step"
import { DeliveryOptions } from "@/components/features/checkout/delivery-options"
import { PaymentStep, type PaymentMethod } from "@/components/features/checkout/payment-step"
import { ReviewStep, paymentMethodLabel } from "@/components/features/checkout/review-step"
import { CheckoutSummary } from "@/components/features/checkout/checkout-summary"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import "@/components/features/checkout/checkout.css"

function CheckoutCanvas({ children }: { children: ReactNode }) {
  return (
    <EditorialShell className="checkout-page bg-[#FBFBF7] font-sans text-[#131111]">
      <div className="checkout-veil" aria-hidden="true" />
      <EditorialFrame>{children}</EditorialFrame>
    </EditorialShell>
  )
}

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, init } = useCartStore()
  const { customer, loading: authLoading, loadCustomer } = useAuthStore()
  const [step, setStep] = useState<CheckoutStep>("address")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<HttpTypes.StoreCartShippingOption[]>([])
  const [selectedOption, setSelectedOption] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay")

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    void loadCustomer()
  }, [loadCustomer])

  const currency = cart?.currency_code ?? "inr"
  const netTerms = isNetTermsCart(cart)
  const paymentMeta = getCartPaymentMeta(cart)
  const razorpayEnabled = isRazorpayEnabled() && !netTerms

  useEffect(() => {
    if (netTerms) setPaymentMethod("net_terms")
  }, [netTerms])

  async function handleAddress(values: DeliveryAddressValues, options: { persist: boolean }) {
    if (!cart) return
    setBusy(true)
    setError(null)
    try {
      const shipping = toCartShippingAddress(values)
      if (options.persist) {
        await medusa.store.customer.createAddress({
          ...toCustomerAddressPayload(values),
          is_default_shipping: false,
        })
      }
      const updated = await setAddresses(cart.id, {
        email: values.email,
        shipping_address: shipping,
        same_as_billing: true,
      })
      useCartStore.setState({ cart: updated })
      const nextOptions = await listShippingOptions(cart.id)
      setShippingOptions(nextOptions)
      if (nextOptions[0]) setSelectedOption(nextOptions[0].id)
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

  if (!cart || (authLoading && !customer)) {
    return (
      <CheckoutCanvas>
        <p className="checkout-help">Loading checkout…</p>
      </CheckoutCanvas>
    )
  }

  if (!(cart.items?.length)) {
    return (
      <CheckoutCanvas>
        <p className="checkout-eyebrow">Order</p>
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-help">Your cart is empty.</p>
        <div className="checkout-actions is-follow">
          <Link href="/shop" className="checkout-continue">
            Continue shopping
          </Link>
        </div>
      </CheckoutCanvas>
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
    <CheckoutCanvas>
      <div className="checkout-layout">
        <div className="checkout-main">
          <p className="checkout-eyebrow">Order</p>
          <h1 className="checkout-title">Checkout</h1>

          {!customer ? (
            <CheckoutAuthGate />
          ) : (
            <>
              <StepIndicator current={step} />

              {error ? (
                <p className="checkout-alert" role="alert">
                  {error}
                </p>
              ) : null}

                {step === "address" && (
                  <CheckoutAddressStep
                    customerEmail={customer.email ?? cart.email ?? ""}
                    busy={busy}
                    onContinue={handleAddress}
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

                {/* Payment route is left open — Razorpay / COD / net-terms still run below. */}
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
              </>
            )}
          </div>

          <CheckoutSummary cart={cart} currency={currency} netTermsLabel={netTermsLabel} />
        </div>
    </CheckoutCanvas>
  )
}

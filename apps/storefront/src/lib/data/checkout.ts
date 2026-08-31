import { medusa } from "../medusa"
import type { HttpTypes } from "@medusajs/types"
import { toSmallestUnit } from "../currency"

/**
 * Checkout orchestration against Medusa's Store API (docs/kit/02 §2.4, §2.5).
 * Flow: set email + addresses → shipping method → payment session → complete.
 * Razorpay is the primary provider for India; corporate net-terms carts skip
 * the prepaid gateway and use the system provider (FR-BULK-5/6).
 */

export type CartPaymentMeta = {
  payment_terms?: string
  net_terms?: boolean | string
  po_number?: string
  corporate_profile_id?: string
  bulk_order_id?: string
}

export function getCartPaymentMeta(cart: HttpTypes.StoreCart | null | undefined): CartPaymentMeta {
  const meta = (cart?.metadata ?? {}) as CartPaymentMeta
  return meta
}

export function isNetTermsCart(cart: HttpTypes.StoreCart | null | undefined): boolean {
  const meta = getCartPaymentMeta(cart)
  if (meta.net_terms === true || meta.net_terms === "true") return true
  return meta.payment_terms === "net_30" || meta.payment_terms === "net_60"
}

export async function setAddresses(
  cartId: string,
  data: {
    email: string
    shipping_address: HttpTypes.StoreAddAddress
    billing_address?: HttpTypes.StoreAddAddress
    same_as_billing?: boolean
  }
) {
  const { cart } = await medusa.store.cart.update(cartId, {
    email: data.email,
    shipping_address: data.shipping_address,
    billing_address: data.same_as_billing ? data.shipping_address : data.billing_address,
  })
  return cart
}

export async function listShippingOptions(cartId: string) {
  const { shipping_options } = await medusa.store.fulfillment.listCartOptions({ cart_id: cartId })
  return shipping_options
}

export async function setShippingMethod(cartId: string, optionId: string) {
  const { cart } = await medusa.store.cart.addShippingMethod(cartId, { option_id: optionId })
  return cart
}

export function isRazorpayEnabled(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) &&
    process.env.NEXT_PUBLIC_RAZORPAY_ENABLED === "true"
  )
}

/**
 * Payment route is left open: Razorpay / COD / corporate net-terms still
 * initialize here. Do not stub or close this step.
 */
export async function initPayment(cartId: string, opts?: { netTerms?: boolean }) {
  const { cart } = await medusa.store.cart.retrieve(cartId)
  const netTerms = opts?.netTerms ?? isNetTermsCart(cart)
  if (!netTerms && isRazorpayEnabled()) {
    const existing = cart.payment_collection?.payment_sessions?.find((s) =>
      s.provider_id?.includes("razorpay")
    )
    const data = (existing?.data ?? {}) as Record<string, unknown>
    if (typeof data.razorpay_order_id === "string" && data.razorpay_order_id) {
      return cart.payment_collection
    }
  }
  const { payment_collection } = await medusa.store.payment.initiatePaymentSession(cart, {
    provider_id: pickProvider(netTerms),
  })
  return payment_collection
}

function pickProvider(netTerms = false): string {
  if (netTerms) return "pp_system_default"
  return isRazorpayEnabled() ? "pp_razorpay_razorpay" : "pp_system_default"
}

export type RazorpaySessionData = {
  orderId?: string
  amountPaise?: number
}

/**
 * Extracts the Razorpay order id + amount (paise) from the payment collection
 * returned by `initPayment`, so checkout can open Razorpay against the same
 * order the Medusa payment session tracks (FR-PAY-1).
 */
export function getRazorpaySessionData(
  paymentCollection: HttpTypes.StorePaymentCollection | null | undefined
): RazorpaySessionData {
  const session = paymentCollection?.payment_sessions?.find((s) =>
    s.provider_id?.includes("razorpay")
  )
  const data = (session?.data ?? {}) as Record<string, unknown>
  const orderId =
    typeof data.razorpay_order_id === "string" ? data.razorpay_order_id : undefined

  const currency =
    (typeof data.currency_code === "string" && data.currency_code) ||
    session?.currency_code ||
    "inr"

  let amountPaise: number | undefined
  if (typeof data.amount_paise === "number") {
    amountPaise = Math.round(data.amount_paise)
  } else if (typeof session?.amount === "number") {
    amountPaise = toSmallestUnit(session.amount, currency)
  }
  return { orderId, amountPaise }
}

export async function completeCart(cartId: string) {
  const res = await medusa.store.cart.complete(cartId)
  return res
}

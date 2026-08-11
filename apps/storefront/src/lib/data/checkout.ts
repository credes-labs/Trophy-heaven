import { medusa } from "../medusa"
import type { HttpTypes } from "@medusajs/types"

/**
 * Checkout orchestration against Medusa's Store API (docs/kit/02 §2.4, §2.5).
 * Flow: set email + addresses → shipping method → payment session → complete.
 * Razorpay is the primary provider for India; when no gateway is configured the
 * system-default provider is used so the flow is exercisable in test mode.
 */

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

export async function initPayment(cartId: string) {
  const { payment_collection } = await medusa.store.payment.initiatePaymentSession(
    (await medusa.store.cart.retrieve(cartId)).cart,
    { provider_id: pickProvider() }
  )
  return payment_collection
}

function pickProvider(): string {
  // Razorpay first (India); falls back to the system provider in test/dev.
  return process.env.NEXT_PUBLIC_RAZORPAY_ENABLED === "true"
    ? "pp_razorpay_razorpay"
    : "pp_system_default"
}

export async function completeCart(cartId: string) {
  const res = await medusa.store.cart.complete(cartId)
  return res
}

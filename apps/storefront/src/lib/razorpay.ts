export type RazorpayCheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: { color?: string }
  handler: (response: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => void
  modal?: {
    ondismiss?: () => void
  }
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void }
  }
}

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

/**
 * Server-side verification of Razorpay's checkout response. The signature is
 * HMAC-checked against the key secret in `/api/checkout/verify-razorpay`; the
 * cart must only be completed when this returns true.
 */
export async function verifyRazorpayPayment(
  response: RazorpaySuccessResponse
): Promise<boolean> {
  try {
    const res = await fetch("/api/checkout/verify-razorpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    })
    if (!res.ok) return false
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean }
    return body.ok === true
  } catch {
    return false
  }
}

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js"

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve(!!window.Razorpay))
      existing.addEventListener("error", () => resolve(false))
      if (window.Razorpay) resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve(!!window.Razorpay)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Opens Razorpay Checkout. Resolves `{ skipped: true }` when the SDK is
 * unavailable (e.g. test mode without a key / blocked script) so callers can
 * fall back to the system provider complete flow.
 */
export async function openCheckout(
  options: RazorpayCheckoutOptions
): Promise<{ skipped: boolean }> {
  const loaded = await loadRazorpayScript()
  if (!loaded || !window.Razorpay) {
    return { skipped: true }
  }

  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      ...options,
      handler: (response) => {
        options.handler(response)
        resolve({ skipped: false })
      },
      modal: {
        ...options.modal,
        ondismiss: () => {
          options.modal?.ondismiss?.()
          resolve({ skipped: false })
        },
      },
    })
    rzp.open()
  })
}

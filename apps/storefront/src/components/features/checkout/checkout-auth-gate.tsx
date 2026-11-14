"use client"

import { OtpSignIn } from "@/components/features/account/otp-sign-in"

/**
 * Checkout stays on this page: guests verify their email or phone with a one-time
 * code (the account is created on first sign-in) and continue straight to delivery.
 * Signing in updates the auth store, which re-renders checkout past this gate.
 */
export function CheckoutAuthGate() {
  return (
    <div className="checkout-step">
      <h2 className="checkout-section-title">Sign in to continue</h2>
      <p className="checkout-help">
        Cart items stay. Enter your email or mobile number and we will send a one-time code.
      </p>
      <div className="mt-[1.5em]">
        <OtpSignIn submitLabel="Send code" onSignedIn={() => undefined} />
      </div>
    </div>
  )
}

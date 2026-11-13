"use client"

import { useState } from "react"
import Link from "next/link"
import { AuthAlert } from "@/components/features/account/auth-frame"
import { CheckoutSubmit } from "@/components/features/checkout/checkout-actions"
import { PasswordField } from "@/components/ui/password-field"
import { useAuthStore } from "@/stores/auth-store"

const REGISTER_HREF = "/account/register?next=/checkout"

/** Checkout stays on this page; guests sign in here or hop to register with `next=/checkout`. */
export function CheckoutAuthGate() {
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await login(String(form.get("email")), String(form.get("password")))
    } catch (err) {
      setError((err as Error).message || "Invalid credentials")
    }
  }

  return (
    <div className="checkout-step">
      <h2 className="checkout-section-title">Sign in to continue</h2>
      <p className="checkout-help">
        Cart items stay. Sign in or create an account to choose a delivery address.
      </p>
      {error ? <AuthAlert>{error}</AuthAlert> : null}
      <form onSubmit={(e) => void onSubmit(e)} className="checkout-form">
        <div className="checkout-field">
          <label htmlFor="checkout-login-email" className="checkout-label">
            Email
          </label>
          <input
            id="checkout-login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="checkout-field">
          <label htmlFor="checkout-login-password" className="checkout-label">
            Password
          </label>
          <PasswordField
            id="checkout-login-password"
            name="password"
            required
            autoComplete="current-password"
          />
        </div>
        <CheckoutSubmit disabled={loading}>{loading ? "Signing in" : "Sign in"}</CheckoutSubmit>
      </form>
      <p className="checkout-help">
        New here?{" "}
        <Link href={REGISTER_HREF} className="checkout-text-link">
          Create an account
        </Link>
      </p>
      <p className="checkout-link-row">
        <Link href="/account/forgot-password" className="checkout-text-link">
          Forgot password?
        </Link>
      </p>
    </div>
  )
}

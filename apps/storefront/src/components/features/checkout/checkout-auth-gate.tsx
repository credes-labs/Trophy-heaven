"use client"

import { useState } from "react"
import Link from "next/link"
import { AuthAlert } from "@/components/features/account/auth-frame"
import {
  EditorialCtaButton,
  EditorialTextLink,
  editorialFieldClass,
  editorialLabelClass,
} from "@/components/layout/editorial/editorial-cta"
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
    <div className="mt-[2.5em] max-w-[32em]">
      <h2 className="m-0 font-outfit text-[1.75em] leading-[1.2] font-normal tracking-[-0.03em] text-[#131111]">
        Sign in to continue
      </h2>
      <p className="mt-[0.75em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
        Cart items stay. Sign in or create an account to choose a delivery address.
      </p>
      {error ? <AuthAlert>{error}</AuthAlert> : null}
      <form onSubmit={(e) => void onSubmit(e)} className="mt-[2em] space-y-[1.75em]">
        <div>
          <label htmlFor="checkout-login-email" className={editorialLabelClass}>
            Email
          </label>
          <input
            id="checkout-login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={editorialFieldClass}
          />
        </div>
        <div>
          <label htmlFor="checkout-login-password" className={editorialLabelClass}>
            Password
          </label>
          <PasswordField
            id="checkout-login-password"
            name="password"
            required
            autoComplete="current-password"
            className={editorialFieldClass}
          />
        </div>
        <EditorialCtaButton disabled={loading}>{loading ? "Signing in" : "Sign in"}</EditorialCtaButton>
      </form>
      <p className="mt-[1.75em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
        New here?{" "}
        <EditorialTextLink href={REGISTER_HREF} className="text-[1em]">
          Create an account
        </EditorialTextLink>
      </p>
      <p className="mt-[0.75em] m-0">
        <Link
          href="/account/forgot-password"
          className="font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111]/70 underline underline-offset-[0.15em]"
        >
          Forgot password?
        </Link>
      </p>
    </div>
  )
}

"use client"

import { useState } from "react"
import { AuthAlert, AuthFrame } from "@/components/features/account/auth-frame"
import {
  EditorialCtaButton,
  EditorialTextLink,
  editorialFieldClass,
  editorialLabelClass,
} from "@/components/layout/editorial/editorial-cta"
import { medusa } from "@/lib/medusa"
import { cn } from "@/lib/utils"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      await medusa.auth.resetPassword("customer", "emailpass", {
        identifier: String(form.get("email")),
      })
      setSent(true)
    } catch {
      setError("Could not process the request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      watermark="reset"
      eyebrow="Account"
      title="Reset your password"
      lede="We will email a secure link to set a new password."
    >
      {sent ? (
        <AuthAlert tone="ok">
          If an account exists for that email, a reset link is on its way. The link expires shortly —
          check your inbox and spam folder.
        </AuthAlert>
      ) : (
        <>
          {error ? <AuthAlert>{error}</AuthAlert> : null}
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-[1.75em]">
            <div>
              <label htmlFor="forgot-email" className={editorialLabelClass}>
                Email
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@studio.in"
                className={fieldClass}
              />
            </div>
            <EditorialCtaButton disabled={loading}>
              {loading ? "Sending" : "Send reset link"}
            </EditorialCtaButton>
          </form>
        </>
      )}
      <p className="mt-[2em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
        Remembered it?{" "}
        <EditorialTextLink href="/account/login" className="text-[1em]">
          Back to sign in
        </EditorialTextLink>
      </p>
    </AuthFrame>
  )
}

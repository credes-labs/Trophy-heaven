"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthAlert, AuthFrame } from "@/components/features/account/auth-frame"
import {
  EditorialCtaButton,
  EditorialTextLink,
  editorialFieldClass,
  editorialLabelClass,
} from "@/components/layout/editorial/editorial-cta"
import { PasswordField } from "@/components/ui/password-field"
import { safeReturnPath } from "@/lib/safe-return-path"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeReturnPath(params.get("next"))
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)
  const [error, setError] = useState<string | null>(null)
  const loginHref = next ? `/account/login?next=${encodeURIComponent(next)}` : "/account/login"

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const password = String(form.get("password"))
    const confirm = String(form.get("confirm_password"))
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    if (!form.get("terms")) {
      setError("Please accept the Terms of Service and Privacy Policy.")
      return
    }
    try {
      await register({
        email: String(form.get("email")),
        password,
        first_name: String(form.get("first_name")),
        last_name: String(form.get("last_name")),
        phone: String(form.get("phone") || "") || undefined,
      })
      router.push(next ?? "/account")
    } catch (err) {
      setError((err as Error).message || "Could not create account")
    }
  }

  return (
    <>
      {error ? <AuthAlert>{error}</AuthAlert> : null}
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-[1.75em]">
        <div className="grid grid-cols-1 gap-[1.75em] sm:grid-cols-2">
          <div>
            <label htmlFor="register-first-name" className={editorialLabelClass}>
              First name
            </label>
            <input
              id="register-first-name"
              name="first_name"
              autoComplete="given-name"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="register-last-name" className={editorialLabelClass}>
              Last name
            </label>
            <input
              id="register-last-name"
              name="last_name"
              autoComplete="family-name"
              className={fieldClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="register-email" className={editorialLabelClass}>
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@studio.in"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="register-password" className={editorialLabelClass}>
            Password
          </label>
          <PasswordField
            id="register-password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="register-confirm" className={editorialLabelClass}>
            Confirm password
          </label>
          <PasswordField
            id="register-confirm"
            name="confirm_password"
            required
            minLength={8}
            autoComplete="new-password"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="register-phone" className={editorialLabelClass}>
            Phone (optional)
          </label>
          <input
            id="register-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            className={fieldClass}
          />
        </div>
        <label className="flex items-start gap-[0.75em] font-outfit text-[0.875em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-[0.2em] size-[0.875em] shrink-0 accent-[#131111]"
          />
          <span>
            I agree to the{" "}
            <EditorialTextLink href="/terms" className="text-[0.875em] normal-case">
              Terms of Service
            </EditorialTextLink>{" "}
            and{" "}
            <EditorialTextLink href="/privacy" className="text-[0.875em] normal-case">
              Privacy Policy
            </EditorialTextLink>
            .
          </span>
        </label>
        <EditorialCtaButton disabled={loading}>{loading ? "Creating" : "Create account"}</EditorialCtaButton>
      </form>
      <p className="mt-[2em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
        Already have an account?{" "}
        <EditorialTextLink href={loginHref} className="text-[1em]">
          Sign in
        </EditorialTextLink>
      </p>
    </>
  )
}

export default function RegisterPage() {
  return (
    <AuthFrame
      watermark="join"
      eyebrow="Account"
      title="Create account"
      lede="Orders, saved designs, and a wishlist that follows you."
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthFrame>
  )
}

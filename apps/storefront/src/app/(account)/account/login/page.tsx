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

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeReturnPath(params.get("next"))
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const [error, setError] = useState<string | null>(null)
  const registerHref = next ? `/account/register?next=${encodeURIComponent(next)}` : "/account/register"

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await login(String(form.get("email")), String(form.get("password")))
      router.push(next ?? "/account")
    } catch (err) {
      setError((err as Error).message || "Invalid credentials")
    }
  }

  return (
    <>
      {params.get("reset") === "1" ? (
        <AuthAlert tone="ok">Password updated. Sign in with your new password.</AuthAlert>
      ) : null}
      {error ? <AuthAlert>{error}</AuthAlert> : null}
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-[1.75em]">
        <div>
          <label htmlFor="login-email" className={editorialLabelClass}>
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@studio.in"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="login-password" className={editorialLabelClass}>
            Password
          </label>
          <PasswordField
            id="login-password"
            name="password"
            required
            autoComplete="current-password"
            className={fieldClass}
          />
          <div className="mt-[0.75em]">
            <EditorialTextLink href="/account/forgot-password" className="text-[0.875em]">
              Forgot password?
            </EditorialTextLink>
          </div>
        </div>
        <EditorialCtaButton disabled={loading}>{loading ? "Signing in" : "Sign in"}</EditorialCtaButton>
      </form>
      <p className="mt-[2em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
        New here?{" "}
        <EditorialTextLink href={registerHref} className="text-[1em]">
          Create an account
        </EditorialTextLink>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthFrame
      watermark="account"
      eyebrow="Account"
      title="Welcome back"
      lede="Sign in to orders, designs, and pieces you saved."
      illustration
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthFrame>
  )
}

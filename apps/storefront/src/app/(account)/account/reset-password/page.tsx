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
import { medusa } from "@/lib/medusa"
import { cn } from "@/lib/utils"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const email = params.get("email") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token || !email) {
    return (
      <AuthAlert>
        This reset link is invalid or incomplete. Request a new one from{" "}
        <EditorialTextLink href="/account/forgot-password" className="text-[0.875em]">
          forgot password
        </EditorialTextLink>
        .
      </AuthAlert>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      await medusa.auth.updateProvider("customer", "emailpass", { email, password }, token)
      router.push("/account/login?reset=1")
    } catch {
      setError("This reset link has expired or is invalid. Please request a new one.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error ? <AuthAlert>{error}</AuthAlert> : null}
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-[1.75em]">
        <div>
          <label htmlFor="reset-password" className={editorialLabelClass}>
            New password
          </label>
          <PasswordField
            id="reset-password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="reset-confirm" className={editorialLabelClass}>
            Confirm new password
          </label>
          <PasswordField
            id="reset-confirm"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={fieldClass}
          />
        </div>
        <EditorialCtaButton disabled={loading}>
          {loading ? "Saving" : "Set new password"}
        </EditorialCtaButton>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthFrame
      watermark="reset"
      eyebrow="Account"
      title="Choose a new password"
      lede="At least 8 characters."
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthFrame>
  )
}

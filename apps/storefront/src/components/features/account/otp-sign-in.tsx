"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { AuthAlert } from "@/components/features/account/auth-frame"
import {
  EditorialCtaButton,
  editorialFieldClass,
  editorialLabelClass,
} from "@/components/layout/editorial/editorial-cta"
import { OtpError, looksLikeIdentifier, type OtpRequestResult } from "@/lib/otp-client"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)

const smallLinkClass =
  "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] underline underline-offset-[0.2em] hover:opacity-70 disabled:cursor-default disabled:no-underline disabled:opacity-50"

/**
 * Passwordless sign-in: email address or mobile number → 6-digit code → signed in.
 * The account is created on first sign-in, so the same form serves sign-in and
 * registration (`withNames` collects names for new accounts).
 */
export function OtpSignIn({
  withNames = false,
  terms,
  submitLabel = "Send code",
  onSignedIn,
}: {
  withNames?: boolean
  /** Extra content shown with the first step (e.g. a terms checkbox named "terms"). */
  terms?: ReactNode
  submitLabel?: string
  onSignedIn: (result: { isNew: boolean }) => void
}) {
  const uid = useId()
  const requestOtp = useAuthStore((s) => s.requestOtp)
  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const [identifier, setIdentifier] = useState("")
  const [names, setNames] = useState({ first_name: "", last_name: "" })
  const [sent, setSent] = useState<OtpRequestResult | null>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  useEffect(() => {
    if (sent) codeRef.current?.focus()
  }, [sent])

  async function send(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault()
    setError(null)
    if (e && terms && !new FormData(e.currentTarget).get("terms")) {
      setError("Please accept the Terms of Service and Privacy Policy.")
      return
    }
    if (!looksLikeIdentifier(identifier)) {
      setError("Enter a valid email address or 10-digit mobile number.")
      return
    }
    setBusy(true)
    try {
      const result = await requestOtp(identifier)
      setSent(result)
      setCode("")
      setCooldown(result.resend_in)
    } catch (err) {
      const otpErr = err as OtpError
      if (otpErr.retryAfter) setCooldown(otpErr.retryAfter)
      setError(otpErr.message)
    } finally {
      setBusy(false)
    }
  }

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.")
      return
    }
    setBusy(true)
    try {
      const result = await verifyOtp({
        identifier,
        code,
        ...(withNames
          ? { first_name: names.first_name.trim() || undefined, last_name: names.last_name.trim() || undefined }
          : {}),
      })
      onSignedIn(result)
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <>
        {error ? <AuthAlert>{error}</AuthAlert> : null}
        <p className="mb-[1.5em] m-0 font-outfit text-[1em] leading-[1.45] tracking-[-0.02em] text-[#131111]/70">
          We sent a 6-digit code {sent.channel === "phone" ? "by SMS " : ""}to{" "}
          <strong className="font-medium text-[#131111]">{sent.destination}</strong>. It expires in{" "}
          {Math.round(sent.expires_in / 60)} minutes.
        </p>
        {sent.dev_code ? (
          <p className="mb-[1.5em] m-0 font-outfit text-[0.8125em] text-[#6B635C]" role="note">
            Dev mode: your code is <span className="font-medium tabular-nums">{sent.dev_code}</span>
          </p>
        ) : null}
        <form onSubmit={(e) => void verify(e)} className="space-y-[1.75em]">
          <div>
            <label htmlFor={`${uid}-code`} className={editorialLabelClass}>
              Code
            </label>
            <input
              ref={codeRef}
              id={`${uid}-code`}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className={cn(fieldClass, "text-[1.25em] tracking-[0.4em] tabular-nums")}
            />
          </div>
          <EditorialCtaButton disabled={busy}>{busy ? "Verifying" : "Verify & continue"}</EditorialCtaButton>
        </form>
        <div className="mt-[1.5em] flex flex-wrap items-center gap-x-[1.5em] gap-y-[0.5em]">
          <button
            type="button"
            className={smallLinkClass}
            disabled={busy || cooldown > 0}
            onClick={() => void send()}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <button
            type="button"
            className={smallLinkClass}
            disabled={busy}
            onClick={() => {
              setSent(null)
              setError(null)
            }}
          >
            Use a different email or number
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {error ? <AuthAlert>{error}</AuthAlert> : null}
      <form onSubmit={(e) => void send(e)} className="space-y-[1.75em]" noValidate>
        {withNames ? (
          <div className="grid grid-cols-1 gap-[1.75em] sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-first`} className={editorialLabelClass}>
                First name
              </label>
              <input
                id={`${uid}-first`}
                autoComplete="given-name"
                value={names.first_name}
                onChange={(e) => setNames((n) => ({ ...n, first_name: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-last`} className={editorialLabelClass}>
                Last name
              </label>
              <input
                id={`${uid}-last`}
                autoComplete="family-name"
                value={names.last_name}
                onChange={(e) => setNames((n) => ({ ...n, last_name: e.target.value }))}
                className={fieldClass}
              />
            </div>
          </div>
        ) : null}
        <div>
          <label htmlFor={`${uid}-id`} className={editorialLabelClass}>
            Email or mobile number
          </label>
          <input
            id={`${uid}-id`}
            name="identifier"
            required
            autoComplete="username"
            inputMode="email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@studio.in or 98765 43210"
            className={fieldClass}
          />
          <p className="mt-[0.6em] m-0 font-outfit text-[0.8125em] leading-[1.4] text-[#6B635C]">
            We will send a one-time code. No password needed.
          </p>
        </div>
        {terms}
        <EditorialCtaButton disabled={busy || cooldown > 0}>
          {busy ? "Sending" : cooldown > 0 ? `Wait ${cooldown}s` : submitLabel}
        </EditorialCtaButton>
      </form>
    </>
  )
}

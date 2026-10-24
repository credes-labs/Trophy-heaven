"use client"

import { useState, type FormEvent } from "react"
import { EditorialCtaButton, editorialFieldClass, editorialLabelClass } from "@/components/layout/editorial/editorial-cta"
import { subscribeNewsletter } from "@/lib/forms"
import { cn } from "@/lib/utils"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)

export function JournalSubscribe() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      await subscribeNewsletter(email.trim())
      setSubmitted(true)
      setEmail("")
    } catch (err) {
      setError((err as Error).message || "Subscription failed — please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-t border-[#CDCDCD] pt-[clamp(2em,4vw,3.5em)]">
      <p className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-[#131111] uppercase">
        The journal, by email
      </p>
      <p className="mt-[0.75em] m-0 max-w-[32em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
        New pieces and workshop notes. No promotions.
      </p>
      {submitted ? (
        <p className="mt-[1.5em] m-0 font-outfit text-[1em] text-[#131111]" role="status">
          You&apos;re on the list.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-[1.5em] max-w-[28em]">
          <label htmlFor="journal-email" className={editorialLabelClass}>
            Email
          </label>
          <input
            id="journal-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@studio.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
          {error ? (
            <p className="mt-[0.75em] m-0 font-outfit text-[0.875em] text-[#8A2D25]" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-[1.75em]">
            <EditorialCtaButton disabled={busy}>{busy ? "Sending" : "Subscribe"}</EditorialCtaButton>
          </div>
        </form>
      )}
    </div>
  )
}

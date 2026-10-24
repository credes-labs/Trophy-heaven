"use client"

import { useState, type FormEvent } from "react"
import { SectionEyebrow, SectionShell } from "@/components/sections/_editorial"
import { subscribeNewsletter } from "@/lib/forms"

export function SignupSection() {
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
    <SectionShell id="stay-close" aria-labelledby="signup-heading">
      <div className="mx-auto max-w-[36em] text-center">
        <SectionEyebrow className="justify-center">stay close</SectionEyebrow>
        <h2
          id="signup-heading"
          className="mt-[0.75em] m-0 font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance"
        >
          A letter, not a blast.
        </h2>
        <p className="mt-[1em] m-0 font-outfit text-[1.125em] leading-[1.5] tracking-[-0.02em] text-pretty text-[#6B635C]">
          New pieces, workshop notes, and the occasional honest word about materials. Once or twice
          a month.
        </p>

        {submitted ? (
          <p className="mt-[2em] m-0 font-outfit text-[1.125em] text-pretty text-[#131111]" role="status">
            Thanks — you&apos;re on the list.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-[2em] flex flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-12 w-full flex-1 border-0 border-b border-[#131111]/25 bg-transparent px-0 font-outfit text-[1em] text-[#131111] placeholder:text-[#6B635C] focus:border-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[#131111] px-6 font-outfit text-[16px] uppercase tracking-wide text-[#F2F1EF] transition-opacity hover:opacity-90 disabled:opacity-50 sm:h-12"
            >
              {busy ? "…" : "Subscribe"}
            </button>
          </form>
        )}
        {error ? (
          <p className="mt-3 m-0 font-outfit text-sm text-pretty text-[#8A2D25]" role="alert">
            {error}
          </p>
        ) : null}
        <p className="mt-[1em] m-0 font-outfit text-[0.8125em] text-pretty text-[#6B635C]">
          Unsubscribe anytime.
        </p>
      </div>
    </SectionShell>
  )
}

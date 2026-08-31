"use client"

import { useState, useTransition } from "react"
import { EditorialCtaButton, editorialFieldClass, editorialLabelClass } from "@/components/layout/editorial/editorial-cta"
import { sendContactMessage } from "@/lib/forms"

const SUBJECTS = [
  "General inquiry",
  "Custom trophy / bulk order",
  "Furniture commission",
  "Order support",
  "Press & partnerships",
]

export function ContactForm() {
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECTS[0],
    message: "",
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await sendContactMessage({
          name: form.name,
          email: form.email,
          message: `[${form.subject}]${form.phone ? ` [Phone: ${form.phone}]` : ""}\n\n${form.message}`,
        })
        setSent(true)
        setForm({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" })
      } catch (err) {
        setError((err as Error).message || "Message could not be sent — please try again.")
      }
    })
  }

  if (sent) {
    return (
      <div>
        <h2 className="m-0 font-outfit text-[clamp(1.75rem,3vw,2.5em)] leading-[1.15] font-normal tracking-[-0.03em] text-[#131111]">
          Message received
        </h2>
        <p className="mt-[1em] m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
          Thank you. The studio will reply within one business day at the email you provided.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-[1.75em] cursor-pointer border-0 bg-transparent p-0 font-outfit text-[1.25em] leading-[1.25em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em]"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-[1.75em]">
      <div className="grid grid-cols-1 gap-[1.75em] sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={editorialLabelClass}>
            Name
          </label>
          <input
            id="contact-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            className={editorialFieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={editorialLabelClass}>
            Email
          </label>
          <input
            id="contact-email"
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@studio.in"
            className={editorialFieldClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[1.75em] sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className={editorialLabelClass}>
            Phone
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+91"
            className={editorialFieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className={editorialLabelClass}>
            Subject
          </label>
          <select
            id="contact-subject"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className={editorialFieldClass}
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={editorialLabelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Quantities, timelines, or links to artwork…"
          className={`${editorialFieldClass} h-auto min-h-[8em] resize-y py-[0.75em]`}
        />
      </div>

      {error ? (
        <p className="m-0 font-outfit text-[0.875em] text-[#8A2D25]" role="alert">
          {error}
        </p>
      ) : null}

      <EditorialCtaButton disabled={pending}>
        {pending ? "Sending" : "Send message"}
      </EditorialCtaButton>
    </form>
  )
}

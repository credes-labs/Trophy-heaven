"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { sendContactMessage } from "@/lib/forms"

const SUBJECTS = [
  "General inquiry",
  "Custom trophy / bulk order",
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
    subject: SUBJECTS[0],
    message: "",
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        // The backend contract is {name, email, message} — fold the chosen
        // subject into the message body so it reaches the team.
        await sendContactMessage({
          name: form.name,
          email: form.email,
          message: `[${form.subject}]\n\n${form.message}`,
        })
        setSent(true)
        setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" })
      } catch (err) {
        setError((err as Error).message || "Message could not be sent — please try again.")
      }
    })
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-8">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Message sent</h2>
        <p className="mt-2 text-muted-foreground">
          Thank you — we will get back to you shortly at the email you provided.
        </p>
        <Button className="mt-6" variant="outline" type="button" onClick={() => setSent(false)}>
          Send another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Your name"
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@company.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <select
          id="subject"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          className="h-11 w-full rounded-md border border-border bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Share quantities, timelines, or links to artwork…"
          className="w-full rounded-md border border-border bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" loading={pending} size="lg">
        Send message
      </Button>
    </form>
  )
}

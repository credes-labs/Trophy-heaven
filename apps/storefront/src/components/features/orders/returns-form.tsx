"use client"

import { useState, type FormEvent } from "react"
import { EditorialCtaButton } from "@/components/layout/editorial/editorial-cta"
import { editorialFieldClass, editorialLabelClass } from "@/components/layout/editorial/editorial-cta"
import { cn } from "@/lib/utils"
import { sendContactMessage } from "@/lib/forms"

const NL = "\n"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#131111]",
)

export function ReturnsForm() {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const v = (k: string) => String(f.get(k) ?? "").trim()
    setBusy(true)
    setError(null)
    try {
      await sendContactMessage({
        topic: "return",
        name: `Order ${v("order")}`,
        email: v("email"),
        message: [`Order number: ${v("order")}`, `Reason: ${v("reason")}`].join(NL),
      })
      setSent(true)
    } catch (err) {
      setError((err as Error).message || "Could not send. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <p className="m-0 max-w-[68ch] font-outfit text-[1.125em] leading-[1.5] text-pretty text-[#131111]" role="status">
        Return request received. We will email an RMA number and packing instructions shortly.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[1.5em]">
      <div>
        <label htmlFor="order" className={editorialLabelClass}>
          Order number
        </label>
        <input id="order" name="order" required className={fieldClass} />
      </div>
      <div>
        <label htmlFor="email" className={editorialLabelClass}>
          Email on the order
        </label>
        <input id="email" name="email" type="email" required className={fieldClass} />
      </div>
      <div>
        <label htmlFor="reason" className={editorialLabelClass}>
          Reason
        </label>
        <textarea id="reason" name="reason" required rows={4} className={cn(fieldClass, "h-auto py-2")} />
      </div>
      {error ? (
        <p role="alert" className="m-0 font-outfit text-[0.875em] text-[#8A2D25]">
          {error}
        </p>
      ) : null}
      <EditorialCtaButton type="submit" disabled={busy}>
        {busy ? "Sending…" : "Request RMA"}
      </EditorialCtaButton>
    </form>
  )
}

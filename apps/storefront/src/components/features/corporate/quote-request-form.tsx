"use client"

import { useState, type FormEvent } from "react"
import { EditorialCtaButton } from "@/components/layout/editorial/editorial-cta"
import { editorialFieldClass, editorialLabelClass } from "@/components/layout/editorial/editorial-cta"
import { cn } from "@/lib/utils"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)

export function QuoteRequestForm() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <p className="m-0 font-outfit text-[1.125em] leading-[1.5] text-[#131111]" role="status">
        Thank you. We will reply within one business day with a proof outline and quote.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[1.5em]">
      <div>
        <label htmlFor="org" className={editorialLabelClass}>
          Organisation
        </label>
        <input id="org" name="org" required className={fieldClass} />
      </div>
      <div>
        <label htmlFor="email" className={editorialLabelClass}>
          Work email
        </label>
        <input id="email" name="email" type="email" required className={fieldClass} />
      </div>
      <div>
        <label htmlFor="qty" className={editorialLabelClass}>
          Approximate quantity
        </label>
        <input id="qty" name="qty" type="number" min={1} required className={fieldClass} />
      </div>
      <div>
        <label htmlFor="occasion" className={editorialLabelClass}>
          Occasion
        </label>
        <input id="occasion" name="occasion" required className={fieldClass} />
      </div>
      <div>
        <label htmlFor="notes" className={editorialLabelClass}>
          Cities, deadlines, notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className={cn(fieldClass, "h-auto py-2")}
        />
      </div>
      <EditorialCtaButton type="submit">Request a quote</EditorialCtaButton>
    </form>
  )
}

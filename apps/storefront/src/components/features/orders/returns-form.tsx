"use client"

import { useState, type FormEvent } from "react"
import { EditorialCtaButton } from "@/components/layout/editorial/editorial-cta"
import { editorialFieldClass, editorialLabelClass } from "@/components/layout/editorial/editorial-cta"

export function ReturnsForm() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <p className="m-0 font-outfit text-[1.125em] leading-[1.5] text-[#131111]" role="status">
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
        <input id="order" name="order" required className={editorialFieldClass} />
      </div>
      <div>
        <label htmlFor="email" className={editorialLabelClass}>
          Email on the order
        </label>
        <input id="email" name="email" type="email" required className={editorialFieldClass} />
      </div>
      <div>
        <label htmlFor="reason" className={editorialLabelClass}>
          Reason
        </label>
        <textarea id="reason" name="reason" required rows={4} className={`${editorialFieldClass} h-auto py-2`} />
      </div>
      <EditorialCtaButton type="submit">Request RMA</EditorialCtaButton>
    </form>
  )
}

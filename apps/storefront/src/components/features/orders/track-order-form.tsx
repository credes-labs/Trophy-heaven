"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { EditorialCtaButton } from "@/components/layout/editorial/editorial-cta"
import { editorialFieldClass, editorialLabelClass } from "@/components/layout/editorial/editorial-cta"

export function TrackOrderForm() {
  const [lookedUp, setLookedUp] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLookedUp(true)
  }

  if (lookedUp) {
    return (
      <div className="border border-[#131111]/10 p-[1.5em]">
        <p className="m-0 font-outfit text-[1em] text-[#131111]/7">
          For signed-in customers, full timelines live in your account. Guests can email us with the
          order number and we will confirm status within one business day.
        </p>
        <Link
          href="/account/orders"
          className="mt-[1.25em] inline-block font-outfit text-[0.875em] uppercase underline underline-offset-[0.15em] text-[#131111]"
        >
          Open my orders
        </Link>
      </div>
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
      <EditorialCtaButton type="submit">Track order</EditorialCtaButton>
    </form>
  )
}

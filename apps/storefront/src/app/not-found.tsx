"use client"

import { useEffect } from "react"
import Link from "next/link"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"

export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found | Legacy Crafts"
  }, [])

  return (
    <EditorialShell>
      <EditorialFrame>
        <EditorialEyebrow>404</EditorialEyebrow>
        <h1 className="mt-[1em] m-0 max-w-[16em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-[#131111]">
          This page is not in the workshop.
        </h1>
        <p className="mt-[1.5em] m-0 max-w-[32em] font-outfit text-[1.125em] leading-[1.4] text-[#131111]/70">
          The link may be outdated, or the piece moved. Start again from the collection or the design
          studio.
        </p>
        <div className="mt-[2em] flex flex-col gap-3 sm:flex-row sm:items-center">
          <EditorialCtaLink href="/shop">Shop the collection</EditorialCtaLink>
          <Link
            href="/"
            className="font-outfit text-[1.125em] uppercase underline underline-offset-[0.15em] text-[#131111]"
          >
            Back home
          </Link>
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}

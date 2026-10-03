"use client"

import { useEffect } from "react"
import { EditorialCtaButton } from "@/components/layout/editorial/editorial-cta"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <EditorialShell>
      <EditorialFrame>
        <EditorialEyebrow>Something went wrong</EditorialEyebrow>
        <h1 className="mt-[1em] m-0 max-w-[16em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-[#131111]">
          The page could not be finished.
        </h1>
        <p className="mt-[1.5em] m-0 max-w-[32em] font-outfit text-[1.125em] leading-[1.4] text-[#131111]/70">
          Try again. If it persists, write to us and we will look at the bench logs.
        </p>
        <div className="mt-[2em]">
          <EditorialCtaButton type="button" onClick={reset}>
            Try again
          </EditorialCtaButton>
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}

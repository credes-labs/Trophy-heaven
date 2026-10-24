import type { Metadata } from "next"
import { EditorialCtaLink, EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false },
}

export default function OfflinePage() {
  return (
    <EditorialShell>
      <EditorialFrame className="flex min-h-[70vh] items-center">
        <div className="relative max-w-[32em]">
          <EditorialWatermark>offline</EditorialWatermark>
          <EditorialEyebrow>Connection</EditorialEyebrow>
          <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
            You&apos;re offline
          </h1>
          <p className="mt-[1.5em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            Your cart is saved on this device. Reconnect to browse the catalog and check out.
          </p>
          <div className="mt-[2em] flex flex-col items-start gap-[1.25em]">
            <EditorialCtaLink href="/cart">View saved cart</EditorialCtaLink>
            <EditorialTextLink href="/">Return home →</EditorialTextLink>
          </div>
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}

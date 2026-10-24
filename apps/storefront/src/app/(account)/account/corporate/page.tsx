import type { Metadata } from "next"
import { CorporateDashboard } from "@/components/features/corporate/corporate-dashboard"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export const metadata: Metadata = {
  title: "Corporate dashboard",
  robots: { index: false },
}

export default function CorporateAccountPage() {
  return (
    <div>
      <header className="relative overflow-hidden">
        <EditorialWatermark>company</EditorialWatermark>
        <EditorialEyebrow>Account</EditorialEyebrow>
        <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,4vw,3em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
          Corporate
        </h1>
        <p className="relative mt-[1em] m-0 max-w-[32em] font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
          Manage your company profile, team seats, payment terms, and bulk orders.
        </p>
      </header>
      <div className="mt-[2.5em]">
        <CorporateDashboard />
      </div>
    </div>
  )
}

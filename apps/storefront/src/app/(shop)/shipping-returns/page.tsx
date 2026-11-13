import type { Metadata } from "next"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { ShippingReturnsTabs } from "./shipping-returns-tabs"

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Shipping tiers across India and our returns policy for Trophy Heaven orders.",
  alternates: { canonical: "/shipping-returns" },
}

export default function ShippingReturnsPage() {
  return (
    <EditorialShell>
      <EditorialFrame>
        <div className="relative max-w-[36em]">
          <EditorialWatermark>send</EditorialWatermark>
          <EditorialEyebrow>Fulfillment</EditorialEyebrow>
          <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
            Shipping & returns
          </h1>
          <p className="mt-[1.25em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            Clear timelines across India, and a straightforward return for non-custom pieces.
          </p>
        </div>
        <ShippingReturnsTabs />
      </EditorialFrame>
    </EditorialShell>
  )
}

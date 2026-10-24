import type { Metadata } from "next"
import Image from "next/image"
import { BulkCalculator } from "@/components/features/corporate/bulk-calculator"
import { EditorialCtaLink, EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export const metadata: Metadata = {
  title: "Corporate & Bulk Orders",
  description:
    "Bulk award orders with per-recipient engraving, PO support, and net terms for verified corporate accounts.",
  alternates: { canonical: "/corporate" },
}

const FEATURES = [
  { title: "Name lists", copy: "Upload a CSV. We validate every row and preview each engraving before you confirm." },
  { title: "Volume pricing", copy: "Transparent breakpoints. The calculator below is an estimate — checkout is final." },
  { title: "Purchase orders", copy: "Verified accounts can settle on prepaid, net-30, or net-60 terms." },
  { title: "Split dispatch", copy: "Individually boxed honors, shipped to many cities from one roster." },
  { title: "GST invoices", copy: "E-invoices with tax split, attached to every corporate order." },
  { title: "A dedicated lead", copy: "One person at the atelier for proofs, timelines, and freight." },
] as const

export default function CorporatePage() {
  return (
    <EditorialShell>
      <section className="relative overflow-hidden border-b border-[#131111]/10">
        <EditorialFrame className="pb-[clamp(2.5rem,6vw,5em)]">
          <div className="grid items-center gap-[2.5em] lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] lg:min-h-[32em] lg:gap-16">
            <div className="relative z-10 max-w-[34em]">
              <EditorialWatermark>honor</EditorialWatermark>
              <EditorialEyebrow>Corporate</EditorialEyebrow>
              <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
                Bulk honors, handled as one brief
              </h1>
              <p className="mt-[1.5em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
                Per-recipient engraving, purchase orders, and net terms for verified accounts.
              </p>
              <div className="mt-[2em] flex flex-col items-start gap-[1.25em]">
                <EditorialCtaLink href="/corporate/bulk">Start a bulk order</EditorialCtaLink>
                <EditorialTextLink href="/account/corporate">Corporate dashboard →</EditorialTextLink>
              </div>
            </div>
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[0.125em] bg-[#D9D9D9] lg:aspect-[6/5]">
              <Image
                src="/images/hero/hero-workshop.jpg"
                alt="Workshop tools and timber for corporate honors"
                fill
                priority
                sizes="(min-width: 1024px) 48em, 100vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </EditorialFrame>
      </section>

      <EditorialFrame>
        <h2 className="m-0 max-w-[18em] font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance text-[#131111]">
          Built for annual ceremonies and quiet programs alike
        </h2>
        <div className="mt-[clamp(2em,4vw,3.5em)] grid grid-cols-1 gap-x-[3em] gap-y-[2.25em] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item) => (
            <div key={item.title}>
              <h3 className="m-0 font-outfit text-[1.25em] leading-[1.25em] font-light tracking-[-0.02em] text-balance text-[#131111] uppercase">
                {item.title}
              </h3>
              <p className="mt-[0.5em] m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
                {item.copy}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(3em,6vw,5.5em)]">
          <BulkCalculator />
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}

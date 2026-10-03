import type { Metadata } from "next"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"

export const metadata: Metadata = {
  title: "Trade Programme",
  description:
    "Trade pricing and samples for designers and architects working with Legacy Crafts.",
  alternates: { canonical: "/trade" },
}

export default function TradePage() {
  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Trade"
        watermark="trade"
        title="For designers & architects."
        body="Trade pricing, samples, and dedicated procurement for interiors projects."
      >
        <EditorialCtaLink href="/corporate/quote">Apply for trade access</EditorialCtaLink>
      </SimplePageHero>
      <EditorialFrame>
        <ul className="m-0 grid list-none gap-[1em] p-0 lg:grid-cols-3">
          {[
            "Net-30 on verified accounts",
            "Sample boards for timber, brass, and crystal",
            "Project quoting with split site delivery",
          ].map((item) => (
            <li key={item} className="border border-[#131111]/10 p-[1.25em] font-outfit text-[1em] leading-[1.45] text-[#131111]">
              {item}
            </li>
          ))}
        </ul>
      </EditorialFrame>
    </EditorialShell>
  )
}

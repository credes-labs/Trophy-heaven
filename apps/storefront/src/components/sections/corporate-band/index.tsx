import { PillCta, SectionEyebrow, SectionShell, TextCta } from "@/components/sections/_editorial"

const POINTS = [
  "CSV name lists, engraved per recipient",
  "Volume pricing from 25 units",
  "GST e-invoicing and purchase orders",
  "Split dispatch to multiple cities",
  "Net-30 for verified accounts",
] as const

export function CorporateBandSection() {
  return (
    <SectionShell id="organisations" aria-labelledby="organisations-heading">
      <SectionEyebrow>for organisations</SectionEyebrow>
      <div className="mt-[0.75em] grid gap-[2em] lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-6">
          <h2
            id="organisations-heading"
            className="m-0 max-w-[14em] font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em]"
          >
            Two hundred awards. One brief.
          </h2>
          <p className="mt-[1.25em] m-0 max-w-[34em] font-outfit text-[1.125em] leading-[1.5] tracking-[-0.02em] text-[#131111]/7">
            Send a spreadsheet of names and we return a single proof, one GST invoice, and dispatch
            split across your venues.
          </p>
          <div className="mt-[2em] flex flex-col gap-3 sm:flex-row sm:items-center">
            <PillCta href="/corporate/quote" variant="dark">
              Request a quote
            </PillCta>
            <TextCta href="/corporate/bulk">See how bulk works</TextCta>
          </div>
        </div>
        <ul className="m-0 grid list-none gap-[0.85em] p-0 lg:col-span-5 lg:col-start-8">
          {POINTS.map((point) => (
            <li
              key={point}
              className="flex items-start gap-[0.75em] border-b border-[#131111]/10 pb-[0.85em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]"
            >
              <span className="mt-[0.45em] size-[0.4em] shrink-0 rounded-full bg-[#131111]" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  )
}

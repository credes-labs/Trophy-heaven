import { TRUST_POINTS } from "@/lib/brand-facts"
import { SectionShell } from "@/components/sections/_editorial"

export function TrustStripSection() {
  return (
    <SectionShell className="!py-[clamp(1.75rem,3vw,2.5em)]" aria-labelledby="trust-heading">
      <h2 id="trust-heading" className="sr-only">
        Why Legacy Crafts
      </h2>
      <ul className="m-0 grid list-none grid-cols-2 gap-x-[1em] gap-y-[1.25em] border-y border-[#131111]/15 py-[1.5em] p-0 lg:grid-cols-4">
        {TRUST_POINTS.map((point) => (
          <li
            key={point}
            className="font-outfit text-[0.875em] leading-[1.4] tracking-[-0.02em] text-[#131111]/8 sm:text-[1em]"
          >
            {point}
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

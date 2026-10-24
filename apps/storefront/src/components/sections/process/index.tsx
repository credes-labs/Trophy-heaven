import { SectionEyebrow, SectionShell } from "@/components/sections/_editorial"

const STEPS = [
  {
    n: "01",
    title: "Brief",
    body: "Tell us the occasion, the quantity, and the names.",
  },
  {
    n: "02",
    title: "Design",
    body: "Approve a render of the real thing, not a sketch.",
  },
  {
    n: "03",
    title: "Craft",
    body: "Cut, cast, engrave, and hand-finish in Bengaluru.",
  },
  {
    n: "04",
    title: "Deliver",
    body: "Packed to survive the courier. Tracked to the door.",
  },
] as const

export function ProcessSection() {
  return (
    <SectionShell id="process" aria-labelledby="process-heading">
      <SectionEyebrow>how it works</SectionEyebrow>
      <h2
        id="process-heading"
        className="mt-[0.75em] m-0 max-w-[16em] font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance"
      >
        Four steps, no surprises.
      </h2>
      <ol className="mt-[clamp(1.75em,3.5vw,3em)] m-0 grid list-none grid-cols-1 gap-[1.25em] p-0 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.n} className="border-t border-[#131111] pt-[1em]">
            <p className="m-0 font-outfit text-[0.75em] uppercase tracking-[0.14em] text-[#6B635C]">
              {step.n}
            </p>
            <h3 className="mt-[0.75em] m-0 font-outfit text-[1.25em] font-normal tracking-[-0.02em] text-balance">
              {step.title}
            </h3>
            <p className="mt-[0.5em] m-0 font-outfit text-[1em] leading-[1.45] text-pretty text-[#6B635C]">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </SectionShell>
  )
}

import { PillCta, SectionEyebrow, SectionShell, TextCta } from "@/components/sections/_editorial"

const AFFORDANCES = [
  { title: "Type it, see it", body: "Engraving renders at actual size on the plate." },
  { title: "Turn it in 3D", body: "Inspect silhouette, metal, and crystal from every angle." },
  { title: "Share it for sign-off", body: "Send a link to stakeholders before we cut." },
  { title: "Save it, reorder it", body: "Keep the design for next year's ceremony." },
] as const

export function CustomizerSection() {
  return (
    <SectionShell id="design-studio" aria-labelledby="design-studio-heading" ink>
      <SectionEyebrow className="text-[#F2F1EF]/70">design it first</SectionEyebrow>
      <div className="mt-[0.75em] grid gap-[2em] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
        <div>
          <h2
            id="design-studio-heading"
            className="m-0 max-w-[16em] font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-[#F2F1EF]"
          >
            See it before you commission it.
          </h2>
          <p className="mt-[1.25em] m-0 max-w-[36em] font-outfit text-[1.125em] leading-[1.5] tracking-[-0.02em] text-[#F2F1EF]/75">
            Set the plate, choose the metal, place the logo, and read the engraving back at actual
            size. Our 2D and 3D studio renders your trophy as it will be made — so the first one you
            hold is the one you approved.
          </p>
          <div className="mt-[2em] flex flex-col gap-3 sm:flex-row sm:items-center">
            <PillCta href="/customize" variant="light">
              Open the design studio
            </PillCta>
            <TextCta href="/shop?category=trophies&customizable=1" className="text-[#F2F1EF]">
              See customisable trophies
            </TextCta>
          </div>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-[1em] p-0 sm:grid-cols-2">
          {AFFORDANCES.map((item) => (
            <li key={item.title} className="border border-[#F2F1EF]/15 p-[1.25em]">
              <p className="m-0 font-outfit text-[1em] font-normal tracking-[-0.02em] text-[#F2F1EF]">
                {item.title}
              </p>
              <p className="mt-[0.5em] m-0 font-outfit text-[0.875em] leading-[1.4] text-[#F2F1EF]/65">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  )
}

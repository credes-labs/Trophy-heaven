import { SectionEyebrow, SectionShell } from "@/components/sections/_editorial"

const MATERIALS = [
  {
    name: "Optical crystal",
    body: "Lead-free, polished to a true edge. Takes an engraving without clouding.",
  },
  {
    name: "Cast brass",
    body: "Sand-cast and hand-buffed. It darkens with handling, which is the point.",
  },
  {
    name: "Solid walnut",
    body: "Quarter-sawn for stability. Grain matched across a single piece, never veneered.",
  },
  {
    name: "Kiln-dried teak",
    body: "Dried to ten percent moisture, so a Bengaluru monsoon does not move it.",
  },
  {
    name: "Full-grain leather",
    body: "Vegetable-tanned. It creases where you sit and nowhere else.",
  },
  {
    name: "Honed stone",
    body: "Matte, not polished. Fingerprints do not live on it.",
  },
] as const

export function MaterialsSection() {
  return (
    <SectionShell id="materials" aria-labelledby="materials-heading">
      <SectionEyebrow>materials</SectionEyebrow>
      <h2
        id="materials-heading"
        className="mt-[0.75em] m-0 max-w-[14em] font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance"
      >
        We name what we use.
      </h2>
      <ul className="mt-[clamp(1.75em,3.5vw,3em)] m-0 grid list-none grid-cols-2 gap-x-[1em] gap-y-[1.75em] p-0 lg:grid-cols-3 lg:gap-[2em]">
        {MATERIALS.map((item) => (
          <li key={item.name}>
            <h3 className="m-0 font-outfit text-[1.125em] font-normal tracking-[-0.02em] text-balance text-[#131111]">
              {item.name}
            </h3>
            <p className="mt-[0.5em] m-0 font-outfit text-[0.9375em] leading-[1.45] text-pretty text-[#6B635C]">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

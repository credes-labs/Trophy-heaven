import { SectionEyebrow, SectionShell } from "@/components/sections/_editorial"
import { MaterialsLoader } from "./materials-loader"

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
      <MaterialsLoader />
    </SectionShell>
  )
}

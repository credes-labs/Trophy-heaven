import { AboutCopy } from "./about-copy"
import { AboutEyebrow } from "./about-eyebrow"
import { AboutFeature } from "./about-feature"
import { AboutHeadline } from "./about-headline"
import { AboutPortrait } from "./about-portrait"
import { AboutStats } from "./about-stats"
import { SectionShell } from "@/components/sections/_editorial"

/**
 * Figma About (1440 artboard). Uses shared SectionShell for fluid em scaling.
 */
export function AboutSection() {
  return (
    <SectionShell id="about" aria-labelledby="about-heading" className="!pb-[clamp(2.5rem,6vw,7em)]">
      <AboutEyebrow />
      <AboutHeadline />

      <div className="mt-[clamp(2rem,4.17vw,3.75em)] grid grid-cols-1 items-stretch gap-[clamp(1.5rem,4.72vw,4.25em)] lg:grid-cols-[minmax(0,1fr)_15.125em_27.3125em] lg:gap-x-[4.25em] lg:gap-y-0">
        <AboutStats />
        <AboutPortrait />
        <AboutCopy />
      </div>

      <AboutFeature />
    </SectionShell>
  )
}

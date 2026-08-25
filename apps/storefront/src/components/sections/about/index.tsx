import { AboutCopy } from "./about-copy"
import { AboutEyebrow } from "./about-eyebrow"
import { AboutFeature } from "./about-feature"
import { AboutHeadline } from "./about-headline"
import { AboutPortrait } from "./about-portrait"
import { AboutStats } from "./about-stats"

/**
 * Figma About (1440 artboard). From `lg` up, `1em` = `min(1rem, 100vw / 90)`
 * so every Figma px/16 value scales with viewport. Below `lg` the section
 * keeps the document rem and stacks so type stays readable.
 */
export function AboutSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className="overflow-x-clip bg-[#F2F1EF] font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]"
    >
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(2.5rem,4.72vw,4.25em)] pb-[clamp(2.5rem,6vw,7em)]">
        <AboutEyebrow />
        <AboutHeadline />

        <div className="mt-[clamp(2rem,4.17vw,3.75em)] grid grid-cols-1 items-stretch gap-[clamp(1.5rem,4.72vw,4.25em)] lg:grid-cols-[minmax(0,1fr)_15.125em_27.3125em] lg:gap-x-[4.25em] lg:gap-y-0">
          <AboutStats />
          <AboutPortrait />
          <AboutCopy />
        </div>

        <AboutFeature />
      </div>
    </section>
  )
}

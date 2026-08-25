import { ABOUT_HEADLINE } from "./constants"

export function AboutHeadline() {
  return (
    <h2
      id="about-heading"
      className="m-0 mt-[1.625em] max-w-[61.1875em] font-outfit text-[clamp(1.75em,5.2vw,3.375em)] leading-[1.2] font-normal tracking-[-0.02em] text-[#131111]"
    >
      {ABOUT_HEADLINE}
    </h2>
  )
}

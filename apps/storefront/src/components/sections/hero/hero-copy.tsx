import { HERO_COPY, HERO_EYEBROW, HERO_HEADLINE } from "./constants"

/** Left-column body copy (Figma 521×124, Outfit 22px). */
export function HeroCopy() {
  return (
    <div className="max-w-[521px]">
      <p className="m-0 font-outfit text-[14px] leading-5 font-normal tracking-wide text-[#FCFBF8]/70 lowercase lg:text-[16px]">
        {HERO_EYEBROW}
      </p>
      <p className="mt-3 m-0 font-outfit text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.15] font-normal tracking-[-0.03em] text-[#FCFBF8]">
        {HERO_HEADLINE}
      </p>
      <p className="mt-4 m-0 font-outfit text-[18px] leading-[28px] font-normal text-[#FCFBF8]/90 lg:text-[22px] lg:leading-[31px]">
        {HERO_COPY}
      </p>
    </div>
  )
}

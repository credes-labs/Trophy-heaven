import { HERO_COPY } from "./constants"

/** Left-column body copy (Figma 521×124, Outfit 22px). */
export function HeroCopy() {
  return (
    <p className="m-0 max-w-[521px] font-outfit text-[18px] leading-[28px] font-normal text-[#FCFBF8] lg:text-[22px] lg:leading-[31px]">
      {HERO_COPY}
    </p>
  )
}

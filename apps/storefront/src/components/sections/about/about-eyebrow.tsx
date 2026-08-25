import { ABOUT_EYEBROW } from "./constants"

export function AboutEyebrow() {
  return (
    <p className="m-0 inline-flex items-center gap-[0.75em] rounded-full bg-[#F2F1EF] font-outfit text-[1em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase">
      <span className="size-[0.5em] shrink-0 rounded-full bg-[#131111]" aria-hidden />
      {ABOUT_EYEBROW}
    </p>
  )
}

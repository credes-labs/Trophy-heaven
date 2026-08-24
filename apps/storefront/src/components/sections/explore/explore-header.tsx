import { EXPLORE_BODY, EXPLORE_HEADLINE } from "./constants"

export function ExploreHeader() {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <h2
        id="explore-heading"
        className="m-0 max-w-[20em] font-outfit text-[clamp(2rem,6vw,3.375em)] leading-[1.24] font-normal tracking-[-0.04em] text-[#131111] lg:max-w-[34.3125em] lg:text-[3.375em]"
      >
        {EXPLORE_HEADLINE}
      </h2>
      <p className="m-0 max-w-[34.75em] font-outfit text-[clamp(1.125rem,3.5vw,1.75em)] leading-[1.4] font-normal tracking-[-0.03em] text-[rgba(19,17,17,0.6)] lg:w-[29.6875em] lg:text-[1.75em]">
        {EXPLORE_BODY}
      </p>
    </header>
  )
}

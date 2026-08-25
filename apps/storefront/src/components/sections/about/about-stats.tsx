import { ABOUT_STATS, ABOUT_STATS_KICKER } from "./constants"

function StatRule() {
  return (
    <span
      aria-hidden
      className="mx-[1.1em] hidden h-[6.375em] w-0 shrink-0 border-l-[0.125em] border-[#131111] lg:block"
      style={{ transform: "rotate(7deg)" }}
    />
  )
}

export function AboutStats() {
  return (
    <div className="flex min-h-[17.625em] flex-col justify-between gap-[1.5em]">
      <p className="m-0 font-outfit text-[clamp(0.875em,1.39vw,1.25em)] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase">
        {ABOUT_STATS_KICKER}
      </p>
      <div className="flex flex-wrap items-start justify-between gap-y-[1.25em] sm:flex-nowrap">
        {ABOUT_STATS.map((stat, i) => (
          <div key={stat.value} className="flex items-start">
            {i > 0 ? <StatRule /> : null}
            <div className="flex w-[8.59375em] flex-col items-center gap-[0.375em] text-center">
              <p className="m-0 font-outfit text-[clamp(2em,4.5vw,4.0625em)] leading-[1.1] font-normal tracking-[-0.03em] text-[#131111]">
                {stat.value}
              </p>
              <p className="m-0 font-outfit text-[0.875em] leading-[1.4] font-normal tracking-[-0.02em] text-[#131111]">
                {stat.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { HERO_COPY, HERO_EYEBROW, HERO_HEADLINE_LINES } from "./constants"

/** Poster headline. Line breaks match the reference stack; the words are the existing tagline. */
export function HeroHeadline() {
  return (
    <h1 className="m-0 font-outfit text-[clamp(2.15rem,10.2vw,7.5rem)] leading-[0.84] font-medium tracking-[-0.045em] text-[#F4F1EA] uppercase">
      {HERO_HEADLINE_LINES.map((line, index) => (
        <span key={line}>
          {index > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </h1>
  )
}

/** Small caption sitting on the lower right of the photograph. */
export function HeroAside() {
  return (
    <div className="max-w-[18rem]">
      <p className="m-0 font-outfit text-[13px] leading-5 font-normal tracking-wide text-[#F2F1EF] lowercase">
        {HERO_EYEBROW}
      </p>
      <p className="mt-2 m-0 font-outfit text-[14px] leading-5 font-normal text-pretty text-[#F4F1EA] lg:text-[15px] lg:leading-[22px]">
        {HERO_COPY}
      </p>
    </div>
  )
}

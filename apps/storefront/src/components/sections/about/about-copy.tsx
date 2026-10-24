import Link from "next/link"

import { ABOUT_BODY, ABOUT_CTA_HREF, ABOUT_CTA_LABEL } from "./constants"

export function AboutCopy() {
  return (
    <div className="flex w-full max-w-[27.3125em] flex-col items-start gap-[1.5em]">
      <div className="flex flex-col gap-[2.5em]">
        {ABOUT_BODY.map((paragraph) => (
          <p
            key={paragraph.slice(0, 24)}
            className="m-0 font-outfit text-[1em] leading-[1.4] font-normal tracking-[-0.02em] text-pretty text-[#131111]"
          >
            {paragraph}
          </p>
        ))}
      </div>
      <Link
        href={ABOUT_CTA_HREF}
        className="font-outfit text-[1.25em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] transition-opacity hover:opacity-70"
      >
        {ABOUT_CTA_LABEL}
      </Link>
    </div>
  )
}

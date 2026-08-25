import Link from "next/link"

/** Figma Vector.svg — 168×69 wordmark, top-left of the hero. */
export function HeroWordmark() {
  return (
    <Link href="/" aria-label="Legacy home" className="relative z-10 block h-[69px] w-[168px] shrink-0 overflow-clip">
      <img
        src="/images/brand/legacy-wordmark.svg"
        alt=""
        width={168}
        height={69}
        className="size-full object-contain"
      />
    </Link>
  )
}

import Image from "next/image"

import { FilmWatermark } from "@/components/sections/_editorial"
import { ABOUT_FILM_TITLE } from "./constants"

function PlayGlyph() {
  return (
    <svg viewBox="0 0 42 42" className="size-[2.625em]" aria-hidden>
      <path fill="#F2F1EF" d="M10.5 3.94 39.375 21 10.5 38.06V3.94Z" />
    </svg>
  )
}

export function AboutFeature() {
  return (
    <div className="relative mt-[clamp(2em,4.3vw,4.3125em)] w-full">
      <div className="relative aspect-[1360/664] w-full overflow-hidden rounded-[0.125em]">
        <Image
          src="/images/about/about-legacy-atelier.webp"
          alt="Sculptural walnut sofa in a dark atelier"
          fill
          sizes="(min-width: 90rem) 85rem, 100vw"
          className="object-cover object-center"
        />
        <div
          className="pointer-events-none absolute top-[calc(50%-2.5em)] left-1/2 flex size-[8em] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[7em] border-[0.0625em] border-[#F2F1EF] bg-[rgba(177,177,177,0.24)] backdrop-blur-[0.3125em]"
          aria-hidden
        >
          <PlayGlyph />
        </div>
      </div>
      <FilmWatermark>{ABOUT_FILM_TITLE}</FilmWatermark>
    </div>
  )
}

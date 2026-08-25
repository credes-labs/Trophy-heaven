import Image from "next/image"

import { FOOTER_POLAROIDS } from "./constants"

function PolaroidCard({
  src,
  alt,
  widthEm,
  transform,
}: {
  src: string
  alt: string
  widthEm: number
  transform?: string
}) {
  return (
    <div
      className="relative h-[25.125em] shrink-0 overflow-hidden rounded-[0.125em] border-[0.375em] border-[#F2F1EF] bg-[#F2F1EF]"
      style={{ width: `${widthEm}em`, transform }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 350px, 160px"
        className="object-cover object-center"
      />
    </div>
  )
}

/** Polaroid scatter — Frame 2147239269 (1440×320). Clipped on desktop; scroller on small screens. */
export function PolaroidStrip() {
  return (
    <>
      <div className="-mx-[1.25rem] flex gap-3 overflow-x-auto px-[1.25rem] pt-4 pb-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        {FOOTER_POLAROIDS.map((card) => (
          <div
            key={card.src}
            className="relative h-52 w-40 shrink-0 overflow-hidden rounded-sm border-[6px] border-[#F2F1EF]"
          >
            <Image
              src={card.src}
              alt={card.alt}
              fill
              sizes="10rem"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      <div className="relative hidden h-[20em] w-full overflow-hidden lg:block">
        {FOOTER_POLAROIDS.map((card, index) => (
          <div
            key={card.src}
            className="absolute origin-center transition-transform duration-300 ease-out hover:-translate-y-[0.5em] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            style={{
              left: `${card.leftEm}em`,
              top: `${card.topEm}em`,
              zIndex: index + 1,
            }}
          >
            <PolaroidCard
              src={card.src}
              alt={card.alt}
              widthEm={card.widthEm}
              transform={card.transform}
            />
          </div>
        ))}
      </div>
    </>
  )
}

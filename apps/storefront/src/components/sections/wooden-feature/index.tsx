import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { BRAND } from "@/lib/brand-facts"

const MARQUEE = "made to be remembered"

/** Placed in code; names and photos match products in the Wooden category. */
const PIECES = [
  {
    handle: "ivory-crest-frame-with-crystal-award",
    name: "Ivory Crest Frame with Crystal Award",
    src: "/images/cutouts/collection/ivory-crest-frame-with-crystal-award.webp",
    width: 312,
    height: 329,
  },
  {
    handle: "rosewood-ring-memento",
    name: "Rosewood Ring Memento",
    src: "/images/cutouts/collection/rosewood-ring-memento.webp",
    width: 375,
    height: 449,
  },
  {
    handle: "twin-pillar-citation-stand",
    name: "Twin Pillar Citation Stand",
    src: "/images/cutouts/collection/twin-pillar-citation-stand.webp",
    width: 261,
    height: 376,
  },
] as const

function MarqueeRun({ hidden = false }: { hidden?: boolean }) {
  return (
    <span aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className="flex items-center">
          <span className="px-[0.35em]">{MARQUEE}</span>
          <span className="px-[0.35em] text-gold-soft" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </span>
  )
}

/**
 * Homepage band for the wooden range: a scrolling line, a ceremony photo, three
 * pieces on ivory tiles and a link to the Wooden category. Deep maroon, so the
 * page has one strong colour moment between the product grids.
 */
export function WoodenFeatureSection() {
  return (
    <section
      aria-labelledby="wooden-feature-heading"
      className="overflow-x-clip bg-maroon-deep font-outfit text-[#F6EFE4]"
    >
      <div
        className="flex overflow-hidden pt-[clamp(1.5rem,3vw,2.75rem)] text-[clamp(3rem,9vw,8.5rem)] leading-none font-normal tracking-[-0.04em] whitespace-nowrap select-none"
        aria-label={MARQUEE}
        role="img"
      >
        <div className="marquee-track flex">
          <MarqueeRun hidden />
          <MarqueeRun hidden />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 pt-[clamp(2rem,4vw,3.5rem)] pb-[clamp(3rem,6vw,5.5rem)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] lg:gap-14 lg:px-6">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] max-lg:aspect-[4/3]">
          <Image
            src="/images/brand/winner-cup.webp"
            alt="A winner smiling as he lifts a gold cup on stage"
            fill
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="object-cover object-[28%_center]"
          />
        </div>

        <div className="flex flex-col justify-between gap-8">
          <div>
            <h2
              id="wooden-feature-heading"
              className="m-0 text-[clamp(2.5rem,5.6vw,5rem)] leading-[1] font-normal tracking-[-0.04em]"
            >
              Wooden collection
            </h2>
            <p className="mt-5 mb-0 max-w-[34em] text-[clamp(0.9375rem,1.1vw,1.0625rem)] leading-[1.55] text-pretty text-[#F6EFE4]/80">
              Rosewood, walnut and gilt, shaped in our {BRAND.city} workshop. Mementos, citation
              plaques and shields in every size from a desk piece to a stage award, each ready for
              an engraved name, logo or citation.
            </p>
          </div>

          <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:gap-5">
            {PIECES.map((piece) => (
              <li key={piece.handle}>
                <Link
                  href={`/products/${piece.handle}`}
                  aria-label={piece.name}
                  className="group flex aspect-[5/4] items-center justify-center rounded-[1.25rem] bg-ivory p-[8%] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-soft"
                >
                  <Image
                    src={piece.src}
                    alt=""
                    width={piece.width}
                    height={piece.height}
                    sizes="(min-width: 1024px) 16vw, 30vw"
                    className="h-full w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <p className="m-0 max-w-[16em] text-[0.9375rem] leading-[1.4] text-[#F6EFE4]/80">
              Finished by hand, engraved to the name.
            </p>
            <Link
              href="/categories/trophies/wooden"
              className="inline-flex min-h-11 items-center gap-3 rounded-full bg-[#F6EFE4] py-1.5 pr-1.5 pl-6 text-[clamp(1rem,1.4vw,1.375rem)] leading-none text-maroon-deep transition-colors hover:bg-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-soft"
            >
              view more
              <span className="flex size-9 items-center justify-center rounded-full bg-maroon-deep text-[#F6EFE4]">
                <ArrowUpRight className="size-5" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

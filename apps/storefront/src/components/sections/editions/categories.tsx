import Image from "next/image"
import Link from "next/link"
import { Emblem } from "@/components/brand/emblem"
import { CUTOUTS, HOME_CATEGORIES } from "./constants"

const count = String(HOME_CATEGORIES.length).padStart(2, "0")

/** "(04) CATEGORIES" row: grey tiles with cut-out trophies, label underneath. */
export function HomeCategories() {
  return (
    <section aria-labelledby="home-categories" className="bg-white text-[#1A1A1A]">
      <div className="mx-auto max-w-[1600px] px-4 pt-10 pb-16 lg:px-6 lg:pt-14 lg:pb-28">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="m-0 text-[15px] leading-none font-light text-[#1A1A1A]/70">({count})</p>
            <h2
              id="home-categories"
              className="m-0 mt-1 text-[22px] leading-none font-medium tracking-[-0.01em] uppercase lg:text-[26px]"
            >
              Categories
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[14px] leading-none font-normal uppercase underline decoration-1 underline-offset-[5px] transition-opacity hover:opacity-60 lg:text-[16px]"
          >
            View all
          </Link>
        </div>

        <ul className="m-0 grid list-none grid-cols-2 gap-1.5 p-0 lg:grid-cols-4">
          {HOME_CATEGORIES.map((cat) => {
            const cut = cat.cutout ? CUTOUTS[cat.cutout] : null
            return (
              <li key={cat.label}>
                <Link
                  href={cat.href}
                  className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"
                >
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#F3F3F3]">
                    {cut ? (
                      <Image
                        src={cut.src}
                        alt=""
                        width={cut.width}
                        height={cut.height}
                        sizes="(min-width: 1024px) 24vw, 48vw"
                        className="h-[74%] w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <span className="flex flex-col items-center gap-3 text-center">
                        <Emblem className="w-[clamp(5rem,11vw,10rem)] text-maroon transition-transform duration-500 group-hover:scale-[1.04]" />
                        <span className="text-[11px] tracking-[0.04em] text-[#1A1A1A]/60 uppercase">
                          Open the studio →
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="m-0 mt-2 text-[11px] leading-none tracking-[0.03em] text-[#1A1A1A]/80 uppercase">
                    {cat.label}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

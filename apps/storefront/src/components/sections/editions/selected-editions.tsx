"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import {
  ALL_PIECES,
  CUTOUTS,
  EDITION_FILTERS,
  EDITION_PRODUCTS,
  EDITION_SORTS,
  EDITIONS_HEADLINE,
  type EditionProduct,
  type EditionSortId,
} from "./constants"

/** Large display heading, slash-separated filters, one big tile plus small tiles. */
export function SelectedEditions() {
  const [filter, setFilter] = useState(ALL_PIECES)
  const [sort, setSort] = useState<EditionSortId>("featured")

  const items = useMemo(() => {
    const list = EDITION_PRODUCTS.filter((p) => filter === ALL_PIECES || p.category === filter)
    if (sort === "price-asc") return [...list].sort((a, b) => a.amount - b.amount)
    if (sort === "price-desc") return [...list].sort((a, b) => b.amount - a.amount)
    return list
  }, [filter, sort])

  const [lead, ...rest] = items

  return (
    <section aria-labelledby="selected-editions" className="bg-white text-[#1A1A1A]">
      <div className="mx-auto max-w-[1600px] px-4 pb-20 lg:px-6 lg:pb-32">
        <h2
          id="selected-editions"
          className="m-0 text-[clamp(3rem,10.4vw,10rem)] leading-[0.9] font-normal tracking-[-0.045em] text-[#1F1F1F]"
        >
          {EDITIONS_HEADLINE}
        </h2>

        <div className="mt-4 mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 lg:mt-5 lg:mb-10">
          <ul
            aria-label="Filter pieces"
            className="m-0 flex list-none flex-wrap items-center p-0 text-[15px] lg:text-[17px]"
          >
            {EDITION_FILTERS.map((f, i) => (
              <li key={f} className="flex items-center">
                {i > 0 ? (
                  <span aria-hidden className="px-1.5 text-[#1A1A1A]/35">
                    /
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] ${
                    filter === f ? "text-[#1A1A1A]" : "text-[#1A1A1A]/70 hover:text-[#1A1A1A]"
                  }`}
                >
                  {f}
                </button>
              </li>
            ))}
          </ul>
          <label className="relative ml-auto flex items-center text-[15px] lg:text-[17px]">
            <span className="sr-only">Sort pieces</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as EditionSortId)}
              className="cursor-pointer appearance-none bg-transparent pr-6 text-right focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"
            >
              {EDITION_SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-0 size-4" strokeWidth={2} />
          </label>
        </div>

        {lead ? (
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
            <EditionTile product={lead} large />
            {rest.map((p) => (
              <EditionTile key={p.id} product={p} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function EditionTile({ product, large = false }: { product: EditionProduct; large?: boolean }) {
  const cut = CUTOUTS[product.id]
  return (
    <Link
      href={product.href}
      className={`group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] ${
        large ? "col-span-2" : "col-span-1 self-start"
      }`}
    >
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-[#F3F3F3] ${
          large ? "aspect-[4/3]" : "aspect-[3/2] lg:aspect-[11/7]"
        }`}
      >
        <Image
          src={cut.src}
          alt={product.alt}
          width={cut.width}
          height={cut.height}
          sizes={large ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
          className={`w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
            large ? "h-[86%]" : "h-[84%]"
          }`}
        />
      </div>
      <p className="m-0 mt-2 text-[11px] leading-none tracking-[0.03em] text-[#1A1A1A]/70 uppercase">
        {product.name}
      </p>
      <p className="m-0 mt-1 text-[16px] leading-none font-normal text-[#1A1A1A]">{product.price}</p>
    </Link>
  )
}

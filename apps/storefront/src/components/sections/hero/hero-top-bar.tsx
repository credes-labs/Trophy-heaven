"use client"

import Link from "next/link"
import { SiteCartControl } from "@/components/layout/site-nav/site-cart-control"
import { HERO_TOP_FILTERS, HERO_TOP_LINKS } from "./constants"

const linkClass =
  "block text-[11px] leading-[1.45] font-normal tracking-[0.02em] text-[#1A1A1A] uppercase transition-opacity hover:opacity-60 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"

/** Reference-style top bar: stacked filter pairs, centred shop links, cart + currency. */
export function HeroTopBar() {
  return (
    <nav aria-label="Primary" className="grid grid-cols-12 items-start gap-x-4">
      {HERO_TOP_FILTERS.map((pair, i) => (
        <ul key={i} className={`m-0 flex list-none flex-col p-0 ${i === 0 ? "col-span-3" : "col-start-4 col-span-3"}`}>
          {pair.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ))}
      <ul className="col-start-8 col-span-3 m-0 flex list-none gap-5 p-0">
        {HERO_TOP_LINKS.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="col-start-11 col-span-2 flex justify-end gap-8">
        <SiteCartControl className={linkClass} />
        <span className={`${linkClass} hover:opacity-100`}>INR</span>
      </div>
    </nav>
  )
}

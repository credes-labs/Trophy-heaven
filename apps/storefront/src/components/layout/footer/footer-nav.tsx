import Link from "next/link"

import { FOOTER_NAV, FOOTER_WORDMARK } from "./constants"
import "./footer-nav.css"

const COLUMN_LEFT = ["left-[53.625em]", "left-[64.5625em]", "left-[75.9375em]"] as const

function NavColumn({
  title,
  links,
}: {
  title: string
  links: readonly { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="m-0 font-outfit text-[1.25em] leading-[1.4] font-normal tracking-[-0.02em] text-[#131111] uppercase">
        {title}
      </h3>
      <ul className="mt-[1em] flex flex-col gap-[0.75em]">
        {links.map((link) => (
          <li key={`${title}-${link.label}`} className="leading-[1.5]">
            <Link
              href={link.href}
              className="font-outfit text-[1em] leading-[1.5] font-normal tracking-[-0.01em] text-[#131111]/70 transition-opacity hover:text-[#131111] hover:opacity-100"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Wordmark + three columns — Frame 2131330794 (1360×259). */
export function FooterNav() {
  return (
    <div className="relative mx-auto w-full max-w-[85em] overflow-x-clip px-[clamp(1.25rem,2.78vw,2.5em)] lg:h-[16.1875em] lg:px-0">
      <div className="-ml-[0.15em] lg:-ml-[1.833em]">
        <Link
          href="/"
          aria-label="Legacy home"
          className="footer-wordmark block font-outfit text-[clamp(3.5rem,18vw,15.143em)] leading-[0.74] font-medium tracking-[-0.104em] text-[#131111] no-underline"
        >
          <span className="footer-wordmark-l">{FOOTER_WORDMARK.slice(0, 1)}</span>
          {FOOTER_WORDMARK.slice(1)}
        </Link>
      </div>

      <nav
        aria-label="Footer"
        className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:mt-0"
      >
        {FOOTER_NAV.map((column, index) => (
          <div
            key={column.title}
            className={`lg:absolute lg:top-0 ${COLUMN_LEFT[index]}`}
          >
            <NavColumn title={column.title} links={column.links} />
          </div>
        ))}
      </nav>

      <div
        className="mt-10 h-px w-full bg-[#131111]/16 lg:absolute lg:right-0 lg:bottom-px lg:left-0 lg:mt-0"
        aria-hidden
      />
    </div>
  )
}

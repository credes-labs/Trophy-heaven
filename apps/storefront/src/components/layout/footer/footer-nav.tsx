import Link from "next/link"

import { FOOTER_NAV } from "./constants"

function NavColumn({
  title,
  links,
}: {
  title: string
  links: readonly { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="m-0 font-outfit text-balance text-[1.25em] leading-[1.4] font-normal tracking-[-0.02em] text-[#131111] uppercase">
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

/** Wordmark fills the space left of the columns. Columns set the row height. */
export function FooterNav() {
  return (
    <div className="mx-auto flex w-full max-w-[85em] flex-col gap-10 px-[clamp(1.25rem,2.78vw,2.5em)] pb-8 lg:flex-row lg:items-end lg:gap-[2.5em] lg:px-0 lg:pb-[5.5em]">
      <div className="min-w-0 lg:mb-[1.75em] lg:flex-1">
        <Link
          href="/"
          aria-label="Trophy Heaven home"
          className="block w-full max-w-[34rem] no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#131111] lg:max-w-none"
        >
          {/* Interim live-text wordmark until the supplied logo files land. */}
          <span
            aria-hidden
            className="block font-serif text-[clamp(3.5rem,11vw,10rem)] leading-[0.9] font-semibold tracking-[-0.03em] text-[#131111]"
          >
            Trophy
            <br />
            Heaven
          </span>
        </Link>
      </div>

      <nav
        aria-label="Footer"
        className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:shrink-0 lg:grid-cols-3 lg:gap-x-[4.75em] lg:pb-[0.35em]"
      >
        {FOOTER_NAV.map((column) => (
          <NavColumn key={column.title} title={column.title} links={column.links} />
        ))}
      </nav>
    </div>
  )
}

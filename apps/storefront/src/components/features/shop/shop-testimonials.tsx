"use client"

import { useState } from "react"
import { SHOP_QUOTES, SHOP_TESTIMONIALS_HEADING } from "./constants"

export function ShopTestimonials() {
  const [offset, setOffset] = useState(0)
  const visible = SHOP_QUOTES.map((_, i) => SHOP_QUOTES[(i + offset) % SHOP_QUOTES.length])

  return (
    <section className="mt-[clamp(3.5rem,8vw,6.5em)]" aria-labelledby="shop-testimonials-heading">
      <h2
        id="shop-testimonials-heading"
        className="m-0 text-center font-outfit text-[clamp(1.75rem,4vw,2.5em)] leading-[1.2] font-normal tracking-[-0.03em] text-[#131111] text-balance"
      >
        {SHOP_TESTIMONIALS_HEADING}
      </h2>

      <div className="relative mt-[2.5em]">
        <button
          type="button"
          aria-label="Previous testimonials"
          onClick={() => setOffset((n) => (n + SHOP_QUOTES.length - 1) % SHOP_QUOTES.length)}
          className="absolute top-1/2 -left-2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent font-outfit text-[1.5em] text-[#6B635C] hover:text-[#131111] md:flex"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next testimonials"
          onClick={() => setOffset((n) => (n + 1) % SHOP_QUOTES.length)}
          className="absolute top-1/2 -right-2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent font-outfit text-[1.5em] text-[#6B635C] hover:text-[#131111] md:flex"
        >
          ›
        </button>

        <ul className="m-0 grid list-none grid-cols-1 gap-[2em] p-0 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((item, i) => (
            <li key={`${item.name}-${i}`}>
              <blockquote className="m-0">
                <p className="m-0 flex size-[1.75em] items-center justify-center rounded-full bg-[#131111] font-outfit text-[0.75em] tracking-[-0.02em] text-[#F2F1EF]">
                  {String(((offset + i) % SHOP_QUOTES.length) + 1)}
                </p>
                <p className="mt-[1em] m-0 font-outfit text-[1em] leading-[1.5] font-light tracking-[-0.02em] text-[rgba(19,17,17,0.7)] text-pretty">
                  {item.quote}
                </p>
                <footer className="mt-[1.25em]">
                  <cite className="not-italic">
                    <span className="block font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase">
                      {item.name}
                    </span>
                    <span className="mt-[0.25em] block font-outfit text-[0.75em] tracking-[-0.01em] text-[#6B635C]">
                      {item.location}
                    </span>
                  </cite>
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

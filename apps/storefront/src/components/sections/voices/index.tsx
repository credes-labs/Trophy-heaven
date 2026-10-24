"use client"

import { useEffect, useState } from "react"
import { SectionEyebrow, SectionShell } from "@/components/sections/_editorial"
import { SHOP_QUOTES } from "@/components/features/shop/constants"

export function VoicesSection() {
  const [index, setIndex] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    if (reduced) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SHOP_QUOTES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [reduced])

  const quote = SHOP_QUOTES[index]

  return (
    <SectionShell id="voices" aria-labelledby="voices-heading">
      <SectionEyebrow>in their words</SectionEyebrow>
      <h2
        id="voices-heading"
        className="mt-[0.75em] m-0 max-w-[16em] font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance"
      >
        What clients say after the ceremony.
      </h2>

      <div className="mt-[clamp(1.75em,3.5vw,3em)] hidden gap-[1.25em] lg:grid lg:grid-cols-2">
        {SHOP_QUOTES.map((item) => (
          <blockquote
            key={item.name}
            className="m-0 border border-[#131111]/10 p-[1.5em]"
          >
            <p className="m-0 font-outfit text-[1.125em] leading-[1.5] tracking-[-0.02em] text-pretty text-[#131111]">
              “{item.quote}”
            </p>
            <footer className="mt-[1.25em] font-outfit text-[0.875em] uppercase tracking-wide text-[#6B635C]">
              {item.name} · {item.location}
            </footer>
          </blockquote>
        ))}
      </div>

      <div className="mt-[clamp(1.75em,3.5vw,3em)] lg:hidden">
        <blockquote className="m-0 border border-[#131111]/10 p-[1.5em]">
          <p className="m-0 font-outfit text-[1.125em] leading-[1.5] tracking-[-0.02em] text-pretty text-[#131111]">
            “{quote.quote}”
          </p>
          <footer className="mt-[1.25em] font-outfit text-[0.875em] uppercase tracking-wide text-[#6B635C]">
            {quote.name} · {quote.location}
          </footer>
        </blockquote>
        <div className="mt-[1em] flex gap-2" role="tablist" aria-label="Testimonials">
          {SHOP_QUOTES.map((item, i) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show testimonial from ${item.name}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-[#131111]" : "bg-[#131111]/25"}`}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  )
}

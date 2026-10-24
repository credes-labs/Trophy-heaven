"use client"

import { useMemo, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EditorialCtaLink, EditorialTextLink, editorialFieldClass } from "@/components/layout/editorial/editorial-cta"
import { cn } from "@/lib/utils"
import type { FaqItem } from "./page"

const fieldClass = cn(
  editorialFieldClass,
  "placeholder:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:!outline-solid"
)

const CATEGORIES = [
  "All",
  "Ordering",
  "Customization",
  "Shipping",
  "Corporate",
  "Returns",
] as const

export function FaqClient({ faqs }: { faqs: FaqItem[] }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return faqs.filter((item) => {
      const catOk = category === "All" || item.category === category
      const textOk =
        q === "" || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      return catOk && textOk
    })
  }, [faqs, category, query])

  return (
    <div className="mt-[clamp(2.5em,5vw,4.5em)] grid grid-cols-1 gap-[3em] lg:grid-cols-12">
      <div className="lg:col-span-8">
        <label htmlFor="faq-search" className="sr-only">
          Search questions
        </label>
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions"
          className={cn(fieldClass, "mt-0")}
        />

        <div className="mt-[1.5em] flex flex-wrap gap-x-[1.5em] gap-y-[0.75em]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] leading-[1.25em] font-normal tracking-[-0.02em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]",
                category === cat
                  ? "text-[#131111] underline underline-offset-[0.2em]"
                  : "text-[#6B635C] hover:text-[#131111]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-[2.5em] font-outfit text-[1.125em] leading-[1.4] text-[#131111]/70">
            Nothing matches. Try another word, or{" "}
            <button
              type="button"
              onClick={() => {
                setCategory("All")
                setQuery("")
              }}
              className="cursor-pointer border-0 bg-transparent p-0 font-outfit uppercase underline underline-offset-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
            >
              clear filters
            </button>
            .
          </p>
        ) : (
          <Accordion type="single" className="mt-[2em] divide-y divide-[#CDCDCD] border-y border-[#CDCDCD]">
            {filtered.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`} className="border-0 px-0">
                <AccordionTrigger className="py-[1.25em] text-left font-outfit text-[1.25em] leading-[1.3] font-normal tracking-[-0.02em] text-[#131111] hover:opacity-70 hover:no-underline [&>svg]:size-[1.75em] [&>svg]:text-[#C2C2C2]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-[68ch] pb-[1.5em] font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-pretty text-[#131111]/70">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <aside className="lg:col-span-4 lg:pt-[0.25em]">
        <p className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-[#131111] uppercase">
          Still looking
        </p>
        <p className="mt-[1em] m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
          The Bangalore studio replies within one business day — briefs, samples, and bulk programs
          included.
        </p>
        <div className="mt-[1.75em] flex flex-col items-start gap-[1.25em]">
          <EditorialCtaLink href="/contact">Write to the studio</EditorialCtaLink>
          <EditorialTextLink href="/corporate">Corporate programs →</EditorialTextLink>
        </div>
      </aside>
    </div>
  )
}

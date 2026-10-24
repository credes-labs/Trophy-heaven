"use client"

import { useMemo, useState } from "react"
import { BULK_TIERS, computeBulkQuote } from "@/lib/pricing"
import { formatMoney } from "@/lib/format"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"
import { cn } from "@/lib/utils"

export function BulkCalculator({ basePrice = 1499 }: { basePrice?: number }) {
  const [qty, setQty] = useState(50)
  const quote = useMemo(() => computeBulkQuote(qty, basePrice), [qty, basePrice])

  return (
    <div className="border-y border-[#CDCDCD] py-[clamp(2em,4vw,3.5em)]">
      <div className="grid grid-cols-1 gap-[3em] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-[#131111] uppercase">
            Estimate
          </p>
          <p className="mt-[0.75em] m-0 max-w-[32em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            Volume discounts apply automatically. Final pricing is confirmed at checkout.
          </p>

          <div className="mt-[2em] flex items-end justify-between gap-4">
            <label htmlFor="bulk-qty" className="font-outfit text-[0.875em] tracking-[-0.02em] uppercase">
              Quantity
            </label>
            <span className="font-outfit text-[2em] leading-none font-light tracking-[-0.04em] text-[#131111] tabular-nums">
              {qty}
            </span>
          </div>
          <input
            id="bulk-qty"
            type="range"
            min={5}
            max={250}
            value={Math.min(qty, 250)}
            onChange={(e) => setQty(Number(e.target.value))}
            className="mt-[1em] h-px w-full cursor-pointer accent-[#131111]"
          />
          <input
            type="number"
            min={1}
            max={1000}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="mt-[1em] h-12 w-28 border-0 border-b border-[#131111]/20 bg-transparent font-outfit text-[1.25em] tracking-[-0.02em] text-[#131111] tabular-nums focus:border-[#131111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] focus-visible:outline-solid"
          />

          <div className="mt-[2em] flex flex-wrap gap-x-[1.75em] gap-y-[0.5em]">
            {BULK_TIERS.map((t) => (
              <p
                key={t.label}
                className={cn(
                  "m-0 font-outfit text-[0.875em] tracking-[-0.02em] uppercase",
                  quote.tierLabel === t.label ? "text-[#131111] underline underline-offset-[0.2em]" : "text-[#6B635C]"
                )}
              >
                {t.label} · {(t.discount * 100).toFixed(0)}%
              </p>
            ))}
          </div>
        </div>

        <dl className="lg:col-span-5">
          <div className="flex justify-between border-b border-[#CDCDCD] py-[0.85em] font-outfit text-[1em] tracking-[-0.02em]">
            <dt className="text-[#131111]/70">Unit</dt>
            <dd className="m-0 tabular-nums">{formatMoney(quote.unitPrice, "inr")}</dd>
          </div>
          <div className="flex justify-between border-b border-[#CDCDCD] py-[0.85em] font-outfit text-[1em] tracking-[-0.02em]">
            <dt className="text-[#131111]/70">Discount</dt>
            <dd className="m-0">{(quote.discount * 100).toFixed(0)}%</dd>
          </div>
          <div className="flex justify-between border-b border-[#CDCDCD] py-[0.85em] font-outfit text-[1em] tracking-[-0.02em]">
            <dt className="text-[#131111]/70">Discounted unit</dt>
            <dd className="m-0 tabular-nums">{formatMoney(quote.discountedUnit, "inr")}</dd>
          </div>
          <div className="flex justify-between py-[1em] font-outfit text-[1.25em] tracking-[-0.02em]">
            <dt>Subtotal ({quote.quantity})</dt>
            <dd className="m-0 tabular-nums">{formatMoney(quote.subtotal, "inr")}</dd>
          </div>
          {quote.savings > 0 ? (
            <p className="m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
              You save {formatMoney(quote.savings, "inr")}
            </p>
          ) : null}
          <div className="mt-[1.75em]">
            <EditorialCtaLink href="/corporate/bulk">Start a bulk order</EditorialCtaLink>
          </div>
        </dl>
      </div>
    </div>
  )
}

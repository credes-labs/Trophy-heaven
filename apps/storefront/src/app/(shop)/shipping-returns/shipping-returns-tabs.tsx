"use client"

import { useState } from "react"
import { EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { cn } from "@/lib/utils"

const TIERS = [
  {
    name: "Standard",
    time: "5–7 business days",
    price: "Free above ₹5,000",
    detail: "Pan-India. Below ₹5,000, a flat courier fee applies at checkout.",
  },
  {
    name: "Express",
    time: "2–3 business days",
    price: "₹299",
    detail: "Priority handling for metro and tier-1 cities when stock is ready to ship.",
  },
  {
    name: "Same-day, Bangalore",
    time: "Same day",
    price: "₹499",
    detail: "Orders placed before 12:00 IST for in-stock items within city limits.",
  },
  {
    name: "White-glove freight",
    time: "By appointment",
    price: "Quoted",
    detail: "Uncrating and placement for large furniture in Bangalore, Mumbai, and Delhi NCR.",
  },
] as const

const STEPS = [
  { n: "01", title: "Request", copy: "Start from your account, or write to hello@legacycrafts.com with the order number." },
  { n: "02", title: "Collect", copy: "We arrange insured pickup where available. Keep the original packaging." },
  { n: "03", title: "Inspect", copy: "The workshop checks the piece, typically within two to three days of arrival." },
  { n: "04", title: "Refund", copy: "Approved refunds return to the original method within 5–7 business days." },
] as const

export function ShippingReturnsTabs() {
  const [tab, setTab] = useState<"shipping" | "returns">("shipping")

  return (
    <div className="mt-[clamp(2.5em,5vw,4em)]">
      <div className="flex flex-wrap gap-x-[2em] gap-y-[0.75em]">
        {(
          [
            ["shipping", "Shipping"],
            ["returns", "Returns & exchanges"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[1em] leading-[1.25em] font-normal tracking-[-0.02em] uppercase",
              tab === id
                ? "text-[#131111] underline underline-offset-[0.25em]"
                : "text-[#6B635C] hover:text-[#131111]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "shipping" ? (
        <div className="mt-[2em] divide-y divide-[#CDCDCD] border-y border-[#CDCDCD]">
          {TIERS.map((tier) => (
            <div key={tier.name} className="grid grid-cols-1 gap-[0.5em] py-[1.5em] sm:grid-cols-12 sm:items-baseline">
              <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-balance text-[#131111] uppercase sm:col-span-4">
                {tier.name}
              </h2>
              <p className="m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#131111]/70 sm:col-span-3">
                {tier.time}
              </p>
              <p className="m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#131111] tabular-nums sm:col-span-2">
                {tier.price}
              </p>
              <p className="m-0 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70 sm:col-span-3">
                {tier.detail}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-[2em]">
          <div className="grid grid-cols-1 gap-[2.5em] border-b border-[#CDCDCD] pb-[2.5em] lg:grid-cols-2">
            <div>
              <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-balance text-[#131111] uppercase">
                7-day window
              </h2>
              <p className="mt-[0.75em] m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
                Non-custom catalog pieces may be returned unused, in original packaging, within seven
                days of delivery.
              </p>
            </div>
            <div>
              <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-balance text-[#131111] uppercase">
                Custom work
              </h2>
              <p className="mt-[0.75em] m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
                Engraved, logoed, or made-to-order pieces are not returnable. Manufacturing defects
                are repaired, replaced, or refunded after inspection.
              </p>
            </div>
          </div>
          <div className="mt-[2.5em] grid grid-cols-1 gap-[2em] sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="m-0 font-outfit text-[2em] leading-none font-light tracking-[-0.04em] text-[#6B635C]">
                  {step.n}
                </p>
                <h3 className="mt-[0.5em] m-0 font-outfit text-[1.125em] font-normal tracking-[-0.02em] text-balance text-[#131111] uppercase">
                  {step.title}
                </h3>
                <p className="mt-[0.5em] m-0 font-outfit text-[0.9375em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-[2.5em]">
        <EditorialTextLink href="/contact">Ask about a shipment →</EditorialTextLink>
      </div>
    </div>
  )
}

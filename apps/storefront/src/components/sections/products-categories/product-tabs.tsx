"use client"

import { motion } from "motion/react"

import { PRODUCT_TABS, type ProductTabId } from "./constants"

type Props = {
  active: ProductTabId
  onChange: (id: ProductTabId) => void
}

export function ProductTabs({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Product collections"
      className="mt-[1.125em] flex flex-wrap items-baseline justify-center gap-x-[0.75em] gap-y-[0.35em]"
    >
      {PRODUCT_TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <span key={tab.id} className="inline-flex items-baseline gap-[0.5em]">
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`product-tab-${tab.id}`}
              className="cursor-pointer border-0 bg-transparent p-0 font-outfit text-[clamp(1.75em,5vw,3.375em)] leading-none font-light tracking-[-0.02em] text-[#131111] uppercase"
              onClick={() => onChange(tab.id)}
            >
              <motion.span
                className={`inline-block text-balance ${isActive ? "text-[#131111]" : "text-[#6B635C]"}`}
                initial={false}
                animate={{ color: isActive ? "#131111" : "#6B635C" }}
                whileHover={{ color: "#131111" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {tab.label}
              </motion.span>
            </button>
            <motion.span
              className={`font-outfit text-[1.5em] leading-[1.25em] font-normal tracking-[-0.02em] uppercase ${isActive ? "text-[#131111]" : "text-[#6B635C]"}`}
              initial={false}
              animate={{ color: isActive ? "#131111" : "#6B635C" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              /{tab.count}/
            </motion.span>
          </span>
        )
      })}
    </div>
  )
}

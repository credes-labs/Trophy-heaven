"use client"

import { useEffect, useState, type RefObject } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"

export function StickyAtc({
  targetRef,
  price,
  currency,
  disabled,
  loading,
  onAdd,
  label = "Add to cart",
}: {
  targetRef: RefObject<HTMLElement | null>
  price: number | null
  currency: string
  disabled?: boolean
  loading?: boolean
  onAdd: () => void
  label?: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = targetRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [targetRef])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="pdp-sticky"
        >
          <div className="mx-auto flex max-w-[90em] items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate font-outfit text-[1em] tracking-[-0.02em] text-[#131111] tabular-nums">
                {price != null ? formatMoney(price, currency) : "—"}
              </p>
            </div>
            <Button
              size="sm"
              className="pdp-atc min-h-0 min-w-0 shrink-0 px-4"
              disabled={disabled}
              loading={loading}
              onClick={onAdd}
            >
              {label}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

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
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tabular-nums">
                {price != null ? formatMoney(price, currency) : "—"}
              </p>
            </div>
            <Button
              variant="trophy"
              size="sm"
              className="shrink-0"
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

"use client"

import { cn } from "@/lib/utils"

const STEPS = [
  { id: "address", label: "Address" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
] as const

export type CheckoutStep = (typeof STEPS)[number]["id"]

export function StepIndicator({
  current,
  className,
}: {
  current: CheckoutStep
  className?: string
}) {
  const currentIdx = STEPS.findIndex((s) => s.id === current)

  return (
    <ol className={cn("checkout-steps", className)} aria-label="Checkout progress">
      {STEPS.map((step, i) => {
        const active = i === currentIdx
        return (
          <li key={step.id} className={cn(active && "is-active")} aria-current={active ? "step" : undefined}>
            <span className="checkout-step-no">{String(i + 1).padStart(2, "0")}</span>
            {step.label}
          </li>
        )
      })}
    </ol>
  )
}

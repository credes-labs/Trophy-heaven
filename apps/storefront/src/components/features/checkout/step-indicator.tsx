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
    <ol className={cn("flex w-full items-center gap-1 sm:gap-2", className)} aria-label="Checkout progress">
      {STEPS.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <li key={step.id} className="flex flex-1 items-center gap-1 sm:gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done && "bg-trophy text-trophy-foreground",
                  active && "bg-trophy text-trophy-foreground ring-2 ring-trophy/30 ring-offset-2 ring-offset-background",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "truncate text-[10px] uppercase tracking-wide sm:text-xs",
                  active ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mb-5 h-px flex-1",
                  i < currentIdx ? "bg-trophy" : "bg-border"
                )}
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

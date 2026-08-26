"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface QuantityStepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  disabled = false,
  className,
  ...props
}: QuantityStepperProps) {
  const atMin = disabled || value <= min
  const atMax = disabled || value >= max

  return (
    <div
      className={cn("inline-flex items-center rounded-md border border-border", className)}
      {...props}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={atMin}
        onClick={() => onChange(Math.max(min, value - step))}
        className="flex h-9 w-9 items-center justify-center text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        −
      </button>
      <span
        className="flex h-9 min-w-[2.5rem] items-center justify-center border-x border-border px-2 text-sm font-medium tabular-nums transition-[transform,opacity] duration-150"
        aria-live="polite"
        key={value}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={atMax}
        onClick={() => onChange(Math.min(max, value + step))}
        className="flex h-9 w-9 items-center justify-center text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        +
      </button>
    </div>
  )
}

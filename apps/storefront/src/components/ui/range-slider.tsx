"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RangeSliderProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  /** Minimum gap between the two thumbs */
  minGap?: number
  formatValue?: (value: number) => string
  ariaLabelMin?: string
  ariaLabelMax?: string
  className?: string
}

/**
 * Dual-handle range slider (shop price filter). Mirrors the visual style of
 * ui/slider.tsx; each thumb is its own focusable slider for keyboard access.
 */
export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  minGap = 0,
  formatValue = (v) => String(v),
  ariaLabelMin = "Minimum value",
  ariaLabelMax = "Maximum value",
  className,
}: RangeSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState<"min" | "max" | null>(null)
  const [lo, hi] = value

  const pct = (v: number) => ((v - min) / (max - min)) * 100

  const valueAt = React.useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min
      const rect = trackRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const stepped = Math.round((min + ratio * (max - min)) / step) * step
      return Math.max(min, Math.min(max, stepped))
    },
    [min, max, step]
  )

  const update = React.useCallback(
    (thumb: "min" | "max", clientX: number) => {
      const v = valueAt(clientX)
      if (thumb === "min") onChange([Math.min(v, hi - minGap), hi])
      else onChange([lo, Math.max(v, lo + minGap)])
    },
    [valueAt, onChange, lo, hi, minGap]
  )

  React.useEffect(() => {
    if (!dragging) return
    const thumb = dragging
    const handleMove = (e: PointerEvent) => update(thumb, e.clientX)
    const handleUp = () => setDragging(null)
    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [dragging, update])

  function onKeyDown(thumb: "min" | "max", e: React.KeyboardEvent) {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowUp"
        ? step
        : e.key === "ArrowLeft" || e.key === "ArrowDown"
          ? -step
          : 0
    if (!delta) return
    e.preventDefault()
    if (thumb === "min") {
      onChange([Math.max(min, Math.min(lo + delta, hi - minGap)), hi])
    } else {
      onChange([lo, Math.min(max, Math.max(hi + delta, lo + minGap))])
    }
  }

  function thumbProps(thumb: "min" | "max", v: number) {
    return {
      role: "slider" as const,
      tabIndex: 0,
      "aria-label": thumb === "min" ? ariaLabelMin : ariaLabelMax,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": v,
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault()
        setDragging(thumb)
        update(thumb, e.clientX)
      },
      onKeyDown: (e: React.KeyboardEvent) => onKeyDown(thumb, e),
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={trackRef}
        className="relative flex h-5 w-full touch-none select-none items-center"
        onPointerDown={(e) => {
          // Clicking the track moves the nearest thumb.
          const v = valueAt(e.clientX)
          const thumb = Math.abs(v - lo) <= Math.abs(v - hi) ? "min" : "max"
          setDragging(thumb)
          update(thumb, e.clientX)
        }}
      >
        <div className="relative h-1.5 w-full rounded-full bg-muted">
          <div
            className="absolute h-full rounded-full bg-primary"
            style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
          />
        </div>
        {(["min", "max"] as const).map((thumb) => {
          const v = thumb === "min" ? lo : hi
          return (
            <div
              key={thumb}
              {...thumbProps(thumb, v)}
              className="absolute -translate-x-1/2 outline-none"
              style={{ left: `${pct(v)}%` }}
            >
              <div className="h-4.5 w-4.5 rounded-full border-2 border-primary bg-card shadow-sm transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary/50" />
              {dragging === thumb && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-0.5 text-xs text-background">
                  {formatValue(v)}
                  <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-foreground" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

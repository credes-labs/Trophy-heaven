"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  showLabels?: boolean
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showLabels = false,
  className,
  ...props
}: SliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const percent = ((value - min) / (max - min)) * 100

  const updateValue = React.useCallback(
    (clientX: number) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const raw = min + ratio * (max - min)
      const stepped = Math.round(raw / step) * step
      onChange(Math.max(min, Math.min(max, stepped)))
    },
    [min, max, step, onChange]
  )

  React.useEffect(() => {
    if (!dragging) return
    const handleMove = (e: PointerEvent) => updateValue(e.clientX)
    const handleUp = () => setDragging(false)
    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)
    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [dragging, updateValue])

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        className="relative flex h-5 w-full touch-none select-none items-center"
        onPointerDown={(e) => {
          setDragging(true)
          updateValue(e.clientX)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(max, value + step))
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(min, value - step))
        }}
      >
        <div className="relative h-1.5 w-full rounded-full bg-muted">
          <div
            className="absolute h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div
          className="absolute -translate-x-1/2"
          style={{ left: `${percent}%` }}
        >
          <div className="h-4.5 w-4.5 rounded-full border-2 border-primary bg-card shadow-sm transition-transform hover:scale-110" />
          {dragging && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-0.5 text-xs text-background">
              {value}
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-foreground" />
            </div>
          )}
        </div>
      </div>
      {showLabels && (
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}

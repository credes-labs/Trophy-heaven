"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TooltipProps {
  content: React.ReactNode
  side?: "top" | "bottom"
  delayMs?: number
  children: React.ReactElement
  className?: string
}

export function Tooltip({ content, side = "top", delayMs = 300, children, className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>(null)

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delayMs)
  }

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            "absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2.5 py-1 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95 duration-150",
            side === "top" && "bottom-full mb-2",
            side === "bottom" && "top-full mt-2",
            className
          )}
        >
          {content}
          <span
            className={cn(
              "absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-foreground",
              side === "top" && "-bottom-1",
              side === "bottom" && "-top-1"
            )}
          />
        </span>
      )}
    </span>
  )
}

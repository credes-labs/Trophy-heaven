"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  openItems: Set<string>
  toggle: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

function useAccordionContext() {
  const ctx = React.useContext(AccordionContext)
  if (!ctx) throw new Error("Accordion compound components must be used within <Accordion>")
  return ctx
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multi"
  defaultValue?: string[]
}

export function Accordion({ type = "single", defaultValue = [], className, children, ...props }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState(() => new Set(defaultValue))

  const toggle = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev)
        if (next.has(value)) {
          next.delete(value)
        } else {
          if (type === "single") next.clear()
          next.add(value)
        }
        return next
      })
    },
    [type]
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn("divide-y divide-border", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItemContext = React.createContext<string>("")

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function AccordionItem({ value, className, ...props }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cn("", className)} {...props} />
    </AccordionItemContext.Provider>
  )
}

export function AccordionTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { openItems, toggle } = useAccordionContext()
  const value = React.useContext(AccordionItemContext)
  const isOpen = openItems.has(value)

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={() => toggle(value)}
      className={cn(
        "flex w-full items-center justify-between py-4 text-sm font-medium transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 [&>svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
      >
        <path d="M3.13 5.567a.45.45 0 01.637 0L7.5 9.3l3.733-3.733a.45.45 0 01.637.637l-4.05 4.05a.45.45 0 01-.637 0l-4.05-4.05a.45.45 0 010-.637z" fill="currentColor" />
      </svg>
    </button>
  )
}

export function AccordionContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { openItems } = useAccordionContext()
  const value = React.useContext(AccordionItemContext)
  const isOpen = openItems.has(value)

  return (
    <div
      role="region"
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-in-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="overflow-hidden">
        <div className={cn("pb-4 text-sm text-muted-foreground", className)} {...props}>
          {children}
        </div>
      </div>
    </div>
  )
}

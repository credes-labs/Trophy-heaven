"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tabsListVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      default: "gap-0 border-b border-border",
      pills: "gap-1 rounded-lg bg-muted p-1",
    },
  },
  defaultVariants: { variant: "default" },
})

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  variant: "default" | "pills"
  registerTab: (value: string, el: HTMLButtonElement | null) => void
  listRef: React.RefObject<HTMLDivElement | null>
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs compound components must be used within <TabsRoot>")
  return ctx
}

export interface TabsRootProps extends VariantProps<typeof tabsListVariants> {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function TabsRoot({ value, onValueChange, variant = "default", className, children }: TabsRootProps) {
  const tabsMap = React.useRef(new Map<string, HTMLButtonElement>())
  const listRef = React.useRef<HTMLDivElement>(null)

  const registerTab = React.useCallback((val: string, el: HTMLButtonElement | null) => {
    if (el) tabsMap.current.set(val, el)
    else tabsMap.current.delete(val)
  }, [])

  return (
    <TabsContext.Provider value={{ value, onValueChange, variant: variant ?? "default", registerTab, listRef }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { variant, listRef } = useTabsContext()
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0 })
  const { value } = useTabsContext()

  React.useEffect(() => {
    if (variant !== "default" || !listRef.current) return
    const activeBtn = listRef.current.querySelector<HTMLElement>('[data-state="active"]')
    if (!activeBtn) return
    const listRect = listRef.current.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()
    setIndicator({ left: btnRect.left - listRect.left, width: btnRect.width })
  }, [value, variant, listRef])

  return (
    <div
      ref={listRef}
      role="tablist"
      className={cn(tabsListVariants({ variant }), "relative", className)}
      {...props}
    >
      {children}
      {variant === "default" && indicator.width > 0 && (
        <span
          className="absolute bottom-0 h-0.5 bg-primary transition-[left,width] duration-200"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </div>
  )
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value: tabValue, className, children, ...props }: TabsTriggerProps) {
  const { value, onValueChange, variant, registerTab } = useTabsContext()
  const isActive = value === tabValue
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    registerTab(tabValue, ref.current)
    return () => registerTab(tabValue, null)
  }, [tabValue, registerTab])

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => onValueChange(tabValue)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "border-b-2 border-transparent text-muted-foreground data-[state=active]:text-foreground",
        variant === "pills" && "rounded-md text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value: tabValue, className, ...props }: TabsContentProps) {
  const { value } = useTabsContext()
  if (value !== tabValue) return null
  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn("mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2", className)}
      {...props}
    />
  )
}

export { tabsListVariants }

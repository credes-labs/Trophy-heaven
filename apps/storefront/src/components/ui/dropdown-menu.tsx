"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) throw new Error("DropdownMenu compound components must be used within <DropdownMenu>")
  return ctx
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-dropdown-menu]")) setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("click", handleClick, true)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("click", handleClick, true)
    }
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" data-dropdown-menu>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useDropdownMenuContext()
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
}

export function DropdownMenuContent({ className, align = "start", children, ...props }: DropdownMenuContentProps) {
  const { open } = useDropdownMenuContext()
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = React.useState(-1)

  React.useEffect(() => {
    if (!open) { setFocusIndex(-1); return }
    const menu = menuRef.current
    if (!menu) return
    const items = menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setFocusIndex((i) => { const next = (i + 1) % items.length; items[next]?.focus(); return next })
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setFocusIndex((i) => { const next = (i - 1 + items.length) % items.length; items[next]?.focus(); return next })
      }
    }
    menu.addEventListener("keydown", handleKeyDown)
    return () => menu.removeEventListener("keydown", handleKeyDown)
  }, [open])

  if (!open) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card p-1 shadow-md animate-in fade-in-0 zoom-in-95 duration-150",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "end" && "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  destructive?: boolean
}

export function DropdownMenuItem({ className, icon, destructive, children, ...props }: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext()
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(e) => {
        props.onClick?.(e)
        setOpen(false)
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-muted hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
        destructive && "text-destructive focus:text-destructive",
        className
      )}
      {...props}
    >
      {icon && <span className="h-4 w-4 shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} role="separator" {...props} />
}

export function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props} />
}

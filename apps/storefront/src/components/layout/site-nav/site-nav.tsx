"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import dynamic from "next/dynamic"
import { SiteCartControl } from "./site-cart-control"
import { HeroWordmark } from "@/components/sections/hero/hero-wordmark"
import { siteNavLinks, type NavCategory, type SiteNavItem } from "./constants"
import { useHoverIntent } from "./use-hover-intent"

export const siteNavItemClass =
  "font-outfit text-[12px] leading-none font-medium tracking-[0.14em] text-white uppercase transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#F2F1EF] lg:text-[13px]"

/** `light` = white type for the dark homepage poster; `ink` = dark type for light inner pages. */
export type SiteNavTone = "light" | "ink"

const siteNavInkItemClass =
  "font-outfit text-[12px] leading-none font-medium tracking-[0.14em] text-[#131111] uppercase transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#131111] lg:text-[13px]"

const inkWordmarkClass = "text-[#131111] focus-visible:outline-[#131111]"

function focusMenuItem(panel: HTMLElement | null, index: number | "next" | "prev") {
  const items = Array.from(panel?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
  if (items.length === 0) return
  const current = items.indexOf(document.activeElement as HTMLElement)
  const target =
    index === "next"
      ? (current + 1) % items.length
      : index === "prev"
        ? (current - 1 + items.length) % items.length
        : (index + items.length) % items.length
  items[target]?.focus()
}

function NavFlyout({
  item,
  open,
  onOpen,
  onClose,
  onPointerEnter,
  onPointerLeave,
  itemClass,
}: {
  item: SiteNavItem
  open: boolean
  onOpen: () => void
  onClose: () => void
  onPointerEnter: () => void
  onPointerLeave: () => void
  itemClass: string
}) {
  const panelId = useId()
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const pointerTypeRef = useRef<string>("mouse")
  const openAtPointerDownRef = useRef(false)
  const pendingFocusRef = useRef<number | null>(null)
  const children = item.children ?? []
  const hasMenu = children.length > 0

  useEffect(() => {
    if (!open || pendingFocusRef.current === null) return
    focusMenuItem(panelRef.current, pendingFocusRef.current)
    pendingFocusRef.current = null
  }, [open])

  const openAndFocus = (index: number) => {
    if (open) {
      focusMenuItem(panelRef.current, index)
      return
    }
    pendingFocusRef.current = index
    onOpen()
  }

  return (
    <li
      className={hasMenu ? "pointer-events-auto relative -mx-2 -my-3 px-2 py-3" : "relative"}
      onPointerEnter={
        hasMenu
          ? (event) => {
              if (event.pointerType === "mouse" || event.pointerType === "pen") onPointerEnter()
            }
          : undefined
      }
      onPointerLeave={
        hasMenu
          ? (event) => {
              if (event.pointerType === "mouse" || event.pointerType === "pen") onPointerLeave()
            }
          : undefined
      }
      onBlur={
        hasMenu
          ? (event) => {
              const next = event.relatedTarget as Node | null
              if (!open || (next && event.currentTarget.contains(next))) return
              onClose()
            }
          : undefined
      }
      onKeyDown={
        hasMenu
          ? (event) => {
              if (event.key === "Escape" && open) {
                event.stopPropagation()
                onClose()
                triggerRef.current?.focus()
              }
            }
          : undefined
      }
    >
      <Link
        ref={triggerRef}
        href={item.href}
        className={itemClass}
        aria-expanded={hasMenu ? (open ? "true" : "false") : undefined}
        aria-controls={hasMenu ? panelId : undefined}
        aria-haspopup={hasMenu ? "true" : undefined}
        onFocus={hasMenu ? onOpen : undefined}
        onPointerDown={(event) => {
          pointerTypeRef.current = event.pointerType
          openAtPointerDownRef.current = open
        }}
        onClick={(event) => {
          if (!hasMenu || pointerTypeRef.current !== "touch" || openAtPointerDownRef.current) return
          event.preventDefault()
          onOpen()
        }}
        onKeyDown={(event) => {
          if (!hasMenu) return
          if (event.key === "ArrowDown") {
            event.preventDefault()
            openAndFocus(0)
          } else if (event.key === "ArrowUp") {
            event.preventDefault()
            openAndFocus(-1)
          }
        }}
      >
        {item.label}
      </Link>
      {hasMenu && open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={item.label}
          className="absolute top-full left-2 z-50 min-w-[16rem]"
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault()
              focusMenuItem(panelRef.current, "next")
            } else if (event.key === "ArrowUp") {
              event.preventDefault()
              focusMenuItem(panelRef.current, "prev")
            } else if (event.key === "Home") {
              event.preventDefault()
              focusMenuItem(panelRef.current, 0)
            } else if (event.key === "End") {
              event.preventDefault()
              focusMenuItem(panelRef.current, -1)
            }
          }}
        >
          <ul className="m-0 list-none border border-[#131111]/10 bg-[#F2F1EF] py-3 shadow-[0_12px_40px_rgba(19,17,17,0.12)]">
            {children.map((child) => (
              <li key={`${child.href}-${child.label}`}>
                <Link
                  href={child.href}
                  role="menuitem"
                  className="block px-5 py-2 font-outfit text-[13px] font-normal tracking-[0.08em] text-[#131111] uppercase transition-colors hover:text-[#6B635C] focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-[#131111]"
                  onClick={onClose}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  )
}

/** Single-row header: wordmark, links, search, and cart. Flyouts still open under each label. */
export function SiteNav({
  categories,
  tone = "light",
}: {
  categories?: NavCategory[]
  tone?: SiteNavTone
}) {
  const links = useMemo(() => siteNavLinks(categories), [categories])
  const { openId, open, close, pointerEnter, pointerLeave } = useHoverIntent()
  const itemClass = tone === "ink" ? siteNavInkItemClass : siteNavItemClass

  useEffect(() => {
    if (!openId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openId, close])

  return (
    <div className="flex items-center justify-between gap-6">
      <HeroWordmark className={tone === "ink" ? inkWordmarkClass : undefined} />
      <nav aria-label="Primary" className="flex items-center gap-5 xl:gap-8">
        <ul className="m-0 flex list-none items-center gap-4 p-0 xl:gap-6">
          {links.map((item) => (
            <NavFlyout
              key={item.id}
              item={item}
              open={openId === item.id}
              onOpen={() => open(item.id)}
              onClose={close}
              onPointerEnter={() => pointerEnter(item.id)}
              onPointerLeave={pointerLeave}
              itemClass={itemClass}
            />
          ))}
        </ul>
        <Link href="/search" aria-label="Search" className={itemClass}>
          SEARCH
        </Link>
        <SiteCartControl className={itemClass} />
      </nav>
    </div>
  )
}

const MobileMenu = dynamic(() => import("./mobile-menu").then((m) => m.MobileMenu), { ssr: false })

export function SiteNavMobile({
  categories,
  tone = "light",
}: {
  categories?: NavCategory[]
  tone?: SiteNavTone
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const links = useMemo(() => siteNavLinks(categories), [categories])
  const close = useCallback(() => setOpen(false), [])
  const controlClass =
    "flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
      triggerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <header
        className={`relative flex items-center justify-between ${tone === "ink" ? "text-[#131111]" : "text-white"}`}
      >
        <HeroWordmark className={tone === "ink" ? inkWordmarkClass : undefined} />
        <div className="flex items-center gap-1">
          <SiteCartControl icon className={controlClass} />
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            className={controlClass}
          >
            <Menu className="size-6" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </header>
      {open ? <MobileMenu id={menuId} links={links} onClose={close} /> : null}
    </>
  )
}

"use client"

import { useEffect, useId, useMemo, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { HeroWordmark } from "@/components/sections/hero/hero-wordmark"
import { siteNavColumns, siteNavLinks, type NavCategory, type SiteNavItem } from "./constants"

export const siteNavItemClass =
  "font-outfit text-[13px] font-normal tracking-[0.08em] text-white uppercase transition-opacity hover:opacity-70 lg:text-[20px] lg:leading-[25px] lg:tracking-[0.04em]"

function SiteCartControl({ className }: { className?: string }) {
  const count = useCartStore((s) => s.itemCount())
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
      className={className}
    >
      CART ({count})
    </button>
  )
}

function NavFlyout({
  item,
  open,
  onOpen,
  onClose,
}: {
  item: SiteNavItem
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const panelId = useId()
  const children = item.children ?? []
  const hasMenu = children.length > 0

  return (
    <li
      className="relative"
      onMouseEnter={hasMenu ? onOpen : undefined}
      onMouseLeave={hasMenu ? onClose : undefined}
    >
      <Link
        href={item.href}
        className={siteNavItemClass}
        aria-expanded={hasMenu ? open : undefined}
        aria-controls={hasMenu ? panelId : undefined}
        aria-haspopup={hasMenu ? "true" : undefined}
        onFocus={hasMenu ? onOpen : undefined}
        onBlur={(event) => {
          if (!hasMenu) return
          const next = event.relatedTarget as Node | null
          if (next && event.currentTarget.parentElement?.contains(next)) return
          onClose()
        }}
      >
        {item.label}
      </Link>
      {hasMenu && open ? (
        <div
          id={panelId}
          role="menu"
          aria-label={item.label}
          className="absolute top-full left-0 z-50 min-w-[16rem] pt-3"
        >
          <ul className="m-0 list-none border border-[#131111]/10 bg-[#F2F1EF] px-5 py-4 shadow-[0_12px_40px_rgba(19,17,17,0.12)]">
            {children.map((child) => (
              <li key={`${child.href}-${child.label}`}>
                <Link
                  href={child.href}
                  role="menuitem"
                  className="block py-1.5 font-outfit text-[13px] font-normal tracking-[0.08em] text-[#131111] uppercase transition-opacity hover:opacity-60"
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

function NavColumns({ categories }: { categories?: NavCategory[] }) {
  const { col1, col2 } = useMemo(() => siteNavColumns(categories), [categories])
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (!openId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openId])

  return (
    <div className="flex gap-12 lg:gap-16">
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {col1.map((item) => (
          <NavFlyout
            key={item.id}
            item={item}
            open={openId === item.id}
            onOpen={() => setOpenId(item.id)}
            onClose={() => setOpenId((current) => (current === item.id ? null : current))}
          />
        ))}
      </ul>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {col2.map((item) => (
          <NavFlyout
            key={item.id}
            item={item}
            open={openId === item.id}
            onOpen={() => setOpenId(item.id)}
            onClose={() => setOpenId((current) => (current === item.id ? null : current))}
          />
        ))}
      </ul>
    </div>
  )
}

/** Homepage-matching nav: wordmark | two columns | search + cart. */
export function SiteNav({ categories }: { categories?: NavCategory[] }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <HeroWordmark />
      <nav aria-label="Primary" className="flex items-start gap-10 lg:gap-16">
        <NavColumns categories={categories} />
        <div className="flex flex-col items-end gap-1">
          <Link href="/search" className={siteNavItemClass}>
            SEARCH
          </Link>
          <SiteCartControl className={siteNavItemClass} />
        </div>
      </nav>
    </div>
  )
}

export function SiteNavMobile({ categories }: { categories?: NavCategory[] }) {
  const [open, setOpen] = useState(false)
  const links = useMemo(() => siteNavLinks(categories), [categories])

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = original
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <>
      <header className="relative z-20 flex items-center justify-between">
        <HeroWordmark />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex size-11 items-center justify-center text-white"
        >
          <Menu className="size-6" strokeWidth={1.5} aria-hidden />
        </button>
      </header>
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-[#1C1612] px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <HeroWordmark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex size-11 items-center justify-center"
              >
                <X className="size-6" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <nav aria-label="Primary" className="mt-8 flex flex-col gap-5 overflow-y-auto">
              {links.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={siteNavItemClass}
                  >
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 ? (
                    <ul className="mt-2 ml-1 list-none p-0">
                      {item.children.map((child) => (
                        <li key={`${item.id}-${child.href}-${child.label}`}>
                          <Link
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="block py-1 font-outfit text-[12px] tracking-[0.08em] text-white/70 uppercase transition-opacity hover:text-white"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
              <Link href="/search" onClick={() => setOpen(false)} className={siteNavItemClass}>
                SEARCH
              </Link>
              <SiteCartControl className={`${siteNavItemClass} text-left`} />
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  )
}

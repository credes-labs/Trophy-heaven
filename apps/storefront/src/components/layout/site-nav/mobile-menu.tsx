"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { ArrowUpRight, ChevronDown, Search, X } from "lucide-react"
import { HeroWordmark } from "@/components/sections/hero/hero-wordmark"
import type { SiteNavItem } from "./constants"
import { SiteCartControl } from "./site-cart-control"

const controlClass =
  "flex size-11 shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBFBF7]"
const linkFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B89E6B]"

/** The native top layer escapes hero isolation and the fixed WebGL canvases. */
export function MobileMenu({
  id,
  links,
  onClose,
}: {
  id: string
  links: SiteNavItem[]
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [expanded, setExpanded] = useState<string | null>("catalog")

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    const desktop = window.matchMedia("(min-width: 1024px)")
    const onResize = () => {
      if (desktop.matches) onClose()
    }
    desktop.addEventListener("change", onResize)
    onResize()
    return () => {
      desktop.removeEventListener("change", onResize)
      dialog?.close()
    }
  }, [onClose])

  return createPortal(
    <dialog
      ref={dialogRef}
      id={id}
      aria-label="Navigation menu"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if ((event.target as Element).closest("a[href]")) onClose()
      }}
      className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none border-0 bg-[#1C1612] p-0 text-[#FBFBF7] backdrop:bg-black/60"
    >
      <div className="mx-auto flex h-full max-w-xl flex-col px-5 sm:px-8">
        <div className="flex shrink-0 items-center justify-between border-b border-white/15 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <HeroWordmark />
          <div className="flex items-center gap-1">
            <SiteCartControl icon onOpen={onClose} className={controlClass} />
            <button
              type="button"
              autoFocus
              onClick={onClose}
              aria-label="Close menu"
              className={controlClass}
            >
              <X className="size-6" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-5 [scrollbar-width:thin]">
          <Link
            href="/search"
            className={`mb-6 flex min-h-12 items-center justify-between border-b border-white/25 pb-3 font-outfit text-sm text-white/70 ${linkFocus}`}
          >
            Search the collection <Search className="size-5" strokeWidth={1.5} aria-hidden />
          </Link>
          <nav aria-label="Primary">
            {links.map((item, index) => {
              const isExpanded = expanded === item.id
              const panelId = `${id}-${item.id}`
              return (
                <div key={item.id} className="border-b border-white/15">
                  <div className="flex min-h-16 items-center gap-3">
                    <span
                      className="w-5 self-center font-outfit text-[10px] tracking-wider text-[#B89E6B]"
                      aria-hidden
                    >
                      0{index + 1}
                    </span>
                    <Link
                      href={item.href}
                      className={`flex min-h-12 flex-1 items-center font-outfit text-[26px] leading-tight font-light tracking-[-0.02em] capitalize ${linkFocus}`}
                    >
                      {item.label.toLowerCase()}
                    </Link>
                    {item.children?.length ? (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.label.toLowerCase()} links`}
                        onClick={() => setExpanded(isExpanded ? null : item.id)}
                        className={controlClass}
                      >
                        <ChevronDown
                          className={`size-5 transition-transform motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`}
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </button>
                    ) : null}
                  </div>
                  {item.children?.length ? (
                    <ul
                      id={panelId}
                      hidden={!isExpanded}
                      className="m-0 grid list-none grid-cols-2 gap-x-4 pb-4 pl-8"
                    >
                      {item.children.map((child) => (
                        <li key={`${child.href}-${child.label}`}>
                          <Link
                            href={child.href}
                            className={`flex min-h-11 items-center py-2 font-outfit text-[13px] leading-5 text-white/75 transition-colors hover:text-white ${linkFocus}`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )
            })}
          </nav>
          <p className="mt-6 mb-1 font-outfit text-xs leading-5 text-white/50">
            Crafted with intention. Built to last.
            <br />
            Bengaluru, India.
          </p>
        </div>

        <div className="shrink-0 border-t border-white/15 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Link
            href="/customize"
            className={`flex min-h-12 items-center justify-between rounded-full bg-white px-5 font-outfit text-xs font-medium tracking-[0.1em] text-[#331207] uppercase ${linkFocus}`}
          >
            Design a trophy <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </dialog>,
    document.body
  )
}

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
const toggleClass =
  "flex size-10 shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBFBF7]"
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
  const [expanded, setExpanded] = useState<string | null>("shop")

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
        <div className="flex shrink-0 items-center justify-between border-b border-white/15 pt-[max(0.375rem,env(safe-area-inset-top))] pb-[clamp(0.25rem,1dvh,0.75rem)]">
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

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain py-[clamp(0.125rem,0.8dvh,0.75rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/search"
            className={`mb-[clamp(0.125rem,0.8dvh,0.75rem)] flex min-h-[clamp(2.25rem,5.4dvh,3rem)] shrink-0 items-center justify-between border-b border-white/25 font-outfit text-[13px] text-white/70 ${linkFocus}`}
          >
            Search the collection <Search className="size-4" strokeWidth={1.5} aria-hidden />
          </Link>
          <nav aria-label="Primary">
            {links.map((item, index) => {
              const isExpanded = expanded === item.id
              const panelId = `${id}-${item.id}`
              return (
                <div key={item.id} className="border-b border-white/15">
                  <div className="flex min-h-[clamp(2.5rem,6.2dvh,3.5rem)] items-center gap-3">
                    <span
                      className="w-5 self-center font-outfit text-[10px] tracking-wider text-[#B89E6B]"
                      aria-hidden
                    >
                      0{index + 1}
                    </span>
                    <Link
                      href={item.href}
                      className={`flex min-h-10 flex-1 items-center font-outfit text-[clamp(1.25rem,2.9dvh,1.5rem)] leading-tight font-light tracking-[-0.02em] capitalize ${linkFocus}`}
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
                        className={toggleClass}
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
                      className="m-0 grid list-none grid-cols-2 gap-x-3 pb-[clamp(0.125rem,0.8dvh,0.625rem)] pl-8"
                    >
                      {item.children.map((child) => (
                        <li key={`${child.href}-${child.label}`}>
                          <Link
                            href={child.href}
                            className={`flex min-h-[clamp(1.75rem,4.1dvh,2.25rem)] items-center font-outfit text-[12.5px] leading-4 text-white/75 transition-colors hover:text-white ${linkFocus}`}
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
          <p className="mt-auto pt-2 font-outfit text-[11px] leading-4 text-white/50 [@media(max-height:760px)]:hidden">
            Crafted with intention. Built to last.
            <br />
            Bengaluru, India.
          </p>
        </div>

        <div className="shrink-0 border-t border-white/15 pt-[clamp(0.375rem,1.1dvh,0.875rem)] pb-[max(clamp(0.375rem,1.3dvh,1rem),env(safe-area-inset-bottom))]">
          <Link
            href="/customize"
            className={`flex min-h-[clamp(2.5rem,5.6dvh,3rem)] items-center justify-between rounded-full bg-white px-5 font-outfit text-xs font-medium tracking-[0.1em] text-[#331207] uppercase ${linkFocus}`}
          >
            Design a trophy <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </dialog>,
    document.body
  )
}

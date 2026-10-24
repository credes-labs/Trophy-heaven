"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { designApi, type DesignRecord } from "@/lib/design-client"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const textBtn =
  "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111] disabled:opacity-50"

type Tab = "all" | "2d" | "3d"

export default function DesignsPage() {
  const [designs, setDesigns] = useState<DesignRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("all")
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { designs: list } = await designApi.list()
        if (!cancelled) setDesigns(list ?? [])
      } catch {
        if (!cancelled) setDesigns([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (tab === "all") return designs
    return designs.filter((d) => d.mode === tab)
  }, [designs, tab])

  async function handleClone(id: string) {
    setBusyId(id)
    try {
      const { design } = await designApi.clone(id)
      setDesigns((prev) => [design, ...prev])
    } catch {
      // ignore
    } finally {
      setBusyId(null)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "2d", label: "2D" },
    { id: "3d", label: "3D" },
  ]

  return (
    <div>
      <header className="relative overflow-hidden">
        <EditorialWatermark>design</EditorialWatermark>
        <div className="flex flex-wrap items-end justify-between gap-[1em]">
          <div>
            <EditorialEyebrow>Account</EditorialEyebrow>
            <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,4vw,3em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
              My designs
              {!loading && designs.length > 0 ? (
                <span className="ml-[0.35em] font-outfit text-[0.55em] font-normal text-[#6B635C] tabular-nums">
                  {designs.length}
                </span>
              ) : null}
            </h1>
            <p className="relative mt-[1em] m-0 max-w-[28em] font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
              Saved 2D and 3D customizations.
            </p>
          </div>
          <Link href="/shop" className={textBtn}>
            New design
          </Link>
        </div>
      </header>

      <div className="mt-[2em] flex flex-wrap gap-x-[1.25em] gap-y-[0.5em]" role="tablist" aria-label="Design modes">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "cursor-pointer border-0 bg-transparent p-0 font-outfit text-[0.875em] tracking-[-0.02em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]",
              tab === item.id
                ? "text-[#131111] underline underline-offset-[0.2em]"
                : "text-[#6B635C] hover:text-[#131111]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-[1.75em] grid gap-[1.5em] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-[0.125em] bg-[#D9D9D9]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-[2em]">
          <p className="m-0 max-w-[28em] font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#6B635C]">
            No designs yet. Open a customizable product and save your work.
          </p>
          <div className="mt-[1.75em]">
            <EditorialCtaLink href="/shop">Browse shop</EditorialCtaLink>
          </div>
        </div>
      ) : (
        <ul className="mt-[1.75em] m-0 grid list-none gap-[1.5em] p-0 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((design) => (
            <li key={design.id}>
              <div className="aspect-[4/3] overflow-hidden rounded-[0.125em] bg-[#D9D9D9]">
                {design.preview_url ? (
                  // Raw <img> used intentionally (dynamic backend URLs; Next/Image domain config not required here).
                  <img src={design.preview_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-outfit text-[0.875em] text-[#6B635C]">
                    No preview
                  </div>
                )}
              </div>
              <p className="mt-[0.75em] m-0 truncate font-outfit text-[1em] tracking-[-0.02em] text-[#131111]">
                {design.name}
              </p>
              <p className="mt-[0.2em] m-0 font-outfit text-[0.75em] tracking-[-0.02em] text-[#6B635C] uppercase">
                {design.mode} · {design.status}
              </p>
              <div className="mt-[0.75em] flex flex-wrap gap-x-[1.25em] gap-y-[0.5em]">
                <Link
                  href={`/customize/${design.product_id}/${design.mode}?design=${design.id}`}
                  className={textBtn}
                >
                  Open
                </Link>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => void handleClone(design.id)}
                  className={textBtn}
                >
                  {busyId === design.id ? "Cloning" : "Clone"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

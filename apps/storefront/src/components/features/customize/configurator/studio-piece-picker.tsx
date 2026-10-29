"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Check } from "lucide-react"
import { CanvasBoundary } from "@/components/sections/products-categories/canvas-boundary"
import { DISCIPLINES } from "@/components/sections/products-categories/constants"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { STUDIO_PIECES, type StudioPieceId } from "@/lib/configurator/studio-pieces"

const CategoryCanvas = dynamic(
  () => import("@/components/sections/products-categories/category-canvas").then((m) => m.CategoryCanvas),
  { ssr: false }
)
const trophies = DISCIPLINES.find((discipline) => discipline.id === "trophies")!

export function StudioPiecePicker({ value }: { value: StudioPieceId }) {
  const root = useRef<HTMLElement>(null)
  const [slots] = useState(() => STUDIO_PIECES.map(() => ({ current: null as HTMLDivElement | null })))
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const onFailure = useCallback(() => {
    setReady(false)
    setFailed(true)
  }, [])
  useEffect(() => {
    if (!root.current) return
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry?.isIntersecting ?? false)
    })
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [])

  return (
    <nav ref={root} aria-label="Trophy designs" data-studio-piece-picker aria-busy={!ready && !failed} className="mb-6">
      <p className="mb-3 font-outfit text-xs font-medium tracking-[0.12em] text-[#6B635C] uppercase">Choose your trophy</p>
      <div className="grid grid-cols-3 gap-2">
        {STUDIO_PIECES.map((piece, index) => (
          <Link
            key={piece.id}
            href={`/customize?piece=${piece.id}`}
            aria-current={piece.id === value ? "page" : undefined}
            aria-label={piece.label}
            className={`group relative min-w-0 rounded-lg border px-1.5 pt-2 pb-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#331207] ${piece.id === value ? "border-[#331207] bg-[#E0D8C3]/30" : "border-[#331207]/15 bg-[#F2F1EF]/60 hover:border-[#331207]/50 hover:bg-[#E0D8C3]/20"}`}
          >
            {piece.id === value && <Check aria-hidden className="absolute top-2 right-2 size-3.5 text-[#331207]" />}
            <div ref={slots[index]} aria-hidden className="pointer-events-none relative mb-2 h-28 lg:h-32">
  
            </div>
            <span className="block truncate text-center font-outfit text-[11px] text-[#331207]">
              {piece.shortLabel}
            </span>
          </Link>
        ))}
      </div>
      {failed && <p role="status" className="mt-2 text-xs text-[#6B635C]">3D previews unavailable.</p>}
      {visible && !failed && (
        <CanvasBoundary onFailure={onFailure}>
          <CategoryCanvas
            layout="desktop"
            slots={slots}
            pieces={trophies.pieces}
            direction={1}
            reduced={reduced}
            running={visible}
            onReady={onReady}
            onFailure={onFailure}
          />
        </CanvasBoundary>
      )}
    </nav>
  )
}

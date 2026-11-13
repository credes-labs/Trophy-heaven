"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { CanvasBoundary } from "@/components/sections/products-categories/canvas-boundary"
import { DISCIPLINES, PRODUCT_LABELS, type DisciplineId } from "@/components/sections/products-categories/constants"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import type { CategoryKey } from "@/lib/category-config"

const CategoryCanvas = dynamic(
  () => import("@/components/sections/products-categories/category-canvas").then((m) => m.CategoryCanvas),
  { ssr: false }
)

const disciplineForCategory: Record<CategoryKey, DisciplineId> = {
  artwork: "sculptures",
  furniture: "tables",
  trophies: "trophies",
}

export function CategoryHeroModels({ category }: { category: CategoryKey }) {
  const discipline = DISCIPLINES.find((item) => item.id === disciplineForCategory[category])!
  const reduced = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const [slots] = useState(() => discipline.pieces.map(() => ({ current: null as HTMLDivElement | null })))
  const [near, setNear] = useState(false)
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
    const preload = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setNear(true)
    }, { rootMargin: "300px 0px" })
    const visibility = new IntersectionObserver(([entry]) => {
      setVisible(entry?.isIntersecting ?? false)
    })
    preload.observe(root.current)
    visibility.observe(root.current)
    return () => {
      preload.disconnect()
      visibility.disconnect()
    }
  }, [])

  return (
    <div ref={root} data-category-hero-models={category} aria-busy={!ready && !failed} className="grid w-full grid-cols-3 items-center gap-2 lg:gap-4">
      {discipline.pieces.map((piece, index) => (
        <div
          key={piece}
          ref={slots[index]}
          role="img"
          aria-label={PRODUCT_LABELS[piece]}
          className="pointer-events-none relative h-[11rem] min-w-0 sm:h-[16rem] lg:h-[22rem]"
        />
      ))}
      {failed && <p role="status" className="col-span-3 text-center text-xs text-[#6B635C]">3D preview unavailable.</p>}
      {near && !failed && (
        <CanvasBoundary onFailure={onFailure}>
          <CategoryCanvas
            layout="desktop"
            slots={slots}
            pieces={discipline.pieces}
            direction={1}
            reduced={reduced}
            running={visible}
            onReady={onReady}
            onFailure={onFailure}
          />
        </CanvasBoundary>
      )}
    </div>
  )
}

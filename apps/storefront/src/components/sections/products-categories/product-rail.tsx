"use client"

import { useEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react"

import type { CatalogProduct } from "./constants"
import { DragBadge } from "./drag-badge"
import { ProductCard } from "./product-card"

type Props = {
  products: CatalogProduct[]
}

export function ProductRail({ products }: Props) {
  const [reduced, setReduced] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const skipClick = useRef(false)
  const draggingRef = useRef(false)
  const x = useMotionValue(0)
  const followX = useMotionValue(0)
  const followY = useMotionValue(0)
  const badgeX = useSpring(followX, { stiffness: 260, damping: 26, mass: 0.55 })
  const badgeY = useSpring(followY, { stiffness: 260, damping: 26, mass: 0.55 })
  const [bound, setBound] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  useEffect(() => {
    const measure = () => {
      const view = viewportRef.current?.offsetWidth ?? 0
      const track = trackRef.current?.scrollWidth ?? 0
      const next = Math.min(0, view - track)
      setBound(next)
      if (x.get() < next) x.set(next)
      if (x.get() > 0) x.set(0)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (viewportRef.current) ro.observe(viewportRef.current)
    if (trackRef.current) ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [products, x])

  useEffect(() => {
    x.set(0)
    followX.set(0)
    followY.set(0)
  }, [products, x, followX, followY])

  const stepOf = () => {
    const first = trackRef.current?.firstElementChild as HTMLElement | undefined
    if (!first || !trackRef.current) return 0
    const style = getComputedStyle(trackRef.current)
    const gap = Number.parseFloat(style.columnGap || style.gap) || 0
    return first.offsetWidth + gap
  }

  const snapTo = (velocity = 0) => {
    const step = stepOf()
    if (step <= 0) return
    const projected = x.get() + velocity * 0.18
    const index = Math.round(projected / step)
    const clamped = Math.max(bound, Math.min(0, index * step))
    animate(x, clamped, {
      type: "spring",
      stiffness: 240,
      damping: 32,
      velocity,
    })
  }

  const nudge = (dir: -1 | 1) => {
    const step = stepOf()
    if (step <= 0 || bound === 0) return
    const next = Math.max(bound, Math.min(0, x.get() - dir * step))
    animate(x, next, { type: "spring", stiffness: 260, damping: 32 })
  }

  const trackPointer = (clientX: number, clientY: number) => {
    if (reduced) return
    const view = viewportRef.current
    if (!view) return
    const rect = view.getBoundingClientRect()
    const em = Number.parseFloat(getComputedStyle(view).fontSize) || 16
    const restX = rect.width / 2
    const restY = 10.0625 * em
    followX.set(clientX - rect.left - restX)
    followY.set(
      Math.max(-4.5 * em, Math.min(4.5 * em, clientY - rect.top - restY)),
    )
  }

  const resetFollow = () => {
    if (draggingRef.current) return
    followX.set(0)
    followY.set(0)
  }

  return (
    <div className="relative mt-[3.25em]">
      <div
        ref={viewportRef}
        className="overflow-hidden max-lg:cursor-grab max-lg:active:cursor-grabbing lg:cursor-none"
        role="region"
        aria-roledescription="carousel"
        aria-label="Product gallery. Drag or use arrow keys to browse."
        tabIndex={0}
        onPointerMove={(e) => trackPointer(e.clientX, e.clientY)}
        onPointerLeave={resetFollow}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault()
            nudge(1)
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault()
            nudge(-1)
          }
        }}
        onClickCapture={(e) => {
          if (!skipClick.current) return
          e.preventDefault()
          e.stopPropagation()
          skipClick.current = false
        }}
      >
        <motion.div
          key={products[0]?.id ?? "rail"}
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            ref={trackRef}
            className="flex touch-none gap-[1.5em] select-none"
            style={{ x }}
            drag={reduced || bound === 0 ? false : "x"}
            dragMomentum={false}
            dragElastic={0.12}
            dragConstraints={{ left: bound, right: 0 }}
            onDragStart={() => {
              skipClick.current = true
              draggingRef.current = true
              setDragging(true)
            }}
            onDrag={(_, info) => trackPointer(info.point.x, info.point.y)}
            onDragEnd={(_, info) => {
              draggingRef.current = false
              setDragging(false)
              snapTo(info.velocity.x)
              window.setTimeout(() => {
                skipClick.current = false
              }, 120)
            }}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                pressed={dragging}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
      {bound < 0 ? (
        <DragBadge
          dragging={dragging}
          x={reduced ? followX : badgeX}
          y={reduced ? followY : badgeY}
          reduced={reduced}
        />
      ) : null}
    </div>
  )
}

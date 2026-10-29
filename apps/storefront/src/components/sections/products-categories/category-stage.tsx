"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { CanvasBoundary } from "./canvas-boundary"

import {
  DISCIPLINES,
  CATEGORY_EYEBROW,
  DEFAULT_DISCIPLINE_ID,
  PRODUCT_LABELS,
  type DisciplineId,
} from "./constants"

const CategoryCanvas = dynamic(() => import("./category-canvas").then((m) => m.CategoryCanvas), {
  ssr: false,
})

type Slots = RefObject<HTMLDivElement | null>[]

function useSlotSets() {
  const sets = useRef<{ desktop: Slots; mobile: Slots } | null>(null)
  if (sets.current === null) {
    const make = () => [0, 1, 2].map(() => ({ current: null }))
    sets.current = { desktop: make(), mobile: make() }
  }
  return sets.current
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])
  return matches
}

export function CategoryStage() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)")
  const desktop = useMediaQuery("(min-width: 1024px)")
  const slotSets = useSlotSets()
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)
  const onReady = useCallback(() => setCanvasReady(true), [])
  const onFailure = useCallback(() => {
    setCanvasReady(false)
    setCanvasFailed(true)
  }, [])
  const stageRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(DEFAULT_DISCIPLINE_ID)
  const [activeId, setActiveId] = useState(DEFAULT_DISCIPLINE_ID)
  const [direction, setDirection] = useState<1 | -1>(1)
  const active = DISCIPLINES.find((c) => c.id === activeId) ?? DISCIPLINES[0]!
  activeRef.current = activeId

  useEffect(() => {
    const root = stageRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const hit = entry?.isIntersecting ?? false
        setVisible(hit)
        if (hit) setNear(true)
      },
      { rootMargin: "300px 0px" }
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const activate = (id: DisciplineId) => {
    if (id === activeRef.current) return
    const prev = DISCIPLINES.findIndex((c) => c.id === activeRef.current)
    const next = DISCIPLINES.findIndex((c) => c.id === id)
    setDirection(next > prev ? 1 : -1)
    activeRef.current = id
    setActiveId(id)
  }

  useEffect(() => {
    const root = stageRef.current
    if (!root) return
    let leftover = 0
    const onWheel = (event: WheelEvent) => {
      leftover += event.deltaY
      const dir = leftover === 0 ? 0 : leftover > 0 ? 1 : -1
      const i = DISCIPLINES.findIndex((c) => c.id === activeRef.current)
      const next = i + dir
      const canStep = dir !== 0 && next >= 0 && next < DISCIPLINES.length

      if (Math.abs(leftover) < 48) {
        if (canStep) event.preventDefault()
        return
      }

      leftover = 0
      if (!canStep) return
      event.preventDefault()
      activate(DISCIPLINES[next]!.id)
    }
    root.addEventListener("wheel", onWheel, { passive: false })
    return () => root.removeEventListener("wheel", onWheel)
  }, [])

  return (
    <div ref={stageRef} className="relative mt-[6.125em] min-h-[35.4em]">
      <p className="m-0 text-center font-outfit text-[1.5em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase">
        {CATEGORY_EYEBROW}
      </p>

      <div className="relative mt-[3em] min-h-[28.5em] overflow-visible">
        {[
          "absolute top-[0.25em] left-0 h-[22.75em] w-[17.25em]",
          "absolute top-[0.25em] right-0 h-[13.75em] w-[10.875em]",
          "absolute top-[14.5em] right-0 h-[13.75em] w-[10.875em]",
        ].map((position, i) => (
          <div
            key={`desktop-${i}`}
            ref={slotSets.desktop[i]}
            role="img"
            aria-label={PRODUCT_LABELS[active.pieces[i]!]}
            className={`pointer-events-none hidden lg:block ${position}`}
          >
            {!canvasReady ? (
              <Image src={active.images[i]!} alt="" fill sizes="25vw" className="object-contain" />
            ) : null}
          </div>
        ))}

        <div className="mb-[2em] flex justify-center gap-[0.75em] lg:hidden">
          {active.pieces.map((piece, i) => (
            <div
              key={`mobile-${i}`}
              ref={slotSets.mobile[i]}
              role="img"
              aria-label={PRODUCT_LABELS[piece]}
              className="pointer-events-none relative h-[8.5em] w-[6.5em]"
            >
              {!canvasReady ? (
                <Image
                  src={active.images[i]!}
                  alt=""
                  fill
                  sizes="30vw"
                  className="object-contain"
                />
              ) : null}
            </div>
          ))}
        </div>

        {near && !canvasFailed ? (
          <CanvasBoundary onFailure={onFailure}>
            <CategoryCanvas
              layout={desktop ? "desktop" : "mobile"}
              slots={desktop ? slotSets.desktop : slotSets.mobile}
              pieces={active.pieces}
              direction={direction}
              reduced={reduced}
              running={visible}
              onReady={onReady}
              onFailure={onFailure}
            />
          </CanvasBoundary>
        ) : null}
        <div
          role="listbox"
          aria-label="Product disciplines. Hover or scroll to preview."
          tabIndex={0}
          className="relative z-10 flex flex-col items-center gap-[2em] py-[1.875em] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault()
              const dir = e.key === "ArrowDown" ? 1 : -1
              const i = DISCIPLINES.findIndex((c) => c.id === activeId)
              const next = (i + dir + DISCIPLINES.length) % DISCIPLINES.length
              activate(DISCIPLINES[next]!.id)
            }
          }}
        >
          {DISCIPLINES.map((category) => {
            const isActive = category.id === activeId
            return (
              <Link
                key={category.id}
                href={category.href}
                role="option"
                aria-selected={isActive}
                className="inline-flex cursor-pointer items-start gap-[0.875em] text-[#131111] no-underline"
                onMouseEnter={() => activate(category.id)}
                onFocus={() => activate(category.id)}
                onClick={(e) => {
                  if (category.id !== activeId) {
                    e.preventDefault()
                    activate(category.id)
                  }
                }}
              >
                <span
                  className={`origin-center font-outfit leading-none font-light tracking-[-0.02em] uppercase text-balance transition-[font-size,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? "text-[2.5em] text-[#131111] sm:text-[3.25em] lg:text-[4.25em]"
                      : "text-[2.25em] text-[#6B635C] hover:text-[#131111] sm:text-[3em] lg:text-[3.5em]"
                  }`}
                >
                  {category.label}
                </span>
                <span
                  className={`mt-[0.15em] font-outfit text-[1.5em] leading-[1.25em] font-normal tracking-[-0.02em] uppercase transition-colors duration-300 ${
                    isActive ? "text-[#131111]" : "text-[#6B635C]"
                  }`}
                >
                  /{category.count}/
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

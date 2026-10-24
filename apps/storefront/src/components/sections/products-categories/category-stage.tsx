"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"

import {
  CATALOG_CATEGORIES,
  CATEGORY_EYEBROW,
  DEFAULT_CATEGORY_ID,
} from "./constants"

const EASE = [0.16, 1, 0.3, 1] as const

type PolaroidProps = {
  frameKey: string
  src: string
  alt: string
  rotate: number
  delay: number
  direction: 1 | -1
  reduceMotion: boolean
  live: boolean
  className: string
}

function Polaroid({
  frameKey,
  src,
  alt,
  rotate,
  delay,
  direction,
  reduceMotion,
  live,
  className,
}: PolaroidProps) {
  const duration = reduceMotion ? 0 : 0.55

  return (
    <div className={className}>
      <div className="relative h-full w-full">
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={frameKey}
          custom={direction}
          variants={{
            enter: (d: 1 | -1) =>
              reduceMotion
                ? { opacity: 1, y: 0, rotate, scale: 1 }
                : {
                    opacity: 0,
                    y: d * 36,
                    rotate: rotate + d * 10,
                    scale: 1.04,
                  },
            rest: { opacity: 1, y: 0, rotate, scale: 1 },
            leave: (d: 1 | -1) =>
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: d * -24,
                    rotate: rotate - d * 8,
                    scale: 1.03,
                  },
          }}
          initial={live ? "enter" : false}
          animate="rest"
          exit="leave"
          transition={{ duration, ease: EASE, delay: reduceMotion ? 0 : delay }}
          className="absolute inset-0 origin-center overflow-hidden rounded-[0.2em] bg-[#D9D9D9] shadow-[0_1.25em_2.5em_rgba(19,17,17,0.12)]"
        >
          <motion.div
            className="absolute inset-0"
            initial={live && !reduceMotion ? { scale: 1.12 } : false}
            animate={{ scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 1.2, ease: EASE, delay }}
          >
            <Image src={src} alt={alt} fill sizes="17.25em" className="object-cover" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  )
}

export function CategoryStage() {
  const [reduced, setReduced] = useState(false)
  const [live, setLive] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(DEFAULT_CATEGORY_ID)
  const [activeId, setActiveId] = useState(DEFAULT_CATEGORY_ID)
  const [direction, setDirection] = useState<1 | -1>(1)
  const active =
    CATALOG_CATEGORIES.find((c) => c.id === activeId) ?? CATALOG_CATEGORIES[2]!

  activeRef.current = activeId

  useEffect(() => {
    setLive(true)
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  const activate = (id: string) => {
    if (id === activeRef.current) return
    const prev = CATALOG_CATEGORIES.findIndex((c) => c.id === activeRef.current)
    const next = CATALOG_CATEGORIES.findIndex((c) => c.id === id)
    setDirection(next > prev ? 1 : -1)
    setActiveId(id)
  }

  useEffect(() => {
    const root = stageRef.current
    if (!root) return
    let leftover = 0
    const onWheel = (event: WheelEvent) => {
      leftover += event.deltaY
      const dir = leftover === 0 ? 0 : leftover > 0 ? 1 : -1
      const i = CATALOG_CATEGORIES.findIndex((c) => c.id === activeRef.current)
      const next = i + dir
      const canStep = dir !== 0 && next >= 0 && next < CATALOG_CATEGORIES.length

      if (Math.abs(leftover) < 48) {
        if (canStep) event.preventDefault()
        return
      }

      leftover = 0
      if (!canStep) return
      event.preventDefault()
      activate(CATALOG_CATEGORIES[next]!.id)
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
        <Polaroid
          frameKey={active.id + "-left"}
          src={active.images[0]}
          alt={active.alts[0]}
          rotate={-12}
          delay={0}
          direction={direction}
          reduceMotion={reduced}
          live={live}
          className="pointer-events-none absolute top-[0.25em] left-0 hidden h-[22.75em] w-[17.25em] lg:block"
        />

        <Polaroid
          frameKey={active.id + "-right-top"}
          src={active.images[1]}
          alt={active.alts[1]}
          rotate={12}
          delay={0.07}
          direction={direction}
          reduceMotion={reduced}
          live={live}
          className="pointer-events-none absolute top-[0.25em] right-0 hidden h-[13.75em] w-[10.875em] lg:block"
        />

        <Polaroid
          frameKey={active.id + "-right-bottom"}
          src={active.images[2]}
          alt={active.alts[2]}
          rotate={12}
          delay={0.14}
          direction={direction}
          reduceMotion={reduced}
          live={live}
          className="pointer-events-none absolute top-[10.4em] right-0 hidden h-[13.75em] w-[10.875em] lg:block"
        />

        <div className="mb-[2em] flex justify-center gap-[0.75em] lg:hidden">
          {active.images.map((src, i) => (
            <Polaroid
              key={`mobile-${i}`}
              frameKey={`${active.id}-m-${i}`}
              src={src}
              alt={active.alts[i]!}
              rotate={i === 0 ? -8 : 8}
              delay={i * 0.06}
              direction={direction}
              reduceMotion={reduced}
          live={live}
              className="relative h-[8.5em] w-[6.5em]"
            />
          ))}
        </div>

        <div
          role="listbox"
          aria-label="Furniture categories. Hover or scroll to preview."
          tabIndex={0}
          className="relative z-10 flex flex-col items-center gap-[2em] py-[1.875em] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault()
              const dir = e.key === "ArrowDown" ? 1 : -1
              const i = CATALOG_CATEGORIES.findIndex((c) => c.id === activeId)
              const next =
                (i + dir + CATALOG_CATEGORIES.length) % CATALOG_CATEGORIES.length
              activate(CATALOG_CATEGORIES[next]!.id)
            }
          }}
        >
          {CATALOG_CATEGORIES.map((category) => {
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
                    isActive ? "text-[4.25em] text-[#131111]" : "text-[3.5em] text-[#6B635C] hover:text-[#131111]"
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

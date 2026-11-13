"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { FOOTER_ORBIT, FOOTER_ORBIT_PERIOD } from "./constants"

const ORBIT_LABEL = `Pieces from the collection: ${[...new Set(FOOTER_ORBIT.map((item) => item.alt))].join("; ")}`

/**
 * Award cutouts revolving on a WebGL ring above the footer links. three.js loads
 * only when the footer nears the viewport; reduced motion and no-WebGL keep
 * the static row.
 */
export function FooterOrbit() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let orbit: Awaited<ReturnType<typeof import("./orbit-scene").mountOrbit>> | null = null
    let cancelled = false
    let visible = false

    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting)
        if (visible) orbit?.start()
        else orbit?.stop()
      },
      { threshold: 0 }
    )

    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        approach.disconnect()
        import("./orbit-scene")
          .then(({ mountOrbit }) => {
            if (cancelled) return
            try {
              orbit = mountOrbit(stage, {
                items: FOOTER_ORBIT,
                period: FOOTER_ORBIT_PERIOD,
                background: "#FFFFFF",
                onReady: () => {
                  if (!cancelled) setReady(true)
                },
              })
              if (visible) orbit.start()
            } catch {
              // WebGL unavailable: the static row stays.
            }
          })
          .catch(() => {})
      },
      { rootMargin: "600px 0px" }
    )

    approach.observe(stage)
    visibility.observe(stage)

    return () => {
      cancelled = true
      approach.disconnect()
      visibility.disconnect()
      orbit?.dispose()
    }
  }, [])

  return (
    <div role="img" aria-label={ORBIT_LABEL} className="relative h-full w-full">
      <ul
        aria-hidden
        className={`absolute inset-0 m-0 flex list-none items-end justify-center gap-[2%] p-0 px-[4%] transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
      >
        {FOOTER_ORBIT.map((item, i) => (
          <li key={`${item.src}-${i}`} className="relative h-[78%] max-w-[18%] flex-1">
            <Image
              src={item.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 15vw, 18vw"
              className="object-contain object-bottom"
            />
          </li>
        ))}
      </ul>
      <div
        ref={stageRef}
        aria-hidden
        className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  )
}

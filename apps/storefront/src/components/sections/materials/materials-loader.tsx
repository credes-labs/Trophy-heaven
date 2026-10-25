"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, type RefObject } from "react"
import { MATERIALS, type MaterialKind } from "./copy"
import { MaterialsList } from "./materials-list"

const MaterialsCanvas = dynamic(
  () => import("./materials-canvas").then((m) => m.MaterialsCanvas),
  { ssr: false },
)

function useSlots() {
  const slots = useRef<RefObject<HTMLDivElement | null>[] | null>(null)
  if (slots.current === null) {
    slots.current = MATERIALS.map(() => ({ current: null }))
  }
  return slots.current
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return reduced
}

/** Names render with the page. The WebGL canvas is a separate client chunk. */
export function MaterialsLoader() {
  const container = useRef<HTMLDivElement>(null)
  const slots = useSlots()
  const [hovered, setHovered] = useState<MaterialKind | null>(null)
  const reduced = useReducedMotion()

  return (
    <div ref={container} className="relative mt-[clamp(1.75em,3.5vw,3em)]">
      <MaterialsList slots={slots} onHoverKind={setHovered} />
      <MaterialsCanvas container={container} slots={slots} hovered={hovered} reduced={reduced} />
    </div>
  )
}

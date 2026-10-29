"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import dynamic from "next/dynamic"
import { RotateCcw, RotateCw, Scan } from "lucide-react"
import { summarizeConfig, type PlaqueConfig } from "@/lib/configurator/plaque"
import { PlaquePreview2D } from "./plaque-preview-2d"
import type { StageView } from "./plaque-scene"

const PlaqueScene = dynamic(() => import("./plaque-scene"), { ssr: false, loading: () => null })

let webglSupport: boolean | null = null
function detectWebGL() {
  if (webglSupport === null) {
    try {
      const canvas = document.createElement("canvas")
      webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
    } catch {
      webglSupport = false
    }
  }
  return webglSupport
}
const noopSubscribe = () => () => {}

const controlClass =
  "flex size-[2.5em] items-center justify-center rounded-full border border-[#131111]/15 bg-[#FBFBF7]/85 text-[#131111] backdrop-blur-sm transition-colors hover:bg-[#FBFBF7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"

/** 3D stage with orbit + keyboard turn controls; shows the flat drawing only when WebGL is unavailable. */
export function PlaqueStage({
  config,
  layoutImage,
  reduced,
}: {
  config: PlaqueConfig
  layoutImage: string | null
  reduced: boolean
}) {
  const webgl = useSyncExternalStore(noopSubscribe, detectWebGL, () => null)
  const [view, setView] = useState<StageView>({ yaw: 0, reset: 0 })
  const [active, setActive] = useState(true)
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = frame.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.05 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const s = summarizeConfig(config)
  const label = `Preview: ${s.form.toLowerCase()} ${s.wood.toLowerCase()} plaque, ${s.finish.toLowerCase()}, ${s.plate.toLowerCase()} ${s.plateShape.toLowerCase()} plate, ${s.mount.toLowerCase()}, ${s.size}.`

  return (
    <div
      ref={frame}
      className="configurator-stage relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#FBFBF7_0%,#F2F1EF_48%,#E6E0D3_100%)]"
    >
      <div role="img" aria-label={label} className="absolute inset-0">
        {webgl ? (
          <PlaqueScene config={config} layoutImage={layoutImage} view={view} reduced={reduced} active={active} />
        ) : null}
        {webgl === false ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center p-[6%]">
            <PlaquePreview2D config={config} layoutImage={layoutImage} className="h-full max-h-[34rem] w-full" />
          </div>
        ) : null}
      </div>

      {webgl === false ? (
        <p className="absolute inset-x-0 bottom-[1.25em] m-0 px-[1.25em] text-center font-outfit text-[0.8125em] text-[#6B635C]">
          3D preview isn&apos;t available on this device — this flat proof updates with every choice.
        </p>
      ) : (
        <div className="absolute inset-x-0 bottom-[1em] flex items-center justify-between gap-3 px-[1em] sm:bottom-[1.25em] sm:px-[1.25em]">
          <p className="m-0 hidden font-outfit text-[0.75em] tracking-[0.08em] text-[#6B635C] uppercase sm:block">
            Drag to turn · scroll to zoom
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className={controlClass}
              aria-label="Turn left"
              onClick={() => setView((v) => ({ ...v, yaw: v.yaw - Math.PI / 4 }))}
            >
              <RotateCcw className="size-[1em]" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              className={controlClass}
              aria-label="Turn right"
              onClick={() => setView((v) => ({ ...v, yaw: v.yaw + Math.PI / 4 }))}
            >
              <RotateCw className="size-[1em]" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              className={controlClass}
              aria-label="Reset view"
              onClick={() => setView((v) => ({ yaw: 0, reset: v.reset + 1 }))}
            >
              <Scan className="size-[1em]" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

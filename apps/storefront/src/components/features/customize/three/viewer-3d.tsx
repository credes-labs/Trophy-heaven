"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, Bounds } from "@react-three/drei"
import { XR, createXRStore } from "@react-three/xr"
import { TrophyModel } from "./trophy-model"
import { LOD_SEGMENTS, type Editor3DValues } from "@/lib/design-3d"
import { useDeviceCapability } from "@/hooks/use-device-capability"

const xrStore = createXRStore()

/** Registers the WebGL renderer + a screenshot fn, and wires context-loss
 * recovery (FR-3D-10) back to the parent. */
function SceneBridge({
  onCapture,
  onContextLost,
  onContextRestored,
}: {
  onCapture: (fn: () => string) => void
  onContextLost: () => void
  onContextRestored: () => void
}) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    onCapture(() => gl.domElement.toDataURL("image/png"))
    const canvas = gl.domElement
    const lost = (e: Event) => {
      e.preventDefault()
      onContextLost()
    }
    canvas.addEventListener("webglcontextlost", lost)
    canvas.addEventListener("webglcontextrestored", onContextRestored)
    return () => {
      canvas.removeEventListener("webglcontextlost", lost)
      canvas.removeEventListener("webglcontextrestored", onContextRestored)
    }
  }, [gl, onCapture, onContextLost, onContextRestored])
  return null
}

export function Viewer3D({
  values,
  onScreenshot,
  fallback,
}: {
  values: Editor3DValues
  onScreenshot?: (dataUrl: string) => void
  fallback?: React.ReactNode
}) {
  const cap = useDeviceCapability()
  const [spin, setSpin] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const [arSupported, setArSupported] = useState(false)
  const captureRef = useRef<(() => string) | null>(null)

  const effectiveLod = values.lod === "auto" ? cap.lod : values.lod
  const segments = LOD_SEGMENTS[effectiveLod === "high" ? "high" : "low"]

  useEffect(() => {
    const xr = (navigator as unknown as { xr?: { isSessionSupported?: (m: string) => Promise<boolean> } }).xr
    xr?.isSessionSupported?.("immersive-ar").then(setArSupported).catch(() => setArSupported(false))
  }, [])

  // WebGL unavailable -> render the 2D fallback so no data is lost (FR-3D-10).
  if (!cap.webgl) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted p-6 text-center">
        <p className="text-sm text-[#6B635C]">
          3D preview isn&apos;t available on this device. Showing the 2D preview instead.
        </p>
        {fallback}
      </div>
    )
  }

  function screenshot() {
    const url = captureRef.current?.()
    if (url) onScreenshot?.(url)
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-gradient-to-b from-neutral-100 to-neutral-200">
        {contextLost && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 text-sm">
            Restoring 3D view…
          </div>
        )}
        <Canvas
          shadows
          dpr={[1, cap.tier === "high" ? 2 : 1.25]}
          camera={{ position: [0, 0.5, 4], fov: 45 }}
          gl={{ preserveDrawingBuffer: true, antialias: cap.tier === "high" }}
        >
          <SceneBridge
            onCapture={(fn) => (captureRef.current = fn)}
            onContextLost={() => setContextLost(true)}
            onContextRestored={() => setContextLost(false)}
          />
          <XR store={xrStore}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 2]} intensity={1.1} castShadow />
            <Suspense fallback={null}>
              <Bounds fit clip observe margin={1.2}>
                <TrophyModel values={values} segments={segments} />
              </Bounds>
              {values.environment === "studio" && <Environment preset="studio" />}
            </Suspense>
            <ContactShadows position={[0, -1.3, 0]} opacity={0.35} blur={2.4} scale={5} />
            <OrbitControls
              enablePan={false}
              autoRotate={spin}
              autoRotateSpeed={3}
              minDistance={2.2}
              maxDistance={7}
            />
          </XR>
        </Canvas>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSpin((s) => !s)}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-[#131111] hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
        >
          {spin ? "Stop spin" : "360° spin"}
        </button>
        <button
          onClick={screenshot}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-[#131111] hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
        >
          Screenshot
        </button>
        {arSupported ? (
          <button
            onClick={() => xrStore.enterAR()}
            className="rounded-md border border-[#131111] px-3 py-1.5 text-sm text-[#131111] hover:bg-[#131111]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#131111]"
          >
            View in AR
          </button>
        ) : (
          <span className="rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-[#6B635C]">
            AR not supported on this device
          </span>
        )}
        <span className="ml-auto self-center text-xs text-[#6B635C]">
          LOD: {effectiveLod} · {cap.tier}-end
        </span>
      </div>
    </div>
  )
}

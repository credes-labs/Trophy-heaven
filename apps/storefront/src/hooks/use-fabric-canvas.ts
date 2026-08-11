"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { Canvas as FabricCanvas } from "fabric"
import { CANVAS_SIZE } from "@/lib/design-2d"

type FabricModule = typeof import("fabric")

/**
 * Lazily loads Fabric.js 7 (never on the server) and binds a `<canvas>` element
 * to a Fabric `Canvas` instance. Exposes the live instance plus the loaded
 * module so callers can construct `IText`/`FabricImage` objects (FR-2D-1).
 */
export function useFabricCanvas() {
  const elRef = useRef<HTMLCanvasElement | null>(null)
  const canvasRef = useRef<FabricCanvas | null>(null)
  const fabricRef = useRef<FabricModule | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let disposed = false
    let instance: FabricCanvas | null = null

    ;(async () => {
      const fabric = await import("fabric")
      if (disposed || !elRef.current) return
      fabricRef.current = fabric
      instance = new fabric.Canvas(elRef.current, {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
        selection: true,
      })
      canvasRef.current = instance
      setReady(true)
    })()

    return () => {
      disposed = true
      instance?.dispose().catch(() => {})
      canvasRef.current = null
      setReady(false)
    }
  }, [])

  const getCanvas = useCallback(() => canvasRef.current, [])
  const getFabric = useCallback(() => fabricRef.current, [])

  return { elRef, getCanvas, getFabric, ready }
}

"use client"

import { useEffect, useState } from "react"

export type DeviceCapability = {
  webgl: boolean
  tier: "high" | "low"
  lod: "high" | "low"
}

/**
 * Detects WebGL availability and a coarse GPU tier so the 3D viewer can pick an
 * appropriate LOD (FR-3D-11) and fall back to 2D when WebGL is unavailable.
 */
export function useDeviceCapability(): DeviceCapability {
  const [cap, setCap] = useState<DeviceCapability>({ webgl: true, tier: "high", lod: "high" })

  useEffect(() => {
    if (typeof window === "undefined") return
    let webgl = false
    let tier: "high" | "low" = "high"
    try {
      const canvas = document.createElement("canvas")
      const gl = (canvas.getContext("webgl2") ||
        canvas.getContext("webgl")) as WebGLRenderingContext | null
      webgl = !!gl
      const cores = navigator.hardwareConcurrency ?? 4
      const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4
      const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      if (mobile || cores <= 4 || mem <= 4) tier = "low"
    } catch {
      webgl = false
    }
    setCap({ webgl, tier, lod: tier })
  }, [])

  return cap
}

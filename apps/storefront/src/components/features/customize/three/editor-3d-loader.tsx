"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { HttpTypes } from "@medusajs/types"
import { designApi, type DesignRecord } from "@/lib/design-client"

// R3F/three touch WebGL + window, so the 3D editor is client-only (ssr:false).
const Editor3D = dynamic(() => import("./editor-3d").then((m) => m.Editor3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-lg border border-border text-muted-foreground">
      Loading the 3D studio…
    </div>
  ),
})

const loadingFallback = (
  <div className="flex h-[600px] items-center justify-center rounded-lg border border-border text-muted-foreground">
    Loading the 3D studio…
  </div>
)

export function Editor3DLoader({
  product,
  initialDesign,
  designId,
}: {
  product: HttpTypes.StoreProduct
  initialDesign?: DesignRecord | null
  /** Saved design to resume (from /account/designs "Open"). Fetched client-side. */
  designId?: string
}) {
  const [design, setDesign] = useState<DesignRecord | null>(initialDesign ?? null)
  const [ready, setReady] = useState(!designId)

  useEffect(() => {
    if (!designId) return
    let cancelled = false
    designApi
      .get(designId)
      .then(({ design: record }) => {
        if (!cancelled) {
          setDesign(record)
          setReady(true)
        }
      })
      .catch(() => {
        // Design missing/inaccessible — open a fresh canvas on this product.
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [designId])

  if (!ready) return loadingFallback
  return <Editor3D product={product} initialDesign={design} />
}

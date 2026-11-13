"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { HttpTypes } from "@medusajs/types"
import { designApi, type DesignRecord } from "@/lib/design-client"

const loadingFallback = (
  <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_50%_42%,#FFFFFF_0%,#F7F7F7_48%,#ECECEC_100%)] font-outfit text-[0.875em] tracking-[0.08em] text-[#6B635C] uppercase">
    Loading the design studio…
  </div>
)

// Fabric.js touches `window`/`document`, so the editor is client-only (ssr:false).
const Editor2D = dynamic(
  () => import("./editor-2d").then((m) => m.Editor2D),
  { ssr: false, loading: () => loadingFallback }
)

export function Editor2DLoader({
  product,
  initialDesign,
  designId,
  preferredVariantId,
}: {
  product: HttpTypes.StoreProduct
  initialDesign?: DesignRecord | null
  /** Saved design to resume (from /account/designs "Open"). Fetched client-side. */
  designId?: string
  preferredVariantId?: string
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
  return <Editor2D product={product} initialDesign={design} preferredVariantId={preferredVariantId} />
}

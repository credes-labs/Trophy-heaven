"use client"

import dynamic from "next/dynamic"
import type { HttpTypes } from "@medusajs/types"
import type { DesignRecord } from "@/lib/design-client"

// Fabric.js touches `window`/`document`, so the editor is client-only (ssr:false).
const Editor2D = dynamic(
  () => import("./editor-2d").then((m) => m.Editor2D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-lg border border-border text-muted-foreground">
        Loading the design studio…
      </div>
    ),
  }
)

export function Editor2DLoader({
  product,
  initialDesign,
}: {
  product: HttpTypes.StoreProduct
  initialDesign?: DesignRecord | null
}) {
  return <Editor2D product={product} initialDesign={initialDesign} />
}

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { HttpTypes } from "@medusajs/types"
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProductReviews } from "@/components/features/catalog/product-reviews"

function SpecRows({ metadata }: { metadata: Record<string, unknown> | null | undefined }) {
  const skip = new Set(["customization_level", "preview_url", "design_id"])
  const entries = Object.entries(metadata ?? {}).filter(
    ([k, v]) => !skip.has(k) && v != null && String(v).length > 0
  )

  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">Specifications will appear here once available.</p>
  }

  return (
    <dl className="divide-y rounded-md border">
      {entries.map(([key, value], i) => (
        <div
          key={key}
          className={`grid grid-cols-2 gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-muted/40" : ""}`}
        >
          <dt className="font-medium capitalize text-muted-foreground">
            {key.replace(/_/g, " ")}
          </dt>
          <dd>{String(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ProductTabs({ product }: { product: HttpTypes.StoreProduct }) {
  const [tab, setTab] = useState("description")

  return (
    <TabsRoot value={tab} onValueChange={setTab} className="mt-12">
      <TabsList className="w-full">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <TabsContent value="description" className="mt-6">
            {product.description ? (
              <div className="prose prose-sm max-w-prose text-muted-foreground">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No description yet.</p>
            )}
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <SpecRows metadata={product.metadata as Record<string, unknown> | null} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </motion.div>
      </AnimatePresence>
    </TabsRoot>
  )
}

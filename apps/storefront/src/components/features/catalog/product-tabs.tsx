"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { HttpTypes } from "@medusajs/types"
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProductReviews } from "@/components/features/catalog/product-reviews"
import "../../../app/(shop)/products/[handle]/pdp.css"

function SpecRows({ metadata }: { metadata: Record<string, unknown> | null | undefined }) {
  const skip = new Set(["customization_level", "preview_url", "design_id"])
  const entries = Object.entries(metadata ?? {}).filter(
    ([k, v]) => !skip.has(k) && v != null && String(v).length > 0
  )

  if (!entries.length) {
    return <p className="pdp-muted">Specifications will appear here once available.</p>
  }

  return (
    <dl className="m-0 divide-y divide-[#131111]/10 border border-[#131111]/10">
      {entries.map(([key, value], i) => (
        <div
          key={key}
          className={`grid grid-cols-2 gap-4 px-[1em] py-[0.85em] font-outfit text-[0.9375em] tracking-[-0.02em] ${i % 2 === 0 ? "bg-[#131111]/[0.03]" : ""}`}
        >
          <dt className="font-normal capitalize text-[#6B635C]">
            {key.replace(/_/g, " ")}
          </dt>
          <dd className="m-0 text-[#131111]">{String(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ProductTabs({ product }: { product: HttpTypes.StoreProduct }) {
  const [tab, setTab] = useState("description")

  useEffect(() => {
    const apply = () => {
      if (window.location.hash === "#reviews") setTab("reviews")
    }
    apply()
    window.addEventListener("hashchange", apply)
    return () => window.removeEventListener("hashchange", apply)
  }, [])

  return (
    <div id="reviews" className="pdp-tabs scroll-mt-[6em]">
      <TabsRoot value={tab} onValueChange={setTab}>
        <div className="pdp-tabs-wash" style={{ backgroundColor: "rgba(19, 17, 17, 0.04)" }}>
          <TabsList className="pdp-tabs-list">
            <TabsTrigger value="description" className="pdp-tab">
              Description
            </TabsTrigger>
            <TabsTrigger value="specs" className="pdp-tab">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="pdp-tab">
              Reviews
            </TabsTrigger>
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="description" className="pdp-tab-body">
              {product.description ? (
                <div className="pdp-prose">
                  <p className="m-0 whitespace-pre-wrap text-pretty">{product.description}</p>
                </div>
              ) : (
                <p className="pdp-muted">No description yet.</p>
              )}
            </TabsContent>

            <TabsContent value="specs" className="pdp-tab-body">
              <SpecRows metadata={product.metadata as Record<string, unknown> | null} />
            </TabsContent>

            <TabsContent value="reviews" className="pdp-tab-body">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </TabsRoot>
    </div>
  )
}

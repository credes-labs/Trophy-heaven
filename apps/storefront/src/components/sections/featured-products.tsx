"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import type { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/features/catalog/product-card"
import { buttonVariants } from "@/components/ui/button"
import { TabsRoot, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CATEGORIES, type CategoryKey } from "@/lib/category-config"
import { fadeUp, staggerContainer, staggerGrid } from "@/lib/animations"
import { cn } from "@/lib/utils"

type TabValue = "all" | CategoryKey

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "trophies", label: CATEGORIES.trophies.label },
  { value: "furniture", label: CATEGORIES.furniture.label },
  { value: "artwork", label: CATEGORIES.artwork.label },
]

function matchesCategory(product: HttpTypes.StoreProduct, key: CategoryKey): boolean {
  const handles = (product.categories ?? []).map((c) => c.handle?.toLowerCase() ?? "")
  const slug = CATEGORIES[key].slug
  return handles.some((h) => h === slug || h.includes(slug))
}

export function FeaturedProducts({ products }: { products: HttpTypes.StoreProduct[] }) {
  const [tab, setTab] = useState<TabValue>("all")

  const filtered =
    tab === "all" ? products : products.filter((p) => matchesCategory(p, tab))

  const display = filtered.length > 0 ? filtered : products

  return (
    <section className="bg-muted/40 py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.div variants={fadeUp}>
            <p className="text-xs font-medium uppercase tracking-widest text-gold-dark">Featured</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Our Collection
            </h2>
          </motion.div>
          <motion.div variants={fadeUp}>
            <TabsRoot value={tab} onValueChange={(v) => setTab(v as TabValue)} variant="pills">
              <TabsList className="flex-wrap">
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </TabsRoot>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={staggerGrid}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            className="mt-8"
          >
            {display.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {display.slice(0, 8).map((product) => (
                  <motion.div key={product.id} variants={fadeUp}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-muted-foreground">
                Catalog is loading. Please check back shortly.
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="mt-10 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link href="/shop" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            View All Products
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

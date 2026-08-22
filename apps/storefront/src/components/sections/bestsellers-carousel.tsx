"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/features/catalog/product-card"
import { buttonVariants } from "@/components/ui/button"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { cn } from "@/lib/utils"

/** Section 7 of the landing spec — horizontal snap carousel of bestsellers. */
export function BestsellersCarousel({ products }: { products: HttpTypes.StoreProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  if (products.length === 0) return null

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>("[data-slide]")
    const step = card ? card.offsetWidth + 24 : 320
    track.scrollBy({ left: direction * step, behavior: "smooth" })
  }

  return (
    <section className="bg-background py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="flex items-end justify-between gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.div variants={fadeUp}>
            <p className="text-xs font-medium uppercase tracking-widest text-gold-dark">Bestsellers</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Most Loved Pieces
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Scroll bestsellers left"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-10 w-10 rounded-full p-0"
              )}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Scroll bestsellers right"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-10 w-10 rounded-full p-0"
              )}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8"
        >
          <div
            ref={trackRef}
            className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div
                key={product.id}
                data-slide
                className="w-[min(75vw,300px)] shrink-0 snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-6 text-center sm:hidden"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }))}>
            View All Products
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

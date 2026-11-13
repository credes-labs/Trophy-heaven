"use client"

import { motion, type Variants } from "motion/react"
import { Hammer, Landmark, Crosshair, Users } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"

const VALUES = [
  {
    icon: Hammer,
    title: "Craftsmanship",
    description: "Every piece handcrafted with intention and skill",
  },
  {
    icon: Landmark,
    title: "Recognition",
    description: "Awards designed to be kept, displayed, and passed on",
  },
  {
    icon: Crosshair,
    title: "Precision",
    description: "Meticulous attention to material, form, and finish",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Working with artisans across India's craft traditions",
  },
]

/**
 * The icons are lucide components (not raw SVG paths), so the spec's
 * "draw-in" is rendered as a gold ring that strokes itself in around each
 * icon while the icon fades up — same effect, no icon regressions.
 */
const ringDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.2, ease: "easeInOut" }, opacity: { duration: 0.2 } },
  },
}

export function BrandValues() {
  return (
    <section className="border-y border-border bg-champagne py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {VALUES.map(({ icon: Icon, title, description }) => (
            <motion.div key={title} variants={fadeUp} className="flex flex-col items-start">
              <span className="relative flex h-16 w-16 items-center justify-center">
                <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full" aria-hidden>
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="text-gold/70"
                    variants={ringDraw}
                  />
                </svg>
                <Icon className="h-9 w-9 text-gold" strokeWidth={1.25} aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 max-w-[200px] text-sm text-muted-foreground">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

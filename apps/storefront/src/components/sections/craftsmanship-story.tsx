"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { buttonVariants } from "@/components/ui/button"
import { fadeUp, slideInRight, staggerContainer } from "@/lib/animations"
import { cn } from "@/lib/utils"
import { BRAND, BRAND_STATS } from "@/lib/brand-facts"

const STATS = BRAND_STATS.map((s) => ({ value: s.value, label: s.caption }))

export function CraftsmanshipStory() {
  return (
    <section className="bg-background py-section">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <motion.div
          className="order-2 lg:order-1"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-widest text-gold-dark"
          >
            Our Story
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl"
          >
            Where Tradition Meets Modern Design
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-base text-muted-foreground">
            Since {BRAND.foundedYear}, {BRAND.name} has partnered with artisans across India to create
            objects of lasting beauty — trophies that celebrate achievement, furniture that anchors
            a home, and artwork that tells a story.
          </motion.p>
          <motion.p variants={fadeUp} className="mt-4 text-base text-muted-foreground">
            Every piece begins with intentional material selection and ends with meticulous
            finishing. We believe craftsmanship is not nostalgia — it is a discipline of care.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 grid grid-cols-3 gap-4 border-y border-border py-6"
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "text-center",
                  i < STATS.length - 1 && "border-r border-border"
                )}
              >
                <p className="font-serif text-2xl font-semibold text-gold-dark sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/about" className={cn(buttonVariants({ variant: "accent" }))}>
              Learn More →
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative order-1 aspect-[4/5] overflow-hidden rounded-xl lg:order-2 lg:aspect-auto lg:min-h-[480px]"
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Image
            src="/images/hero/hero-gallery.webp"
            alt="Legacy Crafts gallery wall of handcrafted trophies, furniture, and artwork in warm light"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-walnut/30 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 border-t-2 border-r-2 border-gold/50"
            aria-hidden
          />
        </motion.div>
      </div>
    </section>
  )
}

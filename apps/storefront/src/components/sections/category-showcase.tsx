"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { CATEGORY_LIST } from "@/lib/category-config"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { cn } from "@/lib/utils"

export function CategoryShowcase() {
  return (
    <section id="categories" className="bg-background py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {CATEGORY_LIST.map((cat) => (
            <motion.div key={cat.slug} variants={fadeUp}>
              <Link
                href={cat.href}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300",
                  "hover:-translate-y-2 hover:shadow-xl",
                  "border-b-4 border-b-trophy"
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={cat.imageSrc}
                    alt={cat.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-walnut/50 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3
                    className={cn(
                      "font-serif text-2xl font-semibold text-foreground transition-colors",
                      "group-hover:text-trophy"
                    )}
                  >
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                  <span
                    className={cn(
                      "mt-2 inline-flex items-center gap-1 text-sm font-medium transition-transform duration-300 group-hover:translate-x-2",
                      cat.textClass
                    )}
                  >
                    Shop Now →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

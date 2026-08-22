"use client"

import type { ReactNode } from "react"
import { motion } from "motion/react"
import { staggerGrid } from "@/lib/animations"
import { cn } from "@/lib/utils"

/** Staggers BlogCard children (each card already uses fadeUp variants). */
export function BlogCardGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={cn(className)}
      variants={staggerGrid}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}

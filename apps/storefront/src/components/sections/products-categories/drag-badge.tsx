"use client"

import { motion, type MotionValue } from "motion/react"

type Props = {
  dragging: boolean
  x: MotionValue<number>
  y: MotionValue<number>
  reduced: boolean
}

export function DragBadge({ dragging, x, y, reduced }: Props) {
  return (
    <div className="pointer-events-none absolute top-[10.0625em] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
      <motion.div
        aria-hidden
        className="flex size-[11.5em] flex-col items-center justify-center rounded-[7em] border-[0.0625em] border-[#F2F1EF] bg-[rgba(177,177,177,0.24)] backdrop-blur-[0.3125em]"
        style={{ x, y }}
        initial={false}
        animate={
          reduced
            ? { scale: 1, opacity: dragging ? 0.25 : 1 }
            : dragging
              ? { scale: 0.78, opacity: 0.45 }
              : { scale: 1, opacity: 1 }
        }
        transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.7 }}
      >
        <p className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#F2F1EF] uppercase">
          drag me
        </p>
        <motion.div
          className="mt-[0.375em] size-[2.5em]"
          animate={reduced || dragging ? { x: 0 } : { x: [-6, 6, -6] }}
          transition={
            reduced || dragging
              ? { duration: 0.2 }
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <svg viewBox="0 0 40 40" className="size-full text-[#F2F1EF]" fill="none">
            <path
              d="M14 10 6 20l8 10M26 10l8 10-8 10"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}

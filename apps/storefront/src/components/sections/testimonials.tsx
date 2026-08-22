"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Star } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { cn } from "@/lib/utils"

const TESTIMONIALS = [
  {
    quote:
      "The custom trophy we commissioned for our annual awards was stunning. Guests still talk about the craftsmanship.",
    name: "Priya Mehta",
    location: "Mumbai",
    rating: 5,
  },
  {
    quote:
      "Our walnut dining table arrived perfectly finished. It feels like a heirloom already — warm, solid, and beautifully made.",
    name: "Arjun Desai",
    location: "Bengaluru",
    rating: 5,
  },
  {
    quote:
      "Legacy Crafts helped us source artwork for our office lobby. The curation was thoughtful and the pieces elevate the space.",
    name: "Sarah Chen",
    location: "Delhi",
    rating: 5,
  },
  {
    quote:
      "Engraving our founder's name on the plaque took minutes online, and the finished piece looked like it came from a museum shop.",
    name: "Rohan Kapoor",
    location: "Pune",
    rating: 5,
  },
  {
    quote:
      "The brass lamps we ordered for our restaurant glow exactly as pictured. Packaging, delivery, finish — all impeccable.",
    name: "Ananya Iyer",
    location: "Chennai",
    rating: 5,
  },
]

const AUTOPLAY_MS = 5000

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <blockquote className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
      <div className="flex gap-0.5" role="img" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-gold text-gold" aria-hidden />
        ))}
      </div>
      <p className="mt-4 font-serif text-lg italic leading-relaxed text-foreground">
        &ldquo;{t.quote}&rdquo;
      </p>
      <footer className="mt-6 flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 font-serif text-sm font-semibold text-walnut"
        >
          {initials(t.name)}
        </span>
        <cite className="not-italic">
          <span className="block text-sm font-medium text-foreground">{t.name}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{t.location}</span>
        </cite>
      </footer>
    </blockquote>
  )
}

export function Testimonials() {
  const [start, setStart] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (paused || reducedMotion) return
    const timer = setInterval(() => {
      setStart((s) => (s + 1) % TESTIMONIALS.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, reducedMotion])

  // Desktop shows a rotating window of three cards; mobile shows the active one.
  const visible = [0, 1, 2].map((i) => TESTIMONIALS[(start + i) % TESTIMONIALS.length])

  return (
    <section className="bg-background py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-widest text-gold-dark"
          >
            Testimonials
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl"
          >
            What Our Clients Say
          </motion.h2>
        </motion.div>

        <motion.div
          role="region"
          aria-label="Customer testimonials"
          aria-live="off"
          tabIndex={0}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="mt-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Mobile: single active card */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={visible[0].name}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <TestimonialCard t={visible[0]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop: rotating window of three */}
          <div className="hidden gap-6 lg:grid lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((t) => (
                <motion.div
                  key={t.name}
                  layout
                  initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <TestimonialCard t={t} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                aria-label={`Show testimonial from ${t.name}`}
                aria-pressed={i === start}
                onClick={() => setStart(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === start ? "w-6 bg-gold" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

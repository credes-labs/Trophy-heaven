"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { ChevronDown } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { fadeUp, staggerContainer } from "@/lib/animations"

const HERO_IMAGES = [
  {
    src: "/images/hero/hero-workshop.png",
    alt: "Craftsman workshop with warm wood and brass tools in low-key atmospheric light",
  },
  {
    src: "/images/hero/hero-living.png",
    alt: "Warm living space furnished with Legacy Crafts handcrafted furniture and decor",
  },
  {
    src: "/images/hero/hero-gallery.png",
    alt: "Gallery wall of handcrafted trophies, furniture, and artwork in warm light",
  },
] as const

const ROTATE_MS = 7000

const HEADLINE = "Crafted to Last."
const HEADLINE_WORDS = HEADLINE.split(" ")

export function HeroSection() {
  const [active, setActive] = useState(0)
  const reducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  // Subtle parallax: the background layer drifts down as the section scrolls out.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % HERO_IMAGES.length)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[80svh] items-end overflow-hidden lg:min-h-[calc(100svh-5.5rem)]"
    >
      {/* Extends above the section so the parallax drift never exposes edges */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 -top-32 h-[calc(100%+8rem)]"
        style={reducedMotion ? undefined : { y: bgY }}
      >
        {HERO_IMAGES.map((image, i) => (
          <motion.div
            key={image.src}
            initial={false}
            animate={{ scale: i === active && !reducedMotion ? 1.08 : 1 }}
            transition={
              i === active
                ? { duration: ROTATE_MS / 1000, ease: "linear" }
                : { duration: 0.6, ease: "easeOut" }
            }
            className={cn(
              "absolute inset-0 transition-opacity duration-[2000ms] ease-out motion-reduce:transition-none",
              i === active ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={image.src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-walnut/90 via-walnut/50 to-walnut/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-walnut/70 via-walnut/30 to-transparent" />
      </motion.div>
      {/* Active image description for assistive tech (layer above is aria-hidden) */}
      <span className="sr-only">{HERO_IMAGES[active].alt}</span>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:pb-28 lg:pt-32">
        <motion.div
          className="max-w-2xl"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-widest text-gold"
          >
            Furniture. Decor &amp; More
          </motion.p>
          <motion.h1
            aria-label={HEADLINE}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
            }}
            className="mt-4 font-serif text-4xl font-semibold leading-[1.05] text-cream sm:text-hero"
          >
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span key={word} aria-hidden variants={fadeUp} className="inline-block">
                {word}
                {i < HEADLINE_WORDS.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-lg text-base text-cream/80 sm:text-lg"
          >
            Premium handcrafted trophies, furniture &amp; artwork — made to honor moments and
            endure generations.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link href="/shop" className={cn(buttonVariants({ variant: "accent", size: "lg" }))}>
              Shop Collection
            </Link>
            <Link
              href="/about"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-cream/40 text-cream hover:bg-cream/10 hover:text-cream"
              )}
            >
              Our Story
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#categories"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-cream/60 transition-colors hover:text-cream"
        aria-label="Scroll to categories"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-7 w-7" strokeWidth={1.5} />
      </motion.a>
    </section>
  )
}

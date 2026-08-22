"use client"

import { useState, type FormEvent } from "react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { subscribeNewsletter } from "@/lib/forms"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      await subscribeNewsletter(email.trim())
      setSubmitted(true)
      setEmail("")
    } catch (err) {
      setError((err as Error).message || "Subscription failed — please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-walnut py-section">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 8c2 4 4 6 8 8-4 2-6 4-8 8-2-4-4-6-8-8 4-2 6-4 8-8zm0 24c1 2 2 3 4 4-2 1-3 2-4 4-1-2-2-3-4-4 2-1 3-2 4-4z' fill='%23C9A84C' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <motion.div
        className="relative mx-auto max-w-lg px-4 text-center sm:px-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
      >
        <motion.h2
          variants={fadeUp}
          className="font-serif text-3xl font-semibold text-cream"
        >
          Stay in the Loop
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 text-base text-cream/70">
          Get early access to new collections, artisan stories, and exclusive offers.
        </motion.p>

        {submitted ? (
          <motion.p
            variants={fadeUp}
            className="mt-8 font-serif text-xl text-gold"
            role="status"
          >
            Thanks! You&apos;re on the list.
          </motion.p>
        ) : (
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-start"
          >
            <div className="flex-1">
              <Input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                className="border-cream/25 bg-walnut-foreground/5 text-cream placeholder:text-cream/40 focus-visible:ring-gold"
              />
            </div>
            <Button type="submit" variant="default" size="lg" className="shrink-0 sm:h-11" loading={busy}>
              Subscribe
            </Button>
          </motion.form>
        )}

        {error && !submitted && (
          <motion.p variants={fadeUp} className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </motion.p>
        )}

        <motion.p variants={fadeUp} className="mt-4 text-xs text-cream/50">
          Join 5,000+ design lovers · Unsubscribe anytime
        </motion.p>
      </motion.div>
    </section>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Instagram, Twitter, Linkedin } from "lucide-react"
import { subscribeNewsletter } from "@/lib/forms"

const SHOP_LINKS = [
  { label: "Trophies", href: "/trophies" },
  { label: "Furniture", href: "/furniture" },
  { label: "Artwork", href: "/artwork" },
  { label: "All Products", href: "/shop" },
  { label: "New Arrivals", href: "/shop?sort=created_at" },
]

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Corporate & Bulk Orders", href: "/account/corporate" },
  { label: "Contact", href: "/contact" },
]

const SUPPORT_LINKS = [
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
]

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  )
}

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      await subscribeNewsletter(email.trim())
      setSubscribed(true)
      setEmail("")
    } catch (err) {
      setError((err as Error).message || "Subscription failed — please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <footer className="bg-walnut pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2" aria-label="Legacy Crafts home">
              <svg
                viewBox="0 0 32 32"
                className="h-8 w-8 text-gold"
                fill="currentColor"
                aria-hidden
              >
                <path d="M16 2C16 2 20 8 20 14C20 18 18 20 16 22C14 20 12 18 12 14C12 8 16 2 16 2Z" />
                <path d="M2 16C2 16 8 12 14 12C18 12 20 14 22 16C20 18 18 20 14 20C8 20 2 16 2 16Z" opacity="0.85" />
                <path d="M16 30C16 30 12 24 12 18C12 14 14 12 16 10C18 12 20 14 20 18C20 24 16 30 16 30Z" opacity="0.7" />
                <path d="M30 16C30 16 24 20 18 20C14 20 12 18 10 16C12 14 14 12 18 12C24 12 30 16 30 16Z" opacity="0.85" />
              </svg>
              <span className="font-serif text-xl font-semibold text-cream">Legacy Crafts</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-walnut-foreground/70">
              Premium handcrafted trophies, bespoke furniture, and curated artwork. Made with
              heritage craftsmanship in India.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com/legacycrafts"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-walnut-foreground/10 text-walnut-foreground/70 transition-colors hover:bg-gold/20 hover:text-gold"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/legacycrafts"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-walnut-foreground/10 text-walnut-foreground/70 transition-colors hover:bg-gold/20 hover:text-gold"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://pinterest.com/legacycrafts"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-walnut-foreground/10 text-walnut-foreground/70 transition-colors hover:bg-gold/20 hover:text-gold"
              >
                <PinterestIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/legacycrafts"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-walnut-foreground/10 text-walnut-foreground/70 transition-colors hover:bg-gold/20 hover:text-gold"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cream">Shop</h3>
            <ul className="mt-4 space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-walnut-foreground/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cream">Company</h3>
            <ul className="mt-4 space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-walnut-foreground/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cream">Support</h3>
            <ul className="mt-4 space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-walnut-foreground/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cream">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-walnut-foreground/70">
              Get updates on new collections, exclusive offers, and craft stories.
            </p>
            {subscribed ? (
              <p className="mt-4 text-sm font-medium text-gold">
                Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="h-10 flex-1 rounded-md border border-walnut-foreground/20 bg-walnut-foreground/5 px-3 text-sm text-cream placeholder:text-walnut-foreground/40 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="h-10 rounded-md bg-gold px-4 text-sm font-medium text-walnut transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    Subscribe
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-xs text-destructive" role="alert">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-walnut-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 md:flex-row">
          <p className="text-xs text-walnut-foreground/70">
            © 2026 Legacy Crafts. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-walnut-foreground/70">We accept</span>
            <div className="flex items-center gap-2 text-walnut-foreground/80">
              <span className="rounded border border-walnut-foreground/40 px-2 py-0.5 text-[10px] font-medium">
                Razorpay
              </span>
              <span className="rounded border border-walnut-foreground/40 px-2 py-0.5 text-[10px] font-medium">
                Visa
              </span>
              <span className="rounded border border-walnut-foreground/40 px-2 py-0.5 text-[10px] font-medium">
                Mastercard
              </span>
              <span className="rounded border border-walnut-foreground/40 px-2 py-0.5 text-[10px] font-medium">
                UPI
              </span>
              <span className="rounded border border-walnut-foreground/40 px-2 py-0.5 text-[10px] font-medium">
                RuPay
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

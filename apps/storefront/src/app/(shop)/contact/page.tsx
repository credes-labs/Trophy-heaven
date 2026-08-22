import type { Metadata } from "next"
import { Mail, MapPin, Phone, Clock } from "lucide-react"
import { ContactForm } from "@/components/features/contact/contact-form"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Legacy Crafts in Bangalore for custom trophies, bulk awards, furniture, and order support.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">Contact</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
          Get in touch
        </h1>
        <p className="mt-4 text-muted-foreground">
          Tell us about a brief, an order, or a visit to the workshop. We typically reply within one
          business day.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        <aside className="space-y-8 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">Studio</h2>
            <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <span>
                  Legacy Crafts Studio
                  <br />
                  Indiranagar, Bangalore 560038
                  <br />
                  Karnataka, India
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <a href="mailto:hello@legacycrafts.com" className="hover:text-foreground">
                  hello@legacycrafts.com
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <a href="tel:+918012345678" className="hover:text-foreground">
                  +91 80 1234 5678
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <span>Mon–Sat, 10:00–18:00 IST</span>
              </li>
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <iframe
              title="Legacy Crafts Bangalore location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.6408!3d12.9784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzQyLjIiTiA3N8KwMzgnMjYuOSJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="h-56 w-full border-0 grayscale-[20%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

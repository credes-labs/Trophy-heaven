import type { Metadata } from "next"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about orders, customization, shipping, returns, and payments at Legacy Crafts.",
  alternates: { canonical: "/faq" },
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I place an order?",
    a: "Browse the shop, add items to your cart, and checkout with Razorpay (cards, UPI, netbanking). For bulk corporate awards, use the Corporate Bulk Order flow.",
  },
  {
    q: "Can I customize trophies with names or logos?",
    a: "Yes. Most trophies support engraving and logo placement. Open the product page and choose Customize, or contact us for large runs with artwork approval.",
  },
  {
    q: "What is the minimum for bulk / corporate orders?",
    a: "Bulk tooling typically starts at 25 units, though smaller custom runs are possible depending on design. Our team will confirm MOQ after reviewing your brief.",
  },
  {
    q: "How long does production take?",
    a: "In-stock pieces usually ship within 2–4 business days. Custom engraving adds 3–7 days. Large bespoke runs can take 2–4 weeks — we share a timeline in your quote.",
  },
  {
    q: "Where do you ship?",
    a: "We ship across India. Metro cities typically receive Standard delivery in 5–7 days. Express and Bangalore same-day options are available at checkout when eligible.",
  },
  {
    q: "Is shipping free?",
    a: "Standard shipping is free on orders above ₹5,000. Below that, a flat shipping fee applies. Express and same-day are charged separately.",
  },
  {
    q: "What is your returns policy?",
    a: "Non-custom items may be returned within 7 days if unused and in original packaging. Custom engraved or made-to-order pieces are non-returnable except for manufacturing defects.",
  },
  {
    q: "How do refunds work?",
    a: "Once we receive and inspect a return, refunds are initiated within 5–7 business days to the original payment method.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, Visa, Mastercard, RuPay, and netbanking via Razorpay. Corporate accounts may request net-30 or prepaid invoicing after verification.",
  },
  {
    q: "Do you provide GST invoices?",
    a: "Yes. Enter your GSTIN at checkout or on your corporate profile. Invoices are emailed with the order confirmation.",
  },
  {
    q: "Can I see a sample before a large order?",
    a: "For custom bulk awards we often produce a physical or digital sample for sign-off before full production. Sample costs may apply and are credited on confirmed runs.",
  },
  {
    q: "How do I track my order?",
    a: "You will receive a confirmation email with tracking once the shipment is handed to the courier. You can also view order status in your account.",
  },
]

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">Support</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-muted-foreground">
          Orders, customization, shipping, returns, and payments — answered briefly.
        </p>
      </header>

      <Accordion type="single" className="mt-12">
        {FAQS.map((item, i) => (
          <AccordionItem key={item.q} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-medium text-foreground">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="leading-relaxed">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-14 rounded-xl border border-border bg-muted/40 p-8 text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Still have questions?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Our Bangalore team is happy to help with briefs, samples, and corporate programs.
        </p>
        <Link href="/contact" className={cn(buttonVariants({ className: "mt-6" }))}>
          Contact us
        </Link>
      </div>
    </div>
  )
}

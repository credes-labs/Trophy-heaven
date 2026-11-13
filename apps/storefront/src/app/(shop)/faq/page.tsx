import type { Metadata } from "next"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { FaqClient } from "./faq-client"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about orders, customization, shipping, returns, and payments at Trophy Heaven.",
  alternates: { canonical: "/faq" },
}

export type FaqItem = { q: string; a: string; category: string }

const FAQS: FaqItem[] = [
  {
    category: "Ordering",
    q: "How do I place an order?",
    a: "Browse the shop, add items to your cart, and checkout with Razorpay (cards, UPI, netbanking). For bulk corporate awards, use the Corporate flow.",
  },
  {
    category: "Ordering",
    q: "What payment methods do you accept?",
    a: "UPI, Visa, Mastercard, RuPay, and netbanking via Razorpay. Verified corporate accounts may request net-30 or prepaid invoicing.",
  },
  {
    category: "Ordering",
    q: "Do you provide GST invoices?",
    a: "Yes. Enter your GSTIN at checkout or on your corporate profile. Invoices are emailed with the order confirmation.",
  },
  {
    category: "Customization",
    q: "Can I customize trophies with names or logos?",
    a: "Most trophies support engraving and logo placement. Open the product page and choose Customize, or contact us for large runs with artwork approval.",
  },
  {
    category: "Customization",
    q: "Can I see a sample before a large order?",
    a: "For custom bulk awards we often produce a physical or digital sample for sign-off. Sample costs may apply and are credited on confirmed runs.",
  },
  {
    category: "Shipping",
    q: "How long does production take?",
    a: "In-stock pieces usually ship within 2–4 business days. Custom engraving adds 3–7 days. Large bespoke runs can take 2–4 weeks.",
  },
  {
    category: "Shipping",
    q: "Where do you ship?",
    a: "Across India. Metro cities typically receive Standard delivery in 5–7 days. Express and Bangalore same-day are available at checkout when eligible.",
  },
  {
    category: "Shipping",
    q: "Is shipping free?",
    a: "Standard shipping is free on orders above ₹5,000. Below that, a flat fee applies. Express and same-day are charged separately.",
  },
  {
    category: "Corporate",
    q: "What is the minimum for bulk orders?",
    a: "Volume pricing typically starts at 10 units, with larger breaks at 25, 50, and 100. Our team confirms MOQ after reviewing your brief.",
  },
  {
    category: "Corporate",
    q: "Can you ship to many addresses?",
    a: "Yes. Individually boxed awards can be dispatched to different cities from a single roster upload.",
  },
  {
    category: "Returns",
    q: "What is your returns policy?",
    a: "Non-custom items may be returned within 7 days if unused and in original packaging. Custom engraved pieces are non-returnable except for manufacturing defects.",
  },
  {
    category: "Returns",
    q: "How do refunds work?",
    a: "Once we receive and inspect a return, refunds are initiated within 5–7 business days to the original payment method.",
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
    <EditorialShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <EditorialFrame>
        <div className="relative max-w-[36em]">
          <EditorialWatermark>ask</EditorialWatermark>
          <EditorialEyebrow>Support</EditorialEyebrow>
          <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
            Questions, answered plainly
          </h1>
          <p className="mt-[1.25em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            Orders, customization, shipping, returns, and corporate programs.
          </p>
        </div>
        <FaqClient faqs={FAQS} />
      </EditorialFrame>
    </EditorialShell>
  )
}

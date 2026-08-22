import type { Metadata } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for shopping and using Legacy Crafts online.",
  alternates: { canonical: "/terms" },
}

// NOTE: brand-voiced final copy, but not a substitute for legal advice —
// have counsel review before production launch.
const SECTIONS = [
  {
    title: "Agreement",
    body: "These Terms of Service govern your use of legacycrafts.com and any purchase you make from Legacy Crafts. By browsing the site or placing an order, you agree to these Terms and to our Privacy Policy. If you do not agree, please do not use the site. We may update these Terms from time to time; the version posted at the time of your order applies to that order, and continued use of the site after changes are posted constitutes acceptance.",
  },
  {
    title: "Products & pricing",
    body: "Every Legacy Crafts piece is handcrafted, so grain, tone, finish, and dimensions may vary slightly from photographs — this is part of the character of handmade work, not a defect. Prices are listed in Indian Rupees and are inclusive of applicable GST unless stated otherwise. A GST invoice is issued with every order; enter your GSTIN at checkout or on your corporate profile to have it reflected. We reserve the right to correct pricing errors and to cancel orders placed at an incorrect price, with a full refund.",
  },
  {
    title: "Orders & customization",
    body: "Your order is an offer to purchase; it is accepted when we send an order confirmation. Custom engraving, logo work, and made-to-order pieces enter production only after you approve the final artwork or proof. You are responsible for the accuracy of names, dates, spelling, and artwork you provide, and for ensuring you have the rights to any logos or designs you submit. Once production begins on a custom piece, it cannot be changed or cancelled.",
  },
  {
    title: "Payment",
    body: "Payment is processed securely via Razorpay (cards, UPI, and netbanking) or under approved corporate credit terms agreed in writing. Orders are produced and dispatched only after payment authorization. Fraudulent, unauthorized, or chargeback-disputed transactions may result in order cancellation, account restriction, and, where appropriate, referral to authorities.",
  },
  {
    title: "Shipping & delivery",
    body: "We ship across India. Estimated timelines are shown at checkout and on your order confirmation; they are estimates, not guarantees, and custom pieces may take longer. Standard shipping is free on orders above ₹5,000. Risk of loss passes to you on delivery to the address you provided. Please inspect shipments on arrival and report transit damage within 48 hours with photographs so we can make it right.",
  },
  {
    title: "Returns & cancellations",
    body: "Non-custom items may be returned within 7 days of delivery if unused and in their original packaging; refunds are initiated to the original payment method within 5–7 business days of our receiving and inspecting the return. Custom engraved, personalized, and made-to-order pieces are non-returnable and non-refundable except in the case of a manufacturing defect or an error on our part, which we will repair, replace, or refund at our discretion.",
  },
  {
    title: "Intellectual property",
    body: "All site content, product designs, photography, illustrations, and branding are the property of Legacy Crafts or its licensors and are protected by Indian and international intellectual property law. You may not reproduce, redistribute, or create derivative works from them without our written permission. Logos and artwork you supply remain yours; by submitting them, you confirm you own or are licensed to use them and grant us a limited license to reproduce them solely to fulfill your order. Custom designs we originate for you remain our intellectual property unless a separate written agreement states otherwise.",
  },
  {
    title: "Limitation of liability",
    body: "To the fullest extent permitted by law, Legacy Crafts is not liable for indirect, incidental, or consequential damages — including lost profits or lost data — arising from use of the site or our products. Our aggregate liability for any claim related to an order is limited to the amount you paid for that order. Nothing in these Terms excludes liability that cannot be excluded under applicable law, including under the Consumer Protection Act, 2019.",
  },
  {
    title: "Governing law",
    body: "These Terms are governed by the laws of India. Any dispute arising out of or relating to these Terms or your use of the site is subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.",
  },
]

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">Legal</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 15 August 2026</p>
        <p className="mt-4 text-muted-foreground">
          The fine print, written plainly — how ordering, customization, shipping, and returns work
          at Legacy Crafts.
        </p>
      </header>

      <Accordion type="single" defaultValue={["terms-0"]} className="mt-10">
        {SECTIONS.map((section, i) => (
          <AccordionItem key={section.title} value={`terms-${i}`}>
            <AccordionTrigger className="text-left font-medium">{section.title}</AccordionTrigger>
            <AccordionContent className="leading-relaxed">{section.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

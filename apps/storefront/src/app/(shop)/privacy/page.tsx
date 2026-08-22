import type { Metadata } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Legacy Crafts collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
}

// NOTE: brand-voiced final copy, but not a substitute for legal advice —
// have counsel review against the DPDP Act 2023 before production launch.
const SECTIONS = [
  {
    title: "Information we collect",
    body: "We collect the details you give us when you shop with Legacy Crafts: your name, email address, phone number, shipping and billing addresses, and order history. If you use our customization studio, we also store the designs, artwork, and engraving text you upload or create. When you contact us, we keep those messages so we can help you. Payment card and UPI details are processed directly by Razorpay, our payment partner — we never see or store your full card number on our servers.",
  },
  {
    title: "How we use information",
    body: "We use your information to process and deliver orders, produce GST invoices, provide customer support, and send transactional updates about your orders by email and SMS. With your consent, we may also send you stories, product launches, and offers from The Legacy Journal — every marketing message includes an unsubscribe link. We use aggregated, de-identified browsing data to understand how the store is used and to improve it. We do not sell your personal information to anyone.",
  },
  {
    title: "Cookies & analytics",
    body: "We use essential cookies to keep your cart, session, and sign-in working. Where analytics cookies are enabled, they help us understand traffic patterns and improve the storefront; these are used in aggregate and not to profile you for third-party advertising. You can control or delete non-essential cookies through your browser settings — the store will continue to work with only essential cookies.",
  },
  {
    title: "Payments",
    body: "Online payments are processed by Razorpay over an encrypted connection. Razorpay handles your card, UPI, and netbanking credentials under its own PCI-DSS-compliant privacy practices. We receive only a payment confirmation, the amount, and the last few details needed to reconcile your order and issue refunds to the original payment method.",
  },
  {
    title: "Sharing",
    body: "We share personal data only with the service providers who help us operate: payment processing (Razorpay), courier and logistics partners (to deliver your order), email and messaging providers, and our accounting stack for GST invoicing and statutory filings. These providers may process data only on our instructions and for the services they provide to us. We may also disclose information where required by law, regulation, or a valid legal process.",
  },
  {
    title: "Retention & security",
    body: "Order and invoice records are retained for the periods required under Indian tax and company law; account and design data is kept while your account is active. We apply reasonable technical and organizational measures — encryption in transit, access controls, and least-privilege access — to protect personal data. No method of transmission or storage is completely secure, but we work hard to protect your information and will notify you of any breach that affects you, as required by law.",
  },
  {
    title: "Your rights",
    body: "Under the Digital Personal Data Protection Act, 2023 and other applicable law, you may request access to, correction of, or erasure of your personal data, and you may withdraw consent for marketing at any time. To exercise these rights, write to privacy@legacycrafts.com or hello@legacycrafts.com. We will respond within a reasonable period and always within the timelines required by law.",
  },
  {
    title: "Contact & grievance",
    body: "Legacy Crafts, Indiranagar, Bangalore 560038, India. Email: hello@legacycrafts.com. Phone: +91 80 1234 5678. If you have a concern about how your data is handled, please write to us first — our grievance officer will acknowledge your concern and work with you to resolve it.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">Legal</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: 15 August 2026</p>
        <p className="mt-4 text-muted-foreground">
          Your trust matters to us. This policy explains what we collect, why, and the choices you
          have — in plain language.
        </p>
      </header>

      <Accordion type="single" defaultValue={["privacy-0"]} className="mt-10">
        {SECTIONS.map((section, i) => (
          <AccordionItem key={section.title} value={`privacy-${i}`}>
            <AccordionTrigger className="text-left font-medium">{section.title}</AccordionTrigger>
            <AccordionContent className="leading-relaxed">{section.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

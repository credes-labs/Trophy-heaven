import type { Metadata } from "next"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Trophy Heaven collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
}

const SECTIONS = [
  {
    id: "collection",
    title: "Information we collect",
    body: "We collect the details you give us when you shop: name, email, phone, shipping and billing addresses, and order history. Customization stores designs, artwork, and engraving text you create. Payment card and UPI details are processed by Razorpay — we never store your full card number.",
  },
  {
    id: "use",
    title: "How we use information",
    body: "We use your information to process and deliver orders, produce GST invoices, provide support, and send transactional updates. With your consent we may send The Legacy Journal — every marketing message includes an unsubscribe link. We do not sell personal information.",
  },
  {
    id: "cookies",
    title: "Cookies & analytics",
    body: "Essential cookies keep your cart, session, and sign-in working. Analytics, where enabled, are used in aggregate. You can control non-essential cookies in the browser — the store works with essential cookies only.",
  },
  {
    id: "payments",
    title: "Payments",
    body: "Online payments are processed by Razorpay over an encrypted connection. We receive a confirmation, the amount, and the details needed to reconcile your order and issue refunds.",
  },
  {
    id: "sharing",
    title: "Sharing",
    body: "We share data only with providers who operate the store: Razorpay, couriers, email, and accounting for GST. We may also disclose information where required by law.",
  },
  {
    id: "retention",
    title: "Retention & security",
    body: "Order and invoice records are kept for the periods required under Indian tax law. Account and design data is kept while your account is active. Encryption in transit and access controls apply; no method of storage is perfectly secure.",
  },
  {
    id: "rights",
    title: "Your rights",
    body: "Under the Digital Personal Data Protection Act, 2023 you may request access, correction, or erasure, and withdraw marketing consent. Write to privacy@trophyheaven.com or hello@trophyheaven.com.",
  },
  {
    id: "contact",
    title: "Contact & grievance",
    body: "Trophy Heaven, Indiranagar, Bangalore 560038, India. Email: hello@trophyheaven.com. Phone: +91 80 1234 5678.",
  },
] as const

export default function PrivacyPage() {
  return (
    <EditorialShell>
      <EditorialFrame>
        <div className="relative max-w-[40em]">
          <EditorialWatermark>legal</EditorialWatermark>
          <EditorialEyebrow>Privacy</EditorialEyebrow>
          <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
            Privacy policy
          </h1>
          <p className="mt-[1em] m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#6B635C] uppercase">
            Last updated 15 August 2026
          </p>
          <p className="mt-[1.25em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            What we collect, why, and the choices you have — in plain language.
          </p>
        </div>

        <div className="mt-[clamp(2.5em,5vw,4.5em)] grid grid-cols-1 gap-[4em] lg:grid-cols-12">
          <div className="divide-y divide-[#CDCDCD] border-y border-[#CDCDCD] lg:col-span-8">
            {SECTIONS.map((section, i) => (
              <article key={section.id} id={section.id} className="scroll-mt-28 py-[2em]">
                <h2 className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-balance text-[#131111] uppercase">
                  {String(i + 1).padStart(2, "0")} / {section.title}
                </h2>
                <p className="mt-[0.75em] m-0 max-w-[68ch] font-outfit text-[1em] leading-[1.6] tracking-[-0.02em] text-pretty text-[#131111]/70">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
          <aside className="lg:col-span-4">
            <nav aria-label="On this page" className="lg:sticky lg:top-28">
              <p className="m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#131111] uppercase">
                Contents
              </p>
              <ul className="mt-[1em] flex flex-col gap-[0.75em]">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="font-outfit text-[1em] leading-[1.4] tracking-[-0.01em] text-[#131111]/70 no-underline hover:text-[#131111]"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-[2em]">
                <EditorialTextLink href="/terms">Terms of service →</EditorialTextLink>
              </div>
            </nav>
          </aside>
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}

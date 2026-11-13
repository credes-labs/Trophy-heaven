import type { Metadata } from "next"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for shopping and using Trophy Heaven online.",
  alternates: { canonical: "/terms" },
}

const SECTIONS = [
  {
    id: "agreement",
    title: "Agreement",
    body: "These Terms govern your use of trophyheaven.com and any purchase from Trophy Heaven. By browsing or placing an order you agree to these Terms and to our Privacy Policy. The version posted at the time of your order applies to that order.",
  },
  {
    id: "products",
    title: "Products & pricing",
    body: "Every piece is handcrafted, so grain, tone, finish, and dimensions may vary slightly from photographs. Prices are in Indian Rupees and inclusive of applicable GST unless stated otherwise. We may correct pricing errors and cancel orders placed at an incorrect price, with a full refund.",
  },
  {
    id: "orders",
    title: "Orders & customization",
    body: "Your order is an offer to purchase; it is accepted when we send confirmation. Custom work enters production after you approve the proof. You are responsible for the accuracy of names, dates, spelling, and artwork, and for the rights to logos you submit. Once production begins, a custom piece cannot be changed or cancelled.",
  },
  {
    id: "payment",
    title: "Payment",
    body: "Payment is processed via Razorpay or under approved corporate credit terms. Orders are produced and dispatched after payment authorization. Fraudulent or chargeback-disputed transactions may result in cancellation and account restriction.",
  },
  {
    id: "shipping",
    title: "Shipping & delivery",
    body: "We ship across India. Timelines at checkout are estimates. Standard shipping is free above ₹5,000. Risk of loss passes on delivery to the address you provided. Inspect shipments on arrival and report transit damage within 48 hours with photographs.",
  },
  {
    id: "returns",
    title: "Returns & cancellations",
    body: "Non-custom items may be returned within 7 days if unused and in original packaging. Custom engraved and made-to-order pieces are non-returnable except for a manufacturing defect or an error on our part.",
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: "Site content, product designs, photography, and branding are the property of Trophy Heaven or its licensors. Logos you supply remain yours; by submitting them you confirm you may use them and grant us a limited license to fulfill the order.",
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: "To the fullest extent permitted by law, Trophy Heaven is not liable for indirect or consequential damages. Aggregate liability for a claim related to an order is limited to the amount you paid for that order. Nothing excludes liability that cannot be excluded under the Consumer Protection Act, 2019.",
  },
  {
    id: "law",
    title: "Governing law",
    body: "These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.",
  },
] as const

export default function TermsPage() {
  return (
    <EditorialShell>
      <EditorialFrame>
        <div className="relative max-w-[40em]">
          <EditorialWatermark>legal</EditorialWatermark>
          <EditorialEyebrow>Terms</EditorialEyebrow>
          <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
            Terms of service
          </h1>
          <p className="mt-[1em] m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#6B635C] uppercase">
            Last updated 15 August 2026
          </p>
          <p className="mt-[1.25em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            How ordering, customization, shipping, and returns work — written plainly.
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
                <EditorialTextLink href="/privacy">Privacy policy →</EditorialTextLink>
              </div>
            </nav>
          </aside>
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}

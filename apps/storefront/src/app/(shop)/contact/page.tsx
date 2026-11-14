import type { Metadata } from "next"
import GlobeDemo from "@/components/globe-demo"
import { ContactForm } from "@/components/features/contact/contact-form"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Trophy Heaven in Bangalore for custom trophies, bulk awards, and order support.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <EditorialShell>
      <section className="relative overflow-hidden border-b border-[#131111]/10">
        <EditorialFrame className="pb-[clamp(2.5rem,6vw,5em)]">
          <div className="grid items-center gap-[2.5em] lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] lg:min-h-[32em] lg:gap-16">
            <div className="relative z-10 max-w-[32em]">
              <EditorialWatermark>hello</EditorialWatermark>
              <EditorialEyebrow>The studio</EditorialEyebrow>
              <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
                Tell us what you want made
              </h1>
              <p className="mt-[1.5em] m-0 font-outfit text-[1.125em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
                A brief, an order, or a visit. We typically reply within one business day.
              </p>
            </div>
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[0.125em] lg:aspect-[6/5]">
              <GlobeDemo embedded />
            </div>
          </div>
        </EditorialFrame>
      </section>

      <EditorialFrame>
        <div className="grid grid-cols-1 gap-[4em] lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <aside className="lg:col-span-5">
            <p className="m-0 font-outfit text-[1.5em] leading-[1.25em] font-light tracking-[-0.02em] text-[#131111] uppercase">
              Bangalore
            </p>
            <address className="mt-[1.25em] not-italic">
              <p className="m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
                Trophy Heaven Studio
                <br />
                Indiranagar, Bangalore 560038
                <br />
                Karnataka, India
              </p>
              <p className="mt-[1.25em] m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
                <a
                  href="mailto:hello@trophyheaven.com"
                  className="text-[#131111] no-underline hover:opacity-70"
                >
                  hello@trophyheaven.com
                </a>
                <br />
                <a
                  href="tel:+918012345678"
                  className="text-[#131111] no-underline hover:opacity-70"
                >
                  +91 80 1234 5678
                </a>
              </p>
              <p className="mt-[1.25em] m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
                Monday–Saturday, 10:00–18:00 IST
              </p>
            </address>
          </aside>
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}

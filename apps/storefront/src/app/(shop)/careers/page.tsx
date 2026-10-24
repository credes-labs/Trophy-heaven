import type { Metadata } from "next"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"

export const metadata: Metadata = {
  title: "Careers",
  description: "Work at Legacy Crafts in Bengaluru — craft, design, and operations roles.",
  alternates: { canonical: "/careers" },
}

const ROLES = [
  {
    title: "Workshop apprentice",
    body: "Timber, metal, and finishing under guild artisans. Hands-on, patient work.",
  },
  {
    title: "Studio designer",
    body: "2D/3D trophy templates, engraving layout, and client proofing.",
  },
  {
    title: "Operations coordinator",
    body: "Bulk dispatch, GST paperwork, and courier coordination across India.",
  },
] as const

export default function CareersPage() {
  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Careers"
        watermark="work"
        title="Work at the bench."
        body="Open roles across craft, design, and operations in Bengaluru."
      >
        <EditorialCtaLink href="mailto:careers@legacycrafts.com">Send a CV</EditorialCtaLink>
      </SimplePageHero>
      <EditorialFrame>
        <ul className="m-0 grid list-none gap-[1.25em] p-0">
          {ROLES.map((role) => (
            <li key={role.title} className="border-b border-[#131111]/10 pb-[1.25em]">
              <h2 className="m-0 font-outfit text-[1.35em] font-normal tracking-[-0.02em] text-balance text-[#131111]">
                {role.title}
              </h2>
              <p className="mt-[0.5em] m-0 font-outfit text-[1em] leading-[1.45] text-[#6B635C]">
                {role.body}
              </p>
            </li>
          ))}
        </ul>
      </EditorialFrame>
    </EditorialShell>
  )
}

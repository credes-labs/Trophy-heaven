import type { Metadata } from "next"
import Link from "next/link"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"

export const metadata: Metadata = {
  title: "Press",
  description: "Press and media resources for Trophy Heaven — brand assets and workshop notes.",
  alternates: { canonical: "/press" },
}

export default function PressPage() {
  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Press"
        watermark="press"
        title="Press & media."
        body="Brand assets, workshop notes, and contact for coverage."
        illustration
      >
        <EditorialCtaLink href="mailto:press@trophyheaven.com">Email press</EditorialCtaLink>
      </SimplePageHero>
      <EditorialFrame>
        <ul className="m-0 grid list-none gap-[1.5em] p-0 lg:grid-cols-2">
          <li className="border border-[#131111]/10 p-[1.5em]">
            <h2 className="m-0 font-outfit text-[1.25em] font-normal text-balance text-[#131111]">Brand kit</h2>
            <p className="mt-[0.75em] m-0 font-outfit text-[1em] leading-[1.45] text-[#6B635C]">
              Logo, monogram, and colour guidance for editors and partners.
            </p>
            <Link href="/contact" className="mt-[1em] inline-block font-outfit text-[0.875em] uppercase underline text-[#131111]">
              Request assets
            </Link>
          </li>
          <li className="border border-[#131111]/10 p-[1.5em]">
            <h2 className="m-0 font-outfit text-[1.25em] font-normal text-balance text-[#131111]">Journal</h2>
            <p className="mt-[0.75em] m-0 font-outfit text-[1em] leading-[1.45] text-[#6B635C]">
              Workshop notes and material stories from the bench.
            </p>
            <Link href="/blog" className="mt-[1em] inline-block font-outfit text-[0.875em] uppercase underline text-[#131111]">
              Read the journal
            </Link>
          </li>
        </ul>
      </EditorialFrame>
    </EditorialShell>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"

export const metadata: Metadata = {
  title: "Design Studio",
  description:
    "Design your trophy in the browser with Legacy Crafts' 2D and 3D studio. Approve a render before we cut.",
  alternates: { canonical: "/customize" },
}

const TEMPLATES = [
  {
    title: "Engraved Wooden Plaque",
    href: "/products/engraved-wooden-plaque",
    body: "Text engraving on seasoned timber — the fastest path into the studio.",
  },
  {
    title: "Browse customisable trophies",
    href: "/shop?category=trophies&customizable=1",
    body: "Crystal, metal, and acrylic awards ready for your names and logos.",
  },
  {
    title: "Corporate bulk",
    href: "/corporate/bulk",
    body: "Hundreds of recipients from one CSV, one proof, one invoice.",
  },
] as const

export default function CustomizeLandingPage() {
  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Design studio"
        watermark="design"
        title="See it before you commission it."
        body="Open a template, place your engraving, and approve a render of the real trophy — so the first piece you hold is the one you signed off."
      >
        <EditorialCtaLink href="/shop?category=trophies&customizable=1">
          See customisable trophies
        </EditorialCtaLink>
      </SimplePageHero>
      <EditorialFrame>
        <h2 className="m-0 font-outfit text-[clamp(1.5em,3vw,2.25em)] font-normal tracking-[-0.03em] text-[#131111]">
          Start from a piece
        </h2>
        <ul className="mt-[2em] m-0 grid list-none grid-cols-1 gap-[1.5em] p-0 lg:grid-cols-3">
          {TEMPLATES.map((item) => (
            <li key={item.href} className="border border-[#131111]/10 p-[1.5em]">
              <h3 className="m-0 font-outfit text-[1.25em] font-normal tracking-[-0.02em] text-[#131111]">
                {item.title}
              </h3>
              <p className="mt-[0.75em] m-0 font-outfit text-[1em] leading-[1.45] text-[#131111]/7">
                {item.body}
              </p>
              <Link
                href={item.href}
                className="mt-[1.25em] inline-block font-outfit text-[0.875em] uppercase underline underline-offset-[0.15em] text-[#131111]"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      </EditorialFrame>
    </EditorialShell>
  )
}

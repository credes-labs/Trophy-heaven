import type { Metadata } from "next"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialCtaLink } from "@/components/layout/editorial/editorial-cta"

export const metadata: Metadata = {
  title: "Gift Cards",
  description: "Give a Legacy Crafts gift card — trophies, furniture, or artwork.",
  alternates: { canonical: "/gift-cards" },
}

const AMOUNTS = ["₹2,500", "₹5,000", "₹10,000", "₹25,000"] as const

export default function GiftCardsPage() {
  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Gifting"
        watermark="gift"
        title="Give a Legacy Crafts gift card."
        body="Let someone choose the piece — trophy, furniture, or artwork."
      >
        <EditorialCtaLink href="/contact">Enquire about gift cards</EditorialCtaLink>
      </SimplePageHero>
      <EditorialFrame>
        <p className="m-0 font-outfit text-[1em] leading-[1.5] text-[#6B635C] max-w-[36em]">
          Digital gift cards are fulfilled by email. Physical cards can be included with a workshop
          visit or couriered with a handwritten note. Checkout purchase goes live once payment
          productisation ships — until then, write to us and we will issue one by hand.
        </p>
        <ul className="mt-[2em] m-0 flex list-none flex-wrap gap-[0.75em] p-0">
          {AMOUNTS.map((amount) => (
            <li
              key={amount}
              className="border border-[#131111]/15 px-[1.25em] py-[0.75em] font-outfit text-[1em] text-[#131111] tabular-nums"
            >
              {amount}
            </li>
          ))}
        </ul>
      </EditorialFrame>
    </EditorialShell>
  )
}

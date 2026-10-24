import type { Metadata } from "next"
import Link from "next/link"
import { SimplePageHero } from "@/components/layout/editorial/simple-page-hero"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"

export const metadata: Metadata = {
  title: "Sitemap",
  description: "A human index of Legacy Crafts — shop, journal, account, and support.",
  alternates: { canonical: "/sitemap" },
}

const GROUPS = [
  {
    title: "Shop",
    links: [
      { label: "Collection", href: "/shop" },
      { label: "Trophies", href: "/trophies" },
      { label: "Furniture", href: "/furniture" },
      { label: "Artwork", href: "/artwork" },
      { label: "Design studio", href: "/customize" },
      { label: "Search", href: "/search" },
      { label: "Gift cards", href: "/gift-cards" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Journal", href: "/blog" },
      { label: "Press", href: "/press" },
      { label: "Careers", href: "/careers" },
      { label: "Corporate", href: "/corporate" },
      { label: "Request a quote", href: "/corporate/quote" },
      { label: "Trade", href: "/trade" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Track order", href: "/track" },
      { label: "Shipping & returns", href: "/shipping-returns" },
      { label: "Start a return", href: "/returns" },
      { label: "Size guide", href: "/guides/size" },
      { label: "Care guide", href: "/guides/care" },
      { label: "Customization guide", href: "/guides/customization" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const

export default function HumanSitemapPage() {
  return (
    <EditorialShell>
      <SimplePageHero
        eyebrow="Sitemap"
        watermark="map"
        title="Everything on the site."
        body="A human index of shop, journal, account, and support."
      />
      <EditorialFrame>
        <div className="grid gap-[2.5em] lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="m-0 font-outfit text-[1.25em] font-normal uppercase tracking-wide text-balance text-[#131111]">
                {group.title}
              </h2>
              <ul className="mt-[1em] m-0 list-none space-y-[0.5em] p-0">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-outfit text-[1em] text-[#131111]/75 no-underline hover:text-[#131111] hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </EditorialFrame>
    </EditorialShell>
  )
}

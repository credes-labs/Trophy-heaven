import type { Metadata } from "next"
import Link from "next/link"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { PlaqueConfigurator } from "@/components/features/customize/configurator/plaque-configurator"
import { getProductByHandle } from "@/lib/data/catalog"
import { variantInStock } from "@/lib/product-filters"
import { PLAQUE_HANDLE, parseConfig, type PlaqueVariant } from "@/lib/configurator/plaque"

export const metadata: Metadata = {
  title: "Design Studio",
  description:
    "Compose an engraved plaque in 3D — choose the form, timber, plate and lettering, read your engraving at size, and share the design before we cut.",
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

export default async function CustomizeLandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [params, product] = await Promise.all([searchParams, getProductByHandle(PLAQUE_HANDLE)])
  const sizeOptionId = product?.options?.find((o) => /size/i.test(o.title ?? ""))?.id
  const variants: PlaqueVariant[] = (product?.variants ?? []).map((v) => ({
    id: v.id,
    sizeLabel:
      v.options?.find((o) => o.option_id === sizeOptionId)?.value ?? v.options?.[0]?.value ?? v.title ?? "",
    amount: v.calculated_price?.calculated_amount ?? null,
    currency: v.calculated_price?.currency_code ?? "inr",
    inStock: variantInStock(v),
  }))

  return (
    <EditorialShell>
      <PlaqueConfigurator
        product={product ? { id: product.id, title: product.title ?? "Engraved plaque", handle: product.handle ?? PLAQUE_HANDLE } : null}
        variants={variants}
        initialConfig={parseConfig(params)}
      />
      <EditorialFrame>
        <h2 className="m-0 font-outfit text-[clamp(1.5em,3vw,2.25em)] font-normal tracking-[-0.03em] text-balance text-[#131111]">
          Start from a piece
        </h2>
        <ul className="mt-[2em] m-0 grid list-none grid-cols-1 gap-[1.5em] p-0 lg:grid-cols-3">
          {TEMPLATES.map((item) => (
            <li key={item.href} className="border border-[#131111]/10 p-[1.5em]">
              <h3 className="m-0 font-outfit text-[1.25em] font-normal tracking-[-0.02em] text-balance text-[#131111]">
                {item.title}
              </h3>
              <p className="mt-[0.75em] m-0 font-outfit text-[1em] leading-[1.45] text-[#6B635C]">
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

import Image from "next/image"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { SectionEyebrow, SectionShell, TextCta } from "@/components/sections/_editorial"
import { listProducts } from "@/lib/data/catalog"
import { formatMoney } from "@/lib/format"
import { localizeImageUrl } from "@/lib/images"

function productPrice(product: HttpTypes.StoreProduct): string {
  const variant = product.variants?.[0]
  const amount = variant?.calculated_price?.calculated_amount
  const currency = variant?.calculated_price?.currency_code ?? "inr"
  if (amount == null) return "—"
  return formatMoney(amount, currency)
}

export async function RecentWorkSection() {
  const { products } = await listProducts({ limit: 8, order: "-created_at" })

  return (
    <SectionShell id="recent-work" aria-labelledby="recent-work-heading">
      <div className="flex flex-col gap-[1em] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionEyebrow>recent work</SectionEyebrow>
          <h2
            id="recent-work-heading"
            className="mt-[0.75em] m-0 font-outfit text-[clamp(1.75em,4vw,3em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance"
          >
            Lately from the workshop.
          </h2>
        </div>
        <TextCta href="/shop">View the full collection</TextCta>
      </div>

      {products.length === 0 ? (
        <p className="mt-[2em] m-0 font-outfit text-pretty text-[#6B635C]">
          The shop is loading. Please check back shortly.
        </p>
      ) : (
        <ul className="mt-[clamp(1.75em,3.5vw,3em)] m-0 flex list-none snap-x snap-mandatory gap-[1em] overflow-x-auto p-0 pb-2 lg:grid lg:grid-cols-4 lg:gap-[1.25em] lg:overflow-visible lg:pb-0">
          {products.map((product) => {
            const href = `/products/${product.handle}`
            const src = localizeImageUrl(product.thumbnail ?? product.images?.[0]?.url ?? "")
            return (
              <li key={product.id} className="min-w-[70%] snap-start sm:min-w-[40%] lg:min-w-0">
                <Link href={href} className="group block no-underline">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#D9D9D9]">
                    {src ? (
                      <Image
                        src={src}
                        alt={product.title}
                        fill
                        sizes="(min-width: 90rem) 20rem, 70vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <p className="mt-[0.85em] m-0 font-outfit text-[1em] leading-[1.3] tracking-[-0.02em] text-[#131111]">
                    {product.title}
                  </p>
                  <p className="mt-[0.25em] m-0 font-outfit text-[0.875em] text-[#131111]/65 tabular-nums">
                    {productPrice(product)}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </SectionShell>
  )
}

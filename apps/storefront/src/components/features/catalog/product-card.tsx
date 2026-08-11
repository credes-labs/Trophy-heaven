import Link from "next/link"
import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"
import { Badge } from "@/components/ui/badge"
import { formatMoney, CUSTOMIZATION_LABELS, isCustomizable } from "@/lib/format"

function lowestPrice(product: HttpTypes.StoreProduct): { amount: number; currency: string } | null {
  const prices = (product.variants ?? [])
    .map((v) => v.calculated_price)
    .filter(Boolean) as NonNullable<HttpTypes.StoreProductVariant["calculated_price"]>[]
  if (!prices.length) return null
  const min = prices.reduce((a, b) =>
    (a.calculated_amount ?? Infinity) < (b.calculated_amount ?? Infinity) ? a : b
  )
  return { amount: min.calculated_amount ?? 0, currency: min.currency_code ?? "inr" }
}

export function ProductCard({ product }: { product: HttpTypes.StoreProduct }) {
  const price = lowestPrice(product)
  const level = (product.metadata?.customization_level as string) ?? "none"

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="font-serif text-2xl opacity-40">LC</span>
          </div>
        )}
        {isCustomizable(level) && (
          <Badge className="absolute left-2 top-2 bg-accent/90 text-accent-foreground">
            Customizable
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 text-sm font-medium">{product.title}</h3>
        <p className="text-xs text-muted-foreground">{CUSTOMIZATION_LABELS[level] ?? "Product"}</p>
        <div className="mt-auto pt-2 text-sm font-semibold">
          {price ? `From ${formatMoney(price.amount, price.currency)}` : "—"}
        </div>
      </div>
    </Link>
  )
}

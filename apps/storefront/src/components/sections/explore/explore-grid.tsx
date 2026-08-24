import { ExploreCard } from "./explore-card"
import type { ExploreProduct } from "./constants"

export function ExploreGrid({ products }: { products: ExploreProduct[] }) {
  if (products.length === 0) {
    return (
      <p className="m-0 font-outfit text-[1.25em] leading-[1.4] tracking-[-0.02em] text-[rgba(19,17,17,0.6)]">
        No pieces match these filters.
      </p>
    )
  }

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-x-[1.5em] gap-y-[2.625em] p-0 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <li key={product.id}>
          <ExploreCard product={product} index={index} />
        </li>
      ))}
    </ul>
  )
}

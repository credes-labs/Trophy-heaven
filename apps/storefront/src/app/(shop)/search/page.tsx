import type { Metadata } from "next"
import { SearchView } from "@/components/features/search/search-view"
import { getRegion } from "@/lib/regions"

export const metadata: Metadata = {
  title: "Search",
  description: "Search Trophy Heaven trophies, awards, and engraved plaques.",
}

export default async function SearchPage() {
  const region = await getRegion().catch(() => undefined)

  return (
    <div className="search-page under-site-header bg-[#F2F1EF] font-outfit text-[#131111] lg:[font-size:min(1rem,calc(100vw/90))]">
      <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)] pt-[clamp(1.25rem,2vw,2em)] pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-[clamp(3rem,6vw,5.5em)]">
        <h1 className="m-0 font-outfit text-[2em] leading-[1.15] font-light tracking-[-0.03em] text-[#131111]">
          Search
        </h1>
        <SearchView regionId={region?.id} />
      </div>
    </div>
  )
}

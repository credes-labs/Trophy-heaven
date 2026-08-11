import type { Metadata } from "next"
import { SearchView } from "@/components/features/search/search-view"

export const metadata: Metadata = {
  title: "Search",
  description: "Search Legacy Crafts trophies, awards, furniture, and home decor.",
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-serif text-3xl">Search</h1>
      <SearchView />
    </div>
  )
}

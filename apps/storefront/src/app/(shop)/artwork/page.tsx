import type { Metadata } from "next"
import {
  buildCategoryMetadata,
  CategoryPage,
} from "@/components/features/catalog/category-page"

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata("artwork")
}

export default function ArtworkPage() {
  return <CategoryPage categoryKey="artwork" />
}

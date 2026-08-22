import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { listPosts, listBlogCategories } from "@/lib/blog"
import { BlogHero } from "@/components/features/blog/blog-hero"
import { BlogCard } from "@/components/features/blog/blog-card"
import { BlogCardGrid } from "@/components/features/blog/blog-card-grid"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "The Legacy Journal",
  description:
    "Stories of craft, design, and material from the Legacy Crafts workshop — trophies, furniture, and Indian craftsmanship.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Legacy Journal",
    description: "Stories of craft, design, and material from the Legacy Crafts workshop.",
  },
}

export const revalidate = 120

const PAGE_SIZE = 7

type Props = {
  searchParams: Promise<{ category?: string; page?: string; q?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams
  const category = params.category?.trim() || undefined
  const q = params.q?.trim() || undefined
  const page = Math.max(1, Number(params.page) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const [categories, { posts, count }] = await Promise.all([
    listBlogCategories().catch(() => []),
    listPosts({ limit: PAGE_SIZE, offset, category, q }).catch(() => ({
      posts: [],
      count: 0,
    })),
  ])

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const featured = page === 1 && posts.length > 0 ? posts[0] : null
  const gridPosts = featured ? posts.slice(1) : posts

  function hrefFor(next: { category?: string; page?: number }) {
    const sp = new URLSearchParams()
    const cat = next.category !== undefined ? next.category : category
    const pg = next.page !== undefined ? next.page : page
    if (cat) sp.set("category", cat)
    if (q) sp.set("q", q)
    if (pg > 1) sp.set("page", String(pg))
    const qs = sp.toString()
    return qs ? `/blog?${qs}` : "/blog"
  }

  return (
    <div>
      <BlogHero />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <nav className="flex flex-wrap gap-2" aria-label="Blog categories">
          <CategoryPill href={hrefFor({ category: "", page: 1 })} active={!category}>
            All
          </CategoryPill>
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              href={hrefFor({ category: cat.slug, page: 1 })}
              active={category === cat.slug}
            >
              {cat.name}
            </CategoryPill>
          ))}
        </nav>

        {posts.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-serif text-2xl text-foreground">No stories yet</p>
            <p className="mt-2 text-muted-foreground">
              Check back soon — we are drafting the next journal entries.
            </p>
          </div>
        ) : (
          <>
            {featured && (
              <div className="mt-10">
                <BlogCard post={featured} categories={categories} featured />
              </div>
            )}

            {gridPosts.length > 0 && (
              <BlogCardGrid
                className={cn(
                  "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
                  featured ? "mt-12" : "mt-10"
                )}
              >
                {gridPosts.map((post) => (
                  <BlogCard key={post.id} post={post} categories={categories} />
                ))}
              </BlogCardGrid>
            )}

            {totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-3">
                {page > 1 ? (
                  <Link
                    href={hrefFor({ page: page - 1 })}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Previous
                  </Link>
                ) : (
                  <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "opacity-40")}>
                    Previous
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={hrefFor({ page: page + 1 })}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Next
                  </Link>
                ) : (
                  <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "opacity-40")}>
                    Next
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CategoryPill({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-walnut text-cream"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  )
}

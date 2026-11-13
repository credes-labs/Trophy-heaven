import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { listPosts, listBlogCategories } from "@/lib/blog"
import { BlogHero } from "@/components/features/blog/blog-hero"
import { BlogCard } from "@/components/features/blog/blog-card"
import { BlogCardGrid } from "@/components/features/blog/blog-card-grid"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "The Trophy Heaven Journal",
  description:
    "Stories of craft, design, and material from the Trophy Heaven workshop — trophies, awards, and Indian craftsmanship.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Trophy Heaven Journal",
    description: "Stories of craft, design, and material from the Trophy Heaven workshop.",
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
    <EditorialShell>
      <BlogHero />

      <EditorialFrame className="pt-[clamp(2.5rem,5vw,4em)]">
        <nav className="flex flex-wrap gap-x-[1.5em] gap-y-[0.75em]" aria-label="Blog categories">
          <CategoryFilter href={hrefFor({ category: "", page: 1 })} active={!category}>
            All
          </CategoryFilter>
          {categories.map((cat) => (
            <CategoryFilter
              key={cat.id}
              href={hrefFor({ category: cat.slug, page: 1 })}
              active={category === cat.slug}
            >
              {cat.name}
            </CategoryFilter>
          ))}
        </nav>

        {posts.length === 0 ? (
          <p className="mt-[3em] m-0 max-w-[28em] font-outfit text-[1.125em] leading-[1.4] text-[#131111]/70">
            No stories yet. Check back soon — we are drafting the next journal entries.
          </p>
        ) : (
          <>
            {featured ? (
              <div className="mt-[clamp(2em,4vw,3.5em)]">
                <BlogCard post={featured} categories={categories} featured />
              </div>
            ) : null}

            {gridPosts.length > 0 ? (
              <BlogCardGrid
                className={cn(
                  "grid gap-[2em] sm:grid-cols-2 lg:grid-cols-3",
                  featured ? "mt-[clamp(2.5em,5vw,4em)]" : "mt-[clamp(2em,4vw,3.5em)]"
                )}
              >
                {gridPosts.map((post) => (
                  <BlogCard key={post.id} post={post} categories={categories} />
                ))}
              </BlogCardGrid>
            ) : null}

            {totalPages > 1 ? (
              <div className="mt-[3em] flex flex-wrap items-center gap-x-[1.75em] gap-y-[0.75em]">
                {page > 1 ? (
                  <Link
                    href={hrefFor({ page: page - 1 })}
                    className="font-outfit text-[1.25em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em]"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="font-outfit text-[1.25em] tracking-[-0.02em] text-[#6B635C] uppercase">
                    Previous
                  </span>
                )}
                <span className="font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C] uppercase">
                  {page} / {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={hrefFor({ page: page + 1 })}
                    className="font-outfit text-[1.25em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em]"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="font-outfit text-[1.25em] tracking-[-0.02em] text-[#6B635C] uppercase">
                    Next
                  </span>
                )}
              </div>
            ) : null}
          </>
        )}
      </EditorialFrame>
    </EditorialShell>
  )
}

function CategoryFilter({
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
        "font-outfit text-[0.875em] leading-[1.25em] font-normal tracking-[-0.02em] uppercase no-underline",
        active ? "text-[#131111] underline underline-offset-[0.2em]" : "text-[#6B635C] hover:text-[#131111]"
      )}
    >
      {children}
    </Link>
  )
}

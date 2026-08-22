import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { marked } from "marked"
import {
  getPost,
  listPosts,
  listBlogCategories,
  categoryForPost,
  formatPostDate,
  addHeadingIds,
} from "@/lib/blog"
import { BlogCard } from "@/components/features/blog/blog-card"
import { ShareButtons } from "@/components/features/blog/share-buttons"
import { Newsletter } from "@/components/sections/newsletter"
import { Badge } from "@/components/ui/badge"
import { localizeImageUrl } from "@/lib/images"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const revalidate = 120

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "")

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug).catch(() => null)
  if (!post) return { title: "Article" }

  const title = post.seo_title || post.title
  const description = post.seo_description || post.excerpt || undefined

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, categories] = await Promise.all([
    getPost(slug).catch(() => null),
    listBlogCategories().catch(() => []),
  ])

  if (!post) notFound()

  const category = categoryForPost(post, categories)
  const date = formatPostDate(post.published_at)
  const { html, toc } = addHeadingIds(marked.parse(post.content_md, { async: false }) as string)

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description || post.excerpt || undefined,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at ?? undefined,
    author: { "@type": "Person", name: post.author_name },
    publisher: { "@type": "Organization", name: "Legacy Crafts" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${slug}` },
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/blog/${slug}` },
    ],
  }

  const related = category
    ? (
        await listPosts({ limit: 4, category: category.slug }).catch(() => ({
          posts: [],
          count: 0,
        }))
      ).posts.filter((p) => p.id !== post.id).slice(0, 3)
    : []

  return (
    <article className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink active>{post.title}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <header className="mx-auto max-w-4xl px-4 pt-10 text-center sm:px-6 sm:pt-14">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
          {category && <Badge variant="gold">{category.name}</Badge>}
          {date && <span>{date}</span>}
          {date && post.read_time_minutes > 0 && <span aria-hidden>•</span>}
          {post.read_time_minutes > 0 && <span>{post.read_time_minutes} min read</span>}
        </div>
        <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-5 text-sm text-muted-foreground">
          By <span className="font-medium text-foreground">{post.author_name}</span>
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
        {post.cover_image_url ? (
          <div className="relative aspect-[21/9] overflow-hidden rounded-xl bg-muted">
            <Image
              src={localizeImageUrl(post.cover_image_url)}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1024px"
            />
          </div>
        ) : (
          <div
            className="aspect-[21/9] rounded-xl bg-gradient-to-br from-walnut via-furniture to-artwork-dark"
            aria-hidden
          />
        )}
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:flex lg:justify-center lg:gap-12">
        <div className="w-full max-w-[720px]">
          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />

          <div className="mt-12 border-t border-border pt-8">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>

          <div className="mt-10 flex items-start gap-4 rounded-xl border border-border bg-muted/40 p-6">
            {post.author_avatar_url ? (
              <Image
                src={post.author_avatar_url}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/20 font-serif text-base font-semibold text-walnut"
                aria-hidden
              >
                {post.author_name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? "")
                  .join("")}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                Written by
              </p>
              <p className="mt-1 font-serif text-lg font-semibold text-foreground">
                {post.author_name}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {post.author_name} writes for The Legacy Journal — stories of craft, material, and
                design from the Legacy Crafts workshop.
              </p>
            </div>
          </div>
        </div>

        {toc.length > 1 && (
          <aside className="hidden w-64 shrink-0 lg:block">
            <nav className="sticky top-24" aria-label="Table of contents">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                On this page
              </p>
              <ul className="mt-4 space-y-2.5 border-l border-border">
                {toc.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className={`-ml-px block border-l-2 border-transparent py-0.5 text-sm text-muted-foreground transition-colors hover:border-gold hover:text-foreground ${
                        entry.level === 3 ? "pl-8" : "pl-4"
                      }`}
                    >
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Related stories</h2>
            {category && (
              <Link
                href={`/blog?category=${category.slug}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                More in {category.name}
              </Link>
            )}
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.id} post={p} categories={categories} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <Newsletter />
      </div>
    </article>
  )
}

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
  journalCoverSrc,
} from "@/lib/blog"
import { BlogCard } from "@/components/features/blog/blog-card"
import { ShareButtons } from "@/components/features/blog/share-buttons"
import { JournalSubscribe } from "@/components/features/blog/journal-subscribe"
import { EditorialEyebrow } from "@/components/layout/editorial/editorial-eyebrow"
import { EditorialFrame, EditorialShell } from "@/components/layout/editorial/editorial-shell"
import { EditorialTextLink } from "@/components/layout/editorial/editorial-cta"
import { EditorialWatermark } from "@/components/layout/editorial/editorial-watermark"
import { getSiteUrl } from "@/lib/site-url"

export const revalidate = 120

const BASE_URL = getSiteUrl()

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

  const meta = [category?.name, date, post.read_time_minutes > 0 ? `${post.read_time_minutes} min` : null]
    .filter(Boolean)
    .join(" · ")

  return (
    <EditorialShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article>
        <section className="relative overflow-hidden border-b border-[#131111]/10">
          <EditorialFrame className="pb-[clamp(2.5rem,6vw,5em)]">
            <EditorialTextLink href="/blog">← Journal</EditorialTextLink>
            <div className="relative mt-[1.5em] max-w-[40em]">
              <EditorialWatermark>story</EditorialWatermark>
              <EditorialEyebrow>{category?.name ?? "Journal"}</EditorialEyebrow>
              <h1 className="relative m-0 mt-[1em] font-outfit text-[clamp(2.25rem,5vw,3.75em)] leading-[1.1] font-normal tracking-[-0.04em] text-balance text-[#131111]">
                {post.title}
              </h1>
              <p className="mt-[1.25em] m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C] uppercase">
                {post.author_name}
                {meta ? ` · ${meta}` : ""}
              </p>
            </div>
          </EditorialFrame>
        </section>

        <div className="mx-auto w-full max-w-[90em] px-[clamp(1.25rem,2.78vw,2.5em)]">
          <div className="relative aspect-[21/9] overflow-hidden rounded-[0.125em] bg-[#D9D9D9]">
            <Image
              src={journalCoverSrc(post)}
              alt=""
              fill
              preload
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 90em"
            />
          </div>
        </div>

        <EditorialFrame>
          <div className="grid grid-cols-1 gap-[3em] lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />

              <div className="mt-[2.5em] border-t border-[#CDCDCD] pt-[1.75em]">
                <ShareButtons title={post.title} slug={post.slug} />
              </div>

              <div className="mt-[2.5em]">
                <p className="m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C] uppercase">
                  Written by
                </p>
                <p className="mt-[0.5em] m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-[#131111]">
                  {post.author_name}
                </p>
                <p className="mt-[0.5em] m-0 max-w-[32em] font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
                  {post.author_name} writes for The Legacy Journal — stories of craft, material, and
                  design from the workshop.
                </p>
              </div>
            </div>

            {toc.length > 1 ? (
              <aside className="lg:col-span-4">
                <nav className="sticky top-24" aria-label="On this page">
                  <p className="m-0 font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C] uppercase">
                    Contents
                  </p>
                  <ul className="mt-[1em] m-0 flex list-none flex-col gap-[0.75em] p-0">
                    {toc.map((entry) => (
                      <li key={entry.id} className={entry.level === 3 ? "pl-[1em]" : undefined}>
                        <a
                          href={`#${entry.id}`}
                          className="font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70 no-underline hover:text-[#131111]"
                        >
                          {entry.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            ) : null}
          </div>

          {related.length > 0 ? (
            <section className="mt-[clamp(3em,6vw,5em)] border-t border-[#CDCDCD] pt-[clamp(2em,4vw,3.5em)]">
              <div className="flex flex-wrap items-baseline justify-between gap-[1em]">
                <h2 className="m-0 font-outfit text-[clamp(1.75em,3vw,2.5em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance text-[#131111]">
                  Related
                </h2>
                {category ? (
                  <Link
                    href={`/blog?category=${category.slug}`}
                    className="font-outfit text-[1.25em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em]"
                  >
                    More in {category.name} →
                  </Link>
                ) : null}
              </div>
              <div className="mt-[2em] grid gap-[2em] sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <BlogCard key={p.id} post={p} categories={categories} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-[clamp(3em,6vw,5em)]">
            <JournalSubscribe />
          </div>
        </EditorialFrame>
      </article>
    </EditorialShell>
  )
}

import { BACKEND_URL, PUBLISHABLE_KEY } from "./medusa"

export type BlogCategory = {
  id: string
  name: string
  slug: string
  description: string | null
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content_md: string
  cover_image_url: string | null
  author_name: string
  author_avatar_url: string | null
  tags: string[] | Record<string, unknown>
  status: "draft" | "published" | "archived"
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  read_time_minutes: number
  view_count?: number
  category_id: string | null
  category?: BlogCategory | null
}

type ListPostsParams = {
  limit?: number
  offset?: number
  category?: string
  q?: string
}

type ListPostsResult = {
  posts: BlogPost[]
  count: number
  limit?: number
  offset?: number
}

const revalidate = { next: { revalidate: 120 } } as const

function blogHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
  }
}

export async function listPosts(params: ListPostsParams = {}): Promise<ListPostsResult> {
  const search = new URLSearchParams()
  if (params.limit != null) search.set("limit", String(params.limit))
  if (params.offset != null) search.set("offset", String(params.offset))
  if (params.category) search.set("category", params.category)
  if (params.q) search.set("q", params.q)

  const qs = search.toString()
  const res = await fetch(`${BACKEND_URL}/store/blog/posts${qs ? `?${qs}` : ""}`, {
    headers: blogHeaders(),
    ...revalidate,
  })

  if (!res.ok) {
    throw new Error(`Failed to list blog posts: ${res.status}`)
  }

  return (await res.json()) as ListPostsResult
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${BACKEND_URL}/store/blog/posts/${encodeURIComponent(slug)}`, {
    headers: blogHeaders(),
    ...revalidate,
  })

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Failed to fetch blog post: ${res.status}`)
  }

  const body = (await res.json()) as { post: BlogPost }
  return body.post
}

export async function listBlogCategories(): Promise<BlogCategory[]> {
  const res = await fetch(`${BACKEND_URL}/store/blog/categories`, {
    headers: blogHeaders(),
    ...revalidate,
  })

  if (!res.ok) {
    throw new Error(`Failed to list blog categories: ${res.status}`)
  }

  const body = (await res.json()) as { categories: BlogCategory[] }
  return body.categories ?? []
}

export function formatPostDate(value: string | null | undefined): string {
  if (!value) return ""
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export function postTags(post: BlogPost): string[] {
  if (Array.isArray(post.tags)) return post.tags
  return []
}

export function categoryForPost(
  post: BlogPost,
  categories: BlogCategory[]
): BlogCategory | null {
  if (post.category) return post.category
  if (!post.category_id) return null
  return categories.find((c) => c.id === post.category_id) ?? null
}

export type TocEntry = { id: string; text: string; level: 2 | 3 }

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Adds anchor ids to the h2/h3 headings of rendered markdown HTML and returns
 * the table of contents from the same pass, so TOC links and heading ids can
 * never drift apart.
 */
export function addHeadingIds(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = []
  const seen = new Map<string, number>()
  const out = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (match, lvl, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, "").trim()
    const base = slugifyHeading(text) || "section"
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    const id = n > 1 ? `${base}-${n}` : base
    toc.push({ id, text, level: Number(lvl) as 2 | 3 })
    return `<h${lvl} id="${id}" class="scroll-mt-24">${inner}</h${lvl}>`
  })
  return { html: out, toc }
}

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  type BlogCategory,
  type BlogPost,
  categoryForPost,
  formatPostDate,
  journalCoverSrc,
} from "@/lib/blog"

type BlogCardProps = {
  post: BlogPost
  categories?: BlogCategory[]
  featured?: boolean
  className?: string
}

export function BlogCard({ post, categories = [], featured = false, className }: BlogCardProps) {
  const category = categoryForPost(post, categories)
  const date = formatPostDate(post.published_at)
  const href = `/blog/${post.slug}`
  const src = journalCoverSrc(post)

  if (featured) {
    return (
      <article className={cn("group", className)}>
        <Link href={href} className="grid items-center gap-[2em] no-underline lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CoverImage src={src} alt="" className="aspect-[16/9]" priority />
          </div>
          <div className="lg:col-span-5">
            <MetaLine category={category} date={date} readTime={post.read_time_minutes} />
            <h2 className="mt-[0.75em] m-0 font-outfit text-[clamp(1.75em,3vw,2.5em)] leading-[1.15] font-normal tracking-[-0.03em] text-balance text-[#131111]">
              {post.title}
            </h2>
            {post.excerpt ? (
              <p className="mt-[1em] m-0 font-outfit text-[1em] leading-[1.5] tracking-[-0.02em] text-[#131111]/70">
                {post.excerpt}
              </p>
            ) : null}
            <span className="mt-[1.5em] inline-block font-outfit text-[1.25em] leading-[1.25em] tracking-[-0.02em] text-[#131111] uppercase underline underline-offset-[0.15em]">
              Read →
            </span>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <article className={cn("group", className)}>
      <Link href={href} className="block no-underline">
        <CoverImage src={src} alt="" className="aspect-[4/3]" />
        <MetaLine
          category={category}
          date={date}
          readTime={post.read_time_minutes}
          className="mt-[1em]"
        />
        <h3 className="mt-[0.5em] m-0 font-outfit text-[1.5em] leading-[1.25] font-light tracking-[-0.02em] text-balance text-[#131111]">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-[0.5em] m-0 line-clamp-3 font-outfit text-[1em] leading-[1.4] tracking-[-0.02em] text-[#131111]/70">
            {post.excerpt}
          </p>
        ) : null}
      </Link>
    </article>
  )
}

function MetaLine({
  category,
  date,
  readTime,
  className,
}: {
  category: BlogCategory | null
  date: string
  readTime: number
  className?: string
}) {
  return (
    <p
      className={cn(
        "m-0 font-outfit text-[0.875em] leading-[1.25em] tracking-[-0.02em] text-[#6B635C] uppercase",
        className
      )}
    >
      {[category?.name, date, readTime > 0 ? `${readTime} min` : null].filter(Boolean).join(" · ")}
    </p>
  )
}

function CoverImage({
  src,
  alt,
  className,
  priority,
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[0.125em] bg-[#D9D9D9]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
      />
    </div>
  )
}

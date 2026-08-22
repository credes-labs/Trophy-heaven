"use client"

import Link from "next/link"
import Image from "next/image"
import { localizeImageUrl } from "@/lib/images"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type BlogCategory,
  type BlogPost,
  categoryForPost,
  formatPostDate,
} from "@/lib/blog"
import { fadeUp } from "@/lib/animations"

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

  if (featured) {
    return (
      <motion.article
        className={cn("group overflow-hidden rounded-xl border border-border bg-card", className)}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Link href={href} className="grid md:grid-cols-2">
          <CoverImage
            src={localizeImageUrl(post.cover_image_url)}
            alt={post.title}
            className="aspect-[16/9] md:aspect-auto md:min-h-[320px]"
            priority
          />
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <MetaLine category={category} date={date} readTime={post.read_time_minutes} />
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-foreground transition-colors group-hover:text-accent">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-3 line-clamp-2 text-base text-muted-foreground">{post.excerpt}</p>
            )}
            <span className="mt-6 text-sm font-medium text-accent underline-offset-4 group-hover:underline">
              Read more →
            </span>
          </div>
        </Link>
      </motion.article>
    )
  }

  return (
    <motion.article
      className={cn("group flex flex-col", className)}
      variants={fadeUp}
    >
      <Link href={href} className="flex flex-1 flex-col">
        <CoverImage
          src={localizeImageUrl(post.cover_image_url)}
          alt={post.title}
          className="aspect-[16/9] overflow-hidden rounded-lg"
        />
        <div className="mt-4 flex flex-1 flex-col">
          <MetaLine category={category} date={date} readTime={post.read_time_minutes} />
          <h3 className="mt-2 line-clamp-2 font-serif text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
          )}
          <span className="mt-auto pt-4 text-sm font-medium text-accent underline-offset-4 group-hover:underline">
            Read more →
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

function MetaLine({
  category,
  date,
  readTime,
}: {
  category: BlogCategory | null
  date: string
  readTime: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      {category && <Badge variant="gold">{category.name}</Badge>}
      {date && <span>{date}</span>}
      {date && readTime > 0 && <span aria-hidden>•</span>}
      {readTime > 0 && <span>{readTime} min read</span>}
    </div>
  )
}

function CoverImage({
  src,
  alt,
  className,
  priority,
}: {
  src: string | null
  alt: string
  className?: string
  priority?: boolean
}) {
  if (src) {
    return (
      <div className={cn("relative bg-muted", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-walnut via-furniture to-artwork-dark",
        className
      )}
      aria-hidden
    />
  )
}

"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { BadgeCheck, Star } from "lucide-react"
import {
  createReview,
  listReviews,
  type ReviewSort,
  type ReviewsResponse,
} from "@/lib/reviews"
import { useAuthStore } from "@/stores/auth-store"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "newest", label: "Most recent" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
  { value: "helpful", label: "Most helpful" },
]

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span role="img" className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(rating) ? "fill-gold text-gold" : "text-muted-foreground/40"
          )}
          aria-hidden
        />
      ))}
    </span>
  )
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value)
  )
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createReview({
        product_id: productId,
        rating,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
      })
      setDone(true)
      onSubmitted()
    } catch (err) {
      setError((err as Error).message || "Could not submit your review.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-sm">
        <p className="font-medium text-foreground">Thank you for your review.</p>
        <p className="mt-1 text-muted-foreground">
          It will appear here once our team approves it — usually within a day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-muted/30 p-5">
      <p className="font-medium">Write a review</p>
      <div>
        <span className="text-sm text-muted-foreground">Your rating</span>
        <div className="mt-1.5 flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              onClick={() => setRating(value)}
              className="rounded p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  value <= rating ? "fill-gold text-gold" : "text-muted-foreground/40"
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>
      <Input
        label="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={160}
        placeholder="Sum it up in a line"
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-body" className="text-sm font-medium leading-none">
          Your review
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          maxLength={5000}
          rows={4}
          placeholder="How was the craftsmanship, finish, and delivery?"
          className="flex w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" variant="accent" loading={submitting}>
        Submit review
      </Button>
    </form>
  )
}

export function ProductReviews({ productId }: { productId: string }) {
  const { customer, loading: authLoading, loadCustomer } = useAuthStore()
  const [data, setData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sort, setSort] = useState<ReviewSort>("newest")

  useEffect(() => {
    void loadCustomer()
  }, [loadCustomer])

  const fetchReviews = useCallback(async (nextSort: ReviewSort) => {
    setLoading(true)
    setError(false)
    try {
      setData(await listReviews({ productId, sort: nextSort, limit: 20 }))
    } catch {
      setData(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void fetchReviews(sort)
  }, [sort, fetchReviews])

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Reviews couldn&apos;t be loaded right now. Please check back shortly.
      </p>
    )
  }

  const total = data?.count ?? 0
  const average = data?.average_rating ?? 0
  const distribution = data?.distribution
  const maxBucket = distribution ? Math.max(1, ...Object.values(distribution)) : 1

  return (
    <div className="space-y-8">
      {total > 0 ? (
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-end gap-3">
            <p className="font-serif text-4xl font-semibold">{average.toFixed(1)}</p>
            <div>
              <Stars rating={average} />
              <p className="mt-1 text-xs text-muted-foreground">Based on {total} review{total === 1 ? "" : "s"}</p>
            </div>
          </div>
          {distribution && (
            <ul className="space-y-1.5">
              {(["5", "4", "3", "2", "1"] as const).map((star) => (
                <li key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-6 shrink-0">{star}★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-gold"
                      style={{ width: `${(distribution[star] / maxBucket) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right">{distribution[star]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No reviews yet — be the first to share your experience with this piece.
        </p>
      )}

      {total > 0 && (
        <div>
          <div className="mb-4 flex justify-end">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Sort
              <select
                className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground"
                value={sort}
                onChange={(e) => setSort(e.target.value as ReviewSort)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ul className={cn("space-y-4", loading && "opacity-60")}>
            {(data?.reviews ?? []).map((review) => (
              <li key={review.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={review.rating} />
                    {review.title && <p className="text-sm font-medium">{review.title}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatReviewDate(review.created_at)}</p>
                </div>
                {review.body && (
                  <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {review.is_verified_purchase && (
                    <span className="inline-flex items-center gap-1 text-success">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verified purchase
                    </span>
                  )}
                  {review.helpful_count > 0 && (
                    <span>{review.helpful_count} found this helpful</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {authLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : customer ? (
        <ReviewForm productId={productId} onSubmitted={() => void fetchReviews(sort)} />
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-muted/30 p-5">
          <p className="text-sm text-muted-foreground">
            Sign in to share your experience with this piece.
          </p>
          <Link href="/account/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Sign in to write a review
          </Link>
        </div>
      )}
    </div>
  )
}

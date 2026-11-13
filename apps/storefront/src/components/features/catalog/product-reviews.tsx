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
            i < Math.round(rating) ? "fill-[#131111] text-[#131111]" : "text-[#131111]/25"
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

function reviewInitial(title: string | null) {
  const ch = title?.trim().charAt(0)
  return ch ? ch.toUpperCase() : "TH"
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
      <div className="pdp-review-card font-outfit text-[0.9375em] tracking-[-0.02em]">
        <p className="m-0 text-[#131111]">Thank you for your review.</p>
        <p className="mt-1 m-0 text-[#6B635C]">
          It will appear here once our team approves it — usually within a day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="pdp-review-card space-y-4">
      <p className="m-0 font-outfit text-[1em] tracking-[-0.02em] text-[#131111]">
        Here you can review this item.
      </p>
      <div>
        <span className="font-outfit text-[0.875em] tracking-[-0.02em] text-[#6B635C]">
          Your rating
        </span>
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
                  value <= rating ? "fill-[#131111] text-[#131111]" : "text-[#131111]/25"
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
        className="rounded-[0.125em] border-[#131111]/20"
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-body" className="font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111]">
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
          className="flex w-full rounded-[0.125em] border border-[#131111]/20 bg-transparent px-3 py-2 font-outfit text-[0.875em] tracking-[-0.02em] text-[#131111] transition-colors placeholder:text-[#6B635C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#131111]/30"
        />
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" loading={submitting} className="pdp-atc min-w-0">
        Add review
      </Button>
    </form>
  )
}

function ReviewGate({
  productId,
  authLoading,
  customer,
  onSubmitted,
}: {
  productId: string
  authLoading: boolean
  customer: unknown
  onSubmitted: () => void
}) {
  if (authLoading) {
    return <Skeleton className="h-40 w-full rounded-[0.125em] bg-[#D9D9D9]" />
  }
  if (customer) {
    return <ReviewForm productId={productId} onSubmitted={onSubmitted} />
  }
  return (
    <div className="pdp-review-card flex flex-col items-start gap-3">
      <p className="pdp-muted">Sign in to share your experience with this piece.</p>
      <Link
        href="/account/login"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-[0.125em]")}
      >
        Sign in to write a review
      </Link>
    </div>
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

  const form = (
    <ReviewGate
      productId={productId}
      authLoading={authLoading}
      customer={customer}
      onSubmitted={() => void fetchReviews(sort)}
    />
  )

  if (loading && !data) {
    return (
      <div className="pdp-reviews">
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        {form}
      </div>
    )
  }

  if (error) {
    return (
      <div className="pdp-reviews">
        <p className="pdp-muted">
          Reviews couldn&apos;t be loaded right now. Please check back shortly.
        </p>
        {form}
      </div>
    )
  }

  const total = data?.count ?? 0
  const average = data?.average_rating ?? 0
  const distribution = data?.distribution
  const maxBucket = distribution ? Math.max(1, ...Object.values(distribution)) : 1

  return (
    <div className="pdp-reviews">
      <div className="min-w-0">
        {total > 0 ? (
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex items-end gap-3">
              <p className="m-0 font-outfit text-[2.5em] leading-none font-normal tracking-[-0.04em] text-[#131111]">
                {average.toFixed(1)}
              </p>
              <div>
                <Stars rating={average} />
                <p className="mt-1 m-0 font-outfit text-[0.75em] tracking-[-0.02em] text-[#6B635C]">
                  Based on {total} review{total === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            {distribution && (
              <ul className="m-0 list-none space-y-1.5 p-0">
                {(["5", "4", "3", "2", "1"] as const).map((star) => (
                  <li key={star} className="flex items-center gap-2 font-outfit text-[0.75em] text-[#6B635C]">
                    <span className="w-6 shrink-0">{star}★</span>
                    <span className="h-2 flex-1 overflow-hidden bg-[#131111]/10">
                      <span
                        className="block h-full bg-[#131111]"
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
          <p className="pdp-muted">No reviews yet — be the first to share your experience with this piece.</p>
        )}

        {total > 0 && (
          <div className="mt-[1.75em]">
            <div className="mb-4 flex justify-end">
              <label className="flex items-center gap-2 font-outfit text-[0.875em] text-[#6B635C]">
                Sort
                <select
                  className="h-9 rounded-[0.125em] border border-[#131111]/20 bg-transparent px-3 font-outfit text-[0.875em] text-[#131111]"
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
            <ul className={cn("m-0 list-none space-y-[1.5em] p-0", loading && "opacity-60")}>
              {(data?.reviews ?? []).map((review) => (
                <li key={review.id} className="flex gap-[0.85em] border-b border-[#131111]/10 pb-[1.5em] last:border-0 last:pb-0">
                  <span
                    aria-hidden
                    className="flex size-[2.5em] shrink-0 items-center justify-center rounded-full bg-[#D9D9D9] font-outfit text-[0.75em] tracking-[0.06em] text-[#131111]"
                  >
                    {reviewInitial(review.title)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {review.title ? (
                          <p className="m-0 font-outfit text-[0.9375em] tracking-[-0.02em] text-[#131111]">
                            {review.title}
                          </p>
                        ) : (
                          <p className="m-0 font-outfit text-[0.9375em] tracking-[-0.02em] text-[#131111]">
                            Customer
                          </p>
                        )}
                        <Stars rating={review.rating} />
                      </div>
                      <p className="m-0 font-outfit text-[0.75em] text-[#6B635C]">
                        {formatReviewDate(review.created_at)}
                      </p>
                    </div>
                    {review.body && (
                      <p className="mt-[0.75em] m-0 font-outfit text-[0.9375em] leading-[1.55] font-light tracking-[-0.02em] text-[#6B635C] text-pretty">
                        {review.body}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 font-outfit text-[0.75em] text-[#6B635C]">
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-[#131111]">
                          <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verified purchase
                        </span>
                      )}
                      {review.helpful_count > 0 && (
                        <span>{review.helpful_count} found this helpful</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="min-w-0">{form}</div>
    </div>
  )
}

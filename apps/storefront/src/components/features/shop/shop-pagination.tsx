import { cn } from "@/lib/utils"

type ShopPaginationProps = {
  page: number
  totalPages: number
  onPage: (page: number) => void
  showingFrom?: number
  showingTo?: number
  total?: number
}

function pageLabel(n: number) {
  return String(n).padStart(2, "0")
}

export function ShopPagination({
  page,
  totalPages,
  onPage,
  showingFrom,
  showingTo,
  total,
}: ShopPaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const showing =
    total != null && showingFrom != null && showingTo != null
      ? `Showing ${showingFrom}–${showingTo} of ${total} results`
      : null

  return (
    <div className="mt-[3em] flex flex-wrap items-center justify-between gap-x-[1.25em] gap-y-[0.75em]">
      <nav aria-label="Product pages" className="flex flex-wrap items-center justify-start gap-[0.5em]">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="flex size-[2.5em] cursor-pointer items-center justify-center border border-[#131111]/15 bg-transparent font-outfit text-[1.25em] text-[#131111] disabled:cursor-default disabled:opacity-30"
        >
          ‹
        </button>
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Page ${n}`}
            aria-current={n === page ? "page" : undefined}
            onClick={() => onPage(n)}
            className={cn(
              "flex size-[2.5em] cursor-pointer items-center justify-center border bg-transparent font-outfit text-[0.875em] tracking-[0.06em]",
              n === page
                ? "border-[#131111] bg-[#131111] text-[#F2F1EF]"
                : "border-[#131111]/15 bg-transparent text-[#6B635C] hover:border-[#131111]/40 hover:text-[#131111]"
            )}
          >
            {pageLabel(n)}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="flex size-[2.5em] cursor-pointer items-center justify-center border border-[#131111]/15 bg-transparent font-outfit text-[1.25em] text-[#131111] disabled:cursor-default disabled:opacity-30"
        >
          ›
        </button>
      </nav>
      {showing ? (
        <p className="m-0 font-outfit text-[0.8125em] tracking-[0.08em] text-[#6B635C] uppercase">
          {showing}
        </p>
      ) : null}
    </div>
  )
}

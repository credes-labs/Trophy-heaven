export default function Loading() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center bg-paper-raised font-outfit"
      role="status"
      aria-live="polite"
    >
      <p className="m-0 text-sm uppercase tracking-widest text-ink">Loading…</p>
    </div>
  )
}

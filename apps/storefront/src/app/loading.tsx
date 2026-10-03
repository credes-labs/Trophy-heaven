export default function Loading() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center bg-[#F2F1EF] font-outfit text-[#131111]/5"
      role="status"
      aria-live="polite"
    >
      <p className="m-0 text-sm uppercase tracking-widest">Loading…</p>
    </div>
  )
}

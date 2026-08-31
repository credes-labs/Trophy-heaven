export function EditorialEyebrow({ children }: { children: string }) {
  return (
    <p className="m-0 inline-flex items-center gap-[0.75em] font-outfit text-[1em] leading-[1.25em] font-normal tracking-[-0.02em] text-[#131111] uppercase">
      <span className="size-[0.5em] shrink-0 rounded-full bg-[#131111]" aria-hidden />
      {children}
    </p>
  )
}

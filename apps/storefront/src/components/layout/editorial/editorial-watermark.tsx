export function EditorialWatermark({ children }: { children: string }) {
  return (
    <p
      aria-hidden
      className="pointer-events-none absolute -top-8 left-0 font-outfit text-[clamp(4rem,14vw,11rem)] leading-[0.8] font-light tracking-[-0.08em] text-[#131111]/[0.06] select-none"
    >
      {children}
    </p>
  )
}

export function BlogHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-champagne via-background to-cream/40">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, oklch(0.72 0.10 80 / 0.25), transparent 45%), radial-gradient(circle at 80% 60%, oklch(0.40 0.13 25 / 0.12), transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">Journal</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          The Legacy Journal
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Stories of craft, design, and material — from the workshop floor to the boardroom.
        </p>
      </div>
    </section>
  )
}

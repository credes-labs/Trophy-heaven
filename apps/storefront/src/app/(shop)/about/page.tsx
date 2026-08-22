import type { Metadata } from "next"
import Link from "next/link"
import { Hammer, Landmark, Crosshair, Leaf } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Legacy Crafts is a Bangalore atelier crafting premium trophies, furniture, and artwork with Indian heritage craftsmanship.",
  alternates: { canonical: "/about" },
}

const VALUES = [
  {
    icon: Hammer,
    title: "Craft first",
    description: "Every piece is shaped by hand — sanded, finished, and inspected before it leaves the workshop.",
  },
  {
    icon: Landmark,
    title: "Built to last",
    description: "We design objects meant to be kept, gifted, and remembered — not discarded after a season.",
  },
  {
    icon: Crosshair,
    title: "Precise form",
    description: "Proportion, weight, and finish matter as much as material. Beauty without balance is incomplete.",
  },
  {
    icon: Leaf,
    title: "Honest materials",
    description: "Oak, walnut, brass, crystal — chosen for how they age, feel, and catch light over years of use.",
  },
]

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-walnut via-furniture to-artwork-dark">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 40%, oklch(0.72 0.10 80 / 0.35), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">Our story</p>
          <h1 className="mt-3 max-w-2xl font-serif text-5xl font-semibold text-cream sm:text-6xl">
            Legacy Crafts
          </h1>
          <p className="mt-5 max-w-xl text-lg text-walnut-foreground/80">
            A Bangalore atelier where trophies, furniture, and artwork are made with patience —
            for ceremonies, homes, and collections that deserve permanence.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground">From workshop to stage</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Legacy Crafts began with a simple belief: recognition and living spaces deserve objects
              with soul. We work with artisans across India — woodworkers, metal casters, crystal
              cutters — to translate briefs into pieces that feel ceremonial without being loud.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Whether you need a single desk award or a hundred custom trophies for a corporate
              night, the same standards apply: clean silhouette, honest material, and a finish you
              can feel with your eyes closed.
            </p>
          </div>
          <div className="rounded-xl bg-muted/60 p-8 sm:p-10">
            <h3 className="font-serif text-2xl font-semibold text-foreground">What we make</h3>
            <ul className="mt-6 space-y-4 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Trophies & awards</span> — metal,
                crystal, and wood compositions for boards, sports, and milestones.
              </li>
              <li>
                <span className="font-medium text-foreground">Furniture</span> — bespoke pieces with
                warm timber and refined metal accents.
              </li>
              <li>
                <span className="font-medium text-foreground">Artwork</span> — curated wall pieces
                and sculptural accents for considered interiors.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-champagne py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center font-serif text-3xl font-semibold text-foreground">
            What we stand for
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <Icon className="h-10 w-10 text-gold" strokeWidth={1.25} aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h2 className="font-serif text-3xl font-semibold text-foreground">Explore the collection</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Browse trophies, furniture, and artwork — or start a custom brief with our team.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className={cn(buttonVariants({ size: "lg" }))}>
            Shop now
          </Link>
          <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Talk to us
          </Link>
        </div>
      </section>
    </div>
  )
}

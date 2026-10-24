import Link from "next/link"
import Image from "next/image"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { CategoryAccent, CategoryConfig } from "@/lib/category-config"
import { cn } from "@/lib/utils"

const HERO_GRADIENT: Record<CategoryAccent, string> = {
  trophy: "from-trophy/90 via-trophy-dark/50 to-transparent",
  furniture: "from-furniture/90 via-furniture-dark/50 to-transparent",
  artwork: "from-artwork/90 via-artwork-dark/50 to-transparent",
}

const HERO_BASE: Record<CategoryAccent, string> = {
  trophy: "bg-trophy-dark",
  furniture: "bg-furniture-dark",
  artwork: "bg-artwork-dark",
}

export type CategoryHeroProps = {
  config: CategoryConfig
  productCount?: number
  className?: string
}

export function CategoryHero({ config, productCount, className }: CategoryHeroProps) {
  return (
    <section
      className={cn(
        "relative flex h-[40vh] min-h-[240px] w-full items-end overflow-hidden md:h-[50vh]",
        HERO_BASE[config.accent],
        className
      )}
    >
      <Image
        src={config.imageSrc}
        alt={config.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      <div
        className={cn("absolute inset-0 bg-gradient-to-t", HERO_GRADIENT[config.accent])}
        aria-hidden
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          HERO_GRADIENT[config.accent]
        )}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, oklch(1 0 0 / 0.15), transparent 50%), radial-gradient(circle at 80% 70%, oklch(1 0 0 / 0.08), transparent 40%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 pt-16 sm:px-6 md:pb-12">
        <Breadcrumb className="mb-3">
          <BreadcrumbList className="text-white/70">
            <BreadcrumbItem>
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/80" />
            <BreadcrumbItem>
              <span className="font-medium text-white" aria-current="page">
                {config.label}
              </span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="font-outfit text-4xl font-semibold text-balance text-white md:text-5xl">
          {config.headline}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-base text-white/80 md:text-lg">{config.description}</p>
        {typeof productCount === "number" && (
          <p className="mt-3 text-sm text-white/80">
            {productCount} product{productCount === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </section>
  )
}

export function ShopBreadcrumb() {
  return (
    <Breadcrumb className="mb-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/shop" active>
            Shop
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

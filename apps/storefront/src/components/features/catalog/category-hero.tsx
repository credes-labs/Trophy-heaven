import Link from "next/link"
import { CategoryHeroModels } from "./category-hero-models"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { CategoryConfig } from "@/lib/category-config"
import { cn } from "@/lib/utils"

export type CategoryHeroProps = {
  config: CategoryConfig
  productCount?: number
  className?: string
}

export function CategoryHero({ config, productCount, className }: CategoryHeroProps) {
  return (
    <section
      className={cn("mx-auto grid w-full max-w-7xl items-center gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-14", className)}
      aria-label={`${config.label} collection`}
    >
      <div>
        <Breadcrumb className="mb-5">
          <BreadcrumbList className="text-[#6B635C]">
            <BreadcrumbItem>
              <Link href="/" className="transition-colors hover:text-[#131111]">Home</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-[#131111]" aria-current="page">{config.label}</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="font-outfit text-4xl leading-[1.05] font-medium tracking-[-0.035em] text-balance text-[#131111] sm:text-5xl lg:text-6xl">
          {config.headline}
        </h1>
        <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-[#6B635C] md:text-lg">{config.description}</p>
        {typeof productCount === "number" && (
          <p className="mt-5 text-sm text-[#6B635C]">
            {productCount} product{productCount === 1 ? "" : "s"}
          </p>
        )}
      </div>
      <CategoryHeroModels key={config.key} category={config.key} />
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

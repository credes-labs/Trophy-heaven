import * as React from "react"
import { cn } from "@/lib/utils"

export function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="Breadcrumb" className={className} {...props} />
}

export function BreadcrumbList({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function BreadcrumbItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />
}

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
}

export function BreadcrumbLink({ className, active, ...props }: BreadcrumbLinkProps) {
  return (
    <a
      aria-current={active ? "page" : undefined}
      className={cn(
        "transition-colors hover:text-foreground",
        active && "pointer-events-none font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

export function BreadcrumbSeparator({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li role="presentation" aria-hidden className={cn("", className)} {...props}>
      {children ?? (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="h-3.5 w-3.5">
          <path d="M6.158 3.135a.45.45 0 01.637 0l4.05 4.05a.45.45 0 010 .637l-4.05 4.05a.45.45 0 01-.637-.637L9.89 7.503 6.158 3.772a.45.45 0 010-.637z" fill="currentColor" />
        </svg>
      )}
    </li>
  )
}

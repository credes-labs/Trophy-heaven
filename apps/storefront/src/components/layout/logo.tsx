import Link from "next/link"

export function Logo({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Legacy Crafts home">
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 text-gold"
        fill="currentColor"
        aria-hidden
      >
        <path d="M16 2C16 2 20 8 20 14C20 18 18 20 16 22C14 20 12 18 12 14C12 8 16 2 16 2Z" />
        <path d="M2 16C2 16 8 12 14 12C18 12 20 14 22 16C20 18 18 20 14 20C8 20 2 16 2 16Z" opacity="0.85" />
        <path d="M16 30C16 30 12 24 12 18C12 14 14 12 16 10C18 12 20 14 20 18C20 24 16 30 16 30Z" opacity="0.7" />
        <path d="M30 16C30 16 24 20 18 20C14 20 12 18 10 16C12 14 14 12 18 12C24 12 30 16 30 16Z" opacity="0.85" />
      </svg>
      {!iconOnly && (
        <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
          Legacy Crafts
        </span>
      )}
    </Link>
  )
}

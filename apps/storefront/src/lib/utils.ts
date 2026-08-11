import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Tailwind-aware className combiner used by shadcn-style primitives. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

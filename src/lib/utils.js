import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Merge Tailwind classes intelligently while supporting conditional classnames
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

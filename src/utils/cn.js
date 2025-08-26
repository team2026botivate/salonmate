// src/utils/cn.js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names conditionally and resolve Tailwind conflicts.
 * Usage: cn('px-2', condition && 'px-4', 'text-sm')
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs))
}
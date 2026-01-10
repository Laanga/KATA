import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely
 * Usage: cn('text-white', condition && 'bg-black')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

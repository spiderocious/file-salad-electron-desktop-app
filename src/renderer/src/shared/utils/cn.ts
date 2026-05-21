import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// clsx + tailwind-merge: conditional classes, with last conflicting class
// winning. Never string-concatenate Tailwind classes — concat doesn't resolve
// conflicts (e.g. `px-2 px-4`).
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

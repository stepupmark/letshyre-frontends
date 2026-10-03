import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// clsx for conditionals/arrays, then twMerge resolves Tailwind conflicts
// left-to-right (cn("p-2", "p-4") -> "p-4"). shadcn components import this.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

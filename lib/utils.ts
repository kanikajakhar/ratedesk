import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number as USD with no decimals, e.g. 139 -> "$139". */
export function usd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** Format a fraction as a signed percent, e.g. 0.078 -> "+7.8%", -0.03 -> "-3.0%". */
export function pct(fraction: number): string {
  const v = (fraction * 100).toFixed(1);
  return `${fraction >= 0 ? "+" : ""}${v}%`;
}

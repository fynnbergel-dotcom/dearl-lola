import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Comparison key for "is this the same compliment?" checks. */
export function fingerprint(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Tidy model output: drop wrapping quotes and stray whitespace. */
export function tidyCompliment(text: string): string {
  return text
    .trim()
    .replace(/^["“”'‘’]+/, "")
    .replace(/["“”'‘’]+$/, "")
    .trim();
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

import { z } from "zod";
import { DAYS, MOODS, SEASONS, STYLES, TIMES_OF_DAY } from "./types";

export const LIMITS = {
  name: 40,
  plate: 140,
  recentItems: 12,
  recentItemLength: 320,
} as const;

const INVISIBLES = new RegExp(
  "[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u2028-\\u202e\\u2066-\\u2069]",
  "g",
);

/** Remove control characters, angle brackets and runs of whitespace. */
export function sanitizeText(input: string, max: number): string {
  return input
    .normalize("NFC")
    .replace(INVISIBLES, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const cleanString = (max: number) =>
  z
    .string()
    .max(max * 4) // generous pre-sanitize ceiling; rejects absurd payloads
    .transform((s) => sanitizeText(s, max));

export const complimentRequestSchema = z.object({
  name: cleanString(LIMITS.name).pipe(z.string().min(1, "Name is required")),
  isHonorary: z.boolean().default(false),
  mood: z.enum(MOODS).nullable().optional(),
  plate: cleanString(LIMITS.plate).optional().default(""),
  style: z.enum(STYLES).default("heartfelt"),
  timeOfDay: z.enum(TIMES_OF_DAY),
  dayOfWeek: z.enum(DAYS).optional(),
  season: z.enum(SEASONS).optional(),
  isReturning: z.boolean().default(false),
  streak: z.number().int().min(0).max(3650).default(0),
  recent: z
    .array(cleanString(LIMITS.recentItemLength))
    .max(40)
    .default([])
    .transform((a) => a.filter(Boolean).slice(0, LIMITS.recentItems)),
});

export type ComplimentRequest = z.infer<typeof complimentRequestSchema>;
export type ComplimentRequestInput = z.input<typeof complimentRequestSchema>;

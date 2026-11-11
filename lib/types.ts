export const MOODS = ["radiant", "tired", "nervous", "celebrating", "just-okay"] as const;
export type Mood = (typeof MOODS)[number];

export const STYLES = ["heartfelt", "funny", "poetic", "hype"] as const;
export type ComplimentStyle = (typeof STYLES)[number];

export const TIMES_OF_DAY = ["early-morning", "morning", "afternoon", "evening", "late-night"] as const;
export type TimeOfDay = (typeof TIMES_OF_DAY)[number];

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export type DayOfWeek = (typeof DAYS)[number];

export type ComplimentSource = "ai" | "fallback";

export interface SavedCompliment {
  id: string;
  text: string;
  style: ComplimentStyle;
  createdAt: string;
  source: ComplimentSource;
}

export const MOOD_LABELS: Record<Mood, string> = {
  radiant: "Radiant",
  tired: "Tired",
  nervous: "Nervous",
  celebrating: "Celebrating",
  "just-okay": "Just okay",
};

export const STYLE_META: Record<ComplimentStyle, { label: string; blurb: string }> = {
  heartfelt: { label: "Heartfelt", blurb: "Sincere, quiet, true" },
  funny: { label: "Funny", blurb: "Warm with a wink" },
  poetic: { label: "Poetic", blurb: "Lyrical and soft" },
  hype: { label: "Hype-woman", blurb: "Loud, proud, on your side" },
};

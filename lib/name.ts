/**
 * Name handling. Deliberately forgiving: "Lola", "LOLA", "Lolá", "Lo-la",
 * "Lola M.", "  lola  " all count. "Lolita" or "Lolly" do not (they're lovely,
 * but they're not Lola).
 */

/** Strip accents, punctuation inside the word and surrounding whitespace. */
export function normalizeName(raw: string): string {
  return raw.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/** First "word" of a name with inner hyphens/dots/apostrophes removed. */
export function firstToken(raw: string): string {
  const normalized = normalizeName(raw);
  // Split on whitespace and commas; "Lo-la" stays one token.
  const [first = ""] = normalized.split(/[\s,]+/).filter(Boolean);
  return first.replace(/[^a-z]/g, "");
}

export function isLola(raw: string): boolean {
  return firstToken(raw) === "lola";
}

/** A tidy display form of the person's first name: "fRANCESCA " -> "Francesca". */
export function displayFirstName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  const [first = ""] = trimmed.split(/[\s,]+/);
  const clean = first.replace(/[^\p{L}\p{M}'-]/gu, "").slice(0, 32);
  if (!clean) return "";
  return clean.charAt(0).toLocaleUpperCase() + clean.slice(1).toLocaleLowerCase();
}

export interface NameVerdict {
  /** Name to greet them with. Always "Lola" for Lolas. */
  greetingName: string;
  /** True when they're not a Lola but get honorary status for the day. */
  isHonorary: boolean;
}

export function judgeName(raw: string): NameVerdict | null {
  if (!raw.trim()) return null;
  if (isLola(raw)) return { greetingName: "Lola", isHonorary: false };
  const first = displayFirstName(raw);
  if (!first) return null;
  return { greetingName: first, isHonorary: true };
}

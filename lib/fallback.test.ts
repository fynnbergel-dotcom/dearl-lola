import { describe, expect, it } from "vitest";
import { FALLBACK_BANK, looksSensitive, pickFallback } from "./fallback";
import { STYLES } from "./types";

const emojiRe = /\p{Extended_Pictographic}/gu;

describe("FALLBACK_BANK", () => {
  it("has ~40 compliments, 10 per style", () => {
    for (const s of STYLES) expect(FALLBACK_BANK[s]).toHaveLength(10);
  });

  it("keeps every compliment within ~45 words", () => {
    for (const c of Object.values(FALLBACK_BANK).flat()) {
      expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(45);
    }
  });

  it("uses emojis only in hype, at most one each", () => {
    for (const s of STYLES) {
      for (const c of FALLBACK_BANK[s]) {
        const n = c.match(emojiRe)?.length ?? 0;
        if (s === "hype") expect(n, c).toBeLessThanOrEqual(1);
        else expect(n, c).toBe(0);
      }
    }
  });

  it("has no duplicates", () => {
    const all = Object.values(FALLBACK_BANK).flat();
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("pickFallback", () => {
  it("picks from the requested style", () => {
    const c = pickFallback({ style: "funny", random: () => 0 });
    expect(FALLBACK_BANK.funny).toContain(c);
  });

  it("never returns an excluded compliment while fresh ones remain", () => {
    const exclude = FALLBACK_BANK.poetic.slice(0, 9);
    for (let i = 0; i < 20; i++) {
      expect(pickFallback({ style: "poetic", exclude })).toBe(FALLBACK_BANK.poetic[9]);
    }
  });

  it("ignores punctuation/case differences when excluding", () => {
    const exclude = FALLBACK_BANK.hype.slice(0, 9).map((c) => c.toUpperCase() + "!!");
    expect(pickFallback({ style: "hype", exclude })).toBe(FALLBACK_BANK.hype[9]);
  });

  it("falls back to another style when a style is exhausted", () => {
    const c = pickFallback({ style: "funny", exclude: [...FALLBACK_BANK.funny], random: () => 0 });
    expect(FALLBACK_BANK.funny).not.toContain(c);
    expect(FALLBACK_BANK.heartfelt).toContain(c);
  });

  it("still returns something when every compliment has been seen", () => {
    const everything = Object.values(FALLBACK_BANK).flat();
    expect(pickFallback({ style: "poetic", exclude: everything })).toBeTruthy();
  });

  it("switches to heartfelt for heavy topics regardless of style", () => {
    const c = pickFallback({ style: "hype", plate: "My grandmother's funeral is today", random: () => 0.5 });
    expect(FALLBACK_BANK.heartfelt).toContain(c);
  });
});

describe("looksSensitive", () => {
  it.each(["just got a cancer diagnosis", "feeling hopeless", "I was laid off", "GRIEF"])("flags %j", (t) =>
    expect(looksSensitive(t)).toBe(true),
  );
  it.each(["big presentation", "dentist at 3", "", null])("ignores %j", (t) =>
    expect(looksSensitive(t)).toBe(false),
  );
});

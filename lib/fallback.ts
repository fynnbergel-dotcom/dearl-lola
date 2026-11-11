import type { ComplimentStyle } from "./types";
import { fingerprint } from "./utils";

/**
 * Hand-written compliments used whenever the model is unavailable, slow,
 * rate-limited, or declines. Rules they follow (same as the AI): no comments
 * on appearance, no invented facts, no romance, at most one emoji (hype only).
 */
export const FALLBACK_BANK: Record<ComplimentStyle, readonly string[]> = {
  heartfelt: [
    "There's a steadiness in the way you show up, Lola. Not loud, just reliably there. People feel safer in rooms you've walked into, even if they couldn't tell you why.",
    "You have a rare habit of noticing the person everyone else forgot to ask. That kind of attention is a quiet gift, and it doesn't go unnoticed.",
    "Some people make hard days look easy. You make them look honest, and somehow that's braver.",
    "The way you keep choosing kindness, even when you're running low on it yourself, says more about you than any résumé ever could.",
    "You're the sort of person whose \"I'll be there\" actually means something. That's rarer than it should be, and it's very you.",
    "Your curiosity is generous. You ask questions because you genuinely want the answer, and people leave conversations with you feeling more interesting than when they arrived.",
    "You don't have to be finished to be worth celebrating, Lola. The version of you showing up today is already doing something quietly remarkable.",
    "There's a softness in how you hold other people's stories. You make it easier for them to tell the true version.",
    "You've made it through every hard day so far. That isn't luck; it's a pattern, and it's yours.",
    "Whatever today is asking of you, go gently. You've already done the bravest part, which is showing up as yourself.",
  ],
  funny: [
    "Lola, your name already sounds like a song, which is frankly an unfair head start on charm. You've used it responsibly. Mostly.",
    'Scientists remain baffled by how you make "I\'m just popping by" feel like an event with a guest list.',
    "You have the energy of someone who could win an argument with a group chat and still get invited to brunch afterwards.",
    "If good intentions were a currency, you'd be gently overdrawn from lending them out. Your bank would understand.",
    "Lola is two syllables and both of them are doing their absolute best. So are you, and it shows.",
    "You could make a to-do list feel like a pep talk. Several to-do lists have reportedly asked for your autograph.",
    "Your sense of humour has the timing most sitcoms spend entire seasons chasing.",
    'Somewhere a houseplant is thriving purely because you once told it "you\'re doing great." The plant was right to believe you.',
    "You have main-character energy, but the generous kind: you keep handing the supporting cast their best lines.",
    "Lola walks into a room like it's 1952 and someone just started the piano. The room, wisely, adjusts accordingly.",
  ],
  poetic: [
    "Lola, a name that rises and falls like a small wave, and you move through the world the same way: gently, with a pull people feel.",
    "You are the lamp left on in a window. Nothing dramatic, just the reason someone finds their way home.",
    "There's a slow-film quality to the way you notice things: the light, the pause, the person at the edge of the frame.",
    "Like the first warm evening of a season, you make people want to stay out a little longer.",
    "Some people are full stops. You're the comma, Lola, the breath that lets everyone else's sentence make sense.",
    "You have a way of turning ordinary hours into remembered ones, the way a single song can change an entire drive.",
    "Two soft syllables, la and la, and somehow a whole melody of patience, wit and warmth lives between them.",
    "You carry a quiet kind of glamour: less spotlight, more candlelight, and kinder to everyone around you.",
    "Even your tired days have a grace to them, like a river that's slow but never once forgets the way to the sea.",
    "If kindness had handwriting, it would loop and lean a little like yours.",
  ],
  hype: [
    "LOLA. You walked in and the whole vibe recalibrated. Whatever today throws at you, it should be the one feeling nervous. 🔥",
    "You are doing so much more than you give yourself credit for, and frankly the credit department is behind. Go collect.",
    "Main stage, bright lights, standing ovation: that's the energy you bring to an ordinary weekday. Imagine the weekend. ✨",
    "You don't need a sign, Lola. You ARE the sign. Go do the thing.",
    "Reminder from the committee: you're sharp, you're kind, and your follow-through is unstoppable. Today is lucky to have you on the schedule.",
    "The confidence you have in other people? Point it at yourself for five minutes. Devastating. Incredible. Long overdue.",
    "Old-Hollywood presence, new-era grit. That combination should come with a warning label. 💫",
    "Whoever's on your team today just got an unfair advantage. It's you. You're the unfair advantage, Lola.",
    "You've survived every one of your hardest days and still make time to cheer for other people. Legend behaviour. 👑",
    "Take up a little more space today, Lola. The world has room, and it's better with more of you in it.",
  ],
};

const SENSITIVE =
  /\b(grief|griev|funeral|passed away|died|death|dying|loss|lost (my|her|his|our)|cancer|chemo|diagnos|hospital|surgery|miscarriage|divorce|breakup|broke up|laid off|fired|depress|anxiety|panic|suicid|self[- ]harm|hurt myself|abuse|crisis|can't cope|cannot cope|hopeless)\b/i;

/** True when free text suggests someone is going through something heavy. */
export function looksSensitive(text: string | undefined | null): boolean {
  return !!text && SENSITIVE.test(text);
}

export interface PickOptions {
  style: ComplimentStyle;
  /** Compliments that must not be repeated (session history, saved ones). */
  exclude?: readonly string[];
  /** Free text from the user; heavy topics always get a heartfelt one. */
  plate?: string;
  /** Injected for deterministic tests. */
  random?: () => number;
}

export function pickFallback({ style, exclude = [], plate, random = Math.random }: PickOptions): string {
  const effectiveStyle: ComplimentStyle = looksSensitive(plate) ? "heartfelt" : style;
  const seen = new Set(exclude.map(fingerprint));
  const fresh = (list: readonly string[]) => list.filter((c) => !seen.has(fingerprint(c)));

  let pool = fresh(FALLBACK_BANK[effectiveStyle]);
  if (pool.length === 0 && effectiveStyle !== "heartfelt") pool = fresh(FALLBACK_BANK.heartfelt);
  if (pool.length === 0) pool = fresh(Object.values(FALLBACK_BANK).flat());
  if (pool.length === 0) pool = [...FALLBACK_BANK[effectiveStyle]]; // Truly exhausted: repeat gracefully.

  return pool[Math.floor(random() * pool.length) % pool.length];
}

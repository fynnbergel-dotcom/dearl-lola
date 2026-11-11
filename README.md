# Dear Lola

A small, warm corner of the internet where anyone named Lola gets a personal, original compliment the moment she arrives, written live by Claude and streamed word by word. Not a Lola? You're made an honorary one for the day.

**Stack:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui-style components (Radix) · Framer Motion · Anthropic TypeScript SDK · zod · sonner · Vitest · Playwright

---

## Quick start

```bash
# Node 20.9+ (22 LTS recommended)
npm install
cp .env.example .env.local     # add your ANTHROPIC_API_KEY
npm run dev                    # http://localhost:3000
```

No API key? The app still works end to end. It serves compliments from the hand-written fallback bank, which is also what the tests use.

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | For AI compliments | – | Server-side only. Never sent to the browser. |
| `ANTHROPIC_MODEL` | No | `claude-opus-5-5` | Any Claude model ID. |
| `ANTHROPIC_EFFORT` | No | `low` | `low`/`medium`/`high`/`xhigh`/`max`, or `off` to omit (needed for older models without effort support). Compliments are short; `low` keeps them fast. |
| `NEXT_PUBLIC_SITE_URL` | In production | `http://localhost:3000` | Absolute base for Open Graph image URLs. |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm test` | Unit tests (Vitest): name matching, fallback logic, schema/sanitisation, rate limiter, streaks |
| `npm run test:e2e` | Playwright smoke tests (desktop + mobile), against a production build with no API key |
| `npm run lint` / `npm run typecheck` / `npm run format` | ESLint / `tsc --noEmit` / Prettier |
| `node scripts/screenshots.mjs [outDir] [baseUrl]` | Capture every screen in light/dark × desktop/mobile (expects `next start -p 3100`) |

First Playwright run: `npx playwright install chromium`.

## How it works

```
app/
  page.tsx                  Hero experience + How it works, samples, FAQ
  collection/page.tsx       Saved compliments (masonry, search, style filter, undo delete)
  share/page.tsx            Public share page with dynamic OG image
  api/compliment/route.ts   POST → validated, rate-limited, streamed compliment
  api/og/route.tsx          1200×630 share card (next/og, edge)
  opengraph-image.tsx       Default social card
components/
  experience/               Welcome → Personalize → Compliment steps, streaming text
  collection/ marketing/ ui/  Feature components and shadcn-style primitives
hooks/
  use-compliment.ts         Typed streaming client hook (abort, fallback, de-dup)
  use-lola-store.ts         Shared store over the storage repository
lib/
  prompt.ts                 System prompt + per-request user message
  fallback.ts               40 hand-written compliments + picker
  name.ts                   Forgiving "is this a Lola?" matching
  schema.ts                 zod request schema, length limits, sanitisation
  storage.ts                LolaRepository interface (localStorage today)
  rate-limit.ts  context.ts  og.tsx  sparkles.ts
```

### The compliment pipeline

1. The client sends `{ name, isHonorary, mood, plate, style, timeOfDay, dayOfWeek, season, isReturning, streak, recent[] }`.
2. The route rate-limits by IP (20 per 10 minutes), caps the body at 8 KB, validates it with zod, and strips control characters and angle brackets so user text can't break out of its tags.
3. It streams from Claude via `client.beta.messages.stream` with `effort: low` and server-side refusal fallback (`fallbacks: "default"`). Only visible text deltas reach the browser; thinking blocks never do.
4. **Never an error screen.** A missing key, any API error, an empty reply, or no first token within **6 s** all fall back to a hand-written compliment, streamed the same way. The response header `X-Compliment-Source: ai | fallback` says which one you got. On a 429 the client picks a fallback locally and shows a gentle toast.
5. The client avoids repeats: recent and saved compliments are sent as `recent[]`, and an exact repeat is swapped for a fresh fallback.

### The system prompt

[lib/prompt.ts](lib/prompt.ts) sets the rules. The voice is sincere and specific-feeling, 1–3 sentences, at most ~45 words. Hard boundaries: no remarks about appearance, no romance, no invented biography. Heavy topics get gentle kindness instead of jokes, whatever style was picked. Lola-flavoured wordplay is allowed, but no song lyrics or references. Output is plain text only, with emojis only in hype style (max one). All visitor text is treated strictly as data. The prompt is static; everything that varies goes in the user turn.

### Privacy

Names, favourites, streaks and preferences live only in the browser (`localStorage`). The API logs only the failure class and the Anthropic request ID, never user text. There's no analytics.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel. The defaults are correct; no `vercel.json` is needed.
2. Add `ANTHROPIC_API_KEY`, optionally `ANTHROPIC_MODEL` / `ANTHROPIC_EFFORT`, and `NEXT_PUBLIC_SITE_URL=https://your-domain`.
3. Deploy. `/api/compliment` runs on the Node runtime with streaming; `/api/og` runs on the edge.

> The rate limiter is in-memory, so it limits per serverless instance. For a hard global limit, back `createRateLimiter` with Upstash Redis or Vercel KV (same `check()` signature).

## Recommended next steps

- **Shared rate limiting**: move to Upstash/Vercel KV so the limit holds across instances.
- **Accounts and sync**: implement `LolaRepository` with Supabase (auth by magic link) so a Lola's collection follows her across devices.
- **Prompt evals**: build a small eval set (moods × styles × sensitive notes × injection attempts) and grade tone, length and boundary adherence before changing prompts or models.
- **Prompt caching**: once the system prompt grows past the model's minimum cacheable size, add `cache_control` to it.
- **Self-host fonts for OG**: bundle Fraunces as a file so share images don't depend on Google Fonts at render time.
- **Moderated share links**: share URLs carry compliment text in the query string. If abuse appears, switch to signed IDs that look up stored compliments.
- **Daily reminder**: an opt-in email or push notification ("Your compliment is ready, Lola") to strengthen the streak loop.

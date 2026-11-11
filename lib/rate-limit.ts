/**
 * Sliding-window, in-memory rate limiter.
 *
 * Note: on serverless platforms each instance keeps its own memory, so this is
 * a soft limit. For a hard global limit swap in a shared store (e.g. Upstash
 * Redis) behind the same `check` signature.
 */
export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();
  let lastSweep = Date.now();

  function sweep(now: number) {
    if (now - lastSweep < windowMs) return;
    lastSweep = now;
    for (const [key, times] of hits) {
      const fresh = times.filter((t) => now - t < windowMs);
      if (fresh.length) hits.set(key, fresh);
      else hits.delete(key);
    }
  }

  return {
    check(key: string, now = Date.now()): RateLimitResult {
      sweep(now);
      const times = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (times.length >= limit) {
        const retryAfterSeconds = Math.max(1, Math.ceil((times[0] + windowMs - now) / 1000));
        hits.set(key, times);
        return { ok: false, remaining: 0, retryAfterSeconds };
      }
      times.push(now);
      hits.set(key, times);
      return { ok: true, remaining: limit - times.length, retryAfterSeconds: 0 };
    },
  };
}

export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "anonymous";
}

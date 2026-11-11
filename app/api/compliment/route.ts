import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { pickFallback } from "@/lib/fallback";
import { buildUserMessage, SYSTEM_PROMPT } from "@/lib/prompt";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { complimentRequestSchema, type ComplimentRequest } from "@/lib/schema";
import type { ComplimentSource } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIRST_TOKEN_TIMEOUT_MS = 6_000;
const MAX_BODY_BYTES = 8_192;

const limiter = createRateLimiter({ limit: 20, windowMs: 10 * 60 * 1000 });

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic({ maxRetries: 0, timeout: 20_000 });
  return client;
}

export async function POST(request: Request) {
  const rate = limiter.check(clientKey(request.headers));
  if (!rate.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "That's a lot of kindness in a short while. Here's one from our handwritten collection while we catch our breath.",
      },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = complimentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues.map((i) => i.path.join(".")) },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const anthropic = getClient();
  if (!anthropic) return fallbackResponse(input, "no_api_key");

  // One controller for: client disconnect, first-token timeout, our own cancel.
  const upstream = new AbortController();
  request.signal.addEventListener("abort", () => upstream.abort(), { once: true });

  try {
    const stream = anthropic.beta.messages.stream(
      {
        model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5",
        max_tokens: 2_000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserMessage(input) }],
        ...effortConfig(),
        // If the model declines on policy grounds, let the API retry on its
        // default fallback model. On models without fallbacks this is a no-op.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      },
      { signal: upstream.signal },
    );

    const iterator = textDeltas(stream)[Symbol.asyncIterator]();
    const first = await withTimeout(iterator.next(), FIRST_TOKEN_TIMEOUT_MS);

    if (first === TIMEOUT) {
      upstream.abort();
      return fallbackResponse(input, "slow");
    }
    if (first.done || !first.value.trim()) {
      return fallbackResponse(input, "empty");
    }

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(first.value));
      },
      async pull(controller) {
        try {
          const next = await iterator.next();
          if (next.done) controller.close();
          else controller.enqueue(encoder.encode(next.value));
        } catch (error) {
          logError("stream_interrupted", error);
          controller.close(); // Keep what was already delivered.
        }
      },
      cancel() {
        upstream.abort();
      },
    });

    return streamResponse(body, "ai");
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    logError(errorKind(error), error);
    return fallbackResponse(input, errorKind(error));
  }
}

/** Yield only visible text; thinking blocks are never sent to the client. */
async function* textDeltas(
  stream: AsyncIterable<Anthropic.Beta.Messages.BetaRawMessageStreamEvent>,
): AsyncGenerator<string> {
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta" && event.delta.text) {
      yield event.delta.text;
    }
  }
}

function effortConfig() {
  const effort = process.env.ANTHROPIC_EFFORT ?? "low";
  if (effort === "off") return {};
  if (!["low", "medium", "high", "xhigh", "max"].includes(effort)) return {};
  return { output_config: { effort: effort as "low" | "medium" | "high" | "xhigh" | "max" } };
}

const TIMEOUT = Symbol("timeout");
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | typeof TIMEOUT> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<typeof TIMEOUT>((resolve) => {
    timer = setTimeout(() => resolve(TIMEOUT), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

function errorKind(error: unknown): string {
  if (error instanceof Anthropic.RateLimitError) return "upstream_rate_limited";
  if (error instanceof Anthropic.AuthenticationError) return "auth";
  if (error instanceof Anthropic.BadRequestError) return "bad_request";
  if (error instanceof Anthropic.APIConnectionTimeoutError) return "timeout";
  if (error instanceof Anthropic.APIConnectionError) return "connection";
  if (error instanceof Anthropic.APIError) return `api_${error.status ?? "unknown"}`;
  return "unknown";
}

/** Log the failure class only. User free text is never logged. */
function logError(kind: string, error: unknown) {
  const requestId = error instanceof Anthropic.APIError ? error.requestID : undefined;
  console.warn(`[compliment] fallback: ${kind}${requestId ? ` (request ${requestId})` : ""}`);
}

function streamResponse(body: ReadableStream<Uint8Array>, source: ComplimentSource, reason?: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
      "X-Compliment-Source": source,
      ...(reason ? { "X-Fallback-Reason": reason } : {}),
    },
  });
}

/** Stream a hand-written compliment word by word so it feels the same. */
function fallbackResponse(input: ComplimentRequest, reason: string) {
  const text = pickFallback({ style: input.style, exclude: input.recent, plate: input.plate });
  const words = text.split(/(\s+)/);
  const encoder = new TextEncoder();
  let i = 0;
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (i >= words.length) return controller.close();
      const chunk = words.slice(i, i + 2).join("");
      i += 2;
      await new Promise((r) => setTimeout(r, 45));
      controller.enqueue(encoder.encode(chunk));
    },
  });
  return streamResponse(body, "fallback", reason);
}

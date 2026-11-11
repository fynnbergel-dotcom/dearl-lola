"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pickFallback } from "@/lib/fallback";
import type { ComplimentRequestInput } from "@/lib/schema";
import type { ComplimentSource } from "@/lib/types";
import { fingerprint, tidyCompliment } from "@/lib/utils";

export type ComplimentStatus = "idle" | "streaming" | "done";

export interface UseComplimentResult {
  text: string;
  status: ComplimentStatus;
  source: ComplimentSource | null;
  /** Friendly note to surface (e.g. rate limit). Not an error the user must act on. */
  notice: string | null;
  /** Resolves with the finished compliment, or null if it was aborted. */
  generate: (input: ComplimentRequestInput) => Promise<{ text: string; source: ComplimentSource } | null>;
  abort: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Streams a compliment from /api/compliment. Never throws and never leaves the
 * user empty-handed: any failure falls back to the hand-written bank.
 */
export function useCompliment(): UseComplimentResult {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<ComplimentStatus>("idle");
  const [source, setSource] = useState<ComplimentSource | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  useEffect(() => abort, [abort]);

  const typeOut = useCallback(async (full: string, signal: AbortSignal) => {
    const words = full.split(/(\s+)/);
    let acc = "";
    for (const w of words) {
      if (signal.aborted) return;
      acc += w;
      setText(acc);
      if (w.trim()) await sleep(40);
    }
  }, []);

  const generate = useCallback(
    async (input: ComplimentRequestInput) => {
      abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const { signal } = controller;

      setText("");
      setNotice(null);
      setSource(null);
      setStatus("streaming");

      const exclude = input.recent ?? [];
      const localFallback = () =>
        pickFallback({ style: input.style ?? "heartfelt", exclude, plate: input.plate });

      let result = "";
      let resultSource: ComplimentSource = "fallback";

      try {
        const res = await fetch("/api/compliment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal,
        });

        if (res.status === 429) {
          const data = (await res.json().catch(() => null)) as { message?: string } | null;
          setNotice(data?.message ?? "Taking a short breather. Here's a handwritten one.");
          result = localFallback();
          await typeOut(result, signal);
        } else if (!res.ok || !res.body) {
          result = localFallback();
          await typeOut(result, signal);
        } else {
          resultSource = (res.headers.get("X-Compliment-Source") as ComplimentSource) ?? "ai";
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let acc = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            acc += decoder.decode(value, { stream: true });
            setText(tidyCompliment(acc));
          }
          acc += decoder.decode();
          result = tidyCompliment(acc);

          // Guard against empty output or a repeat of something already seen.
          const seen = new Set(exclude.map(fingerprint));
          if (!result || seen.has(fingerprint(result))) {
            resultSource = "fallback";
            result = localFallback();
            setText("");
            await typeOut(result, signal);
          }
        }
      } catch {
        if (signal.aborted) return null;
        result = localFallback();
        resultSource = "fallback";
        await typeOut(result, signal);
      }

      if (signal.aborted) return null;
      setText(result);
      setSource(resultSource);
      setStatus("done");
      controllerRef.current = null;
      return { text: result, source: resultSource };
    },
    [abort, typeOut],
  );

  return { text, status, source, notice, generate, abort };
}

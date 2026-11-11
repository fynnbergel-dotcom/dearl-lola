"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { judgeName, isLola, type NameVerdict } from "@/lib/name";
import { LIMITS } from "@/lib/schema";
import type { VisitInfo } from "@/lib/storage";

interface Props {
  savedName: string | null;
  hydrated: boolean;
  visit: VisitInfo | null;
  onEnter: (raw: string, verdict: NameVerdict) => void;
}

const reveal = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function WelcomeStep({ savedName, hydrated, visit, onEnter }: Props) {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [honorary, setHonorary] = useState<{ raw: string; verdict: NameVerdict } | null>(null);

  useEffect(() => {
    if (hydrated && savedName) setName(savedName);
  }, [hydrated, savedName]);

  const returningName = visit?.isReturning && savedName ? judgeName(savedName)?.greetingName : null;
  const streak = visit?.streak ?? 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const verdict = judgeName(name);
    if (!verdict) {
      setError("Just a first name will do.");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    if (verdict.isHonorary) setHonorary({ raw: name, verdict });
    else onEnter(name, verdict);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <motion.div
        initial="hidden"
        animate={hydrated ? "show" : "hidden"}
        className="flex flex-col items-center"
      >
        <motion.div custom={0} variants={reveal} className="mb-7 flex h-8 items-center">
          {streak >= 2 ? (
            <span className="border-border bg-bg-elevated/70 text-fg shadow-soft inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium backdrop-blur">
              <Flame className="text-accent size-3.5" aria-hidden />
              {streak} days in a row, {returningName ?? "Lola"}
            </span>
          ) : (
            <span className="border-border bg-bg-elevated/60 text-fg-muted inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium backdrop-blur">
              <span className="bg-accent size-1.5 rounded-full" aria-hidden />A little something, just for you
            </span>
          )}
        </motion.div>

        <motion.h1
          custom={1}
          variants={reveal}
          className="font-display text-fg text-[44px] leading-[1.02] font-normal text-balance sm:text-7xl md:text-[84px]"
        >
          {returningName ? (
            <>
              Welcome back, {returningName}. <em className="text-accent sm:block">Missed you.</em>
            </>
          ) : (
            <>
              Hi, Lola. <em className="text-accent sm:block">We’ve been expecting you.</em>
            </>
          )}
        </motion.h1>

        <motion.p
          custom={2}
          variants={reveal}
          className="text-fg-muted mt-6 max-w-md text-lg text-pretty sm:text-xl"
        >
          Take a breath. Something nice is on its way.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={hydrated ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ delay: 0.28, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-11 w-full max-w-md"
      >
        <AnimatePresence mode="wait" initial={false}>
          {honorary ? (
            <motion.div
              key="honorary"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="glass rounded-[24px] p-6 text-left sm:p-7"
              role="status"
            >
              <p className="font-display text-fg text-2xl leading-snug">
                Hello, {honorary.verdict.greetingName}.
              </p>
              <p className="text-fg-muted mt-2">
                This place is reserved for Lolas, but we&apos;ll make you an honorary one for today.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button autoFocus className="flex-1" onClick={() => onEnter(honorary.raw, honorary.verdict)}>
                  Accept the title
                  <ArrowRight aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setHonorary(null);
                    requestAnimationFrame(() => inputRef.current?.select());
                  }}
                >
                  Change name
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass flex flex-col gap-2 rounded-[24px] p-2 sm:flex-row sm:items-center"
              noValidate
            >
              <label htmlFor={inputId} className="sr-only">
                What&apos;s your name?
              </label>
              <input
                id={inputId}
                ref={inputRef}
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="What's your name?"
                autoComplete="given-name"
                autoCapitalize="words"
                spellCheck={false}
                maxLength={LIMITS.name}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className="text-fg placeholder:text-fg-subtle h-13 min-w-0 flex-1 rounded-2xl bg-transparent px-4 text-[17px] focus:outline-none focus-visible:outline-none"
              />
              <Button type="submit" size="lg" className="h-13">
                {isLola(name) ? "Come in, Lola" : "Come in"}
                <ArrowRight aria-hidden />
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
        <p id={errorId} role="alert" className="text-accent mt-3 min-h-5 text-sm">
          {error}
        </p>
      </motion.div>
    </div>
  );
}

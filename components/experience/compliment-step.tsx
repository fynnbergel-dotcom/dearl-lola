"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Heart, RefreshCw, Share2, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import type { ComplimentStatus } from "@/hooks/use-compliment";
import { useLolaStore } from "@/hooks/use-lola-store";
import { describeMoment } from "@/lib/context";
import type { NameVerdict } from "@/lib/name";
import { savePop } from "@/lib/sparkles";
import { STYLE_META, STYLES, type ComplimentStyle } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { CurrentCompliment } from "./experience";
import { StreamingText } from "./streaming-text";

interface Props {
  verdict: NameVerdict;
  text: string;
  status: ComplimentStatus;
  current: CurrentCompliment | null;
  style: ComplimentStyle;
  onAnother: () => void;
  onStyleChange: (s: ComplimentStyle) => void;
  onAdjust: () => void;
}

export function ComplimentStep({
  verdict,
  text,
  status,
  current,
  style,
  onAnother,
  onStyleChange,
  onAdjust,
}: Props) {
  const { save, remove, isSaved } = useLolaStore();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moment, setMoment] = useState("");
  useEffect(() => setMoment(describeMoment()), []);

  const streaming = status === "streaming";
  const ready = status === "done" && current !== null;
  const saved = current ? isSaved(current.id) : false;

  const dateLine = useMemo(
    () => (moment ? `For ${verdict.greetingName} · ${moment}` : `For ${verdict.greetingName}`),
    [moment, verdict.greetingName],
  );

  function toggleSave(e: React.MouseEvent<HTMLButtonElement>) {
    if (!current) return;
    if (saved) {
      remove(current.id);
      toast("Removed from your collection");
      return;
    }
    save({
      id: current.id,
      text: current.text,
      style: current.style,
      createdAt: new Date().toISOString(),
      source: current.source,
    });
    const r = e.currentTarget.getBoundingClientRect();
    savePop((r.left + r.width / 2) / window.innerWidth, (r.top + r.height / 2) / window.innerHeight);
    toast.success("Saved to your collection", { description: "For the days you need a reread." });
  }

  async function copy() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(`${current.text}\n\n— Dear Lola`);
      setCopied(true);
      toast("Copied. Go on, send it to yourself.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't reach the clipboard. Try selecting the text instead.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Style switcher */}
      <div className="mb-6 flex justify-center">
        <div
          role="radiogroup"
          aria-label="Compliment style"
          className="border-border bg-bg-elevated/60 grid w-full grid-cols-2 gap-1 rounded-2xl border p-1 backdrop-blur sm:inline-flex sm:w-auto"
        >
          {STYLES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={style === s}
              disabled={streaming}
              onClick={() => style !== s && onStyleChange(s)}
              className={cn(
                "relative h-9 rounded-xl px-3.5 text-sm font-medium transition-colors disabled:cursor-wait",
                style === s ? "text-primary-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {style === s && (
                <motion.span
                  layoutId="style-pill"
                  className="bg-primary absolute inset-0 rounded-xl"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{STYLE_META[s].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* The card */}
      <motion.article
        layout
        className="glass relative overflow-hidden rounded-[28px] px-6 py-10 sm:px-14 sm:py-16"
        aria-busy={streaming}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,var(--rose),transparent_65%)] opacity-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full bg-[radial-gradient(circle,var(--lilac),transparent_65%)] opacity-40"
        />

        <p className="text-fg-subtle relative text-[13px] font-medium tracking-wide">{dateLine}</p>

        <div className="relative mt-6 min-h-[9rem] sm:min-h-[11rem]">
          {streaming && !text ? (
            <div className="space-y-4 pt-2" aria-hidden>
              <div className="shimmer h-7 w-[92%] rounded-lg" />
              <div className="shimmer h-7 w-[78%] rounded-lg" />
              <div className="shimmer h-7 w-[54%] rounded-lg" />
              <p className="text-fg-subtle pt-2 text-sm">Choosing the words carefully…</p>
            </div>
          ) : (
            <blockquote
              aria-hidden={streaming}
              className="font-display text-fg text-[27px] leading-[1.28] text-pretty sm:text-[36px] sm:leading-[1.22]"
            >
              <StreamingText text={text} streaming={streaming} />
            </blockquote>
          )}
        </div>

        {/* Screen readers get the whole compliment once, when it's finished. */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {streaming ? "Writing your compliment…" : status === "done" ? text : ""}
        </div>

        <div className="text-fg-subtle relative mt-8 flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="font-display text-lg italic">Dear Lola</span>
        </div>
      </motion.article>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-4 gap-2 sm:flex sm:justify-center">
        <Button onClick={onAnother} disabled={streaming} size="lg" className="col-span-4 sm:col-auto">
          <RefreshCw className={cn(streaming && "animate-spin")} aria-hidden />
          Another one
        </Button>
        <ActionButton label={saved ? "Saved" : "Save"} disabled={!ready} onClick={toggleSave} pressed={saved}>
          <Heart className={cn("transition-all", saved && "fill-accent text-accent scale-110")} aria-hidden />
        </ActionButton>
        <ActionButton label={copied ? "Copied" : "Copy"} disabled={!ready} onClick={copy}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "check" : "copy"}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="grid place-items-center"
            >
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            </motion.span>
          </AnimatePresence>
        </ActionButton>
        <ActionButton label="Share" disabled={!ready} onClick={() => setShareOpen(true)}>
          <Share2 aria-hidden />
        </ActionButton>
        <ActionButton label="Adjust" onClick={onAdjust}>
          <SlidersHorizontal aria-hidden />
        </ActionButton>
      </div>

      {current && (
        <ShareDialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          text={current.text}
          style={current.style}
        />
      )}
    </div>
  );
}

function ActionButton({
  label,
  children,
  pressed,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; pressed?: boolean }) {
  return (
    <Button
      variant="secondary"
      size="lg"
      aria-pressed={pressed}
      className="flex-col gap-1 px-2 text-xs sm:flex-row sm:gap-2 sm:px-5 sm:text-[15px]"
      {...props}
    >
      {children}
      <span>{label}</span>
    </Button>
  );
}

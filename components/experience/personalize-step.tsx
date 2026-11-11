"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Feather, Laugh, Megaphone, Sparkles } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import type { NameVerdict } from "@/lib/name";
import { LIMITS } from "@/lib/schema";
import { MOOD_LABELS, MOODS, STYLE_META, STYLES, type ComplimentStyle, type Mood } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLE_ICON: Record<ComplimentStyle, React.ComponentType<{ className?: string }>> = {
  heartfelt: Sparkles,
  funny: Laugh,
  poetic: Feather,
  hype: Megaphone,
};

const MOOD_EMOJI: Record<Mood, string> = {
  radiant: "☀️",
  tired: "🌙",
  nervous: "🫧",
  celebrating: "🥂",
  "just-okay": "☁️",
};

interface Props {
  verdict: NameVerdict;
  mood: Mood | null;
  plate: string;
  style: ComplimentStyle;
  onMood: (m: Mood | null) => void;
  onPlate: (p: string) => void;
  onStyle: (s: ComplimentStyle) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export function PersonalizeStep(props: Props) {
  const { verdict, mood, plate, style, onMood, onPlate, onStyle, onSubmit, onBack } = props;
  const plateId = useId();
  const moodLabelId = useId();
  const styleLabelId = useId();

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      className="mx-auto w-full max-w-2xl"
    >
      <motion.div variants={item} className="text-center">
        <p className="text-accent text-sm font-medium">
          {verdict.isHonorary ? `Honorary Lola, ${verdict.greetingName}` : "Lovely to see you, Lola"}
        </p>
        <h2 className="font-display text-fg mt-3 text-4xl leading-tight text-balance sm:text-5xl">
          How’s today treating you?
        </h2>
        <p className="text-fg-muted mt-3">Entirely optional. Ten seconds, tops.</p>
      </motion.div>

      <motion.div variants={item} className="glass mt-10 space-y-8 rounded-[24px] p-5 sm:p-8">
        {/* Mood */}
        <fieldset>
          <legend id={moodLabelId} className="text-fg mb-3 text-sm font-medium">
            How are you feeling?
          </legend>
          <div role="radiogroup" aria-labelledby={moodLabelId} className="flex flex-wrap gap-2">
            {MOODS.map((m) => {
              const active = mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onMood(active ? null : m)}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[15px] transition-all duration-200",
                    active
                      ? "border-primary bg-chip-active text-fg shadow-soft"
                      : "border-border bg-chip text-fg-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  <span aria-hidden>{MOOD_EMOJI[m]}</span>
                  {MOOD_LABELS[m]}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Plate */}
        <div>
          <label
            htmlFor={plateId}
            className="text-fg mb-3 flex items-baseline justify-between text-sm font-medium"
          >
            What&apos;s on your plate today?
            <span className="text-fg-subtle text-xs font-normal tabular-nums" aria-hidden>
              {plate.length}/{LIMITS.plate}
            </span>
          </label>
          <input
            id={plateId}
            value={plate}
            onChange={(e) => onPlate(e.target.value.slice(0, LIMITS.plate))}
            maxLength={LIMITS.plate}
            placeholder="A big presentation, a long shift, nothing much…"
            className="border-border bg-bg-elevated/70 text-fg placeholder:text-fg-subtle hover:border-border-strong focus:border-primary h-12 w-full rounded-2xl border px-4 text-[16px] transition-colors focus:outline-none"
          />
        </div>

        {/* Style */}
        <fieldset>
          <legend id={styleLabelId} className="text-fg mb-3 text-sm font-medium">
            Compliment style
          </legend>
          <div
            role="radiogroup"
            aria-labelledby={styleLabelId}
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {STYLES.map((s) => {
              const Icon = STYLE_ICON[s];
              const active = style === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onStyle(s)}
                  className={cn(
                    "group flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                    active
                      ? "border-primary bg-chip-active shadow-soft"
                      : "border-border bg-chip hover:border-border-strong hover:-translate-y-0.5",
                  )}
                >
                  <Icon className={cn("size-5", active ? "text-primary" : "text-fg-muted")} />
                  <span>
                    <span className="text-fg block text-[15px] font-medium">{STYLE_META[s].label}</span>
                    <span className="text-fg-muted block text-[13px]">{STYLE_META[s].blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </motion.div>

      <motion.div
        variants={item}
        className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft aria-hidden />
          Back
        </Button>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          {(mood || plate) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onMood(null);
                onPlate("");
              }}
            >
              Clear
            </Button>
          )}
          <Button type="submit" size="lg">
            {mood || plate ? "Make my day" : "Skip, surprise me"}
            <Sparkles aria-hidden />
          </Button>
        </div>
      </motion.div>
    </motion.form>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCompliment } from "@/hooks/use-compliment";
import { useLolaStore } from "@/hooks/use-lola-store";
import { getDayOfWeek, getSeason, getTimeOfDay } from "@/lib/context";
import type { NameVerdict } from "@/lib/name";
import { welcomeBurst } from "@/lib/sparkles";
import type { ComplimentSource, ComplimentStyle, Mood } from "@/lib/types";
import { newId } from "@/lib/utils";
import { ComplimentStep } from "./compliment-step";
import { PersonalizeStep } from "./personalize-step";
import { WelcomeStep } from "./welcome-step";

type Step = "welcome" | "personalize" | "compliment";

export interface CurrentCompliment {
  id: string;
  text: string;
  style: ComplimentStyle;
  source: ComplimentSource;
}

const stepMotion = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(6px)" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export function Experience() {
  const store = useLolaStore();
  const { state, visit, setName, setPreferredStyle } = store;
  const compliment = useCompliment();

  const [step, setStep] = useState<Step>("welcome");
  const [verdict, setVerdict] = useState<NameVerdict | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [plate, setPlate] = useState("");
  const [style, setStyle] = useState<ComplimentStyle>("heartfelt");
  const [current, setCurrent] = useState<CurrentCompliment | null>(null);
  const sessionHistory = useRef<string[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  // Adopt the remembered style once storage has loaded.
  const styleInitialised = useRef(false);
  useEffect(() => {
    if (store.hydrated && !styleInitialised.current) {
      styleInitialised.current = true;
      setStyle(state.preferredStyle);
    }
  }, [store.hydrated, state.preferredStyle]);

  useEffect(() => {
    if (compliment.notice) toast(compliment.notice);
  }, [compliment.notice]);

  const goTo = useCallback((next: Step) => {
    setStep(next);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleEnter = useCallback(
    (raw: string, v: NameVerdict) => {
      setVerdict(v);
      setName(raw.trim());
      if (!v.isHonorary) welcomeBurst();
      goTo("personalize");
    },
    [goTo, setName],
  );

  const generate = useCallback(
    async (overrideStyle?: ComplimentStyle) => {
      if (!verdict) return;
      const useStyle = overrideStyle ?? style;
      const now = new Date();
      const recent = [
        ...sessionHistory.current.slice(-8),
        ...state.favorites.slice(0, 8).map((f) => f.text),
      ].slice(0, 12);

      setCurrent(null);
      const result = await compliment.generate({
        name: verdict.greetingName,
        isHonorary: verdict.isHonorary,
        mood,
        plate,
        style: useStyle,
        timeOfDay: getTimeOfDay(now),
        dayOfWeek: getDayOfWeek(now),
        season: getSeason(now),
        isReturning: visit?.isReturning ?? false,
        streak: visit?.streak ?? 0,
        recent,
      });
      if (result) {
        sessionHistory.current.push(result.text);
        setCurrent({ id: newId(), text: result.text, style: useStyle, source: result.source });
      }
    },
    [compliment, mood, plate, state.favorites, style, verdict, visit],
  );

  const handleReceive = useCallback(() => {
    setPreferredStyle(style);
    goTo("compliment");
    void generate();
  }, [generate, goTo, setPreferredStyle, style]);

  return (
    <section
      ref={sectionRef}
      aria-label="Your compliment"
      className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl scroll-mt-16 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-20"
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === "welcome" && (
          <motion.div key="welcome" className="w-full" {...stepMotion}>
            <WelcomeStep
              savedName={state.name}
              hydrated={store.hydrated}
              visit={visit}
              onEnter={handleEnter}
            />
          </motion.div>
        )}
        {step === "personalize" && verdict && (
          <motion.div key="personalize" className="w-full" {...stepMotion}>
            <PersonalizeStep
              verdict={verdict}
              mood={mood}
              plate={plate}
              style={style}
              onMood={setMood}
              onPlate={setPlate}
              onStyle={setStyle}
              onSubmit={handleReceive}
              onBack={() => goTo("welcome")}
            />
          </motion.div>
        )}
        {step === "compliment" && verdict && (
          <motion.div key="compliment" className="w-full" {...stepMotion}>
            <ComplimentStep
              verdict={verdict}
              text={compliment.text}
              status={compliment.status}
              current={current}
              style={style}
              onAnother={() => void generate()}
              onStyleChange={(s) => {
                setStyle(s);
                setPreferredStyle(s);
                void generate(s);
              }}
              onAdjust={() => {
                compliment.abort();
                goTo("personalize");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

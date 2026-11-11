import { Feather, HandHeart, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "./reveal";

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-accent text-sm font-medium">{eyebrow}</p>
      <h2 className="font-display text-fg mt-3 text-4xl leading-tight text-balance sm:text-5xl">{title}</h2>
      {sub && <p className="text-fg-muted mt-4 text-lg text-pretty">{sub}</p>}
    </Reveal>
  );
}

const STEPS = [
  {
    icon: HandHeart,
    title: "Say hello",
    body: "Tell us your name. Lolas get the full welcome; everyone else gets an honorary title for the day.",
  },
  {
    icon: Feather,
    title: "Set the mood",
    body: "Optionally share how you're feeling and what's ahead. Pick heartfelt, funny, poetic or full hype.",
  },
  {
    icon: Sparkles,
    title: "Receive something kind",
    body: "A compliment written for this exact moment, word by word. Save it, share it, or ask for another.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow="How it works" title={<span id="how">Thirty seconds, start to smile</span>} />
      <ol className="mt-16 grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal as="li" delay={i * 0.08} key={s.title} className="glass relative rounded-[24px] p-7">
            <div className="flex items-center justify-between">
              <span className="bg-chip-active text-primary grid size-12 place-items-center rounded-2xl">
                <s.icon className="size-5" aria-hidden />
              </span>
              <span className="font-display text-fg-subtle/60 text-4xl italic" aria-hidden>
                0{i + 1}
              </span>
            </div>
            <h3 className="text-fg mt-6 text-lg font-semibold">{s.title}</h3>
            <p className="text-fg-muted mt-2 leading-relaxed">{s.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

const SAMPLES = [
  {
    text: "You have a way of turning ordinary hours into remembered ones, the way a single song can change an entire drive.",
    style: "Poetic",
    moment: "A slow Sunday morning",
  },
  {
    text: "Whatever today is asking of you, go gently. You've already done the bravest part, which is showing up as yourself.",
    style: "Heartfelt",
    moment: "A nervous Monday",
  },
  {
    text: "You don't need a sign, Lola. You ARE the sign. Go do the thing.",
    style: "Hype-woman",
    moment: "Right before a big meeting",
  },
];

export function Samples() {
  return (
    <section aria-labelledby="samples" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        eyebrow="From the notebook"
        title={<span id="samples">A few we’ve written</span>}
        sub="Every compliment is new, but here's a feel for the voice."
      />
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {SAMPLES.map((s, i) => (
          <Reveal
            as="figure"
            key={s.style}
            delay={i * 0.08}
            className="group border-border bg-bg-elevated/70 shadow-soft hover:shadow-card flex flex-col justify-between rounded-[24px] border p-7 transition-all duration-300 hover:-translate-y-1"
          >
            <blockquote className="font-display text-fg text-[22px] leading-snug">
              <span className="text-accent" aria-hidden>
                “
              </span>
              {s.text}
              <span className="text-accent" aria-hidden>
                ”
              </span>
            </blockquote>
            <figcaption className="border-border mt-8 flex items-center justify-between border-t pt-4 text-sm">
              <span className="text-fg-muted">{s.moment}</span>
              <span className="bg-chip text-fg rounded-full px-2.5 py-1 text-xs font-medium">{s.style}</span>
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "Why only Lolas?",
    a: "Because a name deserves its own little corner of the internet, and Lola got there first. It's soft, musical and a touch glamorous, and we think the people who carry it deserve a place that greets them by it. If you're not a Lola, you're welcome too: you'll be made an honorary one for the day.",
  },
  {
    q: "Is it really AI?",
    a: "Yes. Each compliment is written in the moment by Claude, an AI model from Anthropic, guided by a carefully written brief: be sincere and specific, never comment on appearance, never pretend to know you. If the AI is slow or unavailable, you'll get one from our hand-written collection instead, so there's always something kind waiting.",
  },
  {
    q: "Is my data stored?",
    a: "Only in your own browser. Your name, saved compliments and visit streak live in local storage on this device, and clearing your browser data removes them. To write a compliment we send your first name, mood, chosen style and anything you type to the AI provider. We don't keep it, we don't log it, and we don't use analytics that identify you.",
  },
  {
    q: "Will I see the same compliment twice?",
    a: "We work hard not to. Recent and saved compliments are passed along so new ones avoid repeating them, and anything that comes back too similar is quietly swapped out.",
  },
];

export function Faq() {
  return (
    <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow="Questions" title={<span id="faq">Fair questions, honest answers</span>} />
      <Reveal className="mt-12">
        <Accordion type="single" collapsible className="border-border border-t">
          {FAQ.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}

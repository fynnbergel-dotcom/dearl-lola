import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { sanitizeText } from "@/lib/schema";
import { STYLE_META, STYLES, type ComplimentStyle } from "@/lib/types";

type Search = Promise<{ c?: string; s?: string }>;

async function read(searchParams: Search) {
  const { c, s } = await searchParams;
  const text = sanitizeText(typeof c === "string" ? c : "", 300);
  const style = STYLES.includes(s as ComplimentStyle) ? (s as ComplimentStyle) : null;
  return { text, style };
}

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { text, style } = await read(searchParams);
  if (!text) return { title: "A compliment" };
  const image = `/api/og?${new URLSearchParams({ c: text, ...(style ? { s: style } : {}) })}`;
  return {
    title: "Someone sent you something kind",
    description: text,
    robots: { index: false },
    openGraph: { title: "Dear Lola", description: text, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: "Dear Lola", description: text, images: [image] },
  };
}

export default async function SharePage({ searchParams }: { searchParams: Search }) {
  const { text, style } = await read(searchParams);

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 sm:px-6">
      <p className="text-accent text-sm font-medium">A note from Dear Lola</p>
      <article className="glass mt-6 w-full rounded-[28px] px-6 py-12 sm:px-14 sm:py-16">
        <blockquote className="font-display text-fg text-[28px] leading-[1.25] text-pretty sm:text-[38px]">
          {text || "Take a breath. Something nice is on its way."}
        </blockquote>
        <div className="text-fg-subtle mt-10 flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="font-display text-lg italic">
            Dear Lola{style ? ` · ${STYLE_META[style].label}` : ""}
          </span>
        </div>
      </article>
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <p className="text-fg-muted">Are you a Lola? There&apos;s one waiting for you, too.</p>
        <Button asChild size="lg">
          <Link href="/">Get your own</Link>
        </Button>
      </div>
    </section>
  );
}

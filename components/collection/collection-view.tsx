"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Heart, Search, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import { useLolaStore } from "@/hooks/use-lola-store";
import { judgeName } from "@/lib/name";
import { STYLE_META, STYLES, type ComplimentStyle, type SavedCompliment } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = ComplimentStyle | "all";

const dateFmt = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });

export function CollectionView() {
  const { state, hydrated, remove, restore } = useLolaStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sharing, setSharing] = useState<SavedCompliment | null>(null);
  const name = state.name ? (judgeName(state.name)?.greetingName ?? "Lola") : "Lola";

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.favorites.filter(
      (f) => (filter === "all" || f.style === filter) && (!q || f.text.toLowerCase().includes(q)),
    );
  }, [state.favorites, filter, query]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: state.favorites.length,
      heartfelt: 0,
      funny: 0,
      poetic: 0,
      hype: 0,
    };
    state.favorites.forEach((f) => c[f.style]++);
    return c;
  }, [state.favorites]);

  function handleDelete(item: SavedCompliment) {
    remove(item.id);
    toast("Removed from your collection", {
      action: { label: "Undo", onClick: () => restore(item) },
    });
  }

  const empty = hydrated && state.favorites.length === 0;

  return (
    <div className="mx-auto min-h-[70dvh] max-w-6xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20">
      <header className="flex flex-col gap-2">
        <p className="text-accent text-sm font-medium">Kept for later</p>
        <h1 className="font-display text-fg text-5xl leading-tight sm:text-6xl">{name}’s Collection</h1>
        <p className="text-fg-muted max-w-lg text-lg">The ones worth rereading on the days that need it.</p>
      </header>

      {!hydrated ? (
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-border mb-4 break-inside-avoid rounded-[24px] border p-7">
              <div className="shimmer h-5 w-11/12 rounded" />
              <div className="shimmer mt-3 h-5 w-3/4 rounded" />
              <div className="shimmer mt-3 h-5 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : empty ? (
        <EmptyState />
      ) : (
        <>
          <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-80">
              <Search
                className="text-fg-subtle pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
                aria-hidden
              />
              <label htmlFor="collection-search" className="sr-only">
                Search your collection
              </label>
              <input
                id="collection-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your collection"
                className="border-border bg-bg-elevated/70 text-fg placeholder:text-fg-subtle focus:border-primary h-11 w-full rounded-2xl border pr-4 pl-11 text-[15px] focus:outline-none"
              />
            </div>
            <div
              role="radiogroup"
              aria-label="Filter by style"
              className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
            >
              {(["all", ...STYLES] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors",
                    filter === f
                      ? "border-primary bg-chip-active text-fg"
                      : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  {f === "all" ? "All" : STYLE_META[f].label}
                  <span className="text-fg-subtle text-xs tabular-nums">{counts[f]}</span>
                </button>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-fg-muted mt-16 text-center" role="status">
              Nothing matches that just yet. Try another word or style.
            </p>
          ) : (
            <motion.ul layout className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <CollectionCard
                    key={item.id}
                    item={item}
                    onDelete={() => handleDelete(item)}
                    onShare={() => setSharing(item)}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </>
      )}

      {sharing && (
        <ShareDialog
          open={!!sharing}
          onClose={() => setSharing(null)}
          text={sharing.text}
          style={sharing.style}
        />
      )}
    </div>
  );
}

function CollectionCard({
  item,
  onDelete,
  onShare,
}: {
  item: SavedCompliment;
  onDelete: () => void;
  onShare: () => void;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${item.text}\n\n— Dear Lola`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't reach the clipboard.");
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="group mb-4 break-inside-avoid"
    >
      <article className="border-border bg-bg-elevated/75 shadow-soft hover:border-border-strong hover:shadow-card relative rounded-[24px] border p-7 backdrop-blur transition-all duration-300 hover:-translate-y-0.5">
        <p className="font-display text-fg text-[21px] leading-snug">{item.text}</p>
        <div className="mt-6 flex items-center justify-between gap-2">
          <div className="text-fg-subtle flex items-center gap-2 text-xs">
            <span className="bg-chip text-fg rounded-full px-2.5 py-1 font-medium">
              {STYLE_META[item.style].label}
            </span>
            <time dateTime={item.createdAt}>{dateFmt.format(new Date(item.createdAt))}</time>
          </div>
          <div className="flex gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
            <IconBtn label={copied ? "Copied" : "Copy"} onClick={copy}>
              {copied ? <Check /> : <Copy />}
            </IconBtn>
            <IconBtn label="Share" onClick={onShare}>
              <Share2 />
            </IconBtn>
            <IconBtn label="Delete" onClick={onDelete} className="hover:text-accent">
              <Trash2 />
            </IconBtn>
          </div>
        </div>
      </article>
    </motion.li>
  );
}

function IconBtn({
  label,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "text-fg-muted hover:bg-chip hover:text-fg grid size-9 place-items-center rounded-xl transition-colors [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mx-auto mt-14 flex max-w-lg flex-col items-center rounded-[28px] px-8 py-14 text-center"
    >
      <span className="bg-chip-active grid size-16 place-items-center rounded-full">
        <Heart className="text-accent size-7" aria-hidden />
      </span>
      <h2 className="font-display text-fg mt-6 text-3xl">A shelf, waiting</h2>
      <p className="text-fg-muted mt-3 max-w-sm">
        Nothing saved yet. Tap the heart on a compliment you love and it&apos;ll live here, ready for the days
        that need a reread.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">Get today&apos;s compliment</Link>
      </Button>
    </motion.div>
  );
}

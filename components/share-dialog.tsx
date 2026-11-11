"use client";

import { Download, Link2, Share, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ComplimentStyle } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  text: string;
  style: ComplimentStyle;
}

export function shareQuery(text: string, style: ComplimentStyle) {
  return new URLSearchParams({ c: text, s: style }).toString();
}

export function ShareDialog({ open, onClose, text, style }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const query = useMemo(() => shareQuery(text, style), [text, style]);
  const imageUrl = `/api/og?${query}`;

  useEffect(() => setCanShare(typeof navigator !== "undefined" && "share" in navigator), []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setImgLoaded(false);
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open]);

  const pageUrl = () => `${window.location.origin}/share?${query}`;

  async function nativeShare() {
    try {
      await navigator.share({ title: "Dear Lola", text: `“${text}”`, url: pageUrl() });
    } catch {
      /* user dismissed the share sheet */
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl());
      toast.success("Link copied", { description: "Anyone with it sees this card." });
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="share-title"
      className="border-border bg-bg-elevated text-fg shadow-card m-auto w-[min(640px,calc(100vw-2rem))] rounded-[28px] border p-0 backdrop:bg-[rgb(20_10_25/0.45)] backdrop:backdrop-blur-sm open:animate-[dialog-in_260ms_cubic-bezier(0.22,1,0.36,1)]"
    >
      <div className="p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="share-title" className="font-display text-2xl">
            Share the moment
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-fg-muted hover:bg-chip hover:text-fg grid size-10 place-items-center rounded-xl"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-border bg-chip relative aspect-[1200/630] overflow-hidden rounded-2xl border">
          {!imgLoaded && <div className="shimmer absolute inset-0" aria-hidden />}
          {open && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`Share card reading: ${text}`}
              onLoad={() => setImgLoaded(true)}
              className="absolute inset-0 size-full object-cover transition-opacity duration-500"
              style={{ opacity: imgLoaded ? 1 : 0 }}
            />
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row [&>*]:flex-1">
          {canShare && (
            <Button onClick={nativeShare}>
              <Share aria-hidden />
              Share…
            </Button>
          )}
          <Button variant={canShare ? "secondary" : "primary"} onClick={copyLink}>
            <Link2 aria-hidden />
            Copy link
          </Button>
          <Button variant="secondary" asChild>
            <a href={imageUrl} download="dear-lola.png">
              <Download aria-hidden />
              Download image
            </a>
          </Button>
        </div>
      </div>
    </dialog>
  );
}

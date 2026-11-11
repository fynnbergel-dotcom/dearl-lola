"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { sparkleShower } from "@/lib/sparkles";

/**
 * Type "Lola" three times within a few seconds (anywhere, input or not)
 * for a little sparkle shower.
 */
export function EasterEgg() {
  useEffect(() => {
    let buffer = "";
    let hits: number[] = [];

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-4);
      if (buffer !== "lola") return;

      buffer = "";
      const now = Date.now();
      hits = [...hits.filter((t) => now - t < 4000), now];
      if (hits.length >= 3) {
        hits = [];
        sparkleShower();
        toast("Lola, Lola, Lola.", { description: "Say it three times and the sky gets sparkly." });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}

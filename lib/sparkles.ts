"use client";

import type { Options } from "canvas-confetti";

const COLORS = ["#f7c6a8", "#efa7b5", "#cdb8e8", "#b2537a", "#fff1e0"];

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function fire(opts: Options) {
  if (reducedMotion()) return;
  const confetti = (await import("canvas-confetti")).default;
  confetti({ colors: COLORS, disableForReducedMotion: true, zIndex: 60, ...opts });
}

/** A small, tasteful welcome burst from the input area. */
export function welcomeBurst(origin = { x: 0.5, y: 0.55 }) {
  void fire({ particleCount: 70, spread: 75, startVelocity: 32, scalar: 0.85, ticks: 140, origin });
}

/** A gentle shower of sparkles from the top of the screen (easter egg). */
export function sparkleShower() {
  if (reducedMotion()) return;
  const end = Date.now() + 1600;
  const frame = () => {
    void fire({
      particleCount: 4,
      startVelocity: 0,
      gravity: 0.45,
      ticks: 260,
      scalar: 0.7,
      shapes: ["star"],
      origin: { x: Math.random(), y: -0.05 },
      drift: Math.random() - 0.5,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

/** Tiny heart-pop when saving. */
export function savePop(x: number, y: number) {
  void fire({
    particleCount: 18,
    spread: 50,
    startVelocity: 18,
    scalar: 0.6,
    ticks: 80,
    origin: { x, y },
    shapes: ["circle"],
  });
}

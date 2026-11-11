"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLolaStore } from "@/hooks/use-lola-store";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  const pathname = usePathname();
  const { state, hydrated } = useLolaStore();
  const count = state.favorites.length;

  return (
    <header className="border-border/60 bg-bg/70 sticky top-0 z-50 border-b backdrop-blur-xl backdrop-saturate-150">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link href="/" className="rounded-xl" aria-label="Dear Lola, home">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/collection"
            aria-current={pathname === "/collection" ? "page" : undefined}
            className={cn(
              "text-fg-muted hover:bg-chip hover:text-fg inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-colors",
              pathname === "/collection" && "bg-chip text-fg",
            )}
          >
            Collection
            {hydrated && count > 0 && (
              <span
                className="bg-primary text-primary-fg grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums"
                aria-label={`${count} saved`}
              >
                {count}
              </span>
            )}
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

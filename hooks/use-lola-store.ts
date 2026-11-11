"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  addFavorite,
  EMPTY_STATE,
  getRepository,
  recordVisit,
  removeFavorite,
  type LolaState,
  type VisitInfo,
} from "@/lib/storage";
import type { ComplimentStyle, SavedCompliment } from "@/lib/types";

/* A tiny external store so every component sees the same state. */
let current: LolaState | null = null;
let visit: VisitInfo | null = null;
const listeners = new Set<() => void>();

function read(): LolaState {
  if (current === null) {
    current = getRepository().load();
    // Count this page load as a visit exactly once per session.
    const result = recordVisit(current);
    visit = result.visit;
    current = result.state;
    getRepository().save(current);
  }
  return current;
}

function write(next: LolaState) {
  current = next;
  getRepository().save(next);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("dear-lola")) {
      current = getRepository().load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const serverSnapshot = () => EMPTY_STATE;

export function useLolaStore() {
  const state = useSyncExternalStore(subscribe, read, serverSnapshot);
  const hydrated = state !== EMPTY_STATE;

  const save = useCallback((item: SavedCompliment) => write(addFavorite(read(), item)), []);
  const remove = useCallback((id: string) => write(removeFavorite(read(), id)), []);
  const restore = useCallback((item: SavedCompliment) => {
    const s = read();
    write({
      ...s,
      favorites: [...s.favorites, item].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  }, []);
  const setName = useCallback((name: string) => write({ ...read(), name }), []);
  const setPreferredStyle = useCallback(
    (preferredStyle: ComplimentStyle) => write({ ...read(), preferredStyle }),
    [],
  );

  return {
    state,
    hydrated,
    visit: hydrated ? visit : null,
    isSaved: (id: string) => state.favorites.some((f) => f.id === id),
    save,
    remove,
    restore,
    setName,
    setPreferredStyle,
  };
}

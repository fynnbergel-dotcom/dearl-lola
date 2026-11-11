import { computeStreak, dayKey } from "./context";
import type { ComplimentStyle, SavedCompliment } from "./types";

/**
 * Everything Dear Lola remembers lives behind this interface. The MVP uses
 * localStorage; a Supabase (or any other) implementation only needs to
 * implement the same methods and be returned from `getRepository()`.
 */
export interface LolaState {
  name: string | null;
  favorites: SavedCompliment[];
  visitDays: string[];
  lastVisit: string | null;
  preferredStyle: ComplimentStyle;
}

export interface VisitInfo {
  isReturning: boolean;
  streak: number;
}

export interface LolaRepository {
  load(): LolaState;
  save(state: LolaState): void;
}

const KEY = "dear-lola:v1";
const MAX_VISIT_DAYS = 400;
const MAX_FAVORITES = 500;

export const EMPTY_STATE: LolaState = {
  name: null,
  favorites: [],
  visitDays: [],
  lastVisit: null,
  preferredStyle: "heartfelt",
};

class LocalStorageRepository implements LolaRepository {
  load(): LolaState {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return { ...EMPTY_STATE };
      const parsed = JSON.parse(raw) as Partial<LolaState>;
      return {
        ...EMPTY_STATE,
        ...parsed,
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        visitDays: Array.isArray(parsed.visitDays) ? parsed.visitDays : [],
      };
    } catch {
      return { ...EMPTY_STATE };
    }
  }
  save(state: LolaState): void {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Private mode or full storage: the experience still works, it just won't remember.
    }
  }
}

class MemoryRepository implements LolaRepository {
  private state: LolaState = { ...EMPTY_STATE };
  load() {
    return this.state;
  }
  save(state: LolaState) {
    this.state = state;
  }
}

let repo: LolaRepository | null = null;
export function getRepository(): LolaRepository {
  if (repo) return repo;
  repo = typeof window === "undefined" ? new MemoryRepository() : new LocalStorageRepository();
  return repo;
}

// ---- Pure state transitions (easy to test, storage-agnostic) ----

export function recordVisit(state: LolaState, now = new Date()): { state: LolaState; visit: VisitInfo } {
  const today = dayKey(now);
  const isReturning = state.visitDays.length > 0 || state.lastVisit !== null;
  const visitDays = state.visitDays.includes(today)
    ? state.visitDays
    : [...state.visitDays, today].slice(-MAX_VISIT_DAYS);
  const next = { ...state, visitDays, lastVisit: now.toISOString() };
  return { state: next, visit: { isReturning, streak: computeStreak(visitDays, now) } };
}

export function addFavorite(state: LolaState, item: SavedCompliment): LolaState {
  if (state.favorites.some((f) => f.id === item.id)) return state;
  return { ...state, favorites: [item, ...state.favorites].slice(0, MAX_FAVORITES) };
}

export function removeFavorite(state: LolaState, id: string): LolaState {
  return { ...state, favorites: state.favorites.filter((f) => f.id !== id) };
}

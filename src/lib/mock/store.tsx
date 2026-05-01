/**
 * Mock store. Backend-disabled mode.
 * Loads seed data, persists writes to localStorage so the preview survives
 * a refresh, exposes a tiny subscribe API for components that need to react
 * to mutations.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seed, type SeedData } from "./seed";

const KEY = "renewably:mock-store:v1";

type Listener = () => void;
const listeners = new Set<Listener>();

let DATA: SeedData = (() => {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as SeedData;
  } catch {
    /* ignore */
  }
  return seed();
})();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(DATA));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function getData() {
  return DATA;
}

export function update(mutator: (d: SeedData) => void) {
  mutator(DATA);
  persist();
}

export function resetStore() {
  DATA = seed();
  persist();
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/* ─── React surface ──────────────────────────────────────────────── */

const Ctx = createContext<{ data: SeedData; tick: number } | null>(null);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    return subscribe(() => setTick((t) => t + 1));
  }, []);

  const value = useMemo(() => ({ data: DATA, tick }), [tick]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore inside MockStoreProvider");
  return ctx.data;
}

/* ─── Tiny ID factory ────────────────────────────────────────────── */

export function nid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nref(prefix: string) {
  return `${prefix}-${Math.floor(2500 + Math.random() * 7000)}`;
}

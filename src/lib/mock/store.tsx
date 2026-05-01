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

let DATA: SeedData | null = null;

function loadData(): SeedData {
  if (DATA) return DATA;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        DATA = JSON.parse(raw) as SeedData;
        return DATA;
      }
    } catch {
      /* ignore */
    }
  }
  DATA = seed();
  return DATA;
}

function persist() {
  if (typeof window === "undefined") return;
  if (!DATA) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(DATA));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function getData(): SeedData {
  return loadData();
}

export function update(mutator: (d: SeedData) => void) {
  mutator(loadData());
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
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);

  const value = useMemo(() => ({ data: loadData(), tick }), [tick]);
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

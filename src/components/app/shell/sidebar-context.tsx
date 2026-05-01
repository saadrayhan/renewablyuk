/**
 * Sidebar collapsed/open state. One source of truth used by AppSidebar
 * (desktop collapse) and TopBar (mobile drawer + toggle button).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type SidebarState = {
  /** Desktop collapsed (icon-only) vs expanded. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile off-canvas drawer open. */
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

const Ctx = createContext<SidebarState | null>(null);
const KEY = "renewably:sidebar-collapsed:v1";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setCollapsed(raw === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <Ctx.Provider
      value={{ collapsed, toggleCollapsed, mobileOpen, setMobileOpen }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSidebarState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSidebarState inside SidebarProvider");
  return ctx;
}

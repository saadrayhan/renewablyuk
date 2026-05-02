/**
 * Global command palette (⌘K / Ctrl+K).
 * Mounted once inside the authed shell.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Home,
  FolderKanban,
  FileBadge,
  Database,
  Send,
  Sparkles,
  Settings as SettingsIcon,
  User,
  Briefcase,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useStore } from "@/lib/mock/store";

type Ctx = { open: boolean; setOpen: (v: boolean) => void; toggle: () => void };
const CommandPaletteCtx = createContext<Ctx | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
  return (
    <CommandPaletteCtx.Provider value={value}>
      {children}
      <CommandPalette />
    </CommandPaletteCtx.Provider>
  );
}

export function useCommandPalette() {
  const c = useContext(CommandPaletteCtx);
  if (!c) throw new Error("useCommandPalette inside CommandPaletteProvider");
  return c;
}

const NAV = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "IBG Generator", to: "/ibg/new", icon: FileBadge },
  { label: "IBG Repository", to: "/ibg/repository", icon: Database },
  { label: "Submissions", to: "/submissions", icon: Send },
  { label: "Funding", to: "/funding", icon: Sparkles },
  { label: "Settings", to: "/settings/profile", icon: SettingsIcon },
] as const;

function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const data = useStore();
  const navigate = useNavigate();

  function go(path: string, params?: Record<string, string>) {
    setOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate({ to: path as any, params: params as any });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search customers, jobs, IBGs… or jump to a page" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <CommandItem key={n.to} value={`nav ${n.label}`} onSelect={() => go(n.to)}>
                <Icon className="size-4 text-ink-muted" />
                <span>{n.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Customers">
          {data.customers.slice(0, 12).map((c) => (
            <CommandItem
              key={c.id}
              value={`customer ${c.name} ${c.ref}`}
              onSelect={() => go("/customers/$id", { id: c.id })}
            >
              <User className="size-4 text-ink-muted" />
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-[11px] text-ink-muted">{c.ref}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Jobs">
          {data.jobs.slice(0, 12).map((j) => {
            const cust = data.customers.find((c) => c.id === j.customerId);
            return (
              <CommandItem
                key={j.id}
                value={`job ${j.ref} ${j.measure} ${cust?.name ?? ""}`}
                onSelect={() => go("/jobs/$id", { id: j.id })}
              >
                <Briefcase className="size-4 text-ink-muted" />
                <span className="flex-1 truncate">
                  {j.ref} · {j.measure}
                </span>
                <span className="text-[11px] text-ink-muted">{cust?.name ?? ""}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="IBGs">
          {data.ibgs.slice(0, 12).map((i) => (
            <CommandItem
              key={i.id}
              value={`ibg ${i.ref} ${i.customerName}`}
              onSelect={() => go("/ibg/$id", { id: i.id })}
            >
              <FileBadge className="size-4 text-ink-muted" />
              <span className="flex-1 truncate">{i.ref}</span>
              <span className="text-[11px] text-ink-muted">{i.customerName}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

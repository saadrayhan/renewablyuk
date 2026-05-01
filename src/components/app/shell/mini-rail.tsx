/**
 * Mini icon rail — the left-most strip in the ElevenLabs layout.
 * Shows the workspace avatar, primary section icons, and a footer trigger.
 *
 * Section icons are *role-aware navigation shortcuts*; clicking sets the
 * current route. Active state is derived from URL.
 */

import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Grid3x3,
  FileBadge,
  FolderKanban,
  Sparkles,
  Send,
  Settings as SettingsIcon,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type RailItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const ITEMS: RailItem[] = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "IBG", to: "/ibg/repository", icon: FileBadge },
  { label: "Funding", to: "/funding", icon: Sparkles },
  { label: "Submissions", to: "/submissions", icon: Send },
  { label: "Admin", to: "/admin/users", icon: Shield, adminOnly: true },
];

export function MiniRail() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useAuth();

  const items = ITEMS.filter((i) => !i.adminOnly || isAdmin);

  return (
    <aside className="sticky top-0 flex h-screen w-[56px] shrink-0 flex-col items-center border-r bg-background py-3">
      <Link
        to="/dashboard"
        className="press grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cat-green to-cat-blue text-white shadow-sm"
        aria-label="Renewably home"
      >
        <span className="text-sm font-semibold">R</span>
      </Link>

      <div className="mt-4 flex flex-1 flex-col items-center gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(path, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={cn(
                "press group relative grid size-9 place-items-center rounded-xl transition-colors",
                active
                  ? "bg-tile text-foreground"
                  : "text-ink-muted hover:bg-surface hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" />
              <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background group-hover:block">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        to="/settings/profile"
        aria-label="Settings"
        className="press grid size-9 place-items-center rounded-xl text-ink-muted hover:bg-surface hover:text-foreground"
      >
        <SettingsIcon className="size-[18px]" />
      </Link>
      <Link
        to="/dashboard"
        aria-label="Apps"
        className="press mt-1 grid size-9 place-items-center rounded-xl text-ink-muted hover:bg-surface hover:text-foreground"
      >
        <Grid3x3 className="size-[18px]" />
      </Link>
    </aside>
  );
}

function isActive(path: string, to: string) {
  if (to === "/dashboard") return path === "/dashboard";
  // Match nearest section.
  const root = "/" + to.split("/").filter(Boolean)[0];
  return path.startsWith(root);
}

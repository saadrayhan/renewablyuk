import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileBadge,
  Briefcase,
  Users,
  Building2,
  Send,
  Sparkles,
  BarChart3,
  Database,
  Settings,
  Bell,
  Plus,
  Lock,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

type Tier = "access" | "operate";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  requires?: Tier;
  trailing?: React.ReactNode;
};

const main: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "IBG", to: "/ibg/history", icon: FileBadge },
];

const operateGroup: NavItem[] = [
  { label: "Jobs", to: "/jobs", icon: Briefcase, requires: "operate" },
  { label: "Customers", to: "/customers", icon: Users, requires: "operate" },
  { label: "Properties", to: "/properties", icon: Building2, requires: "operate" },
  { label: "Submissions", to: "/submissions", icon: Send, requires: "operate" },
  { label: "Funding", to: "/funding", icon: Sparkles, requires: "operate" },
];

const insightsGroup: NavItem[] = [
  { label: "Reports", to: "/reports", icon: BarChart3, requires: "operate" },
  {
    label: "IBG Repository",
    to: "/ibg/repository",
    icon: Database,
    requires: "operate",
  },
];

const footerGroup: NavItem[] = [
  { label: "Settings", to: "/settings/profile", icon: Settings },
  { label: "Notifications", to: "/settings/notifications", icon: Bell },
];

export function AppSidebar({ tier = "access" as Tier }: { tier?: Tier }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const initials =
    (user?.user_metadata?.full_name as string | undefined)
      ?.split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "U";

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-[var(--dur-4)] ease-[cubic-bezier(0.32,0.72,0,1)]",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      {/* Logo + collapse */}
      <div className="flex h-14 items-center justify-between px-3">
        <Link
          to="/dashboard"
          className="press flex items-center gap-2 rounded-lg px-2 py-1.5"
        >
          <div className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs font-semibold">R</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">
              Renewably
            </span>
          )}
        </Link>
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((v) => !v)}
          className="press grid size-7 place-items-center rounded-md text-ink-muted hover:bg-sidebar-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-1">
        <Group items={main} tier={tier} collapsed={collapsed}>
          {!collapsed && (
            <Link
              to="/ibg/new"
              className="press grid size-6 place-items-center rounded-md text-ink-muted hover:bg-background hover:text-foreground"
              aria-label="New IBG"
            >
              <Plus className="size-3.5" />
            </Link>
          )}
        </Group>

        <SectionLabel collapsed={collapsed}>Operate</SectionLabel>
        <Group items={operateGroup} tier={tier} collapsed={collapsed} />

        <SectionLabel collapsed={collapsed}>Insights</SectionLabel>
        <Group items={insightsGroup} tier={tier} collapsed={collapsed} />

        <div className="my-3 h-px bg-sidebar-border" />
        <Group items={footerGroup} tier={tier} collapsed={collapsed} />
      </nav>

      {/* Account footer */}
      <div className="border-t p-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl p-2",
            !collapsed && "hover:bg-sidebar-accent",
          )}
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {(user?.user_metadata?.full_name as string | undefined) ??
                  user?.email ??
                  "Account"}
              </div>
              <div className="truncate text-xs capitalize text-ink-muted">
                {tier} plan
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="press grid size-7 place-items-center rounded-md text-ink-muted hover:bg-background hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  if (collapsed) return <div className="my-3 h-px bg-sidebar-border" />;
  return (
    <div className="px-3 pb-1.5 pt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
      {children}
    </div>
  );
}

function Group({
  items,
  tier,
  collapsed,
  children,
}: {
  items: NavItem[];
  tier: Tier;
  collapsed: boolean;
  children?: React.ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const locked = item.requires === "operate" && tier !== "operate";
        const active =
          path === item.to ||
          (item.to !== "/dashboard" && path.startsWith(item.to));

        return (
          <li key={item.to}>
            <Link
              to={item.to}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                active
                  ? "bg-sidebar-accent font-medium text-foreground"
                  : "text-ink-muted hover:bg-sidebar-accent hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && locked && (
                <Lock className="size-3.5 text-ink-muted/70" />
              )}
              {!collapsed && !locked && children}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

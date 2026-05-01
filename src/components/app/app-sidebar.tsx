import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  FilePlus2,
  History,
  Database,
  Send,
  Sparkles,
  Settings,
  Lock,
  ChevronsLeft,
  ChevronsRight,
  Shield,
  Users,
  ScrollText,
  Activity,
  ClipboardList,
  FileWarning,
  Library,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { canAny, type Permission } from "@/lib/rbac";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Visible to anyone holding ANY of these permissions. */
  visibleIf?: Permission[];
  /** Lock indicator when present but disabled. Item still shows. */
  showLockedIfNot?: Permission[];
};

const main: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  {
    label: "Projects",
    to: "/projects",
    icon: FolderKanban,
    showLockedIfNot: ["customers.read", "jobs.read", "properties.read"],
  },
];

const ibgGroup: NavItem[] = [
  {
    label: "IBG Generator",
    to: "/ibg/new",
    icon: FilePlus2,
    showLockedIfNot: ["ibg.issue"],
  },
  { label: "IBG History", to: "/ibg/history", icon: History },
  {
    label: "IBG Repository",
    to: "/ibg/repository",
    icon: Database,
    showLockedIfNot: ["ibg.repository.read"],
  },
];

const workGroup: NavItem[] = [
  {
    label: "Submissions",
    to: "/submissions",
    icon: Send,
    showLockedIfNot: ["submissions.read"],
  },
  {
    label: "Funding",
    to: "/funding",
    icon: Sparkles,
    showLockedIfNot: ["funding.match.read", "funding.projects.read"],
  },
];

// Admin-only conditional items — only render at all if the user has the perm.
const adminGroup: NavItem[] = [
  { label: "Users", to: "/admin/users", icon: Users, visibleIf: ["users.read"] },
  { label: "Audit log", to: "/admin/audit", icon: ScrollText, visibleIf: ["audit.read"] },
  { label: "Activity", to: "/admin/activity", icon: Activity, visibleIf: ["activity.read"] },
  { label: "Onboarding queue", to: "/admin/onboarding", icon: ClipboardList, visibleIf: ["onboarding.queue.read"] },
  { label: "Amendments", to: "/admin/amendments", icon: FileWarning, visibleIf: ["amendments.queue.read"] },
  { label: "Permission library", to: "/admin/permissions", icon: Library, visibleIf: ["permissions.library.manage"] },
  { label: "System config", to: "/admin/config", icon: SlidersHorizontal, visibleIf: ["config.read"] },
];

const footerGroup: NavItem[] = [
  { label: "Settings", to: "/settings/profile", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, permissions } = useAuth();

  const visibleAdmin = adminGroup.filter(
    (item) => !item.visibleIf || canAny(permissions, item.visibleIf),
  );

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-[var(--dur-4)] ease-[cubic-bezier(0.32,0.72,0,1)]",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
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
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-1">
        <Group items={main} permissions={permissions} collapsed={collapsed} />

        <SectionLabel collapsed={collapsed}>IBG</SectionLabel>
        <Group items={ibgGroup} permissions={permissions} collapsed={collapsed} />

        <SectionLabel collapsed={collapsed}>Workflows</SectionLabel>
        <Group items={workGroup} permissions={permissions} collapsed={collapsed} />

        {visibleAdmin.length > 0 && (
          <>
            <SectionLabel collapsed={collapsed} icon={Shield}>
              Admin
            </SectionLabel>
            <Group
              items={visibleAdmin}
              permissions={permissions}
              collapsed={collapsed}
            />
          </>
        )}

        <div className="my-3 h-px bg-sidebar-border" />
        <Group items={footerGroup} permissions={permissions} collapsed={collapsed} />
      </nav>

      <div className="border-t p-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl p-2",
            !collapsed && "hover:bg-sidebar-accent",
          )}
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.fullName}</div>
              <div className="truncate text-xs text-ink-muted">
                {user.roleLabel}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({
  children,
  collapsed,
  icon: Icon,
}: {
  children: React.ReactNode;
  collapsed: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  if (collapsed) return <div className="my-3 h-px bg-sidebar-border" />;
  return (
    <div className="flex items-center gap-1.5 px-3 pb-1.5 pt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
      {Icon && <Icon className="size-3" />}
      {children}
    </div>
  );
}

function Group({
  items,
  permissions,
  collapsed,
}: {
  items: NavItem[];
  permissions: Permission[];
  collapsed: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const locked =
          !!item.showLockedIfNot &&
          !canAny(permissions, item.showLockedIfNot);
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
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

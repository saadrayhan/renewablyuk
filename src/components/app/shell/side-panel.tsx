/**
 * Secondary sidebar — the wider 240px panel that lives next to the
 * mini-rail. Holds workspace switcher, primary nav, "Pinned" group, and
 * the "Invite team members" card pinned to the bottom.
 */

import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  FolderKanban,
  FileBadge,
  History,
  Database,
  Send,
  Sparkles,
  Settings,
  Shield,
  Users,
  ScrollText,
  Activity,
  ClipboardList,
  FileWarning,
  Library,
  SlidersHorizontal,
  Lock,
  Send as Invite,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { canAny, type Permission } from "@/lib/rbac";

type Item = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleIf?: Permission[];
  showLockedIfNot?: Permission[];
};

const main: Item[] = [
  { label: "Home", to: "/dashboard", icon: Home },
  {
    label: "Projects",
    to: "/projects",
    icon: FolderKanban,
    showLockedIfNot: ["customers.read", "jobs.read", "properties.read"],
  },
  {
    label: "IBG Generator",
    to: "/ibg/new",
    icon: FileBadge,
    showLockedIfNot: ["ibg.issue"],
  },
  { label: "IBG History", to: "/ibg/history", icon: History },
  {
    label: "IBG Repository",
    to: "/ibg/repository",
    icon: Database,
    showLockedIfNot: ["ibg.repository.read"],
  },
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

const pinned: Item[] = [
  { label: "Issue an IBG", to: "/ibg/new", icon: FileBadge, showLockedIfNot: ["ibg.issue"] },
  { label: "All jobs", to: "/jobs", icon: FolderKanban, showLockedIfNot: ["jobs.read"] },
];

const adminGroup: Item[] = [
  { label: "Users", to: "/admin/users", icon: Users, visibleIf: ["users.read"] },
  { label: "Onboarding queue", to: "/admin/onboarding", icon: ClipboardList, visibleIf: ["onboarding.queue.read"] },
  { label: "Amendments", to: "/admin/amendments", icon: FileWarning, visibleIf: ["amendments.queue.read"] },
  { label: "Activity", to: "/admin/activity", icon: Activity, visibleIf: ["activity.read"] },
  { label: "Audit log", to: "/admin/audit", icon: ScrollText, visibleIf: ["audit.read"] },
  { label: "Permission library", to: "/admin/permissions", icon: Library, visibleIf: ["permissions.library.manage"] },
  { label: "System config", to: "/admin/config", icon: SlidersHorizontal, visibleIf: ["config.read"] },
];

const footer: Item[] = [
  { label: "Settings", to: "/settings/profile", icon: Settings },
];

export function SidePanel() {
  const { permissions, isAdmin } = useAuth();
  const { onboardingStep } = useDevRole();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const visibleAdmin = adminGroup.filter(
    (i) => !i.visibleIf || canAny(permissions, i.visibleIf),
  );
  const onboardingActive = onboardingStep !== "complete";

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r bg-sidebar">
      <div className="px-3 pt-3">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-3">
        {main.map((item) => (
          <NavRow key={item.to} item={item} permissions={permissions} path={path} />
        ))}

        {onboardingActive && (
          <Link
            to="/onboarding"
            className="mt-2 flex items-center gap-2 rounded-lg bg-cat-amber-bg px-3 py-2 text-xs font-medium text-cat-amber"
          >
            <ClipboardList className="size-3.5" />
            Continue onboarding
          </Link>
        )}

        <SectionLabel>Pinned</SectionLabel>
        {pinned.map((item) => (
          <NavRow key={item.to} item={item} permissions={permissions} path={path} />
        ))}

        {visibleAdmin.length > 0 && (
          <>
            <SectionLabel icon={Shield}>Admin</SectionLabel>
            {visibleAdmin.map((item) => (
              <NavRow key={item.to} item={item} permissions={permissions} path={path} />
            ))}
          </>
        )}

        <div className="my-3 h-px bg-sidebar-border" />
        {footer.map((item) => (
          <NavRow key={item.to} item={item} permissions={permissions} path={path} />
        ))}
      </nav>

      {isAdmin ? (
        <InviteCard />
      ) : (
        <DevelopersFooter />
      )}
    </aside>
  );
}

function NavRow({
  item,
  permissions,
  path,
}: {
  item: Item;
  permissions: Permission[];
  path: string;
}) {
  const Icon = item.icon;
  const locked = !!item.showLockedIfNot && !canAny(permissions, item.showLockedIfNot);
  const active = isActive(path, item.to);

  return (
    <Link
      to={item.to}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm",
        active
          ? "bg-sidebar-accent text-foreground"
          : "text-ink-muted hover:bg-sidebar-accent hover:text-foreground",
      )}
    >
      <Icon className="size-[16px] shrink-0" />
      <span className="flex-1 truncate font-normal">{item.label}</span>
      {locked && <Lock className="size-3 text-ink-muted/70" />}
    </Link>
  );
}

function isActive(path: string, to: string) {
  if (to === "/dashboard") return path === "/dashboard";
  return path === to || path.startsWith(to + "/");
}

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mt-4 flex items-center gap-1.5 px-3 pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
      {Icon && <Icon className="size-3" />}
      {children}
    </div>
  );
}

function InviteCard() {
  return (
    <div className="m-3 rounded-2xl border bg-background p-3">
      <div className="grid size-7 place-items-center rounded-lg bg-cat-blue-bg text-cat-blue">
        <Invite className="size-3.5" />
      </div>
      <div className="mt-2 text-[13px] font-medium text-foreground">
        Invite team members
      </div>
      <div className="mt-1 text-[11px] leading-snug text-ink-muted">
        Bring your team into your workspace.
      </div>
      <Link
        to="/admin/users"
        className="press mt-2 inline-flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-1.5 text-[11px] font-medium text-background"
      >
        Invite
      </Link>
    </div>
  );
}

function DevelopersFooter() {
  return (
    <div className="border-t px-3 py-3">
      <Link
        to="/settings/profile"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-ink-muted hover:bg-surface hover:text-foreground"
      >
        <Settings className="size-3.5" />
        Account
      </Link>
    </div>
  );
}

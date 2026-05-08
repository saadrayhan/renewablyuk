/**
 * Single ElevenLabs-style sidebar.
 *
 * Three modes:
 *  - desktop expanded   (240px, full labels + section headers)
 *  - desktop collapsed  (60px, icons + tooltips on hover)
 *  - mobile drawer      (off-canvas, controlled by mobileOpen)
 *
 * Replaces the previous MiniRail + SidePanel pair.
 */

import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { InviteDialog } from "@/components/app/invite-dialog";
import {
  Home,
  FolderKanban,
  FileBadge,
  Database,
  Send,
  Sparkles,
  Settings as SettingsIcon,
  Users,
  ScrollText,
  Activity,
  History,
  ClipboardList,
  FileWarning,
  Library,
  SlidersHorizontal,
  Lock,
  Shield,
  ShieldAlert,
  Plug,
  BarChart2,
  Building2,
  CreditCard,
  Receipt,
  Workflow,
  ToggleRight,
  Clock,
  DollarSign,
  ListChecks,
  Layers,
  KeyRound,
  Globe,
  ShieldOff,
  Award,
  FileText,
  Inbox,
  LayoutTemplate,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { useMembership } from "@/lib/membership";
import { canAny, type Permission } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useSidebarState } from "./sidebar-context";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleIf?: Permission[];
  showLockedIfNot?: Permission[];
  hideForRoles?: Role[];
};

type Tier = "access" | "operate";

const main: (NavItem & { tier?: Tier })[] = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Certificates", to: "/certificates", icon: Award, hideForRoles: ["admin"] },
  { label: "Documents", to: "/documents", icon: FileText, hideForRoles: ["admin"] },
  {
    label: "Projects",
    to: "/projects",
    icon: FolderKanban,
    showLockedIfNot: ["customers.read", "jobs.read", "properties.read"],
    tier: "operate",
  },
  {
    label: "IBG Generator",
    to: "/ibg/new",
    icon: FileBadge,
    showLockedIfNot: ["ibg.issue"],
    hideForRoles: ["admin"],
  },
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
    tier: "operate",
  },
  {
    label: "Funding",
    to: "/funding",
    icon: Sparkles,
    showLockedIfNot: ["funding.match.read", "funding.projects.read"],
    tier: "operate",
  },
  {
    label: "Reports",
    to: "/reports",
    icon: BarChart2,
    showLockedIfNot: ["reports.read"],
  },
  { label: "Tickets", to: "/tickets", icon: Inbox, hideForRoles: ["admin"] },
  { label: "Membership", to: "/membership", icon: CreditCard, hideForRoles: ["admin"] },
];

type AdminGroup = { label: string; items: NavItem[] };

const adminGroups: AdminGroup[] = [
  {
    label: "Companies & Users",
    items: [
      { label: "Companies", to: "/admin/companies", icon: Building2, visibleIf: ["users.read"] },
      { label: "Users", to: "/admin/users", icon: Users, visibleIf: ["users.read"] },
      { label: "Membership & Billing", to: "/admin/membership", icon: CreditCard, visibleIf: ["users.read"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Onboarding", to: "/admin/onboarding", icon: ClipboardList, visibleIf: ["onboarding.queue.read"] },
      { label: "Amendments", to: "/admin/amendments", icon: FileWarning, visibleIf: ["amendments.queue.read"] },
      { label: "Activity", to: "/admin/activity", icon: Activity, visibleIf: ["activity.read"] },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Configuration", to: "/admin/config", icon: SlidersHorizontal, visibleIf: ["config.read"] },
      { label: "Measure Policy & Pricing", to: "/admin/measure-policy", icon: DollarSign, visibleIf: ["config.read"] },
      { label: "Evidence Requirements", to: "/admin/evidence-requirements", icon: ListChecks, visibleIf: ["config.read"] },
      { label: "Installation & System Types", to: "/admin/installation-types", icon: Layers, visibleIf: ["config.read"] },
      { label: "Funding Schemes", to: "/admin/funding-schemes", icon: Globe, visibleIf: ["config.read"] },
      { label: "Measure Access Control", to: "/admin/measure-access", icon: KeyRound, visibleIf: ["config.read"] },
    ],
  },
  {
    label: "Risk & Compliance",
    items: [
      { label: "Risk Monitoring", to: "/admin/risk", icon: ShieldAlert, visibleIf: ["risk.read"] },
      { label: "Risk Overrides", to: "/admin/risk-overrides", icon: ShieldOff, visibleIf: ["risk.read"] },
      { label: "Audit Logs", to: "/admin/audit", icon: ScrollText, visibleIf: ["audit.read"] },
    ],
  },
  {
    label: "Integrations",
    items: [
      { label: "Integrations Hub", to: "/admin/integrations", icon: Plug, visibleIf: ["config.read"] },
      { label: "External APIs", to: "/admin/external-apis", icon: Activity, visibleIf: ["config.read"] },
      { label: "Cron Jobs", to: "/admin/cron", icon: Clock, visibleIf: ["config.read"] },
      { label: "Stripe Events", to: "/admin/stripe-events", icon: Receipt, visibleIf: ["config.read"] },
      { label: "CRM / HubSpot", to: "/admin/crm", icon: Workflow, visibleIf: ["config.read"] },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Access Control", to: "/admin/permissions", icon: Library, visibleIf: ["permissions.library.manage"] },
      { label: "Feature Flags", to: "/admin/feature-flags", icon: ToggleRight, visibleIf: ["config.read"] },
      { label: "System Settings", to: "/admin/system-settings", icon: SlidersHorizontal, visibleIf: ["config.read"] },
    ],
  },
];

export function AppSidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebarState();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] border-r bg-sidebar transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        <SidebarBody collapsed={false} onItemClick={() => setMobileOpen(false)} mobile />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r bg-sidebar transition-[width] duration-200 md:block",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>
    </>
  );
}

function SidebarBody({
  collapsed,
  onItemClick,
  mobile,
}: {
  collapsed: boolean;
  onItemClick?: () => void;
  mobile?: boolean;
}) {
  const { permissions, isAdmin } = useAuth();
  const { onboardingStep, role } = useDevRole();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { setMobileOpen } = useSidebarState();

  const visibleMain = main.filter((i) => !i.hideForRoles || !i.hideForRoles.includes(role));
  const visibleAdminGroups = adminGroups
    .map((g) => ({
      label: g.label,
      items: g.items.filter((i) => !i.visibleIf || canAny(permissions, i.visibleIf)),
    }))
    .filter((g) => g.items.length > 0);
  const onboardingActive = onboardingStep !== "complete";

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2 px-3 pt-3", collapsed && "justify-center px-2")}>
        {collapsed ? (
          <Link
            to="/dashboard"
            aria-label="Renewably home"
            className="press grid size-8 place-items-center rounded-lg bg-brand-blue text-[11px] font-semibold text-brand-blue-foreground"
          >
            R
          </Link>
        ) : (
          <div className="flex w-full items-center gap-2">
            <div className="min-w-0 flex-1">
              <WorkspaceSwitcher />
            </div>
            {mobile && (
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setMobileOpen(false)}
                className="press grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-3">
        {!collapsed && <SectionLabel>Workspace</SectionLabel>}
        {visibleMain.map((item) => (
          <Row
            key={item.to}
            item={item}
            permissions={permissions}
            path={path}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}

        {onboardingActive && !collapsed && (
          <Link
            to="/onboarding"
            onClick={onItemClick}
            className="mt-2 flex items-center gap-2 rounded-lg bg-cat-amber-bg px-3 py-2 text-xs font-medium text-cat-amber"
          >
            <ClipboardList className="size-3.5" />
            Continue onboarding
          </Link>
        )}

        {visibleAdminGroups.length > 0 && (
          <>
            {!collapsed && <SectionLabel icon={Shield}>Admin</SectionLabel>}
            {collapsed && <Divider />}
            {visibleAdminGroups.map((group, gi) => (
              <div key={group.label} className={cn(gi > 0 && "mt-2")}>
                {!collapsed && (
                  <div className="px-3 pb-1 pt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted/80">
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => (
                  <Row
                    key={`${group.label}-${item.label}`}
                    item={item}
                    permissions={permissions}
                    path={path}
                    collapsed={collapsed}
                    onClick={onItemClick}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </nav>

      <div className={cn("border-t", collapsed ? "px-2 py-2" : "px-2 py-3")}>
        <Row
          item={{ label: "Settings", to: "/settings/profile", icon: SettingsIcon }}
          permissions={permissions}
          path={path}
          collapsed={collapsed}
          onClick={onItemClick}
        />
        {!collapsed && isAdmin && <InviteCard onClick={onItemClick} />}
      </div>
    </div>
  );
}

function Row({
  item,
  permissions,
  path,
  collapsed,
  onClick,
}: {
  item: NavItem;
  permissions: Permission[];
  path: string;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const locked = !!item.showLockedIfNot && !canAny(permissions, item.showLockedIfNot);
  const active = isActive(path, item.to);

  return (
    <Link
      to={item.to}
      onClick={onClick}
      aria-label={item.label}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 overflow-hidden rounded-lg text-sm",
        collapsed ? "mx-auto h-9 w-9 justify-center" : "px-2.5 py-1.5",
        active
          ? "bg-sidebar-accent text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-foreground"
          : "text-ink-muted hover:bg-sidebar-accent hover:text-foreground",
      )}
    >
      <Icon className="size-[16px] shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {locked && <Lock className="size-3 text-ink-muted/70" />}
        </>
      )}
      {collapsed && (
        <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background group-hover:block">
          {item.label}
        </span>
      )}
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
    <div className="mt-3 flex items-center gap-1.5 px-3 pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
      {Icon && <Icon className="size-3" />}
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-2 h-px bg-sidebar-border" />;
}

function InviteCard({ onClick }: { onClick?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-3 rounded-2xl border bg-background p-3">
        <div className="grid size-7 place-items-center rounded-lg bg-cat-blue-bg text-cat-blue">
          <Send className="size-3.5" />
        </div>
        <div className="mt-2 text-[13px] font-medium text-foreground">
          Invite team members
        </div>
        <div className="mt-1 text-[11px] leading-snug text-ink-muted">
          Bring your team into your workspace.
        </div>
        <button
          type="button"
          onClick={() => {
            onClick?.();
            setOpen(true);
          }}
          className="press mt-2 inline-flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-1.5 text-[11px] font-medium text-background"
        >
          Invite
        </button>
      </div>
      <InviteDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

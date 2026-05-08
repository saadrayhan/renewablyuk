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
  Award,
  FileText,
  LifeBuoy,
  CreditCard,
  ShieldCheck,
  Banknote,
  PanelsTopLeft,
  Building2,
  Workflow,
  Boxes,
  Cog,
  Globe,
  TerminalSquare,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { canAny, type Permission } from "@/lib/rbac";
import { useMembership } from "@/lib/membership";
import type { AdminRole } from "@/lib/mock/types";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleIf?: Permission[];
  showLockedIfNot?: Permission[];
  /** Only show when contractor tier matches. */
  tier?: "access" | "operate";
};

const main: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
];

const complianceGroup: NavItem[] = [
  { label: "Certificates", to: "/certificates", icon: Award },
  { label: "Documents", to: "/documents", icon: FileText },
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

const operationsGroup: NavItem[] = [
  {
    label: "Projects",
    to: "/projects",
    icon: FolderKanban,
    tier: "operate",
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
    tier: "operate",
    showLockedIfNot: ["funding.match.read", "funding.projects.read"],
  },
];

const accountGroup: NavItem[] = [
  { label: "Tickets", to: "/tickets", icon: LifeBuoy },
  { label: "Membership", to: "/membership", icon: CreditCard },
];

/* Admin nav surfaces per role */

const adminNavByRole: Record<AdminRole, { label: string; items: NavItem[] }[]> = {
  super_admin: [
    {
      label: "Compliance",
      items: [
        { label: "Evidence queue", to: "/admin/evidence", icon: ShieldCheck },
        { label: "Certificates", to: "/admin/certificates", icon: Award },
        { label: "Templates", to: "/admin/templates", icon: PanelsTopLeft },
        { label: "Amendments", to: "/admin/amendments", icon: FileWarning },
        { label: "Risk", to: "/admin/risk", icon: Shield },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Tickets", to: "/admin/tickets", icon: LifeBuoy },
        { label: "Companies", to: "/admin/companies", icon: Building2 },
        { label: "Users", to: "/admin/users", icon: Users },
        { label: "Onboarding", to: "/admin/onboarding", icon: ClipboardList },
        { label: "CRM", to: "/admin/crm", icon: Workflow },
        { label: "Activity", to: "/admin/activity", icon: Activity },
      ],
    },
    {
      label: "Finance",
      items: [
        { label: "Membership", to: "/admin/membership", icon: CreditCard },
        { label: "Payouts", to: "/admin/payouts", icon: Banknote },
        { label: "Stripe events", to: "/admin/stripe-events", icon: CreditCard },
        { label: "Funding schemes", to: "/admin/funding-schemes", icon: Sparkles },
        { label: "Products", to: "/admin/products", icon: Boxes },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Audit log", to: "/admin/audit", icon: ScrollText },
        { label: "Permission library", to: "/admin/permissions", icon: Library },
        { label: "Feature flags", to: "/admin/feature-flags", icon: SlidersHorizontal },
        { label: "System config", to: "/admin/config", icon: Cog },
        { label: "System settings", to: "/admin/system-settings", icon: SlidersHorizontal },
        { label: "Cron", to: "/admin/cron", icon: TerminalSquare },
        { label: "External APIs", to: "/admin/external-apis", icon: Globe },
        { label: "Integrations", to: "/admin/integrations", icon: Workflow },
        { label: "Installation types", to: "/admin/installation-types", icon: Boxes },
        { label: "Measure access", to: "/admin/measure-access", icon: Library },
        { label: "Measure policy", to: "/admin/measure-policy", icon: Library },
        { label: "Evidence req.", to: "/admin/evidence-requirements", icon: FileWarning },
        { label: "Risk overrides", to: "/admin/risk-overrides", icon: Shield },
        { label: "Create admin", to: "/admin/create-admin", icon: Users },
      ],
    },
  ],
  reviewer: [
    {
      label: "Compliance",
      items: [
        { label: "Evidence queue", to: "/admin/evidence", icon: ShieldCheck },
        { label: "Certificates", to: "/admin/certificates", icon: Award },
        { label: "Templates", to: "/admin/templates", icon: PanelsTopLeft },
        { label: "Amendments", to: "/admin/amendments", icon: FileWarning },
        { label: "Companies", to: "/admin/companies", icon: Building2 },
        { label: "Audit log", to: "/admin/audit", icon: ScrollText },
        { label: "Risk", to: "/admin/risk", icon: Shield },
      ],
    },
  ],
  support: [
    {
      label: "Support",
      items: [
        { label: "Tickets", to: "/admin/tickets", icon: LifeBuoy },
        { label: "Companies", to: "/admin/companies", icon: Building2 },
        { label: "Users", to: "/admin/users", icon: Users },
        { label: "Onboarding", to: "/admin/onboarding", icon: ClipboardList },
        { label: "CRM", to: "/admin/crm", icon: Workflow },
        { label: "Activity", to: "/admin/activity", icon: Activity },
      ],
    },
  ],
  finance: [
    {
      label: "Finance",
      items: [
        { label: "Membership", to: "/admin/membership", icon: CreditCard },
        { label: "Payouts", to: "/admin/payouts", icon: Banknote },
        { label: "Stripe events", to: "/admin/stripe-events", icon: CreditCard },
        { label: "Funding schemes", to: "/admin/funding-schemes", icon: Sparkles },
        { label: "Products", to: "/admin/products", icon: Boxes },
      ],
    },
  ],
};

const footerGroup: NavItem[] = [
  { label: "Settings", to: "/settings/profile", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, permissions, isAdmin } = useAuth();
  const { tier, adminRole } = useMembership();

  const filterByTier = (items: NavItem[]) =>
    items.filter((i) => !i.tier || i.tier === tier);

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
        {!isAdmin && (
          <>
            <Group items={main} permissions={permissions} collapsed={collapsed} />

            <SectionLabel collapsed={collapsed}>Compliance</SectionLabel>
            <Group items={filterByTier(complianceGroup)} permissions={permissions} collapsed={collapsed} />

            <SectionLabel collapsed={collapsed}>Operations</SectionLabel>
            <Group items={filterByTier(operationsGroup)} permissions={permissions} collapsed={collapsed} />

            <SectionLabel collapsed={collapsed}>Account</SectionLabel>
            <Group items={accountGroup} permissions={permissions} collapsed={collapsed} />
          </>
        )}

        {isAdmin && (
          <>
            <Group items={main} permissions={permissions} collapsed={collapsed} />
            {adminNavByRole[adminRole].map((section) => (
              <div key={section.label}>
                <SectionLabel collapsed={collapsed} icon={Shield}>
                  {section.label}
                </SectionLabel>
                <Group items={section.items} permissions={permissions} collapsed={collapsed} />
              </div>
            ))}
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
                {isAdmin ? `Admin · ${adminRole.replace("_", " ")}` : `${user.roleLabel} · ${tier}`}
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

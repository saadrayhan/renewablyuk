import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileBadge,
  FolderKanban,
  Send,
  Sparkles,
  Database,
  ArrowRight,
  Lock,
  Users,
  ScrollText,
  Activity,
  ClipboardList,
  FileWarning,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can, canAny, type Permission } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Renewably UK" }] }),
  component: DashboardPage,
});

type Tile = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "green" | "blue" | "amber" | "purple" | "rose" | "teal";
  permission?: Permission;
};

const installerTiles: Tile[] = [
  { label: "New IBG", to: "/ibg/new", icon: FileBadge, tone: "green", permission: "ibg.issue" },
  { label: "Projects", to: "/projects", icon: FolderKanban, tone: "blue", permission: "jobs.read" },
  { label: "IBG Repository", to: "/ibg/repository", icon: Database, tone: "teal", permission: "ibg.repository.read" },
  { label: "Submissions", to: "/submissions", icon: Send, tone: "purple", permission: "submissions.read" },
  { label: "Funding", to: "/funding", icon: Sparkles, tone: "rose", permission: "funding.match.read" },
];

const adminTiles: Tile[] = [
  { label: "Users", to: "/admin/users", icon: Users, tone: "purple", permission: "users.read" },
  { label: "Audit log", to: "/admin/audit", icon: ScrollText, tone: "blue", permission: "audit.read" },
  { label: "Activity", to: "/admin/activity", icon: Activity, tone: "green", permission: "activity.read" },
  { label: "Onboarding queue", to: "/admin/onboarding", icon: ClipboardList, tone: "amber", permission: "onboarding.queue.read" },
  { label: "Amendments", to: "/admin/amendments", icon: FileWarning, tone: "rose", permission: "amendments.queue.read" },
];

const toneClasses: Record<Tile["tone"], { bg: string; ink: string }> = {
  green: { bg: "bg-cat-green-bg", ink: "text-cat-green" },
  blue: { bg: "bg-cat-blue-bg", ink: "text-cat-blue" },
  amber: { bg: "bg-cat-amber-bg", ink: "text-cat-amber" },
  purple: { bg: "bg-cat-purple-bg", ink: "text-cat-purple" },
  rose: { bg: "bg-cat-rose-bg", ink: "text-cat-rose" },
  teal: { bg: "bg-cat-teal-bg", ink: "text-cat-teal" },
};

function DashboardPage() {
  const { user, permissions, isAdmin } = useAuth();
  const { role } = useDevRole();
  const firstName = user.fullName.split(" ")[0];
  const greeting = greet();

  const isOperator = role === "operator";
  const showAdminTiles = isAdmin || canAny(permissions, adminTiles.map((t) => t.permission!).filter(Boolean));

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      {/* Role banner */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border bg-surface px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-cat-purple-bg px-2 py-0.5 text-xs font-medium text-cat-purple">
            {user.roleLabel}
          </span>
          <span className="text-foreground">
            {isOperator
              ? `You hold ${permissions.length} permission${permissions.length === 1 ? "" : "s"}. Request more from any locked feature.`
              : isAdmin
              ? "You have full configuration access."
              : `${permissions.length} capabilities active in this workspace.`}
          </span>
        </div>
        {isOperator && (
          <Link
            to="/settings/profile"
            className="press inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-foreground"
          >
            My access <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>

      {/* Header */}
      <div className="mt-10">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
          My Workspace
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {greeting}, {firstName}
        </h1>
      </div>

      {/* Workspace tiles */}
      <div className="mt-8">
        <div className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
          Workspace
        </div>
        <div className="stagger-in grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {installerTiles.map((t) => (
            <QuickTile key={t.label} tile={t} permissions={permissions} />
          ))}
        </div>
      </div>

      {showAdminTiles && (
        <div className="mt-8">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
            Admin
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {adminTiles.map((t) => (
              <QuickTile key={t.label} tile={t} permissions={permissions} />
            ))}
          </div>
        </div>
      )}

      {/* Lower section */}
      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Recent activity">
          <ActivityRow
            tone="green"
            title="No activity yet"
            meta="Your IBGs and jobs will appear here."
          />
        </Card>
        <Card title="Get more from Renewably">
          <SuggestionRow to="/ibg/new" label="Issue your first IBG" meta="Generate a certificate in under a minute." />
          <SuggestionRow to="/pricing" label="Upgrade to Operate" meta="Unlock Projects, Funding Match and the IBG repository." />
          <SuggestionRow to="/onboarding" label="Finish onboarding" meta="Verify company, upload accreditations." />
        </Card>
      </div>
    </div>
  );
}

function QuickTile({ tile, permissions }: { tile: Tile; permissions: Permission[] }) {
  const Icon = tile.icon;
  const tone = toneClasses[tile.tone];
  const locked = !!tile.permission && !can(permissions, tile.permission);

  return (
    <Link to={tile.to} className="press block">
      <div className="tile flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <div className={`relative grid size-12 place-items-center rounded-xl ${tone.bg} ${tone.ink}`}>
          <Icon className="size-6" />
          {locked && (
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border bg-background text-ink-muted">
              <Lock className="size-3" />
            </span>
          )}
        </div>
        <div className="text-sm font-medium text-foreground">{tile.label}</div>
      </div>
    </Link>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-3 text-sm font-medium text-foreground">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ActivityRow({ tone, title, meta }: { tone: "green" | "blue" | "amber"; title: string; meta: string }) {
  const dot = { green: "bg-cat-green", blue: "bg-cat-blue", amber: "bg-cat-amber" }[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
      <span className={`size-2 rounded-full ${dot}`} />
      <div className="flex-1">
        <div className="text-sm text-foreground">{title}</div>
        <div className="text-xs text-ink-muted">{meta}</div>
      </div>
    </div>
  );
}

function SuggestionRow({ to, label, meta }: { to: string; label: string; meta: string }) {
  return (
    <Link to={to} className="press flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-surface">
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-ink-muted">{meta}</div>
      </div>
      <ArrowRight className="size-4 text-ink-muted" />
    </Link>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

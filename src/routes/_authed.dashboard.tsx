import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileBadge,
  Briefcase,
  Users,
  Send,
  Sparkles,
  Database,
  ArrowRight,
  Building2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Renewably UK" }] }),
  component: DashboardPage,
});

type Tile = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "green" | "blue" | "amber" | "purple" | "rose" | "teal";
  locked?: boolean;
};

const tiles: Tile[] = [
  { label: "New IBG", to: "/ibg/new", icon: FileBadge, tone: "green" },
  { label: "Jobs", to: "/jobs", icon: Briefcase, tone: "blue", locked: true },
  { label: "Customers", to: "/customers", icon: Users, tone: "amber", locked: true },
  { label: "Properties", to: "/properties", icon: Building2, tone: "teal", locked: true },
  { label: "Submissions", to: "/submissions", icon: Send, tone: "purple", locked: true },
  { label: "Funding", to: "/funding", icon: Sparkles, tone: "rose", locked: true },
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
  const { user } = useAuth();
  const name =
    ((user?.user_metadata?.full_name as string | undefined) ?? "")
      .split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";
  const greeting = greet();

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      {/* Announcement banner */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border bg-surface px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-xs font-medium text-cat-green">
            New
          </span>
          <span className="text-foreground">
            Funding Match is now live for Operate workspaces.
          </span>
        </div>
        <Link
          to="/pricing"
          className="press inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-foreground"
        >
          See plans <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Header */}
      <div className="mt-10">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
          My Workspace
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {greeting}, {name}
        </h1>
      </div>

      {/* Quick tiles */}
      <div className="stagger-in mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <QuickTile key={t.label} tile={t} />
        ))}
      </div>

      {/* Two-column lower section */}
      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Recent activity">
          <ActivityRow
            tone="green"
            title="No activity yet"
            meta="Your IBGs and jobs will appear here."
          />
        </Card>
        <Card title="Get more from Renewably">
          <SuggestionRow
            to="/ibg/new"
            label="Issue your first IBG"
            meta="Generate a certificate in under a minute."
          />
          <SuggestionRow
            to="/pricing"
            label="Upgrade to Operate"
            meta="Unlock Jobs, Funding Match and the IBG repository."
          />
          <SuggestionRow
            to="/settings/company"
            label="Verify your company"
            meta="Companies House lookup keeps your account active."
          />
        </Card>
      </div>
    </div>
  );
}

function QuickTile({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  const tone = toneClasses[tile.tone];

  const inner = (
    <div className="tile flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <div
        className={`relative grid size-12 place-items-center rounded-xl ${tone.bg} ${tone.ink}`}
      >
        <Icon className="size-6" />
        {tile.locked && (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border bg-background text-ink-muted">
            <Lock className="size-3" />
          </span>
        )}
      </div>
      <div className="text-sm font-medium text-foreground">{tile.label}</div>
    </div>
  );

  if (tile.locked) {
    return (
      <Link to="/pricing" className="press block">
        {inner}
      </Link>
    );
  }
  return (
    <Link to={tile.to} className="press block">
      {inner}
    </Link>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-3 text-sm font-medium text-foreground">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ActivityRow({
  tone,
  title,
  meta,
}: {
  tone: "green" | "blue" | "amber";
  title: string;
  meta: string;
}) {
  const dot = {
    green: "bg-cat-green",
    blue: "bg-cat-blue",
    amber: "bg-cat-amber",
  }[tone];
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

function SuggestionRow({
  to,
  label,
  meta,
}: {
  to: string;
  label: string;
  meta: string;
}) {
  return (
    <Link
      to={to}
      className="press flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-surface"
    >
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

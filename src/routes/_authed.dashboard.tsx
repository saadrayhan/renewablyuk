/**
 * Dashboard — ElevenLabs-style hero with role-specific compositions.
 *
 * 5 personas:
 *   admin            → onboarding queue, amendments queue, platform health, activity
 *   operator         → permission summary, pinned shortcuts, what they can do today
 *   installer-access → New IBG hero, last 5 IBGs, Upgrade card
 *   installer-operate → ops summary: jobs by state, IBGs this month, funding readiness
 *   readonly         → record browser tiles
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileBadge, FolderKanban, Send, Sparkles, Database, ArrowRight,
  Users, ScrollText, Activity, ClipboardList, FileWarning,
  Volume2, Music2, Mic2, BookOpen, Image as ImageIcon, Video,
  Plus, TrendingUp, CheckCircle2, AlertTriangle, Clock, ShieldCheck, CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can, type Permission } from "@/lib/rbac";
import { useStore } from "@/lib/mock/store";
import { StatePill, JOB_STATES, IBG_STATES, ONBOARDING_STATES, AMENDMENT_STATES } from "@/components/app/state-pill";
import { fmtDate, relTime } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Home — Renewably UK" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { role } = useDevRole();
  const firstName = user.fullName.split(" ")[0];
  const greeting = greet();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
        {workspaceName(role)}
      </div>
      <h1 className="mt-2 text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl md:text-[44px] md:leading-[1.05]">
        {greeting}, {firstName}
      </h1>

      {role === "admin" && <AdminDash />}
      {role === "operator" && <OperatorDash />}
      {role === "installer-access" && <AccessDash />}
      {role === "installer-operate" && <OperateDash />}
      {role === "readonly" && <ReadonlyDash />}
    </div>
  );
}

/* ─── Admin ──────────────────────────────────────────── */

function AdminDash() {
  const data = useStore();
  const onboardingPending = data.onboarding.filter((o) => o.state !== "activated");
  const amendmentsPending = data.amendments.filter((a) => a.state === "pending");
  const recent = data.activity.slice(0, 6);
  const activeOverrides = data.riskOverrides.filter((o) => o.active);
  const accountsAtRisk = data.users.filter((u) => u.accountRiskState && u.accountRiskState !== "active").length;
  const totalCompanies = data.users.filter((u) => u.role !== "admin" && u.role !== "operator").length;
  const operateCount = data.users.filter((u) => u.role === "installer-operate").length;
  const accessCount = data.users.filter((u) => u.role === "installer-access").length;
  const ibgsTotal = data.ibgs.length;
  const ibgsThisMonth = data.ibgs.filter((i) => i.issuedAt && i.issuedAt > Date.now() - 30 * 86400000).length;
  const flaggedCount = data.users.filter((u) => u.accountRiskState === "flagged").length;
  const pausedCount = data.users.filter((u) => u.accountRiskState === "paused").length;
  const suspendedCount = data.users.filter((u) => u.accountRiskState === "suspended").length;

  return (
    <>
      {activeOverrides.length > 0 && (
        <Link to="/admin/risk" className="press mt-8 flex items-start justify-between gap-3 rounded-2xl border bg-surface/50 px-4 py-3 hover:bg-surface">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 text-cat-amber" />
            <div>
              <div className="text-sm font-medium text-foreground">{activeOverrides.length} active risk override{activeOverrides.length === 1 ? "" : "s"}</div>
              <div className="text-[11px] text-ink-muted">{accountsAtRisk} account{accountsAtRisk === 1 ? "" : "s"} currently at risk · review and revoke as needed.</div>
            </div>
          </div>
          <ArrowRight className="size-4 text-ink-muted" />
        </Link>
      )}

      <SectionLabel>Quick actions</SectionLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction to="/admin/onboarding" icon={ClipboardList} label="Approve users" count={onboardingPending.length} sub="pending" />
        <QuickAction to="/admin/risk" icon={ShieldCheck} label="Review high risk" count={accountsAtRisk} sub="accounts" />
        <QuickAction to="/admin/amendments" icon={FileWarning} label="Approve amendments" count={amendmentsPending.length} sub="requests" />
        <QuickAction to="/admin/membership" icon={CreditCard} label="Failed payments" count={2} sub="accounts" />
      </div>

      <SectionRow title="Companies & users" to="/admin/companies" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total companies" value={totalCompanies} />
        <Metric label="Operate plan" value={operateCount} />
        <Metric label="Access plan" value={accessCount} />
        <Metric label="Onboarding" value={onboardingPending.length} pillTone="amber" pillText={`${onboardingPending.length} pending`} />
      </div>

      <SectionRow title="Risk overview" to="/admin/risk" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Flagged" value={flaggedCount} pillTone={flaggedCount ? "amber" : undefined} />
        <Metric label="Paused" value={pausedCount} pillTone={pausedCount ? "amber" : undefined} />
        <Metric label="Suspended" value={suspendedCount} pillTone={suspendedCount ? "rose" : undefined} />
        <Metric label="Active overrides" value={activeOverrides.length} />
      </div>

      <SectionRow title="IBG activity" to="/ibg/repository" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="IBGs total" value={ibgsTotal} />
        <Metric label="Issued (30d)" value={ibgsThisMonth} />
        <Metric label="Amendments" value={amendmentsPending.length} />
        <Metric label="Audit events" value={data.activity.length} />
      </div>

      <SectionRow title="System health" to="/admin/integrations" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <HealthRow label="Companies House sync" status="ok" detail="Last run 03:00 UTC" />
        <HealthRow label="Stripe webhooks" status="ok" detail="100% delivery (24h)" />
        <HealthRow label="Email notifications" status="ok" detail="Delivered" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionPanel title="Onboarding queue" to="/admin/onboarding">
          {onboardingPending.length === 0 ? (
            <EmptyRow text="No accounts waiting." />
          ) : (
            onboardingPending.slice(0, 4).map((o) => (
              <Link key={o.id} to="/admin/onboarding" className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{o.companyName}</div>
                  <div className="text-xs text-ink-muted">{o.contactName} · {o.tier === "operate" ? "Operate" : "Access"}</div>
                </div>
                <StatePill meta={ONBOARDING_STATES[o.state]} />
              </Link>
            ))
          )}
        </SectionPanel>

        <SectionPanel title="Latest activity" to="/admin/activity">
          {recent.map((act) => (
            <div key={act.id} className="flex items-center justify-between rounded-xl px-2 py-2.5">
              <div className="text-sm text-foreground">
                <span className="font-medium">{act.actor}</span>{" "}
                <span className="text-ink-muted">{act.action}</span>{" "}
                <span className="font-medium">{act.target}</span>
              </div>
              <div className="text-xs text-ink-muted">{relTime(act.at)}</div>
            </div>
          ))}
        </SectionPanel>
      </div>
    </>
  );
}

function SectionRow({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-2 mt-10 flex items-center justify-between">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">{title}</div>
      <Link to={to} className="press inline-flex items-center gap-1 text-[11px] text-ink-muted hover:text-foreground">
        View all <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

function Metric({ label, value, pillTone, pillText }: { label: string; value: number; pillTone?: "amber" | "rose" | "green"; pillText?: string }) {
  const cls = pillTone === "amber" ? "bg-cat-amber-bg text-cat-amber" : pillTone === "rose" ? "bg-cat-rose-bg text-cat-rose" : "bg-cat-green-bg text-cat-green";
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-ink tabular-nums">{value}</div>
      {pillTone && <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{pillText ?? "Attention"}</span>}
    </div>
  );
}

function QuickAction({ to, icon: Icon, label, count, sub }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; count: number; sub: string }) {
  return (
    <Link to={to} className="press tile group flex items-center justify-between rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-xl bg-tile text-ink-muted">
          <Icon className="size-4" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="text-[11px] text-ink-muted"><span className="tabular-nums text-foreground">{count}</span> {sub}</div>
        </div>
      </div>
      <ArrowRight className="size-3.5 text-ink-muted transition group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ─── Operator ───────────────────────────────────────── */

function OperatorDash() {
  const { permissions, pendingPermissionRequests } = useDevRole();

  const groups = [
    { label: "Customers", icon: FolderKanban, to: "/customers", perm: "customers.read" as const },
    { label: "Jobs", icon: Database, to: "/jobs", perm: "jobs.read" as const },
    { label: "IBG Repository", icon: FileBadge, to: "/ibg/repository", perm: "ibg.repository.read" as const },
    { label: "Submissions", icon: Send, to: "/submissions", perm: "submissions.read" as const },
    { label: "Funding", to: "/funding", icon: Sparkles, perm: "funding.projects.read" as const },
    { label: "Audit", to: "/admin/audit", icon: ScrollText, perm: "audit.read" as const },
  ];
  const granted = groups.filter((g) => can(permissions, g.perm));
  const locked = groups.filter((g) => !can(permissions, g.perm));

  return (
    <>
      <NewBadgeBanner
        text={`You hold ${permissions.length} permission${permissions.length === 1 ? "" : "s"}. Request more from any locked feature.`}
        cta="View my access"
        to="/settings/profile"
      />

      <SectionLabel>What you can do</SectionLabel>
      {granted.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-surface/40 px-6 py-10 text-center text-sm text-ink-muted">
          You don't have any permissions yet. Open a locked feature and tap "Request access".
        </div>
      ) : (
        <TileGrid tiles={granted.map((g) => ({ label: g.label, to: g.to, icon: g.icon, tone: "blue" as const, desc: "Granted" }))} />
      )}

      {locked.length > 0 && (
        <>
          <SectionLabel>Available — request access</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {locked.map((g) => {
              const Icon = g.icon;
              return (
                <Link key={g.label} to={g.to} className="press tile flex flex-col items-start gap-2 rounded-2xl border border-dashed bg-card/50 p-4 opacity-80">
                  <div className="grid size-10 place-items-center rounded-xl bg-tile text-ink-muted">
                    <Icon className="size-5" />
                  </div>
                  <div className="text-sm font-medium text-foreground">{g.label}</div>
                  <div className="text-[11px] text-ink-muted">Locked</div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {pendingPermissionRequests.length > 0 && (
        <div className="mt-8 rounded-2xl border bg-cat-amber-bg/30 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="size-4 text-cat-amber" /> {pendingPermissionRequests.length} permission request{pendingPermissionRequests.length === 1 ? "" : "s"} awaiting admin
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Installer Access ───────────────────────────────── */

function AccessDash() {
  const data = useStore();
  const recent = data.ibgs.filter((i) => i.state === "issued").slice(0, 5);

  return (
    <>
      <NewBadgeBanner text="Standalone IBG generator — issue a certificate without setting up a job." cta="New IBG" to="/ibg/new" />

      <SectionLabel>Quick start</SectionLabel>
      <TileGrid tiles={[
        { label: "Issue an IBG", to: "/ibg/new", icon: FileBadge, tone: "green", desc: "Generate certificate + policy" },
        { label: "My IBGs", to: "/ibg/history", icon: Database, tone: "blue", desc: "View 5 most recent" },
        { label: "Upgrade to Operate", to: "/pricing", icon: Sparkles, tone: "amber", desc: "Unlock Projects, Funding, Repository" },
      ]} />

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionPanel title="Recent IBGs" to="/ibg/history">
          {recent.length === 0 ? (
            <EmptyRow text="No IBGs yet — issue your first one." />
          ) : (
            recent.map((i) => (
              <Link key={i.id} to="/ibg/history" className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{i.ref} · {i.customerName}</div>
                  <div className="truncate text-xs text-ink-muted">{i.propertyAddress}</div>
                </div>
                <StatePill meta={IBG_STATES[i.state]} />
              </Link>
            ))
          )}
        </SectionPanel>
        <UpgradeCard />
      </div>
    </>
  );
}

/* ─── Installer Operate ──────────────────────────────── */

function OperateDash() {
  const data = useStore();
  const inProgress = data.jobs.filter((j) => j.state === "in-progress").length;
  const blocked = data.jobs.filter((j) => j.state === "blocked").length;
  const ibgsThisMonth = data.ibgs.filter((i) => i.issuedAt && i.issuedAt > Date.now() - 30 * 86400000).length;
  const fundingReady = data.fundingProjects.filter((f) => f.state === "ready-for-submission").length;

  return (
    <>
      <NewBadgeBanner
        text="Funding Match Hub — see schemes scored against your approved measures."
        cta="Open Match Hub"
        to="/funding/match"
      />

      <SectionLabel>Workspace</SectionLabel>
      <TileGrid tiles={[
        { label: "New IBG", to: "/ibg/new", icon: FileBadge, tone: "green", desc: "Issue certificate" },
        { label: "Projects", to: "/projects", icon: FolderKanban, tone: "blue", desc: "Customers · Properties · Jobs" },
        { label: "IBG Repository", to: "/ibg/repository", icon: Database, tone: "teal", desc: "All issued records" },
        { label: "Submissions", to: "/submissions", icon: Send, tone: "purple", desc: "Scheme submissions" },
        { label: "Funding", to: "/funding", icon: Sparkles, tone: "rose", desc: "Match Hub + projects" },
        { label: "Settings", to: "/settings/profile", icon: TrendingUp, tone: "amber", desc: "Profile · Subscription" },
      ]} />

      <SectionLabel>This week</SectionLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Jobs in progress" value={inProgress} icon={Clock} tone="blue" />
        <Stat label="Jobs blocked" value={blocked} icon={AlertTriangle} tone="rose" />
        <Stat label="IBGs (30d)" value={ibgsThisMonth} icon={FileBadge} tone="green" />
        <Stat label="Funding ready" value={fundingReady} icon={CheckCircle2} tone="teal" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionPanel title="Jobs needing attention" to="/jobs">
          {data.jobs
            .filter((j) => j.state === "blocked" || j.state === "awaiting-information")
            .slice(0, 5)
            .map((j) => {
              const c = data.customers.find((c) => c.id === j.customerId);
              return (
                <Link key={j.id} to="/jobs" className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{j.ref} · {j.measure}</div>
                    <div className="truncate text-xs text-ink-muted">{c?.name}</div>
                  </div>
                  <StatePill meta={JOB_STATES[j.state]} />
                </Link>
              );
            })}
        </SectionPanel>
        <SectionPanel title="Latest IBGs" to="/ibg/repository">
          {data.ibgs.slice(0, 5).map((i) => (
            <Link key={i.id} to="/ibg/repository" className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{i.ref} · {i.customerName}</div>
                <div className="truncate text-xs text-ink-muted">{i.measure} · {i.issuedAt ? fmtDate(i.issuedAt) : "—"}</div>
              </div>
              <StatePill meta={IBG_STATES[i.state]} />
            </Link>
          ))}
        </SectionPanel>
      </div>
    </>
  );
}

/* ─── Readonly ───────────────────────────────────────── */

function ReadonlyDash() {
  return (
    <>
      <div className="mt-6 rounded-2xl border border-cat-blue/20 bg-cat-blue-bg/40 p-4">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-cat-blue-bg text-cat-blue">
            <BookOpen className="size-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">You have read-only access</div>
            <p className="mt-1 text-xs text-ink-muted">
              You can browse customers, properties, jobs, IBGs, submissions and the audit trail.
              You cannot create, edit, submit or approve anything. To upgrade your access, contact your workspace admin.
            </p>
          </div>
        </div>
      </div>
      <SectionLabel>Browse</SectionLabel>
      <TileGrid tiles={[
        { label: "Customers", to: "/customers", icon: FolderKanban, tone: "blue", desc: "Read-only" },
        { label: "Jobs", to: "/jobs", icon: Database, tone: "teal", desc: "Read-only" },
        { label: "IBG Repository", to: "/ibg/repository", icon: FileBadge, tone: "green", desc: "Read-only" },
        { label: "Submissions", to: "/submissions", icon: Send, tone: "purple", desc: "Read-only" },
        { label: "Funding", to: "/funding", icon: Sparkles, tone: "rose", desc: "Read-only" },
        { label: "Audit log", to: "/admin/audit", icon: ScrollText, tone: "amber", desc: "Compliance trail" },
      ]} />
    </>
  );
}

/* ─── Pieces ─────────────────────────────────────────── */

const TONES = {
  green: { bg: "bg-cat-green-bg", ink: "text-cat-green" },
  blue: { bg: "bg-cat-blue-bg", ink: "text-cat-blue" },
  amber: { bg: "bg-cat-amber-bg", ink: "text-cat-amber" },
  purple: { bg: "bg-cat-purple-bg", ink: "text-cat-purple" },
  rose: { bg: "bg-cat-rose-bg", ink: "text-cat-rose" },
  teal: { bg: "bg-cat-teal-bg", ink: "text-cat-teal" },
} as const;
type Tone = keyof typeof TONES;

type Tile = { label: string; to: string; icon: React.ComponentType<{ className?: string }>; tone: Tone; desc: string; permission?: Permission };

function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="stagger-in mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => {
        const Icon = t.icon;
        const tone = TONES[t.tone];
        return (
          <Link key={t.label + t.to} to={t.to} className="press tile group flex h-[148px] flex-col items-start justify-between rounded-2xl border bg-card p-4">
            <div className={`grid size-10 place-items-center rounded-xl ${tone.bg} ${tone.ink}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{t.label}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-ink-muted">{t.desc}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-10 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
      {children}
    </div>
  );
}

function SectionPanel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between px-2">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <Link to={to} className="press inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-ink-muted hover:text-foreground">
          View all <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="rounded-xl bg-surface px-3 py-4 text-center text-xs text-ink-muted">{text}</div>;
}

function NewBadgeBanner({ text, cta, to }: { text: string; cta: string; to: string }) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-3 rounded-full border bg-surface/60 px-3 py-1.5 text-sm">
      <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">New</span>
      <span className="flex-1 text-foreground">{text}</span>
      <Link to={to} className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
        {cta} <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: Tone }) {
  const t = TONES[tone];
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className={`grid size-8 place-items-center rounded-lg ${t.bg} ${t.ink}`}>
        <Icon className="size-4" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-ink">{value}</div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-foreground p-5 text-background">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-background/60">Operate plan</div>
      <div className="mt-2 text-xl font-semibold leading-tight">Unlock Projects, Funding Match and the IBG Repository.</div>
      <div className="mt-1 text-sm text-background/70">Run the full record chain — Customer → Property → Job → IBG → Submission.</div>
      <Link to="/pricing" className="press mt-4 inline-flex items-center gap-1 rounded-full bg-background px-4 py-2 text-xs font-medium text-foreground">
        See plans <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

function HealthRow({ label, status, detail }: { label: string; status: "ok" | "warn" | "error"; detail: string }) {
  const tone = status === "ok" ? "bg-cat-green" : status === "warn" ? "bg-cat-amber" : "bg-cat-rose";
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2.5">
        <span className={`size-2 rounded-full ${tone}`} />
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="text-[11px] text-ink-muted">{detail}</div>
        </div>
      </div>
      <CheckCircle2 className="size-4 text-cat-green" />
    </div>
  );
}

function workspaceName(role: string) {
  if (role === "admin") return "Renewably HQ";
  if (role === "operator") return "Renewably Ops";
  if (role === "installer-access") return "Northwarmth Ltd · Access";
  if (role === "installer-operate") return "Evergreen Installs · Operate";
  return "External · Read-only";
}

function greet() {
  // Computed at render time; safe because <Outlet/> is client-gated in _authed layout.
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// silence unused import warnings (these icons may not all be used after refactor)
void Volume2; void Music2; void Mic2; void BookOpen; void ImageIcon; void Video; void Plus;

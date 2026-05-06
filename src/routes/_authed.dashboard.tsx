/**
 * Dashboard — ElevenLabs-style editorial home for all 5 roles.
 *
 *   eyebrow
 *   Greeting, name
 *
 *   TileRow             ← role-specific destinations
 *   Section ›           ← work to do today (flat ListRows)
 *   Section ›           ← recent / activity
 *   Section ›           ← optional third
 *
 * No bordered metric grids. No card chrome on the canvas.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileBadge, FolderKanban, Send, Sparkles, Database, ArrowRight,
  Users, ScrollText, Activity, ClipboardList, FileWarning,
  ShieldAlert, Building2, Plug, BarChart2, BookOpen,
  CheckCircle2, AlertTriangle, Clock, Lock, CreditCard, Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { useStore } from "@/lib/mock/store";
import { TileRow, type Tile } from "@/components/app/tile-row";
import { ListRow } from "@/components/app/list-row";
import { SectionHeader } from "@/components/app/section-header";
import { StatePill, JOB_STATES, IBG_STATES, ONBOARDING_STATES } from "@/components/app/state-pill";
import { fmtDate, relTime } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Home — Renewably UK" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { role } = useDevRole();
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-8 md:px-8 md:pt-12">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        {workspaceName(role)}
      </div>
      <h1 className="font-display mt-2 text-[36px] leading-[1.05] text-ink md:text-[44px]">
        {greet()}, {firstName}
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
  const flagged = data.users.filter((u) => u.accountRiskState === "flagged" || u.accountRiskState === "paused").slice(0, 4);

  const tiles: Tile[] = [
    { label: "Onboarding", to: "/admin/onboarding", icon: ClipboardList, tone: "amber" },
    { label: "Amendments", to: "/admin/amendments", icon: FileWarning, tone: "purple" },
    { label: "Risk", to: "/admin/risk", icon: ShieldAlert, tone: "rose" },
    { label: "Companies", to: "/admin/companies", icon: Building2, tone: "blue" },
    { label: "Audit", to: "/admin/audit", icon: ScrollText, tone: "teal" },
    { label: "Integrations", to: "/admin/integrations", icon: Plug, tone: "green" },
  ];

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Today" to="/admin/onboarding" />
      <div className="space-y-0.5">
        {onboardingPending.length === 0 && flagged.length === 0 ? (
          <EmptyRow text="Nothing waiting on you." />
        ) : (
          <>
            {onboardingPending.slice(0, 4).map((o) => (
              <ListRow
                key={o.id}
                to="/admin/onboarding"
                icon={ClipboardList}
                iconTone="amber"
                title={o.companyName}
                subtitle={`${o.contactName} · ${o.tier === "operate" ? "Operate" : "Access"}`}
                meta={<StatePill meta={ONBOARDING_STATES[o.state]} />}
              />
            ))}
            {flagged.map((u) => (
              <ListRow
                key={u.id}
                to="/admin/risk"
                icon={ShieldAlert}
                iconTone="rose"
                title={u.name}
                subtitle={u.email}
                meta={<span className="rounded-full bg-cat-rose-bg px-2 py-0.5 text-[11px] font-medium text-cat-rose">{u.accountRiskState}</span>}
              />
            ))}
          </>
        )}
      </div>

      <SectionHeader title="Latest activity" to="/admin/activity" />
      <div className="space-y-0.5">
        {recent.map((a) => (
          <ListRow
            key={a.id}
            icon={Activity}
            title={<><span className="font-medium">{a.actor}</span> <span className="font-normal text-ink-muted">{a.action}</span> <span className="font-medium">{a.target}</span></>}
            meta={relTime(a.at)}
          />
        ))}
      </div>

      <SectionHeader title="Platform health" to="/admin/integrations" />
      <div className="space-y-0.5">
        <HealthRow label="Companies House sync" status="ok" detail="Last run 03:00 UTC" />
        <HealthRow label="Stripe webhooks" status="ok" detail="100% delivery (24h)" />
        <HealthRow label="Email notifications" status="ok" detail="Delivered" />
        <HealthRow label="Amendments queue" status={amendmentsPending.length > 5 ? "warn" : "ok"} detail={`${amendmentsPending.length} pending review`} />
      </div>
    </>
  );
}

/* ─── Operator ───────────────────────────────────────── */

function OperatorDash() {
  const { permissions, pendingPermissionRequests } = useDevRole();
  const groups = [
    { label: "Customers", icon: FolderKanban, to: "/customers", perm: "customers.read" as const, tone: "blue" as const },
    { label: "Jobs", icon: Database, to: "/jobs", perm: "jobs.read" as const, tone: "teal" as const },
    { label: "IBG Repository", icon: FileBadge, to: "/ibg/repository", perm: "ibg.repository.read" as const, tone: "green" as const },
    { label: "Submissions", icon: Send, to: "/submissions", perm: "submissions.read" as const, tone: "purple" as const },
    { label: "Funding", icon: Sparkles, to: "/funding", perm: "funding.projects.read" as const, tone: "amber" as const },
    { label: "Audit", icon: ScrollText, to: "/admin/audit", perm: "audit.read" as const, tone: "rose" as const },
  ];

  const tiles: Tile[] = groups.map((g) => ({
    label: g.label,
    to: g.to,
    icon: g.icon,
    tone: g.tone,
    badge: can(permissions, g.perm) ? undefined : "Locked",
    disabled: !can(permissions, g.perm),
  }));

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Your access" to="/settings/profile" />
      <div className="space-y-0.5">
        <ListRow
          icon={CheckCircle2}
          iconTone="green"
          title={`${permissions.length} permission${permissions.length === 1 ? "" : "s"} granted`}
          subtitle="Open a locked tile to request access."
        />
        {pendingPermissionRequests.length > 0 && (
          <ListRow
            icon={Clock}
            iconTone="amber"
            title={`${pendingPermissionRequests.length} request${pendingPermissionRequests.length === 1 ? "" : "s"} awaiting admin`}
            subtitle="You'll be notified when reviewed."
          />
        )}
      </div>
    </>
  );
}

/* ─── Installer Access ───────────────────────────────── */

function AccessDash() {
  const data = useStore();
  const recent = data.ibgs.filter((i) => i.state === "issued").slice(0, 5);

  const tiles: Tile[] = [
    { label: "Issue an IBG", to: "/ibg/new", icon: FileBadge, tone: "green" },
    { label: "My IBGs", to: "/ibg/history", icon: Database, tone: "blue" },
    { label: "Templates", to: "/ibg/repository", icon: BookOpen, tone: "purple" },
    { label: "Pricing", to: "/pricing", icon: Sparkles, tone: "amber" },
    { label: "Account", to: "/settings/profile", icon: Settings, tone: "neutral" },
    { label: "Help", to: "/settings/profile", icon: BookOpen, tone: "teal" },
  ];

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Recent IBGs" to="/ibg/history" />
      <div className="space-y-0.5">
        {recent.length === 0 ? (
          <EmptyRow text="No IBGs yet — issue your first one." />
        ) : (
          recent.map((i) => (
            <ListRow
              key={i.id}
              to="/ibg/history"
              icon={FileBadge}
              iconTone="green"
              title={`${i.ref} · ${i.customerName}`}
              subtitle={i.propertyAddress}
              meta={<StatePill meta={IBG_STATES[i.state]} />}
            />
          ))
        )}
      </div>

      <SectionHeader title="Upgrade" to="/pricing" />
      <div className="space-y-0.5">
        <ListRow
          to="/pricing"
          icon={Sparkles}
          iconTone="amber"
          title="Operate plan"
          subtitle="Unlock Projects, Funding Match and the IBG Repository."
          meta={<ArrowRight className="size-4" />}
        />
      </div>
    </>
  );
}

/* ─── Installer Operate ──────────────────────────────── */

function OperateDash() {
  const data = useStore();
  const attention = data.jobs.filter((j) => j.state === "blocked" || j.state === "awaiting-information").slice(0, 5);
  const recentIbgs = data.ibgs.slice(0, 5);
  const fundingReady = data.fundingProjects.filter((f) => f.state === "ready-for-submission").slice(0, 4);

  const tiles: Tile[] = [
    { label: "New IBG", to: "/ibg/new", icon: FileBadge, tone: "green" },
    { label: "Projects", to: "/projects", icon: FolderKanban, tone: "blue" },
    { label: "IBG Repository", to: "/ibg/repository", icon: Database, tone: "teal" },
    { label: "Submissions", to: "/submissions", icon: Send, tone: "purple" },
    { label: "Funding", to: "/funding", icon: Sparkles, tone: "amber" },
    { label: "Reports", to: "/reports", icon: BarChart2, tone: "rose" },
  ];

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Jobs needing attention" to="/jobs" />
      <div className="space-y-0.5">
        {attention.length === 0 ? (
          <EmptyRow text="All jobs are progressing." />
        ) : (
          attention.map((j) => {
            const c = data.customers.find((c) => c.id === j.customerId);
            return (
              <ListRow
                key={j.id}
                to="/jobs"
                icon={AlertTriangle}
                iconTone="amber"
                title={`${j.ref} · ${j.measure}`}
                subtitle={c?.name}
                meta={<StatePill meta={JOB_STATES[j.state]} />}
              />
            );
          })
        )}
      </div>

      <SectionHeader title="Recently issued IBGs" to="/ibg/repository" />
      <div className="space-y-0.5">
        {recentIbgs.map((i) => (
          <ListRow
            key={i.id}
            to="/ibg/repository"
            icon={FileBadge}
            iconTone="green"
            title={`${i.ref} · ${i.customerName}`}
            subtitle={`${i.measure} · ${i.issuedAt ? fmtDate(i.issuedAt) : "—"}`}
            meta={<StatePill meta={IBG_STATES[i.state]} />}
          />
        ))}
      </div>

      <SectionHeader title="Funding-ready projects" to="/funding" />
      <div className="space-y-0.5">
        {fundingReady.length === 0 ? (
          <EmptyRow text="No projects ready for submission." />
        ) : (
          fundingReady.map((f) => (
            <ListRow
              key={f.id}
              to="/funding"
              icon={Sparkles}
              iconTone="amber"
              title={f.ref}
              subtitle={`${f.scheme} · ${f.measure}`}
            />
          ))
        )}
      </div>
    </>
  );
}

/* ─── Readonly ───────────────────────────────────────── */

function ReadonlyDash() {
  const data = useStore();
  const recent = data.ibgs.slice(0, 5);

  const tiles: Tile[] = [
    { label: "Customers", to: "/customers", icon: FolderKanban, tone: "blue", badge: "Read-only" },
    { label: "Properties", to: "/properties", icon: Building2, tone: "teal", badge: "Read-only" },
    { label: "Jobs", to: "/jobs", icon: Database, tone: "amber", badge: "Read-only" },
    { label: "IBG Repository", to: "/ibg/repository", icon: FileBadge, tone: "green", badge: "Read-only" },
    { label: "Submissions", to: "/submissions", icon: Send, tone: "purple", badge: "Read-only" },
    { label: "Audit log", to: "/admin/audit", icon: ScrollText, tone: "rose", badge: "Read-only" },
  ];

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Recent records" to="/ibg/repository" />
      <div className="space-y-0.5">
        {recent.map((i) => (
          <ListRow
            key={i.id}
            to="/ibg/repository"
            icon={FileBadge}
            iconTone="green"
            title={`${i.ref} · ${i.customerName}`}
            subtitle={i.propertyAddress}
            meta={<StatePill meta={IBG_STATES[i.state]} />}
          />
        ))}
      </div>
    </>
  );
}

/* ─── Pieces ─────────────────────────────────────────── */

function EmptyRow({ text }: { text: string }) {
  return <div className="px-2 py-6 text-[13px] text-ink-muted">{text}</div>;
}

function HealthRow({ label, status, detail }: { label: string; status: "ok" | "warn" | "error"; detail: string }) {
  const tone = status === "ok" ? "bg-cat-green" : status === "warn" ? "bg-cat-amber" : "bg-cat-rose";
  return (
    <div className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-[80ms] hover:bg-surface">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-tile">
        <span className={`size-2 rounded-full ${tone}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-foreground">{label}</div>
        <div className="text-[12px] text-ink-muted">{detail}</div>
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
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// silence unused
void Users; void Lock; void CreditCard; void Permission;

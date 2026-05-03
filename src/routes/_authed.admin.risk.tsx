import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, Activity, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, RISK_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/admin/risk")({
  head: () => ({ meta: [{ title: "Risk & Compliance — Renewably UK" }] }),
  component: RiskPage,
});

type RiskFilter = "flagged" | "paused" | "suspended";

function RiskPage() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [filter, setFilter] = useState<RiskFilter | "all">("all");

  if (!can(permissions, "risk.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Admin · Risk" title="Risk & Compliance" />
        <div className="mt-6"><LockedCard title="Risk & Compliance" reason={{ kind: "permission", permission: "risk.read" }} /></div>
      </div>
    );
  }

  const allUsers = data.users.filter((u) => u.role === "installer-access" || u.role === "installer-operate" || u.role === "operator" || u.role === "readonly");
  const counts = {
    flagged: allUsers.filter((u) => u.accountRiskState === "flagged").length,
    paused: allUsers.filter((u) => u.accountRiskState === "paused").length,
    suspended: allUsers.filter((u) => u.accountRiskState === "suspended").length,
  };
  const atRisk = counts.flagged + counts.paused + counts.suspended;
  const activeOverrides = data.riskOverrides.filter((o) => o.active).length;
  const limitedCount = allUsers.filter((u) => u.entityType === "limited").length;
  const newSignals = data.riskAssessments.filter((r) => Date.now() - r.createdAt < 86400000).length;

  const rows = allUsers.filter((u) => filter === "all" || u.accountRiskState === filter);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · Risk" title="Risk & Compliance" subtitle="Companies House monitoring, account risk states, and override management." />

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatTile label="Accounts at risk" value={atRisk} icon={ShieldAlert} tone="amber" />
        <StatTile label="Active overrides" value={activeOverrides} icon={Activity} tone="blue" />
      </div>

      {/* CH Monitoring strip */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-l-4 border-l-cat-blue bg-card">
        <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          <Tile label="Last run" value="Today at 03:00 UTC" />
          <Tile label="Accounts checked" value={String(limitedCount)} />
          <Tile label="New signals" value={String(newSignals)} />
        </div>
        <div className="border-t bg-surface/40 px-5 py-2.5 text-[11px] text-ink-muted">
          Companies House checks run automatically every 24 hours for all limited company accounts. Sole traders use internal signals only.
        </div>
      </div>

      <div className="mt-6">
        <FilterPills<RiskFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "flagged", label: "Flagged", count: counts.flagged },
            { value: "paused", label: "Paused", count: counts.paused },
            { value: "suspended", label: "Suspended", count: counts.suspended },
          ]}
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              <th className="px-4 py-2.5 text-left">Organisation</th>
              <th className="px-4 py-2.5 text-left">Type</th>
              <th className="px-4 py-2.5 text-left">Risk State</th>
              <th className="px-4 py-2.5 text-left">Last Check</th>
              <th className="px-4 py-2.5 text-left">Signal</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const isLtd = u.entityType === "limited";
              const ra = data.riskAssessments.find((r) => r.organisationId === u.id);
              return (
                <tr key={u.id} className="border-b last:border-b-0 hover:bg-surface/60">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{isLtd ? "Limited Co." : "Sole Trader"}</td>
                  <td className="px-4 py-3"><StatePill meta={RISK_STATES[u.accountRiskState ?? "active"]} /></td>
                  <td className="px-4 py-3 text-ink-muted">{isLtd ? "Today 09:14" : "Internal"}</td>
                  <td className="px-4 py-3 text-ink-muted">{ra?.signalDetail ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin/risk/$id" params={{ id: u.id }} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
                      Review <ArrowRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">No accounts in this state.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatTile({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: "amber" | "blue" }) {
  const cls = tone === "amber" ? "bg-cat-amber-bg text-cat-amber" : "bg-cat-blue-bg text-cat-blue";
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</div>
        <span className={`grid size-8 place-items-center rounded-lg ${cls}`}><Icon className="size-4" /></span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

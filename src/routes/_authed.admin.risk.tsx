import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, Activity, ArrowRight, CheckCircle2, AlertTriangle, PauseCircle, XCircle, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update } from "@/lib/mock/store";
import { pushAudit, fmtDate } from "@/lib/mock/queries";
import { StatePill, RISK_STATES } from "@/components/app/state-pill";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { useAuth } from "@/lib/auth-context";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/admin/risk")({
  head: () => ({ meta: [{ title: "Risk & Compliance — Renewably UK" }] }),
  component: RiskPage,
});

type RiskFilter = "all" | "flagged" | "paused" | "suspended";

function RiskPage() {
  const data = useStore();
  const nav = useNavigate();
  const { permissions } = useDevRole();
  const [filter, setFilter] = useState<RiskFilter>("all");

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
  const newSignals = data.riskAssessments.filter((r) => Date.now() - r.createdAt < 86400000 * 7).length;

  const rows = allUsers.filter((u) => filter === "all" || u.accountRiskState === filter);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · Risk" title="Risk & Compliance" subtitle="Companies House monitoring, account risk states and override management." />

      {/* KPI tiles — neutral */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Stat label="Accounts at risk" value={atRisk} icon={ShieldAlert} sub={`${counts.flagged} flagged · ${counts.paused} paused · ${counts.suspended} suspended`} />
        <Stat label="Active overrides" value={activeOverrides} icon={Activity} sub={activeOverrides ? "HIGH-risk issuance temporarily allowed" : "No temporary overrides in effect"} />
      </div>

      {/* CH monitoring strip — calmer */}
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border bg-card p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-cat-green" />
          <div>
            <div className="text-sm font-medium text-foreground">Companies House monitoring</div>
            <div className="text-[11px] text-ink-muted">Runs every 24 hours for limited company accounts. Sole traders use internal signals only.</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <Mini label="Last run" value="03:00 UTC" />
          <Mini label="Checked" value={String(limitedCount)} />
          <Mini label="New signals (7d)" value={String(newSignals)} />
        </div>
      </div>

      <div className="mt-6">
        <UnderlineTabs<RiskFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: allUsers.length },
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
              <th className="px-4 py-2.5 text-left">Risk state</th>
              <th className="px-4 py-2.5 text-left">Last check</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const isLtd = u.entityType === "limited";
              return (
                <tr
                  key={u.id}
                  onClick={() => nav({ to: "/admin/risk/$id", params: { id: u.id } })}
                  className="cursor-pointer border-b last:border-b-0 transition-colors hover:bg-surface/60"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{isLtd ? "Limited Co." : "Sole trader"}</td>
                  <td className="px-4 py-3"><StatePill meta={RISK_STATES[u.accountRiskState ?? "active"]} /></td>
                  <td className="px-4 py-3 text-ink-muted">{isLtd ? "Today 09:14" : "Internal"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
                      Review <ArrowRight className="size-3" />
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-muted">No accounts in this state.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, sub }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; sub: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">{label}</div>
        <span className="grid size-7 place-items-center rounded-lg bg-tile text-ink-muted"><Icon className="size-3.5" /></span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</div>
      <div className="mt-1 text-[11px] text-ink-muted">{sub}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm font-medium tabular-nums text-foreground">{value}</div>
    </div>
  );
}

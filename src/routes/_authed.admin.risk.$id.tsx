import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldAlert, ArrowUp, ArrowDown, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { findUser, pushAudit, fmtDate } from "@/lib/mock/queries";
import { StatePill, RISK_STATES } from "@/components/app/state-pill";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";
import { HighRiskOverrideSheet } from "@/components/app/high-risk-override-sheet";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { useAuth } from "@/lib/auth-context";
import type { AccountRiskState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/admin/risk/$id")({
  head: () => ({ meta: [{ title: "Account risk — Renewably UK" }] }),
  component: RiskDetail,
});

const ORDER: AccountRiskState[] = ["active", "flagged", "paused", "suspended"];
type Tab = "history" | "checks" | "overrides";

function RiskDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const { permissions } = useDevRole();
  const { user: actor } = useAuth();
  const u = findUser(data, id);
  const [tab, setTab] = useState<Tab>("history");
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!can(permissions, "risk.read")) {
    return <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10"><LockedCard title="Account risk" reason={{ kind: "permission", permission: "risk.read" }} /></div>;
  }
  if (!u) throw notFound();

  const state = u.accountRiskState ?? "active";
  const isLtd = u.entityType === "limited";
  const overrides = data.riskOverrides.filter((o) => o.organisationId === id);
  const assessments = data.riskAssessments.filter((r) => r.organisationId === id);

  function move(dir: 1 | -1) {
    const idx = ORDER.indexOf(state);
    const next = ORDER[Math.max(0, Math.min(ORDER.length - 1, idx + dir))];
    if (next === state) return;
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.accountRiskState = next;
      pushAudit(d, "user", id, actor.fullName, `Risk state ${state} → ${next}`);
    });
    toast.success(`Risk state set to ${next}`);
  }

  const checks = isLtd ? [
    { date: "29 Apr", type: "Annual accounts", signal: "On time", severity: "low", pass: true },
    { date: "22 Apr", type: "Officer changes", signal: "1 director resigned", severity: "medium", pass: false },
    { date: "15 Apr", type: "Confirmation statement", signal: "Filed", severity: "low", pass: true },
    { date: "08 Apr", type: "Strike-off risk", signal: "None", severity: "low", pass: true },
    { date: "01 Apr", type: "Dissolution notice", signal: "None", severity: "low", pass: true },
  ] : [];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/admin/risk" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Risk & Compliance
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Account · {isLtd ? "Limited Co." : "Sole Trader"}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{u.name}</h1>
          <div className="mt-2 text-sm text-ink-muted">{u.email}</div>
        </div>
        <StatePill meta={RISK_STATES[state]} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <UnderlineTabs<Tab>
            value={tab} onChange={setTab}
            options={[
              { value: "history", label: "Risk History" },
              { value: "checks", label: "CH Checks", count: checks.length },
              { value: "overrides", label: "Overrides", count: overrides.length },
            ]}
          />

          <div className="mt-5">
            {tab === "history" && (
              <div className="rounded-2xl border bg-card p-4">
                {assessments.length === 0 ? <EmptyState title="No risk events" body="No risk state changes recorded." /> : (
                  <ol className="space-y-3">
                    {assessments.map((r) => (
                      <li key={r.id} className="relative pl-4">
                        <span className="absolute left-0 top-1.5 size-2 rounded-full bg-foreground" />
                        <div className="text-sm text-foreground">State → {r.state}</div>
                        <div className="text-xs text-ink-muted">{r.signalDetail}</div>
                        <div className="text-[11px] text-ink-muted">{r.signalType} · {fmtDate(r.createdAt)}</div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
            {tab === "checks" && (
              <div className="overflow-hidden rounded-2xl border bg-card">
                {!isLtd ? (
                  <div className="p-6 text-center text-sm text-ink-muted">Companies House checks only apply to limited companies.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                        <th className="px-4 py-2.5 text-left">Date</th>
                        <th className="px-4 py-2.5 text-left">Type</th>
                        <th className="px-4 py-2.5 text-left">Signal</th>
                        <th className="px-4 py-2.5 text-left">Severity</th>
                        <th className="px-4 py-2.5 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checks.map((c, i) => (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="px-4 py-3 text-ink-muted">{c.date}</td>
                          <td className="px-4 py-3 text-foreground">{c.type}</td>
                          <td className="px-4 py-3 text-ink-muted">{c.signal}</td>
                          <td className="px-4 py-3 text-ink-muted">{c.severity}</td>
                          <td className="px-4 py-3 text-right">
                            {c.pass
                              ? <span className="inline-flex items-center gap-1 rounded-full bg-cat-green-bg px-2 py-0.5 text-[11px] font-medium text-cat-green"><Check className="size-3" /> Pass</span>
                              : <span className="inline-flex items-center gap-1 rounded-full bg-cat-amber-bg px-2 py-0.5 text-[11px] font-medium text-cat-amber"><AlertTriangle className="size-3" /> Flag</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            {tab === "overrides" && (
              <div className="rounded-2xl border bg-card">
                {overrides.length === 0 ? (
                  <div className="p-6"><EmptyState title="No overrides" body="No overrides recorded for this account" /></div>
                ) : (
                  <div className="divide-y">
                    {overrides.map((o) => (
                      <div key={o.id} className="flex items-start justify-between gap-4 px-5 py-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${o.riskLevel === "high" ? "bg-cat-amber-bg text-cat-amber" : "bg-cat-rose-bg text-cat-rose"}`}>
                              {o.riskLevel.toUpperCase()}
                            </span>
                            <span className={`text-[11px] ${o.active ? "text-cat-green" : "text-ink-muted"}`}>{o.active ? "Active" : "Expired"}</span>
                          </div>
                          <div className="mt-1.5 text-sm text-foreground">{o.reason}</div>
                          <div className="mt-0.5 text-[11px] text-ink-muted">By {o.createdBy} · applied {fmtDate(o.createdAt)}{o.expiresAt ? ` · expires ${fmtDate(o.expiresAt)}` : " · indefinite"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Current state</div>
            <div className="mt-2"><StatePill meta={RISK_STATES[state]} /></div>

            <div className="mt-4 space-y-2">
              {(state === "flagged" || state === "paused") && (
                <button onClick={() => setSheetOpen(true)} className="press inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-cat-amber px-3 py-2 text-xs font-medium text-white">
                  <ShieldAlert className="size-3.5" /> Apply HIGH Risk Override
                </button>
              )}
              {state === "suspended" && (
                <button onClick={() => toast.info("CRITICAL override requires multi-step review (coming soon)")} className="press inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-cat-rose px-3 py-2 text-xs font-medium text-white">
                  <ShieldAlert className="size-3.5" /> Apply CRITICAL Risk Override
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => move(1)} className="press inline-flex items-center justify-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs">
                  <ArrowUp className="size-3" /> Escalate
                </button>
                <button onClick={() => move(-1)} className="press inline-flex items-center justify-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs">
                  <ArrowDown className="size-3" /> Downgrade
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <HighRiskOverrideSheet open={sheetOpen} onOpenChange={setSheetOpen} organisationId={u.id} organisationName={u.name} />
    </div>
  );
}

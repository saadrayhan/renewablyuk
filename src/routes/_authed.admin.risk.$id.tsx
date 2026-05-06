import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldAlert, ArrowUp, ArrowDown, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { findUser, pushAudit, fmtDate } from "@/lib/mock/queries";
import { StatePill, RISK_STATES } from "@/components/app/state-pill";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";
import { HighRiskOverrideSheet } from "@/components/app/high-risk-override-sheet";
import { CriticalRiskOverrideSheet } from "@/components/app/critical-risk-override-sheet";
import { Button } from "@/components/ui/button";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { useAuth } from "@/lib/auth-context";
import type { AccountRiskState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/admin/risk/$id")({
  head: () => ({ meta: [{ title: "Account risk — Renewably UK" }] }),
  component: RiskDetail,
});

const ORDER: AccountRiskState[] = ["active", "flagged", "paused", "suspended"];

function RiskDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const { permissions } = useDevRole();
  const { user: actor } = useAuth();
  const u = findUser(data, id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [criticalOpen, setCriticalOpen] = useState(false);
  const [flash, setFlash] = useState(true);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    const t = setTimeout(() => setFlash(false), 700);
    return () => clearTimeout(t);
  }, [id]);

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

  const activeOverride = overrides.find((o) => o.active);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/admin/risk" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Risk & Compliance
      </Link>

      <div className={`mt-3 flex items-start justify-between gap-6 rounded-2xl px-3 py-2 transition-colors duration-700 ${flash ? "bg-cat-amber-bg/40" : "bg-transparent"}`}>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Account · {isLtd ? "Limited Co." : "Sole Trader"}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{u.name}</h1>
          <div className="mt-2 text-sm text-ink-muted">{u.email}</div>
        </div>
        <StatePill meta={RISK_STATES[state]} />
      </div>

      {activeOverride && (
        <div className="mt-4 rounded-2xl border border-brand-blue/20 bg-brand-blue-tint px-4 py-3 text-sm text-brand-blue">
          <div className="font-medium">Override active — {activeOverride.riskLevel.toUpperCase()}</div>
          <div className="mt-0.5 text-xs opacity-80">{activeOverride.reason} · by {activeOverride.createdBy}</div>
        </div>
      )}

      {/* Card 1 — Risk Evaluation */}
      <section className="mt-6 rounded-2xl border bg-card">
        <header className="flex items-center justify-between gap-3 border-b px-5 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-ink-muted">Card 1</div>
            <h2 className="text-base font-semibold text-foreground">Risk Evaluation</h2>
          </div>
          <span className="text-xs text-ink-muted">{isLtd ? "Companies House monitoring" : "Internal signals only"}</span>
        </header>
        <div className="px-5 py-4">
          {isLtd ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {checks.map((c, i) => (
                <div key={i} className="rounded-xl border bg-background p-3">
                  <div className="text-[10px] uppercase tracking-wide text-ink-muted">{c.date}</div>
                  <div className="mt-1 text-xs font-medium text-foreground">{c.type}</div>
                  <div className="mt-0.5 text-[11px] text-ink-muted">{c.signal}</div>
                  <div className="mt-2">
                    {c.pass
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-cat-green-bg px-1.5 py-0.5 text-[10px] text-cat-green"><Check className="size-2.5" /> Pass</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-cat-amber-bg px-1.5 py-0.5 text-[10px] text-cat-amber"><AlertTriangle className="size-2.5" /> Flag</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Sole traders are not monitored against Companies House. Risk signals come from internal triggers (failed payments, complaint volume, manual review).</p>
          )}
          {assessments.length > 0 && (
            <div className="mt-5 border-t pt-4">
              <div className="text-[10px] uppercase tracking-wide text-ink-muted">Recent risk events</div>
              <ol className="mt-2 space-y-2">
                {assessments.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center gap-3 text-sm">
                    <span className="size-1.5 rounded-full bg-foreground" />
                    <span className="text-foreground">State → {r.state}</span>
                    <span className="text-ink-muted">{r.signalDetail}</span>
                    <span className="ml-auto text-[11px] text-ink-muted">{fmtDate(r.createdAt)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* Card 2 — System Impact */}
      <section className="mt-4 rounded-2xl border bg-card">
        <header className="flex items-center justify-between gap-3 border-b px-5 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-ink-muted">Card 2</div>
            <h2 className="text-base font-semibold text-foreground">System Impact</h2>
          </div>
          <span className="text-xs text-ink-muted">What this risk state restricts</span>
        </header>
        <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          <ImpactRow label="IBG issuance" blocked={state === "suspended"} restricted={state === "paused"} />
          <ImpactRow label="Submissions" blocked={state === "suspended"} restricted={false} />
          <ImpactRow label="Payouts" blocked={state === "suspended" || state === "paused"} restricted={state === "flagged"} />
        </div>
      </section>

      {/* Card 3 — Admin Override */}
      <section className="mt-4 rounded-2xl border bg-card">
        <header className="flex items-center justify-between gap-3 border-b px-5 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-ink-muted">Card 3</div>
            <h2 className="text-base font-semibold text-foreground">Admin Override</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => move(-1)}><ArrowDown className="size-3.5" /> Downgrade</Button>
            <Button variant="secondary" size="sm" onClick={() => move(1)}><ArrowUp className="size-3.5" /> Escalate</Button>
            {(state === "flagged" || state === "paused") && (
              <Button variant="brand" size="sm" onClick={() => setSheetOpen(true)}><ShieldAlert className="size-3.5" /> Apply override</Button>
            )}
            {state === "suspended" && (
              <Button variant="brand" size="sm" onClick={() => setCriticalOpen(true)}><ShieldAlert className="size-3.5" /> Apply CRITICAL</Button>
            )}
          </div>
        </header>
        <div className="px-5 py-4">
          {overrides.length === 0 ? (
            <EmptyState title="No overrides" body="No overrides have been applied to this account." />
          ) : (
            <div className="divide-y">
              {overrides.map((o) => (
                <div key={o.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${o.riskLevel === "high" ? "bg-cat-amber-bg text-cat-amber" : "bg-cat-rose-bg text-cat-rose"}`}>
                        {o.riskLevel.toUpperCase()}
                      </span>
                      <span className={`text-[11px] ${o.active ? "text-cat-green" : "text-ink-muted"}`}>{o.active ? "Active" : "Expired"}</span>
                    </div>
                    <div className="mt-1.5 text-sm text-foreground">{o.reason}</div>
                    <div className="mt-0.5 text-[11px] text-ink-muted">By {o.createdBy} · {fmtDate(o.createdAt)}{o.expiresAt ? ` · expires ${fmtDate(o.expiresAt)}` : " · indefinite"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <HighRiskOverrideSheet open={sheetOpen} onOpenChange={setSheetOpen} organisationId={u.id} organisationName={u.name} />
      <CriticalRiskOverrideSheet open={criticalOpen} onOpenChange={setCriticalOpen} organisationId={u.id} organisationName={u.name} />
    </div>
  );
}

function ImpactRow({ label, blocked, restricted }: { label: string; blocked: boolean; restricted: boolean }) {
  const tone = blocked ? "rose" : restricted ? "amber" : "green";
  const status = blocked ? "Blocked" : restricted ? "Restricted" : "Allowed";
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4">
      <div>
        <div className="text-[10px] uppercase tracking-wide text-ink-muted">Capability</div>
        <div className="mt-0.5 text-sm font-medium text-foreground">{label}</div>
      </div>
      <span className={`rounded-full bg-cat-${tone}-bg px-2 py-0.5 text-[11px] text-cat-${tone}`}>{status}</span>
    </div>
  );
}

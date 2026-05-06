import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { FilterPills } from "@/components/app/filter-pills";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/risk-overrides")({
  head: () => ({ meta: [{ title: "Risk Overrides — Renewably UK" }] }),
  component: RiskOverridesPage,
});

type Filter = "all" | "expiring" | "permanent" | "expired";
type Override = {
  id: string;
  account: string;
  level: "High" | "Critical";
  reason: string;
  appliedBy: string;
  appliedAt: string;
  expiresInDays: number | null;
};

const SEED: Override[] = [
  { id: "OVR-101", account: "Acme Energy Ltd", level: "High", reason: "Director change verified", appliedBy: "S. Patel", appliedAt: "02 May 2026", expiresInDays: 4 },
  { id: "OVR-102", account: "BrightSpark Renewables", level: "Critical", reason: "Manual due-diligence pass", appliedBy: "J. Reeves", appliedAt: "28 Apr 2026", expiresInDays: 28 },
  { id: "OVR-103", account: "Hilltop Heat Ltd", level: "High", reason: "Late filing — addressed", appliedBy: "S. Patel", appliedAt: "10 Apr 2026", expiresInDays: null },
  { id: "OVR-104", account: "Northern Solar Co.", level: "High", reason: "Temporary while CH refresh", appliedBy: "M. Gupta", appliedAt: "10 Mar 2026", expiresInDays: -3 },
];

function RiskOverridesPage() {
  const { permissions } = useDevRole();
  const [filter, setFilter] = useState<Filter>("all");

  if (!can(permissions, "risk.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Risk Overrides" reason={{ kind: "permission", permission: "risk.read" }} />
      </div>
    );
  }

  const filtered = SEED.filter((o) => {
    if (filter === "all") return true;
    if (filter === "expiring") return o.expiresInDays !== null && o.expiresInDays >= 0 && o.expiresInDays <= 7;
    if (filter === "permanent") return o.expiresInDays === null;
    if (filter === "expired") return o.expiresInDays !== null && o.expiresInDays < 0;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Risk"
        title="Risk overrides"
        subtitle="Active overrides that restore IBG access on flagged or suspended accounts."
        actions={<Button asChild><Link to="/admin/risk">Risk monitoring</Link></Button>}
      />

      <FilterPills<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: "expiring", label: "Expiring ≤7d", count: SEED.filter((o) => o.expiresInDays !== null && o.expiresInDays >= 0 && o.expiresInDays <= 7).length },
          { value: "permanent", label: "Permanent", count: SEED.filter((o) => o.expiresInDays === null).length },
          { value: "expired", label: "Expired", count: SEED.filter((o) => o.expiresInDays !== null && o.expiresInDays < 0).length },
        ]}
      />

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[12px] font-medium text-ink-muted">
              <th className="px-3 py-2.5 text-left">Override</th>
              <th className="px-3 py-2.5 text-left">Account</th>
              <th className="px-3 py-2.5 text-left">Level</th>
              <th className="px-3 py-2.5 text-left">Reason</th>
              <th className="px-3 py-2.5 text-left">Applied by</th>
              <th className="px-3 py-2.5 text-left">Applied</th>
              <th className="px-3 py-2.5 text-left">Expires</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b last:border-b-0 hover:bg-surface/60">
                <td className="px-3 py-3.5 font-mono text-[12px] text-foreground">{o.id}</td>
                <td className="px-3 py-3.5 text-foreground">{o.account}</td>
                <td className="px-3 py-3.5">
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                    o.level === "Critical" ? "bg-cat-rose-bg text-cat-rose" : "bg-cat-amber-bg text-cat-amber",
                  )}>{o.level}</span>
                </td>
                <td className="px-3 py-3.5 text-ink-muted">{o.reason}</td>
                <td className="px-3 py-3.5 text-ink-muted">{o.appliedBy}</td>
                <td className="px-3 py-3.5 text-ink-muted">{o.appliedAt}</td>
                <td className="px-3 py-3.5">
                  {o.expiresInDays === null ? (
                    <span className="text-ink-muted">Permanent</span>
                  ) : o.expiresInDays < 0 ? (
                    <span className="text-cat-rose">Expired {Math.abs(o.expiresInDays)}d ago</span>
                  ) : (
                    <span className={o.expiresInDays <= 7 ? "text-cat-amber" : "text-ink-muted"}>in {o.expiresInDays}d</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RiskOverridesPage;

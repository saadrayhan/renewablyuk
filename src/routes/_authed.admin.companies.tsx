import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, Pencil, CreditCard, Flag, Ban } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/admin/companies")({
  head: () => ({ meta: [{ title: "Companies — Renewably UK" }] }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const data = useStore();
  const nav = useNavigate();
  const { permissions } = useDevRole();
  if (!can(permissions, "users.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Companies" reason={{ kind: "permission", permission: "users.read" }} />
      </div>
    );
  }

  const companies = data.users.filter((u) => u.role === "installer-access" || u.role === "installer-operate");

  const accountBadge = (s?: string) => {
    if (s === "flagged") return "bg-cat-amber-bg text-cat-amber";
    if (s === "paused" || s === "suspended") return "bg-cat-rose-bg text-cat-rose";
    return "bg-cat-green-bg text-cat-green";
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Companies & Users"
        title="Companies"
        subtitle="Manage installer organisations and company account status."
      />

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              <th className="px-4 py-2.5 text-left">Company Name</th>
              <th className="px-4 py-2.5 text-left">Company Number</th>
              <th className="px-4 py-2.5 text-left">Business Type</th>
              <th className="px-4 py-2.5 text-left">Account Status</th>
              <th className="px-4 py-2.5 text-left">Membership</th>
              <th className="px-4 py-2.5 text-left">Risk Level</th>
              <th className="px-4 py-2.5 text-left">Billing</th>
              <th className="px-4 py-2.5 text-left">IBG Access</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => {
              const isLtd = c.entityType === "limited";
              const membership = c.role === "installer-operate" ? "Operate" : "Access";
              const risk = c.accountRiskState === "suspended" ? "CRITICAL"
                : c.accountRiskState === "paused" ? "HIGH"
                : c.accountRiskState === "flagged" ? "MEDIUM" : "LOW";
              const riskCls = risk === "CRITICAL" ? "bg-cat-rose-bg text-cat-rose"
                : risk === "HIGH" ? "bg-cat-amber-bg text-cat-amber"
                : risk === "MEDIUM" ? "bg-cat-amber-bg text-cat-amber"
                : "bg-cat-green-bg text-cat-green";
              return (
                <tr key={c.id} onClick={() => nav({ to: "/admin/companies/$id", params: { id: c.id } })} className="cursor-pointer border-b last:border-b-0 transition-colors hover:bg-surface/60">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span className={`size-2 rounded-full ${isLtd ? "bg-cat-purple" : "bg-ink-muted"}`} />
                      {c.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">{isLtd ? `0${(7000000 + parseInt(c.id.slice(-3) || "1", 10)).toString().slice(0, 7)}` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${isLtd ? "bg-cat-blue-bg text-cat-blue" : "bg-tile text-ink-muted"}`}>{isLtd ? "Limited Company" : "Sole Trader"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${accountBadge(c.accountRiskState)}`}>{(c.accountRiskState ?? "active").replace(/^./, (m) => m.toUpperCase())}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{membership}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${riskCls}`}>{risk}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-[11px] font-medium text-cat-green">Active</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${c.accountRiskState === "suspended" || c.accountRiskState === "paused" ? "bg-tile text-ink-muted" : "bg-cat-green-bg text-cat-green"}`}>
                      {c.accountRiskState === "suspended" || c.accountRiskState === "paused" ? "Disabled" : "Enabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1 text-ink-muted">
                      <button title="View" className="press grid size-7 place-items-center rounded-md hover:bg-surface hover:text-foreground"><Eye className="size-3.5" /></button>
                      <button title="Edit" className="press grid size-7 place-items-center rounded-md hover:bg-surface hover:text-foreground"><Pencil className="size-3.5" /></button>
                      <button title="Billing" className="press grid size-7 place-items-center rounded-md hover:bg-surface hover:text-foreground"><CreditCard className="size-3.5" /></button>
                      <button title="Flag" className="press grid size-7 place-items-center rounded-md hover:bg-surface hover:text-foreground"><Flag className="size-3.5" /></button>
                      <button title="Suspend" className="press grid size-7 place-items-center rounded-md hover:bg-surface hover:text-foreground"><Ban className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-2xl border bg-surface/50 p-4">
        <div className="text-sm font-medium text-foreground">Business Type Verification</div>
        <p className="mt-1 text-xs text-ink-muted">
          Limited Company: Risk checks use Companies House API for automated verification · Sole Trader: Risk checks use platform-based verification and manual review.
        </p>
      </div>
    </div>
  );
}

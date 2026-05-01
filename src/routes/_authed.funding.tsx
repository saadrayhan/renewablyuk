import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, FUNDING_STATES } from "@/components/app/state-pill";
import { findJob, fmtDate } from "@/lib/mock/queries";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";

export const Route = createFileRoute("/_authed/funding")({
  head: () => ({ meta: [{ title: "Funding — Renewably UK" }] }),
  component: FundingHub,
});

function FundingHub() {
  const data = useStore();
  const { permissions } = useDevRole();

  if (!can(permissions, "funding.projects.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-8 py-10">
        <PageHeader eyebrow="Funding" title="Funding" />
        <div className="mt-6"><LockedCard title="Funding hub" reason={{ kind: "permission", permission: "funding.projects.read" }} /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <PageHeader
        eyebrow="Funding"
        title="Funding hub"
        subtitle="Match Hub · Funding projects · Per-project workflow."
        actions={
          <Link to="/funding/match" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Sparkles className="size-4" /> Match Hub
          </Link>
        }
      />

      <div className="mt-8 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">Funding projects</div>
          <Link to="/funding" className="text-xs text-ink-muted hover:text-foreground">Refresh</Link>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-4 py-2.5 text-left">Ref</th>
                <th className="px-4 py-2.5 text-left">Scheme</th>
                <th className="px-4 py-2.5 text-left">Job</th>
                <th className="px-4 py-2.5 text-left">Measure</th>
                <th className="px-4 py-2.5 text-left">Created</th>
                <th className="px-4 py-2.5 text-right">State</th>
              </tr>
            </thead>
            <tbody>
              {data.fundingProjects.map((f) => {
                const j = findJob(data, f.jobId);
                return (
                  <tr key={f.id} className="border-b last:border-b-0 hover:bg-surface/60">
                    <td className="px-4 py-3"><Link to="/funding/$id" params={{ id: f.id }} className="font-medium text-foreground hover:underline">{f.ref}</Link></td>
                    <td className="px-4 py-3 text-foreground">{f.scheme}</td>
                    <td className="px-4 py-3 text-ink-muted">{j?.ref ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground">{f.measure}</td>
                    <td className="px-4 py-3 text-ink-muted">{fmtDate(f.createdAt)}</td>
                    <td className="px-4 py-3 text-right"><StatePill meta={FUNDING_STATES[f.state]} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

void Search; void Plus; void ArrowRight;

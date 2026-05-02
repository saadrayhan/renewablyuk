import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, JOB_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { findCustomer } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import type { JobState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/jobs")({
  head: () => ({ meta: [{ title: "Jobs — Renewably UK" }] }),
  component: JobsList,
});

const FILTERS: { value: JobState; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In progress" },
  { value: "awaiting-information", label: "Awaiting info" },
  { value: "under-validation", label: "Under validation" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
];

function JobsList() {
  const data = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<JobState | "all">("all");

  const rows = data.jobs
    .filter((j) => filter === "all" || j.state === filter)
    .filter((j) => {
      if (!q) return true;
      const c = findCustomer(data, j.customerId);
      return j.ref.toLowerCase().includes(q.toLowerCase()) || j.measure.toLowerCase().includes(q.toLowerCase()) || (c?.name.toLowerCase().includes(q.toLowerCase()) ?? false);
    });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Projects"
        title="Jobs"
        subtitle="Installation work — full lifecycle from draft to archived."
        actions={
          <Link to="/jobs/new" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Plus className="size-4" /> New job
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <FilterPills<JobState>
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ ...f, count: data.jobs.filter((j) => j.state === f.value).length }))}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs" className="h-9 w-64 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? <EmptyState icon={Briefcase} title="No jobs found" body="Try removing filters or create a new job." /> : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Ref</th>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Measure</th>
                  <th className="px-4 py-2.5 text-left">Owner</th>
                  <th className="px-4 py-2.5 text-left">Start</th>
                  <th className="px-4 py-2.5 text-right">State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((j) => {
                  const c = findCustomer(data, j.customerId);
                  return (
                    <tr key={j.id} className="border-b last:border-b-0 hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <Link to="/jobs/$id" params={{ id: j.id }} className="font-medium text-foreground hover:underline">{j.ref}</Link>
                      </td>
                      <td className="px-4 py-3 text-foreground">{c?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-foreground">{j.measure}</td>
                      <td className="px-4 py-3 text-ink-muted">{j.owner}</td>
                      <td className="px-4 py-3 text-ink-muted">{j.startDate}</td>
                      <td className="px-4 py-3 text-right"><StatePill meta={JOB_STATES[j.state]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

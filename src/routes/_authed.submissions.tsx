import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Search } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, SUBMISSION_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import type { SubmissionState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/submissions")({
  head: () => ({ meta: [{ title: "Submissions — Renewably UK" }] }),
  component: SubmissionsList,
});

const FILTERS: { value: SubmissionState; label: string }[] = [
  { value: "submitted", label: "Submitted" },
  { value: "under-review", label: "Under review" },
  { value: "awaiting-information", label: "Awaiting info" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

function SubmissionsList() {
  const data = useStore();
  const [filter, setFilter] = useState<SubmissionState | "all">("all");
  const [q, setQ] = useState("");
  const rows = data.submissions
    .filter((s) => filter === "all" || s.state === filter)
    .filter((s) => !q || s.ref.toLowerCase().includes(q.toLowerCase()) || s.scheme.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Submissions" title="Scheme submissions" subtitle="Created automatically when a funding project is submitted." />

      <div className="mt-6 flex items-center justify-between gap-3">
        <FilterPills<SubmissionState>
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ ...f, count: data.submissions.filter((s) => s.state === f.value).length }))}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-9 w-64 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? <EmptyState icon={Send} title="No submissions" body="Submit a funding project to create a submission record." /> : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Ref</th>
                  <th className="px-4 py-2.5 text-left">Scheme</th>
                  <th className="px-4 py-2.5 text-left">Funding project</th>
                  <th className="px-4 py-2.5 text-left">Submitted</th>
                  <th className="px-4 py-2.5 text-right">State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const fp = data.fundingProjects.find((f) => f.id === s.fundingProjectId);
                  return (
                    <tr key={s.id} className="cursor-pointer border-b last:border-b-0 hover:bg-surface/60">
                      <td className="px-4 py-3 font-medium text-foreground"><Link to="/submissions/$id" params={{ id: s.id }} className="hover:underline">{s.ref}</Link></td>
                      <td className="px-4 py-3 text-foreground">{s.scheme}</td>
                      <td className="px-4 py-3">
                        {fp ? <Link to="/funding/$id" params={{ id: fp.id }} className="text-foreground hover:underline">{fp.ref}</Link> : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{fmtDate(s.submittedAt)}</td>
                      <td className="px-4 py-3 text-right"><StatePill meta={SUBMISSION_STATES[s.state]} /></td>
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

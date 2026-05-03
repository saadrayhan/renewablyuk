import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart2, Download, FileBadge, Sparkles, Send, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";
import { EmptyState } from "@/components/app/empty-state";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/reports")({
  head: () => ({ meta: [{ title: "Reports — Renewably UK" }] }),
  component: ReportsPage,
});

type Tab = "ibg" | "pipeline" | "funding" | "submissions";

function ReportsPage() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [tab, setTab] = useState<Tab>("ibg");
  const [exports, setExports] = useState<{ id: string; name: string; at: number }[]>([]);

  if (!can(permissions, "reports.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Insight" title="Reports" />
        <div className="mt-6"><LockedCard title="Reports" reason={{ kind: "permission", permission: "reports.read" }} /></div>
      </div>
    );
  }

  const ibgStats = useMemo(() => {
    const issued = data.ibgs.filter((i) => i.state === "issued").length;
    const pending = data.ibgs.filter((i) => i.state === "amended").length;
    const cancelled = data.ibgs.filter((i) => i.state === "cancelled").length;
    const month = data.ibgs.filter((i) => i.issuedAt && Date.now() - i.issuedAt < 30 * 86400000).length;
    return { issued, pending, cancelled, month };
  }, [data.ibgs]);

  const jobStats = useMemo(() => ({
    active: data.jobs.filter((j) => j.state === "in-progress").length,
    completed: data.jobs.filter((j) => j.state === "completed").length,
    blocked: data.jobs.filter((j) => j.state === "blocked").length,
    archived: data.jobs.filter((j) => j.state === "archived" || j.state === "closed").length,
  }), [data.jobs]);

  const fundingStats = useMemo(() => ({
    started: data.fundingProjects.length,
    review: data.fundingProjects.filter((f) => f.state === "under-review").length,
    submitted: data.fundingProjects.filter((f) => f.state === "submitted").length,
    returned: data.fundingProjects.filter((f) => f.state === "returned").length,
  }), [data.fundingProjects]);

  const subStats = useMemo(() => ({
    submitted: data.submissions.filter((s) => s.state === "submitted").length,
    accepted: data.submissions.filter((s) => s.state === "accepted").length,
    rejected: data.submissions.filter((s) => s.state === "rejected").length,
  }), [data.submissions]);

  function runExport(name: string) {
    setExports((prev) => [{ id: Math.random().toString(36).slice(2), name, at: Date.now() }, ...prev]);
    toast.success(`${name} exported`);
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Insight"
        title="Reporting"
        subtitle="Operational visibility across jobs, IBGs, funding and submissions."
        actions={
          <button onClick={() => runExport(`${tab.toUpperCase()} report`)} className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Download className="size-3.5" /> Export current view
          </button>
        }
      />

      <div className="mt-6"><UnderlineTabs<Tab> value={tab} onChange={setTab} options={[
        { value: "ibg", label: "IBGs" },
        { value: "pipeline", label: "Job pipeline" },
        { value: "funding", label: "Funding" },
        { value: "submissions", label: "Submissions" },
      ]} /></div>

      <div className="mt-5">
        {tab === "ibg" && (
          <ReportCard icon={FileBadge} title="IBG report" stats={[
            { label: "Issued (total)", value: ibgStats.issued },
            { label: "Issued this month", value: ibgStats.month },
            { label: "Pending amendment", value: ibgStats.pending },
            { label: "Cancelled", value: ibgStats.cancelled },
          ]} chart={<LineSpark values={[3, 5, 4, 7, 9, 6, 11, 12, 14]} />} />
        )}
        {tab === "pipeline" && (
          <ReportCard icon={BarChart2} title="Job pipeline" stats={[
            { label: "Active", value: jobStats.active },
            { label: "Completed", value: jobStats.completed },
            { label: "Blocked", value: jobStats.blocked },
            { label: "Archived", value: jobStats.archived },
          ]} chart={<BarRow data={[
            { label: "Active", value: jobStats.active },
            { label: "Completed", value: jobStats.completed },
            { label: "Blocked", value: jobStats.blocked },
            { label: "Archived", value: jobStats.archived },
          ]} />} />
        )}
        {tab === "funding" && (
          <ReportCard icon={Sparkles} title="Funding progress" stats={[
            { label: "Projects started", value: fundingStats.started },
            { label: "In review", value: fundingStats.review },
            { label: "Submitted", value: fundingStats.submitted },
            { label: "Returned", value: fundingStats.returned },
          ]} chart={<Funnel values={[fundingStats.started, fundingStats.review, fundingStats.submitted]} />} />
        )}
        {tab === "submissions" && (
          <ReportCard icon={Send} title="Submission tracker" stats={[
            { label: "Submitted", value: subStats.submitted },
            { label: "Accepted", value: subStats.accepted },
            { label: "Rejected", value: subStats.rejected },
          ]} chart={<Pie values={[subStats.accepted, subStats.rejected, subStats.submitted]} />} />
        )}
      </div>

      <div className="mt-6 rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-medium">Recent exports</div>
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted"><TrendingUp className="size-3" /> {exports.length} total</span>
        </div>
        {exports.length === 0 ? (
          <div className="px-5 py-10"><EmptyState icon={Download} title="No exports yet" body="Run a report and export to CSV — your downloads will appear here." /></div>
        ) : (
          <div className="divide-y">
            {exports.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{e.name}.csv</div>
                  <div className="text-[11px] text-ink-muted">Generated {fmtDate(e.at)}</div>
                </div>
                <button className="press rounded-full border bg-background px-3 py-1 text-xs">Download</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ icon: Icon, title, stats, chart }: { icon: React.ComponentType<{ className?: string }>; title: string; stats: { label: string; value: number }[]; chart: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="grid size-7 place-items-center rounded-lg bg-tile text-ink-muted"><Icon className="size-3.5" /></span>
        {title}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-surface/40 p-3">
            <div className="text-[11px] uppercase tracking-wide text-ink-muted">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-5">{chart}</div>
    </div>
  );
}

function LineSpark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - (v / max) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-32 w-full rounded-xl bg-gradient-to-b from-tile to-background">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={pts} className="text-cat-green" />
    </svg>
  );
}

function BarRow({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-24 text-xs text-ink-muted">{d.label}</div>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-tile">
            <div className="h-full rounded-full bg-cat-blue" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <div className="w-8 text-right text-xs font-medium text-foreground">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

function Funnel({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const labels = ["Started", "In review", "Submitted"];
  return (
    <div className="space-y-1.5">
      {values.map((v, i) => (
        <div key={i} className="mx-auto flex items-center gap-3" style={{ width: `${100 - i * 15}%` }}>
          <div className="h-8 flex-1 overflow-hidden rounded-lg bg-cat-amber-bg">
            <div className="grid h-full place-items-center text-xs font-medium text-cat-amber" style={{ width: `${(v / max) * 100}%`, background: "var(--cat-amber)", color: "white" }}>
              {labels[i]} · {v}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Pie({ values }: { values: number[] }) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const colors = ["var(--cat-green)", "var(--cat-rose)", "var(--cat-blue)"];
  let acc = 0;
  const segs = values.map((v, i) => {
    const start = (acc / total) * 360; acc += v;
    const end = (acc / total) * 360;
    const large = end - start > 180 ? 1 : 0;
    const sx = 50 + 40 * Math.cos((Math.PI * (start - 90)) / 180);
    const sy = 50 + 40 * Math.sin((Math.PI * (start - 90)) / 180);
    const ex = 50 + 40 * Math.cos((Math.PI * (end - 90)) / 180);
    const ey = 50 + 40 * Math.sin((Math.PI * (end - 90)) / 180);
    return <path key={i} d={`M50 50 L${sx} ${sy} A40 40 0 ${large} 1 ${ex} ${ey} Z`} fill={colors[i]} />;
  });
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-32 w-32">{segs}</svg>
      <div className="space-y-1.5 text-xs">
        {["Accepted", "Rejected", "Submitted"].map((l, i) => (
          <div key={l} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: colors[i] }} />
            <span className="text-ink-muted">{l}</span>
            <span className="font-medium text-foreground">{values[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart2, Download, FileBadge, Sparkles, Send } from "lucide-react";
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
  const [exports, setExports] = useState<{ id: string; name: string; rows: string[][]; at: number }[]>([]);

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

  const acceptanceRate = subStats.submitted + subStats.accepted + subStats.rejected > 0
    ? Math.round((subStats.accepted / (subStats.submitted + subStats.accepted + subStats.rejected)) * 100)
    : 0;

  function buildRows(): string[][] {
    if (tab === "ibg") return [["Ref", "Customer", "Property", "State", "Issued"], ...data.ibgs.map((i) => [i.ref, i.customerName, i.propertyAddress, i.state, i.issuedAt ? fmtDate(i.issuedAt) : ""])];
    if (tab === "pipeline") return [["Ref", "Customer", "Measure", "State"], ...data.jobs.map((j) => [j.ref, data.customers.find((c) => c.id === j.customerId)?.name ?? "", j.measure, j.state])];
    if (tab === "funding") return [["Ref", "Scheme", "State"], ...data.fundingProjects.map((f) => [f.ref, f.scheme, f.state])];
    return [["Ref", "Scheme", "State"], ...data.submissions.map((s) => [s.ref, s.scheme, s.state])];
  }

  function runExport() {
    const name = `${tab}-report-${new Date().toISOString().slice(0, 10)}`;
    const rows = buildRows();
    setExports((prev) => [{ id: Math.random().toString(36).slice(2), name, rows, at: Date.now() }, ...prev]);
    download(name, rows);
    toast.success("Export ready");
  }

  function download(name: string, rows: string[][]) {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${name}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Insight"
        title="Reports"
        subtitle="Operational visibility across jobs, IBGs, funding and submissions."
        actions={
          <button onClick={runExport} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-2 text-sm font-medium text-foreground hover:bg-surface">
            <Download className="size-3.5" /> Export current view
          </button>
        }
      />

      {/* KPI strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="IBGs issued" value={ibgStats.issued} sub={`${ibgStats.month} this month`} spark={[3, 5, 4, 7, 9, 6, 11, 12, 14]} />
        <Kpi label="Active jobs" value={jobStats.active} sub={`${jobStats.completed} completed`} spark={[2, 3, 3, 5, 4, 6, 7, 6, 8]} />
        <Kpi label="Funding submitted" value={fundingStats.submitted} sub={`${fundingStats.review} in review`} spark={[1, 1, 2, 2, 3, 3, 4, 4, 5]} />
        <Kpi label="Acceptance rate" value={`${acceptanceRate}%`} sub={`${subStats.accepted} accepted`} spark={[40, 55, 50, 62, 70, 68, 74, 80, acceptanceRate || 60]} />
      </div>

      <div className="mt-6"><UnderlineTabs<Tab> value={tab} onChange={setTab} options={[
        { value: "ibg", label: "IBGs" },
        { value: "pipeline", label: "Job pipeline" },
        { value: "funding", label: "Funding" },
        { value: "submissions", label: "Submissions" },
      ]} /></div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {tab === "ibg" && <ChartCard icon={FileBadge} title="IBGs over time" subtitle="Last 9 weeks"><LineSpark values={[3, 5, 4, 7, 9, 6, 11, 12, 14]} /></ChartCard>}
          {tab === "pipeline" && <ChartCard icon={BarChart2} title="Job state distribution" subtitle="Open + recently closed"><BarRow data={[
            { label: "Active", value: jobStats.active },
            { label: "Completed", value: jobStats.completed },
            { label: "Blocked", value: jobStats.blocked },
            { label: "Archived", value: jobStats.archived },
          ]} /></ChartCard>}
          {tab === "funding" && <ChartCard icon={Sparkles} title="Funnel — start to submission" subtitle="Drop-off by stage"><Funnel values={[fundingStats.started, fundingStats.review, fundingStats.submitted]} /></ChartCard>}
          {tab === "submissions" && <ChartCard icon={Send} title="Outcome split" subtitle="Last 90 days"><Pie values={[subStats.accepted, subStats.rejected, subStats.submitted]} /></ChartCard>}
        </div>
        <div>
          <BreakdownCard tab={tab} ibgStats={ibgStats} jobStats={jobStats} fundingStats={fundingStats} subStats={subStats} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-medium">Recent exports</div>
          <span className="text-[11px] text-ink-muted">{exports.length} total</span>
        </div>
        {exports.length === 0 ? (
          <div className="px-5 py-8"><EmptyState icon={Download} title="No exports yet" body="Run a report and export to CSV — your downloads will appear here." /></div>
        ) : (
          <div className="divide-y">
            {exports.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{e.name}.csv</div>
                  <div className="text-[11px] text-ink-muted">Generated {fmtDate(e.at)} · {e.rows.length - 1} rows</div>
                </div>
                <button onClick={() => download(e.name, e.rows)} className="press rounded-full border bg-background px-3 py-1 text-xs hover:bg-surface">Download</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, spark }: { label: string; value: number | string; sub: string; spark: number[] }) {
  const max = Math.max(...spark, 1);
  const pts = spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${30 - (v / max) * 28}`).join(" ");
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">{label}</div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-ink">{value}</div>
          <div className="mt-0.5 text-[11px] text-ink-muted">{sub}</div>
        </div>
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-20 text-foreground/70">
          <polyline fill="none" stroke="currentColor" strokeWidth="1.25" points={pts} />
        </svg>
      </div>
    </div>
  );
}

function ChartCard({ icon: Icon, title, subtitle, children }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-tile text-ink-muted"><Icon className="size-3.5" /></span>
          <div>
            <div className="text-sm font-medium text-foreground">{title}</div>
            <div className="text-[11px] text-ink-muted">{subtitle}</div>
          </div>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function BreakdownCard({ tab, ibgStats, jobStats, fundingStats, subStats }: {
  tab: Tab;
  ibgStats: { issued: number; month: number; pending: number; cancelled: number };
  jobStats: { active: number; completed: number; blocked: number; archived: number };
  fundingStats: { started: number; review: number; submitted: number; returned: number };
  subStats: { submitted: number; accepted: number; rejected: number };
}) {
  const items = tab === "ibg"
    ? [["Issued total", ibgStats.issued], ["This month", ibgStats.month], ["Amended", ibgStats.pending], ["Cancelled", ibgStats.cancelled]]
    : tab === "pipeline"
    ? [["Active", jobStats.active], ["Completed", jobStats.completed], ["Blocked", jobStats.blocked], ["Archived", jobStats.archived]]
    : tab === "funding"
    ? [["Started", fundingStats.started], ["In review", fundingStats.review], ["Submitted", fundingStats.submitted], ["Returned", fundingStats.returned]]
    : [["Submitted", subStats.submitted], ["Accepted", subStats.accepted], ["Rejected", subStats.rejected]];
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="text-sm font-medium text-foreground">Breakdown</div>
      <div className="mt-3 divide-y">
        {items.map(([l, v]) => (
          <div key={l as string} className="flex items-center justify-between py-2.5">
            <div className="text-sm text-ink-muted">{l}</div>
            <div className="text-sm font-semibold tabular-nums text-foreground">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineSpark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - (v / max) * 90 - 5}`).join(" ");
  const area = `0,100 ${pts} 100,100`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full">
      <polygon points={area} fill="currentColor" className="text-foreground/[0.06]" />
      <polyline fill="none" stroke="currentColor" strokeWidth="1.25" points={pts} className="text-foreground" />
    </svg>
  );
}

function BarRow({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-24 text-xs text-ink-muted">{d.label}</div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-tile">
            <div className="h-full rounded-full bg-foreground" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <div className="w-8 text-right text-xs font-medium tabular-nums text-foreground">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

function Funnel({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const labels = ["Started", "In review", "Submitted"];
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-20 text-xs text-ink-muted">{labels[i]}</div>
          <div className="h-8 flex-1 overflow-hidden rounded-lg bg-tile">
            <div className="grid h-full place-items-start rounded-lg bg-foreground px-3 text-xs font-medium text-background" style={{ width: `${(v / max) * 100}%`, alignContent: "center" }}>{v}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Pie({ values }: { values: number[] }) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const tones = ["text-cat-green", "text-cat-rose", "text-ink-muted"] as const;
  const fills = ["var(--cat-green)", "var(--cat-rose)", "var(--border)"];
  let acc = 0;
  const segs = values.map((v, i) => {
    const start = (acc / total) * 360; acc += v;
    const end = (acc / total) * 360;
    const large = end - start > 180 ? 1 : 0;
    const sx = 50 + 40 * Math.cos((Math.PI * (start - 90)) / 180);
    const sy = 50 + 40 * Math.sin((Math.PI * (start - 90)) / 180);
    const ex = 50 + 40 * Math.cos((Math.PI * (end - 90)) / 180);
    const ey = 50 + 40 * Math.sin((Math.PI * (end - 90)) / 180);
    return <path key={i} d={`M50 50 L${sx} ${sy} A40 40 0 ${large} 1 ${ex} ${ey} Z`} fill={fills[i]} />;
  });
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-32 w-32">{segs}<circle cx="50" cy="50" r="22" fill="var(--card)" /></svg>
      <div className="space-y-2 text-xs">
        {["Accepted", "Rejected", "Submitted"].map((l, i) => (
          <div key={l} className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${tones[i]} bg-current`} />
            <span className="text-ink-muted">{l}</span>
            <span className="font-semibold tabular-nums text-foreground">{values[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

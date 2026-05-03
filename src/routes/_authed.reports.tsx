import { createFileRoute } from "@tanstack/react-router";
import { BarChart2, Download, FileBadge, Sparkles, Send, Lock } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";
import { EmptyState } from "@/components/app/empty-state";

export const Route = createFileRoute("/_authed/reports")({
  head: () => ({ meta: [{ title: "Reports — Renewably UK" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const data = useStore();
  const { permissions } = useDevRole();

  if (!can(permissions, "reports.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Insight" title="Reports" />
        <div className="mt-6"><LockedCard title="Reports" reason={{ kind: "permission", permission: "reports.read" }} /></div>
      </div>
    );
  }

  const cards = [
    { key: "ibg", icon: FileBadge, title: "IBGs", subtitle: "Issued by month", value: data.ibgs.filter((i) => i.state === "issued").length, hint: "issued total" },
    { key: "pipeline", icon: BarChart2, title: "Pipeline", subtitle: "Jobs by state", value: data.jobs.length, hint: "active jobs" },
    { key: "funding", icon: Sparkles, title: "Funding", subtitle: "Projects by scheme", value: data.fundingProjects.length, hint: "in flight" },
    { key: "submissions", icon: Send, title: "Submissions", subtitle: "Outcome by scheme", value: data.submissions.length, hint: "submitted" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Insight"
        title="Reports"
        subtitle="Operational metrics across the record chain. Exports unlock once data sources are connected."
        actions={
          <button disabled className="press inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border bg-background px-3.5 py-2 text-sm font-medium opacity-50">
            <Download className="size-3.5" /> Export CSV
          </button>
        }
      />

      <div className="relative mt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.key} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className="grid size-7 place-items-center rounded-lg bg-tile text-ink-muted"><Icon className="size-3.5" /></span>
                      {c.title}
                    </div>
                    <div className="mt-1 text-xs text-ink-muted">{c.subtitle}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold tracking-tight text-foreground">{c.value}</div>
                    <div className="text-[11px] text-ink-muted">{c.hint}</div>
                  </div>
                </div>
                <div className="mt-4 h-32 rounded-xl bg-gradient-to-b from-tile to-background" />
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border bg-card">
          <div className="border-b px-5 py-3 text-sm font-medium">Recent exports</div>
          <div className="px-5 py-10">
            <EmptyState icon={Download} title="No exports yet" body="Run a report and export to CSV — your downloads will appear here." />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-background/40 backdrop-blur-[1px]">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs font-medium text-ink-muted shadow-sm">
            <Lock className="size-3.5" /> Reports module coming soon
          </div>
        </div>
      </div>
    </div>
  );
}

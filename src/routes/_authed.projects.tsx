import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Home, Briefcase, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, JOB_STATES, RECORD_STATES } from "@/components/app/state-pill";
import { fmtDate } from "@/lib/mock/queries";
import { useDevRole } from "@/lib/dev-role";
import { canAny } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";

export const Route = createFileRoute("/_authed/projects")({
  head: () => ({ meta: [{ title: "Projects — Renewably UK" }] }),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  const data = useStore();
  const { permissions } = useDevRole();

  if (!canAny(permissions, ["customers.read", "jobs.read", "properties.read"])) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Projects" title="Projects" />
        <div className="mt-6"><LockedCard title="Projects hub" body="Ask an admin for read access to customers, properties or jobs." reason={{ kind: "permission", permission: "customers.read" }} /></div>
      </div>
    );
  }

  const tiles = [
    { label: "Customers", to: "/customers", icon: Users, count: data.customers.length, desc: "People + organisations you serve", tone: "blue" },
    { label: "Properties", to: "/properties", icon: Home, count: data.properties.length, desc: "Sites linked to a customer", tone: "teal" },
    { label: "Jobs", to: "/jobs", icon: Briefcase, count: data.jobs.length, desc: "Installation work — full lifecycle", tone: "green" },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Projects" title="The record chain" subtitle="Customer → Property → Job. Every IBG, funding project and submission is anchored here." />

      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to} className="press tile group flex flex-col gap-3 rounded-2xl border bg-card p-5">
              <div className={`grid size-12 place-items-center rounded-xl bg-cat-${t.tone}-bg text-cat-${t.tone}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium text-foreground">{t.label}</div>
                  <span className="rounded-full bg-tile px-2 py-0.5 text-[11px] font-medium text-ink-muted">{t.count}</span>
                </div>
                <div className="mt-1 text-sm text-ink-muted">{t.desc}</div>
              </div>
              <div className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-foreground">Open <ArrowRight className="size-3" /></div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Recent customers" to="/customers">
          {data.customers.slice(0, 5).map((c) => (
            <Link key={c.id} to="/customers/$id" params={{ id: c.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{c.name}</div>
                <div className="text-xs text-ink-muted">{c.ref} · created {fmtDate(c.createdAt)}</div>
              </div>
              <StatePill meta={RECORD_STATES[c.status]} />
            </Link>
          ))}
        </Panel>
        <Panel title="Active jobs" to="/jobs">
          {data.jobs.filter((j) => j.state === "in-progress" || j.state === "under-validation").slice(0, 5).map((j) => (
            <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{j.ref} · {j.measure}</div>
                <div className="text-xs text-ink-muted">Owner · {j.owner}</div>
              </div>
              <StatePill meta={JOB_STATES[j.state]} />
            </Link>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between px-2">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <Link to={to} className="text-xs text-ink-muted hover:text-foreground">View all</Link>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

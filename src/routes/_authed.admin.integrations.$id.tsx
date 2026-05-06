import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/admin/integrations/$id")({
  head: () => ({ meta: [{ title: "Integration — Renewably UK" }] }),
  component: IntegrationDetail,
});

const META: Record<string, { name: string; category: string; status: "operational" | "degraded"; lastSync: string }> = {
  "companies-house": { name: "Companies House", category: "Risk monitoring", status: "operational", lastSync: "2 min ago" },
  stripe: { name: "Stripe", category: "Payments", status: "operational", lastSync: "Just now" },
  hubspot: { name: "HubSpot", category: "CRM", status: "degraded", lastSync: "14 min ago" },
};

function IntegrationDetail() {
  const { id } = Route.useParams();
  const m = META[id] ?? { name: id, category: "External service", status: "operational" as const, lastSync: "—" };
  const degraded = m.status === "degraded";

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/admin/integrations" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Integrations Hub
      </Link>
      <div className="mt-3">
        <PageHeader
          eyebrow={`Admin · Integrations · ${m.category}`}
          title={m.name}
          subtitle={`Last sync ${m.lastSync}`}
          actions={<Button variant="secondary" size="sm">Run sync now</Button>}
        />
      </div>

      {degraded && (
        <div className="mt-4 rounded-2xl border border-brand-blue/20 bg-brand-blue-tint px-4 py-3 text-sm text-brand-blue">
          Service is degraded — recent calls are slower than usual but no data has been lost.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Stat label="Status" value={m.status === "operational" ? "Operational" : "Degraded"} icon={m.status === "operational" ? CheckCircle2 : AlertTriangle} tone={m.status === "operational" ? "green" : "amber"} />
        <Stat label="Calls (24h)" value="14,238" icon={Activity} tone="green" />
        <Stat label="Error rate (24h)" value={degraded ? "2.4%" : "0.1%"} icon={AlertTriangle} tone={degraded ? "amber" : "green"} />
      </div>

      <section className="mt-4 rounded-2xl border bg-card">
        <header className="border-b px-5 py-3">
          <h2 className="text-base font-semibold text-foreground">Recent errors</h2>
        </header>
        <div className="divide-y">
          {(degraded ? mockErrors : []).map((e, i) => (
            <div key={i} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
              <div>
                <div className="font-medium text-foreground">{e.title}</div>
                <div className="text-[11px] text-ink-muted">{e.endpoint}</div>
              </div>
              <span className="text-[11px] text-ink-muted">{e.at}</span>
            </div>
          ))}
          {!degraded && <div className="px-5 py-8 text-center text-sm text-ink-muted">No errors in the last 24 hours.</div>}
        </div>
      </section>
    </div>
  );
}

const mockErrors = [
  { title: "Rate limit reached (429)", endpoint: "POST /v1/contacts", at: "12 min ago" },
  { title: "Timeout (504)", endpoint: "GET /v1/companies/123", at: "38 min ago" },
];

function Stat({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone: "green" | "amber" | "rose" }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
        <Icon className={`size-4 text-cat-${tone}`} />
      </div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}

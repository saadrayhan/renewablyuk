import { createFileRoute, Link } from "@tanstack/react-router";
import { Plug, Receipt, Workflow, Building2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/integrations")({
  head: () => ({ meta: [{ title: "Integrations Hub — Renewably UK" }] }),
  component: IntegrationsHub,
});

const HEALTH = [
  { label: "Companies House API", status: "ok" as const, detail: "Operational · last sync 03:00 UTC" },
  { label: "Stripe API", status: "ok" as const, detail: "Operational · 100% delivery (24h)" },
  { label: "HubSpot API", status: "warn" as const, detail: "Degraded · elevated latency" },
];

const ENDPOINTS = [
  { name: "POST /ibg", used: 412, limit: 1000 },
  { name: "GET /repository", used: 1820, limit: 5000 },
  { name: "POST /webhooks", used: 64, limit: 500 },
];

const HUBS = [
  { to: "/admin/stripe-events", icon: Receipt, label: "Stripe Events", desc: "Webhook log, payment & subscription events." },
  { to: "/admin/crm", icon: Workflow, label: "CRM / HubSpot", desc: "Two-way customer & job sync (coming soon)." },
  { to: "/settings/integrations", icon: Plug, label: "Workspace Integrations", desc: "Connect Zapier, Slack, Webhooks at workspace level." },
  { to: "/admin/companies", icon: Building2, label: "Companies House", desc: "Limited-company verification & risk signals." },
];

function IntegrationsHub() {
  const { permissions } = useDevRole();
  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Integrations" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Integrations"
        title="Integrations Hub"
        subtitle="Read-only observability for external APIs powering the platform. Connect or disconnect tools from Workspace Settings."
      />

      <section>
        <SectionHeader title="System health" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {HEALTH.map((h) => (
            <div key={h.label} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", h.status === "ok" ? "bg-cat-green" : h.status === "warn" ? "bg-cat-amber" : "bg-cat-rose")} />
                <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">{h.label}</div>
              </div>
              <div className="mt-3 text-lg font-semibold tracking-tight text-ink">
                {h.status === "ok" ? "Operational" : h.status === "warn" ? "Degraded" : "Down"}
              </div>
              <div className="mt-1 text-[11px] text-ink-muted">{h.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="API usage" subtitle="Monthly request volume against connector quotas." />
        <div className="grid gap-3 md:grid-cols-3">
          {ENDPOINTS.map((e) => {
            const pct = Math.min(100, Math.round((e.used / e.limit) * 100));
            const tone = pct > 80 ? "bg-cat-rose" : pct > 60 ? "bg-cat-amber" : "bg-foreground";
            return (
              <div key={e.name} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[12px] text-foreground">{e.name}</div>
                  <div className="text-[11px] text-ink-muted">{e.used.toLocaleString()} / {e.limit.toLocaleString()}</div>
                </div>
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-tile">
                  <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 text-[11px] text-ink-muted">{pct}% of monthly quota</div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader title="Surfaces" subtitle="Drill into specific integration activity." />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {HUBS.map((h) => {
            const Icon = h.icon;
            return (
              <Link key={h.to} to={h.to} className="press tile group flex items-start justify-between gap-4 rounded-2xl border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-tile text-ink-muted">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{h.label}</div>
                    <div className="mt-0.5 text-[12px] text-ink-muted">{h.desc}</div>
                  </div>
                </div>
                <ArrowRight className="mt-1 size-4 text-ink-muted transition group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {subtitle && <div className="mt-0.5 text-[12px] text-ink-muted">{subtitle}</div>}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/external-apis")({
  head: () => ({ meta: [{ title: "External APIs — Renewably UK" }] }),
  component: ExternalAPIs,
});

type LogStatus = "Success" | "Failed" | "Rate Limited";
type Log = {
  id: string;
  ts: string;
  source: string;
  endpoint: string;
  method: string;
  status: LogStatus;
  ms: number;
  statusCode: number;
  payload?: string;
  response?: string;
};

const QUOTAS = [
  { name: "Companies House", used: 847, limit: 1000, reset: "00:00 UTC", status: "Warning" as const },
  { name: "HubSpot", used: 1245, limit: 2000, reset: "00:00 UTC", status: "Normal" as const },
  { name: "Stripe", used: 423, limit: 1000, reset: "00:00 UTC", status: "Normal" as const },
  { name: "Lovable AI Gateway", used: 38, limit: 500, reset: "Hourly", status: "Normal" as const },
];

const LOGS: Log[] = [
  { id: "L-1", ts: "2026-05-06 09:42:18", source: "Companies House", endpoint: "/company/12345678", method: "GET", status: "Success", ms: 184, statusCode: 200, response: '{ "company_status": "active" }' },
  { id: "L-2", ts: "2026-05-06 09:41:02", source: "HubSpot", endpoint: "/crm/v3/objects/contacts", method: "POST", status: "Success", ms: 312, statusCode: 201, payload: '{ "email": "j@acme.io" }' },
  { id: "L-3", ts: "2026-05-06 09:39:55", source: "Companies House", endpoint: "/search/companies", method: "GET", status: "Rate Limited", ms: 28, statusCode: 429 },
  { id: "L-4", ts: "2026-05-06 09:38:11", source: "Stripe", endpoint: "/v1/customers/cus_X", method: "GET", status: "Failed", ms: 5012, statusCode: 504, response: "Gateway timeout" },
];

function ExternalAPIs() {
  const { permissions } = useDevRole();
  const [throttle, setThrottle] = useState(true);
  const [queue, setQueue] = useState(false);
  const [priority, setPriority] = useState(false);
  const [open, setOpen] = useState<Log | null>(null);

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="External APIs" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Integrations"
        title="External APIs"
        subtitle="Detailed observability, quotas and rate-limit controls for connected services."
        actions={<Button>Refresh now</Button>}
      />

      <section>
        <SectionHeader title="Quotas & rate limits" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {QUOTAS.map((q) => {
            const pct = Math.round((q.used / q.limit) * 100);
            const tone = pct > 80 ? "bg-cat-rose" : pct > 60 ? "bg-cat-amber" : "bg-foreground";
            return (
              <div key={q.name} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wide text-ink-muted">{q.name}</div>
                  {q.status === "Warning" ? <AlertTriangle className="size-4 text-cat-amber" /> : <CheckCircle2 className="size-4 text-cat-green" />}
                </div>
                <div className="mt-3 text-2xl font-semibold text-ink">{q.used.toLocaleString()}<span className="text-sm text-ink-muted"> / {q.limit.toLocaleString()}</span></div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-tile">
                  <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 text-[11px] text-ink-muted">Resets {q.reset}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader title="Throttling controls" subtitle="Applied platform-wide to outgoing requests." />
        <div className="rounded-2xl border bg-card divide-y">
          <ToggleRow label="Enable request throttling" desc="Smooth bursts to stay under per-second limits." checked={throttle} onChange={setThrottle} />
          <ToggleRow label="Queue requests on rate-limit" desc="Hold and retry instead of failing fast." checked={queue} onChange={setQueue} />
          <ToggleRow label="Priority mode" desc="Always reserve 10% of quota for IBG issuance flows." checked={priority} onChange={setPriority} />
        </div>
      </section>

      <section>
        <SectionHeader title="Recent calls" subtitle="Click a row for full request and response payload." />
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-4 py-2.5 text-left">Time</th>
                <th className="px-4 py-2.5 text-left">Source</th>
                <th className="px-4 py-2.5 text-left">Endpoint</th>
                <th className="px-4 py-2.5 text-left">Method</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Latency</th>
              </tr>
            </thead>
            <tbody>
              {LOGS.map((l) => (
                <tr key={l.id} onClick={() => setOpen(l)} className="cursor-pointer border-b last:border-b-0 hover:bg-surface/60">
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-muted">{l.ts}</td>
                  <td className="px-4 py-3 text-foreground">{l.source}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-muted">{l.endpoint}</td>
                  <td className="px-4 py-3 text-ink-muted">{l.method}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                      l.status === "Success" ? "bg-cat-green-bg text-cat-green" :
                      l.status === "Rate Limited" ? "bg-cat-amber-bg text-cat-amber" :
                      "bg-cat-rose-bg text-cat-rose",
                    )}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-ink-muted">{l.ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-[520px] sm:max-w-[520px]">
          <SheetHeader>
            <SheetTitle>{open?.source} — {open?.endpoint}</SheetTitle>
          </SheetHeader>
          {open && (
            <div className="mt-6 space-y-4 text-sm">
              <Field label="Status code" value={String(open.statusCode)} />
              <Field label="Latency" value={`${open.ms} ms`} />
              <Field label="Method" value={open.method} />
              {open.payload && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-muted">Request payload</div>
                  <pre className="mt-1 overflow-auto rounded-lg bg-surface p-3 font-mono text-[11px]">{open.payload}</pre>
                </div>
              )}
              {open.response && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-muted">Response</div>
                  <pre className="mt-1 overflow-auto rounded-lg bg-surface p-3 font-mono text-[11px]">{open.response}</pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {subtitle && <div className="mt-0.5 text-[12px] text-ink-muted">{subtitle}</div>}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="mt-0.5 text-[12px] text-ink-muted">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-mono text-[12px] text-foreground">{value}</span>
    </div>
  );
}

export default ExternalAPIs;

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  Copy,
  KeyRound,
  Library,
  Receipt,
  Webhook,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/app/empty-state";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

const SNIPPET = `import { RenewablyClient } from "@renewably/sdk";

const renewably = new RenewablyClient({
  apiKey: process.env.RENEWABLY_API_KEY,
});

const lookup = await renewably.companies.lookup({
  number: "12345678",
});

console.log(lookup.status);`;

const QUICK_LINKS = [
  { icon: KeyRound, label: "Create an API key", href: "#" },
  { icon: Boxes, label: "Browse providers", href: "#" },
  { icon: BookOpen, label: "API reference", href: "#" },
  { icon: Library, label: "Libraries & SDKs", href: "#" },
  { icon: Webhook, label: "Webhooks", href: "#" },
  { icon: Receipt, label: "Pricing overview", href: "#" },
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
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="Admin · Integrations" title="External APIs" dense />
        <div className="flex items-center gap-2">
          <a href="#" className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-surface/60">
            API pricing <ArrowUpRight className="size-3.5" />
          </a>
          <a href="#" className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-surface/60">
            Documentation <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quotas">Quotas</TabsTrigger>
          <TabsTrigger value="throttling">Throttling</TabsTrigger>
          <TabsTrigger value="logs">Request log</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Promo card */}
          <div className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/60">
            <div className="size-20 shrink-0 rounded-xl bg-gradient-to-br from-cat-amber/40 via-cat-rose/30 to-cat-blue/30" />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-foreground">Companies House lookups now cached</div>
              <div className="mt-1 text-[13px] text-ink-muted">
                Repeated company queries are deduped server-side for 24h. Cuts quota usage by ~40% with no code changes.
              </div>
            </div>
            <Button variant="outline" size="sm">Learn more</Button>
          </div>

          {/* Quickstart */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <div className="flex flex-col justify-end">
              <div className="text-[18px] font-semibold text-foreground">Developer quickstart</div>
              <div className="mt-1.5 text-[13px] text-ink-muted">
                Wire the Renewably SDK into your service in under a minute. All connected providers route through one client.
              </div>
              <div className="mt-4">
                <Button>Configure</Button>
              </div>
            </div>
            <CodeBlock code={SNIPPET} />
          </div>

          {/* Usage + Quick links */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
            <section>
              <div className="text-[15px] font-semibold text-foreground">Usage</div>
              <div className="mt-3 rounded-2xl bg-card p-5 ring-1 ring-border/60">
                <div className="text-[12px] text-ink-muted">Top up balance</div>
                <div className="mt-1 text-[28px] font-semibold text-ink">£0</div>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm">+ Add credits</Button>
                  <button className="press inline-flex h-8 items-center gap-2 rounded-full border bg-background px-3 text-[13px] font-medium text-foreground hover:bg-surface/60">
                    Auto top up <span className="text-ink-muted">Off</span>
                  </button>
                </div>
              </div>
            </section>
            <section>
              <div className="text-[15px] font-semibold text-foreground">Quick links</div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {QUICK_LINKS.map((q) => {
                  const Icon = q.icon;
                  return (
                    <a key={q.label} href={q.href} className="press group flex items-center gap-3 rounded-xl bg-card px-4 py-3.5 ring-1 ring-border/60 transition-colors hover:bg-surface/60">
                      <span className="grid size-8 place-items-center rounded-md bg-tile">
                        <Icon className="size-4 text-foreground" />
                      </span>
                      <span className="text-[13px] font-medium text-foreground">{q.label}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="quotas">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {QUOTAS.map((q) => {
              const pct = Math.round((q.used / q.limit) * 100);
              const tone = pct > 80 ? "bg-cat-rose" : pct > 60 ? "bg-cat-amber" : "bg-foreground";
              return (
                <div key={q.name} className="rounded-2xl bg-card p-5 ring-1 ring-border/60">
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] text-ink-muted">{q.name}</div>
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
        </TabsContent>

        <TabsContent value="throttling">
          <div className="divide-y rounded-2xl bg-card ring-1 ring-border/60">
            <ToggleRow label="Enable request throttling" desc="Smooth bursts to stay under per-second limits." checked={throttle} onChange={setThrottle} />
            <ToggleRow label="Queue requests on rate-limit" desc="Hold and retry instead of failing fast." checked={queue} onChange={setQueue} />
            <ToggleRow label="Priority mode" desc="Always reserve 10% of quota for IBG issuance flows." checked={priority} onChange={setPriority} />
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[12px] font-medium text-ink-muted">
                  <th className="px-3 py-2.5 text-left">Time</th>
                  <th className="px-3 py-2.5 text-left">Source</th>
                  <th className="px-3 py-2.5 text-left">Endpoint</th>
                  <th className="px-3 py-2.5 text-left">Method</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {LOGS.map((l) => (
                  <tr key={l.id} onClick={() => setOpen(l)} className="cursor-pointer hover:bg-surface/60">
                    <td className="px-3 py-3.5 font-mono text-[12px] text-ink-muted">{l.ts}</td>
                    <td className="px-3 py-3.5 text-foreground">{l.source}</td>
                    <td className="px-3 py-3.5 font-mono text-[12px] text-ink-muted">{l.endpoint}</td>
                    <td className="px-3 py-3.5 text-ink-muted">{l.method}</td>
                    <td className="px-3 py-3.5">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        l.status === "Success" ? "bg-cat-green-bg text-cat-green" :
                        l.status === "Rate Limited" ? "bg-cat-amber-bg text-cat-amber" :
                        "bg-cat-rose-bg text-cat-rose",
                      )}>{l.status}</span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-ink-muted">{l.ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <EmptyState title="No webhooks configured" body="Forward platform events to an external URL when integrations need realtime updates." />
        </TabsContent>

        <TabsContent value="settings">
          <EmptyState title="Per-provider settings" body="Override credentials, regions and timeouts for individual integrations." />
        </TabsContent>
      </Tabs>

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

function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface ring-1 ring-border/60">
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied"); }}
        className="press absolute right-2 top-2 grid size-7 place-items-center rounded-md text-ink-muted hover:bg-tile hover:text-foreground"
        aria-label="Copy code"
      >
        <Copy className="size-3.5" />
      </button>
      <pre className="overflow-auto px-4 py-4 font-mono text-[12px] leading-[1.55]">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 inline-block w-6 select-none text-right text-ink-muted/60">{i + 1}</span>
              <span className="text-foreground">{line || " "}</span>
            </div>
          ))}
        </code>
      </pre>
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

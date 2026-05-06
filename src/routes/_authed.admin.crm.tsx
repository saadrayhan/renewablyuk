import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Workflow, Plug, Activity as ActIcon, ArrowLeftRight, Link as LinkIcon, Webhook,
  CheckCircle2, RotateCw, Copy, ExternalLink, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/admin/crm")({
  head: () => ({ meta: [{ title: "CRM / HubSpot — Renewably UK" }] }),
  component: CrmPage,
});

type Tab = "overview" | "mapping" | "triggers" | "history" | "webhook";

function CrmPage() {
  const { permissions } = useDevRole();
  // Local-only connection state — production would call the connector API.
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="CRM / HubSpot" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Integrations"
        title="CRM / HubSpot"
        subtitle="Two-way sync of customers, jobs, and IBG events with HubSpot."
        actions={connected ? (
          <Button variant="primary" size="sm" onClick={() => toast.success("Sync started — running in background")}>
            <RotateCw className="size-4" /> Sync now
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={() => { setConnected(true); toast.success("HubSpot connected (demo)"); }}>
            <Plug className="size-4" /> Connect HubSpot
          </Button>
        )}
      />

      {!connected ? (
        <NotConnectedHero onConnect={() => { setConnected(true); toast.success("HubSpot connected (demo)"); }} />
      ) : (
        <>
          <UnderlineTabs<Tab>
            value={tab}
            onChange={setTab}
            options={[
              { value: "overview", label: "Overview", icon: ActIcon },
              { value: "mapping", label: "Object mapping", icon: ArrowLeftRight },
              { value: "triggers", label: "Event triggers", icon: Workflow },
              { value: "history", label: "Sync history", icon: LinkIcon },
              { value: "webhook", label: "Webhook", icon: Webhook },
            ]}
          />
          {tab === "overview" && <OverviewTab onDisconnect={() => { setConnected(false); toast("HubSpot disconnected"); }} />}
          {tab === "mapping" && <MappingTab />}
          {tab === "triggers" && <TriggersTab />}
          {tab === "history" && <HistoryTab />}
          {tab === "webhook" && <WebhookTab />}
        </>
      )}
    </div>
  );
}

/* ────────── states ────────── */

function NotConnectedHero({ onConnect }: { onConnect: () => void }) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid gap-6 p-8 md:grid-cols-[1fr_280px]">
        <div>
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-blue-tint text-brand-blue">
            <Workflow className="size-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Connect your HubSpot account</h2>
          <p className="mt-1.5 max-w-lg text-sm text-ink-muted">
            Mirror customers, companies and projects between Renewably and HubSpot. Push events into your sales
            pipeline as IBGs are issued, amendments raised, and funding approved.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-ink-muted">
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-cat-green" /> Two-way contact &amp; company sync</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-cat-green" /> Deal stage automation on platform events</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-cat-green" /> Inbound webhook for HubSpot-side updates</li>
          </ul>
          <div className="mt-6 flex items-center gap-2">
            <Button variant="primary" onClick={onConnect}><Plug className="size-4" /> Connect HubSpot</Button>
            <Button variant="ghost" asChild><a href="https://developers.hubspot.com/docs/api-reference/overview" target="_blank" rel="noreferrer">Docs <ExternalLink className="size-3.5" /></a></Button>
          </div>
        </div>
        <div className="rounded-xl border bg-surface/40 p-5 text-[12px] text-ink-muted">
          <div className="text-[10px] font-medium uppercase tracking-wide text-foreground">Required scopes</div>
          <ul className="mt-2 space-y-1 font-mono">
            <li>crm.objects.contacts.read</li>
            <li>crm.objects.contacts.write</li>
            <li>crm.objects.companies.read</li>
            <li>crm.objects.deals.write</li>
            <li>webhooks</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function OverviewTab({ onDisconnect }: { onDisconnect: () => void }) {
  const stats = [
    { label: "Contacts synced", value: "1,284" },
    { label: "Companies synced", value: "312" },
    { label: "Deals mirrored", value: "97" },
    { label: "Errors (24h)", value: "0" },
  ];
  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between rounded-2xl border bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-brand-blue-tint text-brand-blue"><Workflow className="size-5" /></span>
          <div>
            <div className="text-sm font-medium text-foreground">ops@renewably.uk</div>
            <div className="text-[12px] text-ink-muted">Connected · last sync {fmtDate(Date.now() - 1000 * 60 * 12)}</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onDisconnect}>Disconnect</Button>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-4">
            <div className="text-[10px] uppercase tracking-wide text-ink-muted">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MappingTab() {
  const [open, setOpen] = useState<null | { from: string; to: string }>(null);
  const rows = [
    { from: "HubSpot Contact", to: "Renewably Customer", dir: "two-way", policy: "newest" },
    { from: "HubSpot Company", to: "Renewably Company", dir: "two-way", policy: "hubspot" },
    { from: "HubSpot Deal", to: "Renewably Project", dir: "one-way →", policy: "renewably" },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border bg-card divide-y">
      {rows.map((r) => (
        <button key={r.from} type="button" onClick={() => setOpen(r)}
          className="press flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface/40">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="size-4 text-ink-muted" />
            <div>
              <div className="text-sm font-medium text-foreground">{r.from} ↔ {r.to}</div>
              <div className="text-[11px] text-ink-muted">Direction: {r.dir} · Conflict: {r.policy === "newest" ? "Newest wins" : r.policy === "hubspot" ? "HubSpot wins" : "Renewably wins"}</div>
            </div>
          </div>
          <span className="text-xs text-ink-muted">Configure →</span>
        </button>
      ))}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-[440px] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Configure mapping</SheetTitle>
            <SheetDescription>{open?.from} ↔ {open?.to}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid gap-1.5">
              <Label className="text-[12px]">Sync direction</Label>
              <Select defaultValue="two-way"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="two-way">Two-way</SelectItem>
                  <SelectItem value="from">HubSpot → Renewably</SelectItem>
                  <SelectItem value="to">Renewably → HubSpot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[12px]">Conflict policy</Label>
              <Select defaultValue="newest"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest wins</SelectItem>
                  <SelectItem value="hubspot">HubSpot wins</SelectItem>
                  <SelectItem value="renewably">Renewably wins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border bg-surface/40 p-3 text-[11px] text-ink-muted">
              Field-level mapping for {open?.from} will appear here once a sync runs.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={() => { setOpen(null); toast.success("Mapping saved"); }}>Save mapping</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TriggersTab() {
  const [t, setT] = useState({ ibg: true, amend: true, fund: false });
  return (
    <div className="overflow-hidden rounded-2xl border bg-card divide-y">
      <TriggerRow label="On IBG issued" desc="Create a HubSpot note on the linked deal."
        on={t.ibg} onChange={(v) => setT({ ...t, ibg: v })} />
      <TriggerRow label="On amendment requested" desc="Create a follow-up task assigned to the deal owner."
        on={t.amend} onChange={(v) => setT({ ...t, amend: v })} />
      <TriggerRow label="On funding approved" desc="Move the deal to the configured pipeline stage."
        on={t.fund} onChange={(v) => setT({ ...t, fund: v })}
        extra={
          <div className="mt-2 grid gap-1.5">
            <Label className="text-[11px] text-ink-muted">Pipeline stage</Label>
            <Select defaultValue="closedwon"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="qualifiedtobuy">Qualified to buy</SelectItem>
                <SelectItem value="contractsent">Contract sent</SelectItem>
                <SelectItem value="closedwon">Closed won</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}

function TriggerRow({ label, desc, on, onChange, extra }: {
  label: string; desc: string; on: boolean; onChange: (v: boolean) => void; extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="mt-0.5 text-[12px] text-ink-muted">{desc}</div>
        {on && extra}
      </div>
      <Switch checked={on} onCheckedChange={onChange} />
    </div>
  );
}

function HistoryTab() {
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    id: `sync_${i}`,
    at: Date.now() - i * 1000 * 60 * 47,
    dir: i % 2 === 0 ? "→ HubSpot" : "← HubSpot",
    object: ["contact", "company", "deal"][i % 3],
    count: [12, 4, 1, 7, 22, 3, 9, 2][i],
    status: i === 3 ? "error" : "ok",
  }));
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-[10px] uppercase tracking-wide text-ink-muted">
          <tr className="border-b">
            <th className="px-5 py-2.5 text-left font-medium">When</th>
            <th className="px-5 py-2.5 text-left font-medium">Direction</th>
            <th className="px-5 py-2.5 text-left font-medium">Object</th>
            <th className="px-5 py-2.5 text-right font-medium">Count</th>
            <th className="px-5 py-2.5 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b last:border-0 hover:bg-surface/40">
              <td className="px-5 py-3 text-ink-muted">{fmtDate(r.at)}</td>
              <td className="px-5 py-3">{r.dir}</td>
              <td className="px-5 py-3 capitalize">{r.object}</td>
              <td className="px-5 py-3 text-right tabular-nums">{r.count}</td>
              <td className="px-5 py-3">
                {r.status === "ok"
                  ? <span className="inline-flex items-center gap-1 text-cat-green"><CheckCircle2 className="size-3.5" /> ok</span>
                  : <span className="inline-flex items-center gap-1 text-destructive"><AlertCircle className="size-3.5" /> error</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WebhookTab() {
  const url = "https://renewablyuk.lovable.app/api/public/hubspot/webhook";
  const [secret] = useState("whsec_demo_" + Math.random().toString(36).slice(2, 14));
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border bg-card p-5">
        <div className="text-sm font-medium text-foreground">Inbound URL</div>
        <div className="mt-1 text-[12px] text-ink-muted">Add this URL to HubSpot's webhook settings.</div>
        <div className="mt-3 flex items-center gap-2 rounded-md border bg-surface px-3 py-2 font-mono text-[12px]">
          <span className="grow break-all">{url}</span>
          <Button variant="icon" size="icon" onClick={() => { navigator.clipboard.writeText(url); toast.success("Copied"); }}><Copy className="size-4" /></Button>
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">Signing secret</div>
            <div className="mt-1 text-[12px] text-ink-muted">Used to verify inbound payloads. Rotate if leaked.</div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => toast.success("Secret rotated")}><RotateCw className="size-4" /> Rotate</Button>
        </div>
        <div className="mt-3">
          <Input readOnly value={secret} className="font-mono" />
        </div>
      </section>
    </div>
  );
}

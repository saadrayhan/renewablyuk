import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plug, Check, ExternalLink, Zap, Building2, MessageSquare, Webhook, Workflow } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { fmtDate } from "@/lib/mock/queries";
import type { Integration, IntegrationKey } from "@/lib/mock/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/settings/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Renewably UK" }] }),
  component: IntegrationsPage,
});

const ICONS: Record<IntegrationKey, React.ComponentType<{ className?: string }>> = {
  zapier: Zap,
  make: Workflow,
  hubspot: Building2,
  salesforce: Building2,
  slack: MessageSquare,
  webhooks: Webhook,
};

function IntegrationsPage() {
  const data = useStore();
  const [target, setTarget] = useState<Integration | null>(null);
  const [account, setAccount] = useState("");

  const categories = Array.from(new Set(data.integrations.map((i) => i.category)));

  function disconnect(key: IntegrationKey) {
    update((d) => {
      const x = d.integrations.find((i) => i.key === key);
      if (!x) return;
      x.connected = false;
      x.account = undefined;
      x.connectedAt = undefined;
    });
    toast.success("Disconnected");
  }

  function openConnect(i: Integration) {
    setTarget(i);
    setAccount("");
  }

  function confirmConnect() {
    if (!target) return;
    if (!account.trim()) {
      toast.error("Account or workspace is required");
      return;
    }
    update((d) => {
      const x = d.integrations.find((i) => i.key === target.key);
      if (!x) return;
      x.connected = true;
      x.account = account.trim();
      x.connectedAt = Date.now();
    });
    toast.success(`${target.name} connected`);
    setTarget(null);
    setAccount("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Integrations</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Connect external tools to push events from the IBG, job and submission record-chain.
        </p>
      </div>

      {categories.map((cat) => {
        const items = data.integrations.filter((i) => i.category === cat);
        return (
          <section key={cat} className="space-y-3">
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">{cat}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((i) => {
                const Icon = ICONS[i.key];
                return (
                  <div
                    key={i.key}
                    className={cn(
                      "rounded-2xl border bg-card p-4 transition",
                      i.connected ? "border-cat-green/30" : "hover:border-foreground/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl",
                          i.connected ? "bg-cat-green-bg text-cat-green" : "bg-muted text-ink-muted",
                        )}>
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className="text-sm font-semibold text-foreground">{i.name}</div>
                            {i.connected && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-cat-green-bg px-1.5 py-0.5 text-[10px] font-medium text-cat-green">
                                <Check className="size-2.5" /> Connected
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-ink-muted">{i.description}</div>
                          {i.connected && i.account && (
                            <div className="mt-2 text-[11px] text-ink-muted">
                              {i.account} · since {fmtDate(i.connectedAt!)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      {i.connected ? (
                        <button
                          onClick={() => disconnect(i.key)}
                          className="press rounded-full border bg-background px-3 py-1.5 text-xs"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => openConnect(i)}
                          className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                        >
                          <Plug className="size-3" /> Connect
                          <ExternalLink className="size-3 opacity-60" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <ApiUsagePanel />

      <Dialog open={!!target} onOpenChange={(v) => !v && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {target?.name}</DialogTitle>
            <DialogDescription>{target?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="account">
              {target?.key === "slack" ? "Channel" : target?.key === "webhooks" ? "Endpoint URL" : "Account / workspace"}
            </Label>
            <Input
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder={
                target?.key === "slack"
                  ? "#ops-renewably"
                  : target?.key === "webhooks"
                  ? "https://hooks.example.com/renewably"
                  : "renewably-uk"
              }
            />
            <p className="text-xs text-ink-muted">
              You'll be redirected to {target?.name} to complete OAuth in production.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setTarget(null)}
              className="press rounded-full border bg-background px-3.5 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={confirmConnect}
              className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
            >
              <Plug className="size-4" /> Connect
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApiUsagePanel() {
  const [throttle, setThrottle] = useState(true);
  const [strict, setStrict] = useState(false);
  const endpoints = [
    { name: "POST /ibg", used: 412, limit: 1000 },
    { name: "GET /repository", used: 1820, limit: 5000 },
    { name: "POST /webhooks", used: 64, limit: 500 },
  ];
  return (
    <section className="space-y-3">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">API usage</div>
      <div className="grid gap-3 sm:grid-cols-3">
        {endpoints.map((e) => {
          const pct = Math.min(100, Math.round((e.used / e.limit) * 100));
          const tone = pct > 80 ? "bg-cat-rose" : pct > 60 ? "bg-cat-amber" : "bg-cat-green";
          return (
            <div key={e.name} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">{e.name}</div>
                <div className="text-[11px] text-ink-muted">{e.used.toLocaleString()} / {e.limit.toLocaleString()}</div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-tile">
                <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-[11px] text-ink-muted">{pct}% of monthly quota</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="text-sm font-medium text-foreground">Rate limit & throttling</div>
        <div className="mt-1 text-[11px] text-ink-muted">Apply automatic protection when an integration approaches its quota.</div>
        <div className="mt-4 space-y-3">
          <ToggleRow label="Auto-throttle at 80% quota" desc="Slow non-critical writes to avoid hitting the cap." value={throttle} onChange={setThrottle} />
          <ToggleRow label="Strict mode" desc="Reject calls above 100% with HTTP 429 instead of queueing." value={strict} onChange={setStrict} />
        </div>
      </div>
    </section>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-foreground">{label}</div>
        <div className="text-[11px] text-ink-muted">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "press relative h-6 w-10 rounded-full border transition",
          value ? "bg-foreground" : "bg-background",
        )}
      >
        <span className={cn(
          "absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition-all",
          value ? "left-[18px] bg-background" : "left-1 bg-foreground/40",
        )} />
      </button>
    </div>
  );
}

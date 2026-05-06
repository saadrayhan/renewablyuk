import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/measure-access")({
  head: () => ({ meta: [{ title: "Measure Access Control — Renewably UK" }] }),
  component: MeasureAccess,
});

const MEASURES = ["Solar PV", "ASHP", "EWI", "CWI", "GSHP", "Loft Insulation"];

const ORGS = [
  { id: "O1", name: "Acme Energy Ltd", access: { "Solar PV": true, "ASHP": true, "EWI": false, "CWI": true, "GSHP": false, "Loft Insulation": true } },
  { id: "O2", name: "GreenWatt Installs", access: { "Solar PV": true, "ASHP": true, "EWI": true, "CWI": true, "GSHP": true, "Loft Insulation": true } },
  { id: "O3", name: "BrightSpark Renewables", access: { "Solar PV": true, "ASHP": false, "EWI": false, "CWI": false, "GSHP": false, "Loft Insulation": false } },
];

const OVERRIDES = [
  { id: "U1", user: "Jane Smith", org: "Acme Energy Ltd", measure: "EWI", allow: true, reason: "Pilot project authorisation" },
  { id: "U2", user: "Tom Patel", org: "BrightSpark Renewables", measure: "GSHP", allow: true, reason: "Certified for GSHP only" },
];

function MeasureAccess() {
  const { permissions } = useDevRole();
  const [orgs, setOrgs] = useState(ORGS);
  const [open, setOpen] = useState(false);

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Measure Access Control" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-8 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Configuration"
        title="Measure access control"
        subtitle="Control which measures each organisation can issue IBGs for. User overrides take precedence."
        actions={<Button onClick={() => setOpen(true)}>Apply user override</Button>}
      />

      <section>
        <SectionHeader title="Organisation defaults" />
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-4 py-2.5 text-left">Organisation</th>
                {MEASURES.map((m) => <th key={m} className="px-3 py-2.5 text-center">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="border-b last:border-b-0 hover:bg-surface/60">
                  <td className="px-4 py-3 font-medium text-foreground">{o.name}</td>
                  {MEASURES.map((m) => (
                    <td key={m} className="px-3 py-3 text-center">
                      <div className="inline-flex">
                        <Switch
                          checked={o.access[m as keyof typeof o.access]}
                          onCheckedChange={(v) => setOrgs((xs) => xs.map((x) => x.id === o.id ? { ...x, access: { ...x.access, [m]: v } } : x))}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHeader title="User overrides" subtitle="Per-user permissions that override their organisation default." />
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-4 py-2.5 text-left">User</th>
                <th className="px-4 py-2.5 text-left">Organisation</th>
                <th className="px-4 py-2.5 text-left">Measure</th>
                <th className="px-4 py-2.5 text-left">Decision</th>
                <th className="px-4 py-2.5 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {OVERRIDES.map((o) => (
                <tr key={o.id} className="border-b last:border-b-0 hover:bg-surface/60">
                  <td className="px-4 py-3 font-medium text-foreground">{o.user}</td>
                  <td className="px-4 py-3 text-ink-muted">{o.org}</td>
                  <td className="px-4 py-3">{o.measure}</td>
                  <td className="px-4 py-3">
                    <span className={"inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium " + (o.allow ? "bg-cat-green-bg text-cat-green" : "bg-cat-rose-bg text-cat-rose")}>
                      {o.allow ? "Allow" : "Deny"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{o.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply user override</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>User</Label><Input placeholder="Search by name or email" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Measure</Label><Input placeholder="Solar PV" /></div>
              <div><Label>Decision</Label><Input placeholder="allow / deny" /></div>
            </div>
            <div><Label>Reason</Label><Input placeholder="Audit-friendly justification" /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => { setOpen(false); toast.success("Override applied"); }}>Apply override</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

export default MeasureAccess;

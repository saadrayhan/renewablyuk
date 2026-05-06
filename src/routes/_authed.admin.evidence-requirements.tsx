import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FilterPills } from "@/components/app/filter-pills";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/evidence-requirements")({
  head: () => ({ meta: [{ title: "Evidence Requirements — Renewably UK" }] }),
  component: EvidencePage,
});

type Scope = "Company" | "Project" | "Installation";
type Rule = {
  id: string;
  scope: Scope;
  name: string;
  installation: string;
  funding: string;
  standard: string;
  required: boolean;
  effective: string;
  status: "Active" | "Archived";
};

const SEED: Rule[] = [
  { id: "ER-001", scope: "Installation", name: "MCS Certificate", installation: "Solar PV", funding: "ECO4", standard: "MCS", required: true, effective: "01 Jan 2026", status: "Active" },
  { id: "ER-002", scope: "Installation", name: "Installation Certificate", installation: "Solar PV", funding: "ECO4", standard: "PAS 2035", required: true, effective: "01 Jan 2026", status: "Active" },
  { id: "ER-003", scope: "Project", name: "Retrofit Plan", installation: "Any", funding: "ECO4", standard: "PAS 2035", required: true, effective: "01 Jan 2026", status: "Active" },
  { id: "ER-004", scope: "Company", name: "Public Liability Insurance", installation: "Any", funding: "Any", standard: "Internal", required: true, effective: "01 Mar 2026", status: "Active" },
  { id: "ER-005", scope: "Installation", name: "EPR Certificate", installation: "ASHP", funding: "GBIS", standard: "MCS", required: false, effective: "01 Feb 2026", status: "Archived" },
];

function EvidencePage() {
  const { permissions } = useDevRole();
  const [scope, setScope] = useState<Scope | "all">("all");
  const [rules, setRules] = useState(SEED);
  const [open, setOpen] = useState(false);

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Evidence Requirements" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  const filtered = rules.filter((r) => scope === "all" || r.scope === scope);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Configuration"
        title="Evidence requirements"
        subtitle="Define what evidence must be supplied per scope, measure and funding scheme."
        actions={<Button onClick={() => setOpen(true)}>New rule</Button>}
      />

      <FilterPills<Scope>
        value={scope}
        onChange={setScope}
        options={[
          { value: "Company" as const, label: "Company", count: rules.filter((r) => r.scope === "Company").length },
          { value: "Project" as const, label: "Project", count: rules.filter((r) => r.scope === "Project").length },
          { value: "Installation" as const, label: "Installation", count: rules.filter((r) => r.scope === "Installation").length },
        ]}
      />

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              <th className="px-4 py-2.5 text-left">Rule</th>
              <th className="px-4 py-2.5 text-left">Scope</th>
              <th className="px-4 py-2.5 text-left">Installation</th>
              <th className="px-4 py-2.5 text-left">Scheme</th>
              <th className="px-4 py-2.5 text-left">Standard</th>
              <th className="px-4 py-2.5 text-left">Required</th>
              <th className="px-4 py-2.5 text-left">Effective</th>
              <th className="px-4 py-2.5 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b last:border-b-0 hover:bg-surface/60">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="font-mono text-[10px] text-ink-muted">{r.id}</div>
                </td>
                <td className="px-4 py-3 text-ink-muted">{r.scope}</td>
                <td className="px-4 py-3 text-ink-muted">{r.installation}</td>
                <td className="px-4 py-3 text-ink-muted">{r.funding}</td>
                <td className="px-4 py-3 text-ink-muted">{r.standard}</td>
                <td className="px-4 py-3">
                  <Switch checked={r.required} onCheckedChange={(v) => setRules((xs) => xs.map((x) => x.id === r.id ? { ...x, required: v } : x))} />
                </td>
                <td className="px-4 py-3 text-ink-muted">{r.effective}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                    r.status === "Active" ? "bg-cat-green-bg text-cat-green" : "bg-tile text-ink-muted",
                  )}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New evidence rule</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Evidence name</Label><Input placeholder="e.g. MCS Certificate" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Installation type</Label><Input placeholder="Solar PV" /></div>
              <div><Label>Funding scheme</Label><Input placeholder="ECO4" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setOpen(false)}>Create rule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EvidencePage;

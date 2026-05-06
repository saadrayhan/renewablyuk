import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/funding-schemes")({
  head: () => ({ meta: [{ title: "Funding Schemes — Renewably UK" }] }),
  component: SchemesPage,
});

type Scheme = {
  id: string;
  name: string;
  funder: string;
  measures: string[];
  effectiveFrom: string;
  effectiveTo: string;
  consumers: number;
  status: "Active" | "Closed";
};

const SEED: Scheme[] = [
  { id: "ECO4", name: "ECO4", funder: "Ofgem", measures: ["Solar PV", "ASHP", "EWI", "CWI"], effectiveFrom: "01 Apr 2022", effectiveTo: "31 Mar 2026", consumers: 184, status: "Active" },
  { id: "GBIS", name: "Great British Insulation Scheme", funder: "Ofgem", measures: ["EWI", "CWI", "Loft Insulation"], effectiveFrom: "30 Mar 2023", effectiveTo: "31 Mar 2026", consumers: 92, status: "Active" },
  { id: "BUS", name: "Boiler Upgrade Scheme", funder: "DESNZ", measures: ["ASHP", "Ground Source HP"], effectiveFrom: "23 May 2022", effectiveTo: "31 Mar 2028", consumers: 47, status: "Active" },
  { id: "WHD", name: "Warm Home Discount", funder: "DESNZ", measures: [], effectiveFrom: "01 Apr 2023", effectiveTo: "31 Mar 2025", consumers: 12, status: "Closed" },
];

function SchemesPage() {
  const { permissions } = useDevRole();
  const [open, setOpen] = useState<Scheme | null>(null);

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Funding Schemes" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Configuration"
        title="Funding schemes"
        subtitle="Catalogue of schemes available to installers across the platform."
        actions={<Button>New scheme</Button>}
      />

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              <th className="px-4 py-2.5 text-left">Scheme</th>
              <th className="px-4 py-2.5 text-left">Funder</th>
              <th className="px-4 py-2.5 text-left">Eligible measures</th>
              <th className="px-4 py-2.5 text-left">Effective window</th>
              <th className="px-4 py-2.5 text-right">Consumers</th>
              <th className="px-4 py-2.5 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {SEED.map((s) => (
              <tr key={s.id} onClick={() => setOpen(s)} className="cursor-pointer border-b last:border-b-0 hover:bg-surface/60">
                <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-ink-muted">{s.funder}</td>
                <td className="px-4 py-3 text-ink-muted">{s.measures.length ? s.measures.join(", ") : "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{s.effectiveFrom} → {s.effectiveTo}</td>
                <td className="px-4 py-3 text-right text-ink-muted">{s.consumers}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                    s.status === "Active" ? "bg-cat-green-bg text-cat-green" : "bg-tile text-ink-muted",
                  )}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader><SheetTitle>{open?.name}</SheetTitle></SheetHeader>
          {open && (
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-ink-muted">Funder</span><span>{open.funder}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-ink-muted">Window</span><span>{open.effectiveFrom} → {open.effectiveTo}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-ink-muted">Active consumers</span><span>{open.consumers}</span></div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-ink-muted">Eligible measures</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {open.measures.map((m) => <span key={m} className="rounded-full border px-2 py-0.5 text-[12px]">{m}</span>)}
                  {!open.measures.length && <span className="text-ink-muted">None</span>}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" size="sm" onClick={() => setOpen(null)}>Close</Button>
                <Button size="sm">Edit scheme</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default SchemesPage;

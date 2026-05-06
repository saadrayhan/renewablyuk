import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/admin/measure-policy")({
  head: () => ({ meta: [{ title: "Measure Policy & Pricing — Renewably UK" }] }),
  component: MeasurePolicy,
});

type Policy = {
  id: string;
  measure: string;
  durationYears: number;
  startRule: "Installation date" | "IBG issue date";
  basePrice: number;
  accessPrice: number;
  operatePrice: number;
  version: string;
  effectiveFrom: string;
};

const SEED: Policy[] = [
  { id: "P1", measure: "Solar PV", durationYears: 10, startRule: "Installation date", basePrice: 145, accessPrice: 165, operatePrice: 125, version: "v3.2", effectiveFrom: "01 Jan 2026" },
  { id: "P2", measure: "Air Source Heat Pump", durationYears: 10, startRule: "Installation date", basePrice: 220, accessPrice: 240, operatePrice: 195, version: "v2.1", effectiveFrom: "01 Mar 2026" },
  { id: "P3", measure: "External Wall Insulation", durationYears: 25, startRule: "IBG issue date", basePrice: 310, accessPrice: 340, operatePrice: 280, version: "v1.8", effectiveFrom: "01 Jan 2026" },
  { id: "P4", measure: "Cavity Wall Insulation", durationYears: 25, startRule: "Installation date", basePrice: 95, accessPrice: 110, operatePrice: 85, version: "v4.0", effectiveFrom: "15 Apr 2026" },
];

function MeasurePolicy() {
  const { permissions } = useDevRole();
  const [open, setOpen] = useState<Policy | null>(null);

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Measure Policy & Pricing" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Configuration"
        title="Measure policy & pricing"
        subtitle="Define IBG duration, coverage rules and pricing per measure type. Existing IBGs preserve the policy active at issue time."
        actions={<Button>New policy version</Button>}
      />

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              <th className="px-4 py-2.5 text-left">Measure</th>
              <th className="px-4 py-2.5 text-left">Duration</th>
              <th className="px-4 py-2.5 text-left">Start rule</th>
              <th className="px-4 py-2.5 text-right">Base</th>
              <th className="px-4 py-2.5 text-right">Access tier</th>
              <th className="px-4 py-2.5 text-right">Operate tier</th>
              <th className="px-4 py-2.5 text-left">Version</th>
              <th className="px-4 py-2.5 text-left">Effective</th>
            </tr>
          </thead>
          <tbody>
            {SEED.map((p) => (
              <tr key={p.id} onClick={() => setOpen(p)} className="cursor-pointer border-b last:border-b-0 hover:bg-surface/60">
                <td className="px-4 py-3 font-medium text-foreground">{p.measure}</td>
                <td className="px-4 py-3 text-ink-muted">{p.durationYears} yrs</td>
                <td className="px-4 py-3 text-ink-muted">{p.startRule}</td>
                <td className="px-4 py-3 text-right">£{p.basePrice}</td>
                <td className="px-4 py-3 text-right">£{p.accessPrice}</td>
                <td className="px-4 py-3 text-right">£{p.operatePrice}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink-muted">{p.version}</td>
                <td className="px-4 py-3 text-ink-muted">{p.effectiveFrom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-[520px] sm:max-w-[520px]">
          <SheetHeader><SheetTitle>{open?.measure} — policy</SheetTitle></SheetHeader>
          {open && (
            <div className="mt-6 space-y-4 text-sm">
              <Row label="Duration">{open.durationYears} years</Row>
              <Row label="Coverage start">{open.startRule}</Row>
              <Row label="Base price">£{open.basePrice}</Row>
              <Row label="Access tier">£{open.accessPrice}</Row>
              <Row label="Operate tier">£{open.operatePrice}</Row>
              <Row label="Active version">{open.version} · from {open.effectiveFrom}</Row>
              <div className="pt-4">
                <div className="text-[11px] uppercase tracking-wide text-ink-muted">Pricing history</div>
                <ul className="mt-2 space-y-2 text-[12px] text-ink-muted">
                  <li>{open.version} · £{open.basePrice} · from {open.effectiveFrom}</li>
                  <li>v{Number(open.version.replace("v","").split(".")[0]) - 1}.0 · £{open.basePrice - 15} · from 01 Jul 2025</li>
                </ul>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" size="sm" onClick={() => setOpen(null)}>Cancel</Button>
                <Button size="sm">Save new version</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <span className="text-ink-muted">{label}</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}

export default MeasurePolicy;

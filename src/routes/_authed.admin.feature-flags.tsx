import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/feature-flags")({
  head: () => ({ meta: [{ title: "Feature Flags — Renewably UK" }] }),
  component: FeatureFlagsPage,
});

const INITIAL = [
  { key: "funding-match-v2", label: "Funding Match v2", desc: "Scoring engine with confidence intervals.", on: true },
  { key: "amendment-bulk", label: "Bulk amendment review", desc: "Approve/reject amendments in batch.", on: false },
  { key: "ibg-pdf-v3", label: "IBG PDF v3", desc: "New layout with QR provenance code.", on: true },
  { key: "hubspot-sync", label: "HubSpot sync (beta)", desc: "Two-way contact sync via CRM connector.", on: false },
];

function FeatureFlagsPage() {
  const { permissions } = useDevRole();
  const [flags, setFlags] = useState(INITIAL);
  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Feature Flags" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[900px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · System" title="Feature Flags" subtitle="Toggle in-progress capabilities for this environment." />
      <div className="overflow-hidden rounded-2xl border bg-card divide-y">
        {flags.map((f) => (
          <div key={f.key} className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{f.label}</div>
              <div className="mt-0.5 text-[12px] text-ink-muted">{f.desc}</div>
              <div className="mt-1 font-mono text-[10px] text-ink-muted/80">{f.key}</div>
            </div>
            <button
              onClick={() => setFlags((xs) => xs.map((x) => x.key === f.key ? { ...x, on: !x.on } : x))}
              className={cn("press relative h-6 w-10 shrink-0 rounded-full border transition", f.on ? "bg-foreground" : "bg-background")}
            >
              <span className={cn("absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition-all", f.on ? "left-[18px] bg-background" : "left-1 bg-foreground/40")} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

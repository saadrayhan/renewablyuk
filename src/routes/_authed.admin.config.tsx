import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { TemplateEditorDialog } from "@/components/app/template-editor-dialog";

export const Route = createFileRoute("/_authed/admin/config")({
  head: () => ({ meta: [{ title: "System config — Renewably UK" }] }),
  component: ConfigPage,
});

const MEASURES = ["Air Source Heat Pump", "Ground Source Heat Pump", "Solar PV", "Loft Insulation", "Cavity Wall Insulation", "EV Charger", "Heat Battery"];
const TEMPLATES = [
  { name: "IBG issued", desc: "Sent to installer when an IBG is created." },
  { name: "Amendment approved", desc: "Sent when admin approves an amendment." },
  { name: "Funding submitted", desc: "Sent when a funding project is submitted to a scheme." },
];
const SCHEMES = [
  { name: "ECO4", status: "Active" },
  { name: "GBIS", status: "Active" },
  { name: "BUS", status: "Active" },
  { name: "Home Upgrade Grant", status: "Opportunity" },
];

function ConfigPage() {
  const [tab, setTab] = useState<"measures" | "templates" | "schemes">("measures");
  const [editing, setEditing] = useState<{ name: string; desc: string } | null>(null);
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · System" title="System config" subtitle="Approved measures, notification templates and scheme integrations." />

      <div className="mt-6">
        <UnderlineTabs<"measures" | "templates" | "schemes">
          value={tab} onChange={setTab}
          options={[
            { value: "measures", label: "Approved measures" },
            { value: "templates", label: "Notification templates" },
            { value: "schemes", label: "Scheme integrations" },
          ]}
        />
      </div>

      <div className="mt-5 rounded-2xl border bg-card">
        {tab === "measures" && (
          <div className="divide-y">
            {MEASURES.map((m) => (
              <div key={m} className="flex items-center justify-between px-5 py-3">
                <div className="text-sm font-medium text-foreground">{m}</div>
                <span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-[11px] font-medium text-cat-green">Approved</span>
              </div>
            ))}
          </div>
        )}
        {tab === "templates" && (
          <div className="divide-y">
            {TEMPLATES.map((t) => (
              <div key={t.name} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-ink-muted">{t.desc}</div>
                </div>
                <button className="press rounded-full border px-3 py-1 text-xs">Edit</button>
              </div>
            ))}
          </div>
        )}
        {tab === "schemes" && (
          <div className="divide-y">
            {SCHEMES.map((s) => (
              <div key={s.name} className="flex items-center justify-between px-5 py-3">
                <div className="text-sm font-medium text-foreground">{s.name}</div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.status === "Active" ? "bg-cat-green-bg text-cat-green" : "bg-cat-amber-bg text-cat-amber"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { TemplateEditorDialog } from "@/components/app/template-editor-dialog";
import { useStore, update, nid } from "@/lib/mock/store";

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

type Tab = "measures" | "templates" | "schemes" | "installation" | "system" | "evidence";

const EVIDENCE_RULES: { name: string; scope: "Installation" | "Project" | "Company"; required: boolean; desc: string }[] = [
  { name: "Pre-install survey photos", scope: "Installation", required: true, desc: "Min 4 photos of the property prior to works." },
  { name: "Post-install commissioning report", scope: "Installation", required: true, desc: "Signed engineer's commissioning sheet." },
  { name: "MCS certificate", scope: "Project", required: true, desc: "Required for funding submission across all schemes." },
  { name: "Building Regulations notification", scope: "Project", required: true, desc: "BR notification reference number." },
  { name: "Insurance certificate", scope: "Company", required: true, desc: "Public liability £5m+, current." },
  { name: "Companies House filings", scope: "Company", required: false, desc: "Auto-checked daily for limited companies." },
];

function ConfigPage() {
  const data = useStore();
  const [tab, setTab] = useState<Tab>("measures");
  const [editing, setEditing] = useState<{ name: string; desc: string } | null>(null);
  const [newInstall, setNewInstall] = useState("");
  const [newSystem, setNewSystem] = useState("");
  const [newSystemParent, setNewSystemParent] = useState(data.installationTypes[0]?.id ?? "");

  function addInstallation() {
    if (!newInstall.trim()) return;
    const id = nid("it");
    update((d) => { d.installationTypes.push({ id, name: newInstall.trim(), status: "active" }); });
    toast.success("Installation type added");
    setNewInstall("");
  }
  function toggleInstallation(id: string) {
    update((d) => {
      const t = d.installationTypes.find((x) => x.id === id);
      if (!t) return;
      t.status = t.status === "active" ? "archived" : "active";
    });
  }
  function addSystem() {
    if (!newSystem.trim() || !newSystemParent) return;
    const id = nid("st");
    update((d) => { d.systemTypes.push({ id, name: newSystem.trim(), installationTypeId: newSystemParent, status: "active" }); });
    toast.success("System type added");
    setNewSystem("");
  }
  function toggleSystem(id: string) {
    update((d) => {
      const t = d.systemTypes.find((x) => x.id === id);
      if (!t) return;
      t.status = t.status === "active" ? "archived" : "active";
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · System" title="System config" subtitle="Approved measures, notification templates, scheme integrations and the installation taxonomy." />

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab} onChange={setTab}
          options={[
            { value: "measures", label: "Approved measures" },
            { value: "evidence", label: "Evidence requirements", count: EVIDENCE_RULES.length },
            { value: "templates", label: "Notification templates" },
            { value: "schemes", label: "Scheme integrations" },
            { value: "installation", label: "Installation types", count: data.installationTypes.length },
            { value: "system", label: "System types", count: data.systemTypes.length },
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
        {tab === "evidence" && (
          <div className="divide-y">
            {EVIDENCE_RULES.map((r) => {
              const scopeTone =
                r.scope === "Installation" ? "bg-cat-blue-bg text-cat-blue"
                : r.scope === "Project" ? "bg-cat-purple-bg text-cat-purple"
                : "bg-cat-teal-bg text-cat-teal";
              return (
                <div key={r.name} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-foreground">{r.name}</div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${scopeTone}`}>{r.scope}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">{r.desc}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${r.required ? "bg-cat-rose-bg text-cat-rose" : "bg-tile text-ink-muted"}`}>
                    {r.required ? "Required" : "Optional"}
                  </span>
                </div>
              );
            })}
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
                <button onClick={() => setEditing(t)} className="press rounded-full border px-3 py-1 text-xs">Edit</button>
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

        {tab === "installation" && (
          <div>
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <input value={newInstall} onChange={(e) => setNewInstall(e.target.value)} placeholder="New installation type name" className="h-9 flex-1 rounded-full border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={addInstallation} className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">
                <Plus className="size-3" /> Add
              </button>
            </div>
            <div className="divide-y">
              {data.installationTypes.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-[11px] text-ink-muted">{data.systemTypes.filter((s) => s.installationTypeId === t.id).length} system types</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${t.status === "active" ? "bg-cat-green-bg text-cat-green" : "bg-tile text-ink-muted"}`}>{t.status}</span>
                    <button onClick={() => toggleInstallation(t.id)} className="press inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-[11px]">
                      {t.status === "active" ? <><Archive className="size-3" /> Archive</> : <><RotateCcw className="size-3" /> Restore</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "system" && (
          <div>
            <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
              <select value={newSystemParent} onChange={(e) => setNewSystemParent(e.target.value)} className="h-9 rounded-full border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                {data.installationTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input value={newSystem} onChange={(e) => setNewSystem(e.target.value)} placeholder="New system type name" className="h-9 flex-1 rounded-full border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={addSystem} className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">
                <Plus className="size-3" /> Add
              </button>
            </div>
            <div className="divide-y">
              {data.installationTypes.map((it) => {
                const systems = data.systemTypes.filter((s) => s.installationTypeId === it.id);
                if (systems.length === 0) return null;
                return (
                  <div key={it.id}>
                    <div className="bg-surface/60 px-5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">{it.name}</div>
                    {systems.map((s) => (
                      <div key={s.id} className="flex items-center justify-between px-5 py-3">
                        <div className="text-sm text-foreground">{s.name}</div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.status === "active" ? "bg-cat-green-bg text-cat-green" : "bg-tile text-ink-muted"}`}>{s.status}</span>
                          <button onClick={() => toggleSystem(s.id)} className="press inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-[11px]">
                            {s.status === "active" ? <><Archive className="size-3" /> Archive</> : <><RotateCcw className="size-3" /> Restore</>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <TemplateEditorDialog open={!!editing} template={editing} onOpenChange={(v) => { if (!v) setEditing(null); }} />
    </div>
  );
}

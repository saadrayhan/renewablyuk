import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Archive, RotateCcw, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { TemplateEditorDialog } from "@/components/app/template-editor-dialog";
import { useStore, update, nid } from "@/lib/mock/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/config")({
  head: () => ({ meta: [{ title: "Configuration — Renewably UK" }] }),
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

const EVIDENCE_RULES = [
  { name: "MCS Certificate", scope: "Installation", required: true, desc: "Microgeneration Certification Scheme certificate.", from: "01 Jan 2026" },
  { name: "Pre-install survey photos", scope: "Installation", required: true, desc: "Min 4 photos of the property prior to works.", from: "01 Jan 2026" },
  { name: "Customer Declaration", scope: "Project", required: true, desc: "Customer declaration of consent for the funding scheme.", from: "01 Jan 2026" },
  { name: "Building Regulations notification", scope: "Project", required: true, desc: "BR notification reference number.", from: "01 Jan 2026" },
  { name: "MCS Accreditation", scope: "Company", required: true, desc: "Company MCS accreditation evidence.", from: "01 Jan 2026" },
  { name: "Public Liability Insurance", scope: "Company", required: true, desc: "Public liability £5m+, current.", from: "01 Jan 2026" },
] as const;

type Tab = "installation" | "measures" | "evidence" | "schemes" | "templates" | "flags";

function ConfigPage() {
  const data = useStore();
  const [tab, setTab] = useState<Tab>("installation");
  const [editing, setEditing] = useState<{ name: string; desc: string } | null>(null);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Configuration"
        title="Configuration"
        subtitle="Taxonomies, evidence policy, schemes, templates and flags that govern the platform."
      />

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab} onChange={setTab}
          options={[
            { value: "installation", label: "Installation & System Types", count: data.installationTypes.length },
            { value: "measures", label: "Measures & Warranty", count: MEASURES.length },
            { value: "evidence", label: "Evidence Requirements", count: EVIDENCE_RULES.length },
            { value: "schemes", label: "Funding Schemes", count: SCHEMES.length },
            { value: "templates", label: "Email Templates", count: TEMPLATES.length },
          ]}
        />
      </div>

      <div className="mt-6">
        {tab === "installation" && <InstallationTypes />}
        {tab === "measures" && <Measures />}
        {tab === "evidence" && <Evidence />}
        {tab === "schemes" && <Schemes />}
        {tab === "templates" && <Templates onEdit={setEditing} />}
      </div>

      <TemplateEditorDialog open={!!editing} template={editing} onOpenChange={(v) => { if (!v) setEditing(null); }} />
    </div>
  );
}

/* ─── Installation & System Types ─────────────────── */

function InstallationTypes() {
  const data = useStore();
  const [newInstall, setNewInstall] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [newSystem, setNewSystem] = useState("");

  function addInstallation() {
    if (!newInstall.trim()) return;
    update((d) => { d.installationTypes.push({ id: nid("it"), name: newInstall.trim(), status: "active" }); });
    toast.success("Installation type added");
    setNewInstall("");
  }
  function addSystem(parentId: string) {
    if (!newSystem.trim()) return;
    update((d) => { d.systemTypes.push({ id: nid("st"), name: newSystem.trim(), installationTypeId: parentId, status: "active" }); });
    toast.success("System type added");
    setNewSystem("");
    setAdding(null);
  }
  function toggleSystem(id: string) {
    update((d) => {
      const t = d.systemTypes.find((x) => x.id === id);
      if (!t) return;
      t.status = t.status === "active" ? "archived" : "active";
    });
  }

  return (
    <SectionShell
      title="Installation Types"
      helper="Installation Type defines the category of work; System Type defines the specific configuration within that category."
    >
      <div className="space-y-4">
        {data.installationTypes.map((it) => {
          const systems = data.systemTypes.filter((s) => s.installationTypeId === it.id);
          return (
            <div key={it.id} className="rounded-2xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <div className="text-sm font-semibold text-foreground">{it.name}</div>
                  <div className="mt-0.5 text-[11px] text-ink-muted">{systems.length} system type{systems.length === 1 ? "" : "s"}</div>
                </div>
                <button onClick={() => setAdding(adding === it.id ? null : it.id)} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs">
                  <Plus className="size-3" /> Add system type
                </button>
              </div>
              <div className="divide-y">
                {systems.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-foreground">{s.name}</div>
                      <span className="font-mono text-[10px] text-ink-muted">{s.id}</span>
                    </div>
                    <button onClick={() => toggleSystem(s.id)} className="press text-[11px] text-ink-muted hover:text-foreground">
                      {s.status === "active" ? "Archive" : "Restore"}
                    </button>
                  </div>
                ))}
                {adding === it.id && (
                  <div className="flex items-center gap-2 bg-surface/40 px-5 py-3">
                    <input autoFocus value={newSystem} onChange={(e) => setNewSystem(e.target.value)} placeholder="System type name" className="h-8 flex-1 rounded-full border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                    <button onClick={() => addSystem(it.id)} className="press rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">Add</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex items-center gap-2 rounded-2xl border border-dashed bg-surface/30 p-3">
          <Plus className="size-3.5 text-ink-muted" />
          <input value={newInstall} onChange={(e) => setNewInstall(e.target.value)} placeholder="New installation type (e.g. Heat Pump)" className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted" />
          <button onClick={addInstallation} className="press rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">Add</button>
        </div>
      </div>
    </SectionShell>
  );
}

/* ─── Measures ─────────────────── */

function Measures() {
  return (
    <SectionShell title="Approved Measures" helper="Measures available across all installer accounts.">
      <div className="overflow-hidden rounded-2xl border bg-card divide-y">
        {MEASURES.map((m) => (
          <div key={m} className="flex items-center justify-between px-5 py-3.5">
            <div className="text-sm font-medium text-foreground">{m}</div>
            <span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-[11px] font-medium text-cat-green">Approved</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ─── Evidence ─────────────────── */

function Evidence() {
  return (
    <SectionShell
      title="Evidence Requirements"
      helper="Documents required at each scope. Required rules block IBG issuance until satisfied."
      action={<button className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"><Plus className="size-3" /> New rule</button>}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {EVIDENCE_RULES.map((r) => {
          const scopeTone =
            r.scope === "Installation" ? "bg-cat-blue-bg text-cat-blue"
            : r.scope === "Project" ? "bg-cat-purple-bg text-cat-purple"
            : "bg-cat-teal-bg text-cat-teal";
          return (
            <div key={r.name} className="group rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", scopeTone)}>{r.scope}</span>
                    {r.required && <span className="rounded-full bg-tile px-2 py-0.5 text-[10px] font-medium text-foreground">Required</span>}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-foreground">{r.name}</div>
                  <div className="mt-1 text-[12px] text-ink-muted">{r.desc}</div>
                </div>
                <button className="press grid size-7 place-items-center rounded-md text-ink-muted opacity-0 hover:bg-surface hover:text-foreground group-hover:opacity-100"><Pencil className="size-3.5" /></button>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3 text-[11px] text-ink-muted">
                <span>Effective from {r.from}</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-cat-green" /> Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

/* ─── Schemes ─────────────────── */

function Schemes() {
  return (
    <SectionShell title="Funding Schemes" helper="Schemes available for funding submission.">
      <div className="overflow-hidden rounded-2xl border bg-card divide-y">
        {SCHEMES.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-5 py-3.5">
            <div className="text-sm font-medium text-foreground">{s.name}</div>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", s.status === "Active" ? "bg-cat-green-bg text-cat-green" : "bg-cat-amber-bg text-cat-amber")}>{s.status}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ─── Templates ─────────────────── */

function Templates({ onEdit }: { onEdit: (t: { name: string; desc: string }) => void }) {
  return (
    <SectionShell title="Email Templates" helper="Transactional emails sent by the platform.">
      <div className="overflow-hidden rounded-2xl border bg-card divide-y">
        {TEMPLATES.map((t) => (
          <div key={t.name} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <div className="text-sm font-medium text-foreground">{t.name}</div>
              <div className="text-[12px] text-ink-muted">{t.desc}</div>
            </div>
            <button onClick={() => onEdit(t)} className="press rounded-full border px-3 py-1.5 text-xs">Edit</button>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ─── Shell ─────────────────── */

function SectionShell({ title, helper, action, children }: { title: string; helper?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {helper && <div className="mt-0.5 text-[12px] text-ink-muted">{helper}</div>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// silence (Archive/RotateCcw retained for future archive UI)
void Archive; void RotateCcw;

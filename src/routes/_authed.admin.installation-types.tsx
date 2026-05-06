import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/installation-types")({
  head: () => ({ meta: [{ title: "Installation Types — Renewably UK" }] }),
  component: TypesPage,
});

type Inst = { id: string; name: string; usedBy: number; systems: { id: string; name: string }[] };

const SEED: Inst[] = [
  { id: "spv", name: "Solar PV", usedBy: 412, systems: [
    { id: "1", name: "Roof-mounted (residential)" },
    { id: "2", name: "Ground-mounted" },
    { id: "3", name: "Solar carport" },
  ]},
  { id: "ashp", name: "Air Source Heat Pump", usedBy: 218, systems: [
    { id: "1", name: "Monobloc" },
    { id: "2", name: "Split system" },
  ]},
  { id: "ewi", name: "External Wall Insulation", usedBy: 84, systems: [
    { id: "1", name: "Mineral wool" },
    { id: "2", name: "EPS board" },
  ]},
  { id: "cwi", name: "Cavity Wall Insulation", usedBy: 156, systems: [{ id: "1", name: "Bonded bead" }] },
];

function TypesPage() {
  const { permissions } = useDevRole();
  const [data, setData] = useState(SEED);
  const [selected, setSelected] = useState(SEED[0].id);
  const [newSys, setNewSys] = useState("");

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Installation Types" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  const active = data.find((d) => d.id === selected) ?? data[0];

  function addSystem() {
    if (!newSys.trim()) return;
    setData((xs) => xs.map((x) => x.id === selected ? { ...x, systems: [...x.systems, { id: String(Date.now()), name: newSys.trim() }] } : x));
    setNewSys("");
  }

  function removeInst(i: Inst) {
    if (i.usedBy > 0) {
      toast.error(`Cannot delete — referenced by ${i.usedBy} IBGs`);
      return;
    }
    setData((xs) => xs.filter((x) => x.id !== i.id));
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Configuration"
        title="Installation & system types"
        subtitle="Define the catalogue of installation types and their child system variants."
        actions={<Button>New installation type</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border bg-card p-2">
          {data.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                selected === d.id ? "bg-surface text-foreground" : "text-ink-muted hover:bg-surface/60",
              )}
            >
              <span>{d.name}</span>
              <span className="text-[11px]">{d.usedBy}</span>
            </button>
          ))}
        </aside>

        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-foreground">{active.name}</div>
              <div className="mt-0.5 text-[12px] text-ink-muted">Used by {active.usedBy} IBGs · {active.systems.length} system types</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => removeInst(active)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>

          <div className="mt-5 divide-y rounded-xl border">
            {active.systems.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-foreground">{s.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setData((xs) => xs.map((x) => x.id === active.id ? { ...x, systems: x.systems.filter((y) => y.id !== s.id) } : x))}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Input value={newSys} onChange={(e) => setNewSys(e.target.value)} placeholder="New system type name" />
            <Button onClick={addSystem}><Plus className="size-3.5" /> Add system</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TypesPage;

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/jobs/new")({
  head: () => ({ meta: [{ title: "New job — Renewably UK" }] }),
  component: NewJob,
});

const MEASURES = ["Air Source Heat Pump", "Solar PV", "Loft Insulation", "Cavity Wall Insulation", "EV Charger", "Ground Source Heat Pump"];

function NewJob() {
  const data = useStore();
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ customerId: data.customers[0]?.id ?? "", propertyId: "", measure: MEASURES[0], owner: user.fullName, startDate: new Date().toISOString().slice(0, 10) });

  const props = data.properties.filter((p) => p.customerId === form.customerId);

  function save() {
    if (!form.customerId || !form.propertyId) {
      toast.error("Customer and property required");
      return;
    }
    const id = nid("job");
    const ref = nref("J");
    update((d) => {
      d.jobs.unshift({
        id, ref, customerId: form.customerId, propertyId: form.propertyId,
        measure: form.measure, owner: form.owner, state: "draft",
        startDate: form.startDate, createdAt: Date.now(),
      });
      pushAudit(d, "job", id, user.fullName, "Created job");
    });
    toast.success("Job created");
    nav({ to: "/jobs/$id", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-10">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Jobs
      </Link>
      <div className="mt-3"><PageHeader eyebrow="Jobs" title="New job" /></div>

      <div className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
        <Field label="Customer">
          <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value, propertyId: "" })} className={inputCls}>
            {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.ref})</option>)}
          </select>
        </Field>
        <Field label="Property">
          <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} className={inputCls}>
            <option value="">Select…</option>
            {props.map((p) => <option key={p.id} value={p.id}>{p.address}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Measure">
            <select value={form.measure} onChange={(e) => setForm({ ...form, measure: e.target.value })} className={inputCls}>
              {MEASURES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Start date">
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="Owner">
          <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className={inputCls} />
        </Field>

        <div className="flex justify-end pt-2">
          <button onClick={save} className="press rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Create job</button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1 text-xs font-medium text-ink-muted">{label}</div>{children}</label>;
}

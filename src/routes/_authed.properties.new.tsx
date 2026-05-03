import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update, nid } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";

export const Route = createFileRoute("/_authed/properties/new")({
  head: () => ({ meta: [{ title: "New property — Renewably UK" }] }),
  component: NewProperty,
});

function NewProperty() {
  const data = useStore();
  const nav = useNavigate();
  const { user } = useAuth();
  const { permissions } = useDevRole();
  const [form, setForm] = useState({
    customerId: data.customers[0]?.id ?? "",
    address: "",
    postcode: "",
    uprn: "",
    epc: "",
  });

  if (!can(permissions, "properties.create")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Properties" title="New property" />
        <div className="mt-6"><LockedCard title="Add property" reason={{ kind: "permission", permission: "properties.create" }} /></div>
      </div>
    );
  }

  function save() {
    if (!form.customerId || !form.address.trim() || !form.postcode.trim()) {
      toast.error("Customer, address and postcode are required");
      return;
    }
    const id = nid("pro");
    update((d) => {
      d.properties.unshift({
        id,
        customerId: form.customerId,
        address: form.address.trim(),
        postcode: form.postcode.trim().toUpperCase(),
        uprn: form.uprn.trim() || undefined,
        epc: form.epc.trim() || undefined,
        status: "active",
        createdAt: Date.now(),
      });
      pushAudit(d, "property", id, user.fullName, `Created property ${form.address}`);
    });
    toast.success("Property created");
    nav({ to: "/properties/$id", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <Link to="/properties" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to properties
      </Link>
      <div className="mt-3">
        <PageHeader eyebrow="Properties" title="New property" subtitle="Link a site to a customer. Jobs live under properties." />
      </div>

      <div className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
        <Field label="Customer *">
          <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className={inputCls}>
            {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.ref})</option>)}
          </select>
        </Field>
        <Field label="Address line *">
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="14 Oak Lane, Leeds" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Postcode *">
            <input value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} placeholder="LS1 4AB" className={inputCls} />
          </Field>
          <Field label="EPC band">
            <input value={form.epc} onChange={(e) => setForm({ ...form, epc: e.target.value })} placeholder="C" className={inputCls} />
          </Field>
        </div>
        <Field label="UPRN (optional)">
          <input value={form.uprn} onChange={(e) => setForm({ ...form, uprn: e.target.value })} placeholder="100012345678" className={inputCls} />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link to="/properties" className="press rounded-full border bg-background px-4 py-2 text-sm font-medium">Cancel</Link>
          <button onClick={save} className="press rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Save property</button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1 text-xs font-medium text-ink-muted">{label}</div>{children}</label>;
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { update, nid, nref } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/customers/new")({
  head: () => ({ meta: [{ title: "New customer — Renewably UK" }] }),
  component: NewCustomer,
});

function NewCustomer() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", org: "" });

  function save(activate: boolean) {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const id = nid("cus");
    const ref = nref("C");
    update((d) => {
      d.customers.unshift({
        id, ref, name: form.name, email: form.email, phone: form.phone,
        org: form.org || undefined,
        status: activate ? "active" : "draft",
        createdAt: Date.now(),
      });
      pushAudit(d, "customer", id, user.fullName, activate ? "Created and activated customer" : "Saved customer draft");
    });
    toast.success(activate ? "Customer activated" : "Saved as draft");
    nav({ to: "/customers/$id", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-8 py-10">
      <Link to="/customers" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to customers
      </Link>
      <div className="mt-3">
        <PageHeader eyebrow="Customers" title="New customer" subtitle="Create a customer record. You can add properties and jobs after." />
      </div>

      <div className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
        <Field label="Full name *">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Organisation (optional)">
          <input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={() => save(false)} className="press rounded-full border bg-background px-4 py-2 text-sm font-medium">Save draft</button>
          <button onClick={() => save(true)} className="press rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Save & activate</button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-ink-muted">{label}</div>
      {children}
    </label>
  );
}

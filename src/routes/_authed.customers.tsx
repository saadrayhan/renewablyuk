import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, RECORD_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate, propertiesOfCustomer, jobsOfCustomer } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";

export const Route = createFileRoute("/_authed/customers")({
  head: () => ({ meta: [{ title: "Customers — Renewably UK" }] }),
  component: CustomersList,
});

function CustomersList() {
  const data = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "archived">("all");

  const rows = data.customers
    .filter((c) => filter === "all" || c.status === filter)
    .filter((c) => q === "" || c.name.toLowerCase().includes(q.toLowerCase()) || c.ref.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <PageHeader
        eyebrow="Projects"
        title="Customers"
        subtitle="People and organisations served. Customer is the root of every record."
        actions={
          <Link to="/customers/new" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Plus className="size-4" /> New customer
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          value={filter}
          onChange={setFilter}
          options={[
            { value: "active", label: "Active", count: data.customers.filter((c) => c.status === "active").length },
            { value: "draft", label: "Draft", count: data.customers.filter((c) => c.status === "draft").length },
            { value: "archived", label: "Archived", count: data.customers.filter((c) => c.status === "archived").length },
          ]}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or ref"
            className="h-9 w-64 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" body="Try removing filters or create a new customer." />
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Ref</th>
                  <th className="px-4 py-2.5 text-left">Properties</th>
                  <th className="px-4 py-2.5 text-left">Jobs</th>
                  <th className="px-4 py-2.5 text-left">Created</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const p = propertiesOfCustomer(data, c.id).length;
                  const j = jobsOfCustomer(data, c.id).length;
                  return (
                    <tr key={c.id} className="border-b last:border-b-0 hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <Link to="/customers/$id" params={{ id: c.id }} className="block">
                          <div className="font-medium text-foreground">{c.name}</div>
                          <div className="text-xs text-ink-muted">{c.email}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{c.ref}</td>
                      <td className="px-4 py-3 text-foreground">{p}</td>
                      <td className="px-4 py-3 text-foreground">{j}</td>
                      <td className="px-4 py-3 text-ink-muted">{fmtDate(c.createdAt)}</td>
                      <td className="px-4 py-3 text-right"><StatePill meta={RECORD_STATES[c.status]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Home as HomeIcon } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, RECORD_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { findCustomer, jobsOfProperty } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";

export const Route = createFileRoute("/_authed/properties")({
  head: () => ({ meta: [{ title: "Properties — Renewably UK" }] }),
  component: PropertiesList,
});

function PropertiesList() {
  const data = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");

  const rows = data.properties
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => q === "" || p.address.toLowerCase().includes(q.toLowerCase()) || p.postcode.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <PageHeader eyebrow="Projects" title="Properties" subtitle="Sites linked to a customer. Each property hosts jobs." />

      <div className="mt-6 flex items-center justify-between gap-3">
        <FilterPills
          value={filter}
          onChange={setFilter}
          options={[
            { value: "active", label: "Active", count: data.properties.filter((p) => p.status === "active").length },
            { value: "draft", label: "Draft", count: data.properties.filter((p) => p.status === "draft").length },
          ]}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search address" className="h-9 w-64 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? <EmptyState icon={HomeIcon} title="No properties" body="Properties are added from a customer detail page." /> : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Address</th>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">EPC</th>
                  <th className="px-4 py-2.5 text-left">UPRN</th>
                  <th className="px-4 py-2.5 text-left">Jobs</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const c = findCustomer(data, p.customerId);
                  const j = jobsOfProperty(data, p.id).length;
                  return (
                    <tr key={p.id} className="border-b last:border-b-0 hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <Link to="/properties/$id" params={{ id: p.id }} className="block">
                          <div className="font-medium text-foreground">{p.address}</div>
                          <div className="text-xs text-ink-muted">{p.postcode}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {c ? <Link to="/customers/$id" params={{ id: c.id }} className="text-foreground hover:underline">{c.name}</Link> : "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">{p.epc ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-muted">{p.uprn ?? "—"}</td>
                      <td className="px-4 py-3 text-foreground">{j}</td>
                      <td className="px-4 py-3 text-right"><StatePill meta={RECORD_STATES[p.status]} /></td>
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

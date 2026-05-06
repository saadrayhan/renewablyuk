import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Home as HomeIcon, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, RECORD_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { findCustomer, jobsOfProperty } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/properties")({
  head: () => ({ meta: [{ title: "Properties — Renewably UK" }] }),
  component: PropertiesList,
});

function PropertiesList() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");

  if (!can(permissions, "properties.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Properties" title="Properties" />
        <div className="mt-6"><LockedCard title="Properties" reason={{ kind: "permission", permission: "properties.read" }} /></div>
      </div>
    );
  }

  const rows = data.properties
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => q === "" || p.address.toLowerCase().includes(q.toLowerCase()) || p.postcode.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Projects"
        title="Properties"
        subtitle="Sites linked to a customer. Each property hosts jobs."
        actions={
          can(permissions, "properties.create") ? (
            <Link to="/properties/new" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
              <Plus className="size-4" /> New property
            </Link>
          ) : null
        }
      />

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
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[12px] font-medium text-ink-muted">
                  <th className="px-3 py-2.5 text-left">Address</th>
                  <th className="px-3 py-2.5 text-left">Customer</th>
                  <th className="px-3 py-2.5 text-left">EPC</th>
                  <th className="px-3 py-2.5 text-left">UPRN</th>
                  <th className="px-3 py-2.5 text-left">Jobs</th>
                  <th className="px-3 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const c = findCustomer(data, p.customerId);
                  const j = jobsOfProperty(data, p.id).length;
                  return (
                    <tr key={p.id} className="border-b last:border-b-0 hover:bg-surface/60">
                      <td className="px-3 py-3.5">
                        <Link to="/properties/$id" params={{ id: p.id }} className="block">
                          <div className="font-medium text-foreground">{p.address}</div>
                          <div className="text-xs text-ink-muted">{p.postcode}</div>
                        </Link>
                      </td>
                      <td className="px-3 py-3.5">
                        {c ? <Link to="/customers/$id" params={{ id: c.id }} className="text-foreground hover:underline">{c.name}</Link> : "—"}
                      </td>
                      <td className="px-3 py-3.5 text-foreground">{p.epc ?? "—"}</td>
                      <td className="px-3 py-3.5 text-ink-muted">{p.uprn ?? "—"}</td>
                      <td className="px-3 py-3.5 text-foreground">{j}</td>
                      <td className="px-3 py-3.5 text-right"><StatePill meta={RECORD_STATES[p.status]} /></td>
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

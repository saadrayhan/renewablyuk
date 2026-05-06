import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, FileBadge, Plus, Download, Eye, History as HistoryIcon } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";
import { StatePill, IBG_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import type { IbgState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/ibg/repository")({
  head: () => ({ meta: [{ title: "IBG Repository — Renewably UK" }] }),
  component: Repository,
});

const FILTERS: { value: IbgState; label: string }[] = [
  { value: "issued", label: "Issued" },
  { value: "ready-for-issue", label: "Ready" },
  { value: "incomplete", label: "Incomplete" },
  { value: "amended", label: "Amended" },
  { value: "cancelled", label: "Cancelled" },
];

function Repository() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<IbgState | "all">("all");

  if (!can(permissions, "ibg.repository.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="IBG" title="IBG Repository" />
        <div className="mt-6">
          <LockedCard title="IBG Repository" body="Searchable record store of every issued IBG. Operate plan or operator permission required." reason={{ kind: "permission", permission: "ibg.repository.read" }} />
        </div>
      </div>
    );
  }

  const rows = data.ibgs
    .filter((i) => filter === "all" || i.state === filter)
    .filter((i) => !q || i.ref.toLowerCase().includes(q.toLowerCase()) || i.customerName.toLowerCase().includes(q.toLowerCase()) || i.propertyAddress.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="IBG · Repository"
        title="Every issued IBG"
        subtitle="A searchable record store for certificates, policies and confirmation reports."
        actions={
          <>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/ibg/history"><HistoryIcon className="size-4" /> History</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/ibg/new"><Plus className="size-4" /> New IBG</Link>
            </Button>
          </>
        }
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <FilterPills<IbgState>
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ ...f, count: data.ibgs.filter((i) => i.state === f.value).length }))}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ref, customer, address" className="h-9 w-72 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? <EmptyState icon={FileBadge} title="No IBGs match" body="Try clearing filters or search for a reference." /> : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Ref</th>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Property</th>
                  <th className="px-4 py-2.5 text-left">Measure</th>
                  <th className="px-4 py-2.5 text-left">Issued</th>
                  <th className="px-4 py-2.5 text-left">State</th>
                  <th className="w-24 px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} className="border-b last:border-b-0 hover:bg-surface/60">
                    <td className="px-4 py-3"><Link to="/ibg/$id" params={{ id: i.id }} className="font-mono text-[12px] font-medium text-foreground hover:underline">{i.ref}</Link></td>
                    <td className="px-4 py-3 text-foreground">{i.customerName}</td>
                    <td className="px-4 py-3 text-ink-muted">{i.propertyAddress}</td>
                    <td className="px-4 py-3 text-foreground">{i.measure}</td>
                    <td className="px-4 py-3 text-ink-muted">{i.issuedAt ? fmtDate(i.issuedAt) : "—"}</td>
                    <td className="px-4 py-3"><StatePill meta={IBG_STATES[i.state]} /></td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="icon" title="Download PDF"><Download className="size-4" /></Button>
                        <Button variant="icon" title="View" asChild>
                          <Link to="/ibg/$id" params={{ id: i.id }}><Eye className="size-4" /></Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

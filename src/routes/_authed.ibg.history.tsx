import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { History, Mail, Send, FileBadge, AlertTriangle, RefreshCw, CheckCircle2, XCircle, Eye } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";

export const Route = createFileRoute("/_authed/ibg/history")({
  head: () => ({ meta: [{ title: "IBG History — Renewably UK" }] }),
  component: HistoryPage,
});

type EventKind =
  | "generated" | "issued" | "sent" | "resent"
  | "delivered" | "bounced" | "viewed" | "amended" | "cancelled";

type Row = {
  id: string;
  at: number;
  ref: string;
  ibgId?: string;
  kind: EventKind;
  actor: string;
  target: string;
};

const KIND_META: Record<EventKind, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  generated: { label: "Generated", icon: FileBadge, tone: "cat-blue" },
  issued:    { label: "Issued",    icon: CheckCircle2, tone: "cat-green" },
  sent:      { label: "Sent",      icon: Send, tone: "cat-blue" },
  resent:    { label: "Resent",    icon: RefreshCw, tone: "cat-amber" },
  delivered: { label: "Delivered", icon: Mail, tone: "cat-green" },
  bounced:   { label: "Bounced",   icon: AlertTriangle, tone: "cat-rose" },
  viewed:    { label: "Viewed by customer", icon: Eye, tone: "cat-purple" },
  amended:   { label: "Amended",   icon: RefreshCw, tone: "cat-amber" },
  cancelled: { label: "Cancelled", icon: XCircle, tone: "cat-rose" },
};

const FILTERS: { value: EventKind; label: string }[] = [
  { value: "issued", label: "Issued" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
  { value: "bounced", label: "Bounced" },
  { value: "viewed", label: "Viewed" },
  { value: "amended", label: "Amended" },
  { value: "cancelled", label: "Cancelled" },
];

function HistoryPage() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [filter, setFilter] = useState<EventKind | "all">("all");

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const ibg of data.ibgs) {
      out.push({ id: `${ibg.id}-gen`, at: ibg.createdAt, ref: ibg.ref, ibgId: ibg.id, kind: "generated", actor: ibg.issuedBy, target: ibg.customerName });
      if (ibg.issuedAt) {
        out.push({ id: `${ibg.id}-iss`, at: ibg.issuedAt, ref: ibg.ref, ibgId: ibg.id, kind: "issued", actor: ibg.issuedBy, target: ibg.customerName });
        out.push({ id: `${ibg.id}-snt`, at: ibg.issuedAt + 1000 * 60, ref: ibg.ref, ibgId: ibg.id, kind: "sent", actor: "system", target: ibg.customerName });
        if (ibg.state === "amended") out.push({ id: `${ibg.id}-amd`, at: ibg.issuedAt + 1000 * 60 * 60 * 24, ref: ibg.ref, ibgId: ibg.id, kind: "amended", actor: ibg.issuedBy, target: ibg.customerName });
        if (ibg.state === "cancelled") out.push({ id: `${ibg.id}-cnl`, at: ibg.issuedAt + 1000 * 60 * 60 * 48, ref: ibg.ref, ibgId: ibg.id, kind: "cancelled", actor: ibg.issuedBy, target: ibg.customerName });
      }
    }
    return out.sort((a, b) => b.at - a.at);
  }, [data.ibgs]);

  if (!can(permissions, "ibg.repository.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="IBG" title="IBG History" />
        <div className="mt-6">
          <LockedCard title="IBG History" body="Activity log of every IBG event." reason={{ kind: "permission", permission: "ibg.repository.read" }} />
        </div>
      </div>
    );
  }

  const filtered = rows.filter((r) => filter === "all" || r.kind === filter);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="IBG · History"
        title="Activity log"
        subtitle="Every IBG event — generated, issued, sent, delivery status."
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link to="/ibg/repository"><FileBadge className="size-4" /> Repository</Link>
          </Button>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <FilterPills options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface/40 text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">When</th>
              <th className="px-4 py-2.5 text-left font-medium">Event</th>
              <th className="px-4 py-2.5 text-left font-medium">IBG</th>
              <th className="px-4 py-2.5 text-left font-medium">Actor</th>
              <th className="px-4 py-2.5 text-left font-medium">Recipient</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const meta = KIND_META[r.kind];
              const Icon = meta.icon;
              return (
                <tr key={r.id} className="border-t hover:bg-surface/60">
                  <td className="px-4 py-2.5 text-ink-muted">{fmtDate(r.at)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full bg-${meta.tone}-bg px-2 py-0.5 text-xs text-${meta.tone}`}>
                      <Icon className="size-3" /> {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">
                    {r.ibgId ? <Link to="/ibg/$id" params={{ id: r.ibgId }} className="text-foreground hover:underline">{r.ref}</Link> : r.ref}
                  </td>
                  <td className="px-4 py-2.5">{r.actor}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{r.target}</td>
                  <td className="px-2 py-2.5 text-right">
                    {r.ibgId && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/ibg/$id" params={{ id: r.ibgId }}>View</Link>
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12">
                <EmptyState icon={History} title="No events" body="Try a different filter." />
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

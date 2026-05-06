import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { fmtDate } from "@/lib/mock/queries";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";

export const Route = createFileRoute("/_authed/admin/audit")({
  head: () => ({ meta: [{ title: "Audit log — Renewably UK" }] }),
  component: AuditPage,
});

function AuditPage() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [q, setQ] = useState("");
  if (!can(permissions, "audit.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Admin · Compliance" title="Audit log" />
        <div className="mt-6">
          <LockedCard
            title="Audit log"
            body="The full audit trail is restricted to compliance reviewers and admins. External read-only stakeholders see scope-limited activity only."
            reason={{ kind: "permission", permission: "audit.read" }}
          />
        </div>
      </div>
    );
  }
  const rows = [...data.audit].sort((a, b) => b.at - a.at).filter((a) => !q || a.actor.toLowerCase().includes(q.toLowerCase()) || a.action.toLowerCase().includes(q.toLowerCase()));

  function exportCsv() {
    const lines = ["Date,Actor,Action,Entity,EntityId,Detail"];
    rows.forEach((a) => lines.push([fmtDate(a.at), a.actor, a.action, a.entityType, a.entityId, a.detail ?? ""].map((s) => `"${String(s).replace(/"/g, '""')}"`).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url; el.download = "audit-log.csv"; el.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Compliance"
        title="Audit log"
        subtitle="Every state change, write and approval — tamper-evident."
        actions={<button onClick={exportCsv} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-2 text-sm font-medium"><Download className="size-3.5" /> Export CSV</button>}
      />

      <div className="mt-6 flex justify-end">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor or action" className="h-9 w-72 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5 w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[12px] font-medium text-ink-muted">
              <th className="px-3 py-2.5 text-left">Date</th>
              <th className="px-3 py-2.5 text-left">Actor</th>
              <th className="px-3 py-2.5 text-left">Action</th>
              <th className="px-3 py-2.5 text-left">Entity</th>
              <th className="px-3 py-2.5 text-left">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-surface/60">
                <td className="px-3 py-3.5 text-ink-muted">{fmtDate(a.at)}</td>
                <td className="px-3 py-3.5 text-foreground">{a.actor}</td>
                <td className="px-3 py-3.5 text-foreground">{a.action}</td>
                <td className="px-3 py-3.5"><span className="rounded-full bg-tile px-2 py-0.5 text-[11px] text-ink-muted">{a.entityType}</span></td>
                <td className="px-3 py-3.5 text-ink-muted">{a.detail ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

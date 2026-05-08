import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { useStore } from "@/lib/mock/store";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/admin/tickets")({
  component: AdminTicketsPage,
});

function AdminTicketsPage() {
  const { tickets } = useStore();
  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-12">
      <PageHeader eyebrow="SUPPORT" title="All tickets" />
      {tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No tickets" />
      ) : (
        <ul className="divide-y rounded-2xl border bg-background">
          {tickets.map((t) => (
            <li key={t.id} className="grid grid-cols-[80px_1fr_180px_120px] items-center gap-4 px-4 py-3 text-sm">
              <span className="font-mono text-xs text-ink-muted">{t.ref}</span>
              <div>
                <div className="font-medium">{t.subject}</div>
                <div className="text-xs text-ink-muted">{t.contractorName} · {t.category}</div>
              </div>
              <span className="text-xs text-ink-muted">{t.assigneeName ?? "Unassigned"}</span>
              <span className="text-xs text-ink-muted capitalize">{t.state} · {fmtDate(t.updatedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

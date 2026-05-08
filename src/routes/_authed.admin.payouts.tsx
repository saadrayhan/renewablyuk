import { createFileRoute } from "@tanstack/react-router";
import { Banknote } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatePill, type StateMeta } from "@/components/app/state-pill";
import { useStore } from "@/lib/mock/store";
import { fmtDate } from "@/lib/mock/queries";

const PAYOUT_STATES: Record<string, StateMeta> = {
  scheduled: { label: "Scheduled", tone: "info" },
  processing: { label: "Processing", tone: "warning" },
  paid: { label: "Paid", tone: "active" },
  failed: { label: "Failed", tone: "error" },
};

export const Route = createFileRoute("/_authed/admin/payouts")({
  component: PayoutsPage,
});

function PayoutsPage() {
  const { payouts } = useStore();
  const total = payouts.reduce((s, p) => s + p.amountGbp, 0);
  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-12">
      <PageHeader eyebrow="FINANCE" title="Payouts" />
      <div className="rounded-2xl border bg-background p-5">
        <div className="text-[11px] uppercase tracking-wide text-ink-muted">Outstanding</div>
        <div className="mt-1 text-3xl font-semibold">£{total.toFixed(2)}</div>
        <div className="text-xs text-ink-muted">{payouts.length} runs across all contractors</div>
      </div>
      {payouts.length === 0 ? (
        <EmptyState icon={Banknote} title="No payouts" />
      ) : (
        <ul className="divide-y rounded-2xl border bg-background">
          {payouts.map((p) => (
            <li key={p.id} className="grid grid-cols-[100px_1fr_120px_140px_120px] items-center gap-4 px-4 py-3 text-sm">
              <span className="font-mono text-xs text-ink-muted">{p.ref}</span>
              <div>
                <div className="font-medium">{p.contractorName}</div>
                <div className="text-xs text-ink-muted">Scheduled {fmtDate(p.scheduledFor)}</div>
              </div>
              <span className="font-medium">£{p.amountGbp.toFixed(2)}</span>
              <span className="text-xs text-ink-muted">{p.paidAt ? `Paid ${fmtDate(p.paidAt)}` : "—"}</span>
              <StatePill meta={PAYOUT_STATES[p.state]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

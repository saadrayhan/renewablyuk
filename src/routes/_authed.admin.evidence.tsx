import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Check, X, MessageSquareWarning } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatePill, type StateMeta } from "@/components/app/state-pill";
import { useStore } from "@/lib/mock/store";
import { update } from "@/lib/mock/store";
import { fmtDate } from "@/lib/mock/queries";
import { cn } from "@/lib/utils";
import type { EvidenceState } from "@/lib/mock/types";
import { toast } from "sonner";

const EV_STATES: Record<EvidenceState, StateMeta> = {
  pending: { label: "Pending", tone: "neutral" },
  in_review: { label: "In review", tone: "info" },
  approved: { label: "Approved", tone: "active" },
  changes_requested: { label: "Changes requested", tone: "warning" },
  rejected: { label: "Rejected", tone: "error" },
};

export const Route = createFileRoute("/_authed/admin/evidence")({
  component: EvidenceQueuePage,
});

function EvidenceQueuePage() {
  const { evidenceItems } = useStore();
  const [activeId, setActiveId] = useState<string | null>(evidenceItems[0]?.id ?? null);
  const active = evidenceItems.find((e) => e.id === activeId);

  const decide = (decision: EvidenceState, notes?: string) => {
    if (!active) return;
    update((d) => {
      const ev = d.evidenceItems.find((e) => e.id === active.id);
      if (ev) {
        ev.state = decision;
        ev.decidedAt = Date.now();
        if (notes) ev.reviewerNotes = notes;
      }
    });
    toast.success(`Evidence ${decision.replace("_", " ")}`);
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-end justify-between gap-4 px-6 pb-4 pt-8 md:px-10 md:pt-12">
        <PageHeader eyebrow="REVIEW" title="Evidence queue" />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden border-t md:grid-cols-[360px_1fr]">
        <aside className="overflow-y-auto border-r">
          {evidenceItems.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={ShieldCheck} title="Inbox zero" body="No items awaiting review." />
            </div>
          ) : (
            <ul className="divide-y">
              {evidenceItems.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(e.id)}
                    className={cn(
                      "press w-full px-4 py-3 text-left",
                      activeId === e.id ? "bg-surface" : "hover:bg-surface/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-ink-muted">{e.certificateRef}</span>
                      <StatePill meta={EV_STATES[e.state]} />
                    </div>
                    <div className="mt-1 truncate text-sm font-medium">{e.fileName}</div>
                    <div className="mt-0.5 truncate text-xs text-ink-muted">
                      {e.contractorName} · {e.category}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="flex flex-col overflow-hidden">
          {active ? (
            <>
              <div className="border-b px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-muted">{active.certificateRef}</span>
                  <StatePill meta={EV_STATES[active.state]} />
                </div>
                <div className="mt-1 text-base font-semibold">{active.fileName}</div>
                <div className="mt-1 text-xs text-ink-muted">
                  {active.contractorName} · {active.templateName} · {active.category} · uploaded {fmtDate(active.uploadedAt)}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid h-[400px] place-items-center rounded-2xl border bg-surface text-sm text-ink-muted">
                  Document preview — {active.fileType.toUpperCase()}
                </div>
                {active.reviewerNotes && (
                  <div className="mt-4 rounded-xl border border-cat-amber/30 bg-cat-amber-bg/40 p-3 text-sm">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-cat-amber">
                      <MessageSquareWarning className="size-3.5" /> Reviewer notes
                    </div>
                    {active.reviewerNotes}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 border-t px-6 py-4">
                <button
                  onClick={() => decide("approved")}
                  className="press inline-flex items-center gap-1.5 rounded-full bg-cat-green px-4 py-2 text-sm font-medium text-white"
                >
                  <Check className="size-4" /> Approve
                </button>
                <button
                  onClick={() => decide("changes_requested", "Please re-upload with full signature.")}
                  className="press inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium"
                >
                  Request changes
                </button>
                <button
                  onClick={() => decide("rejected")}
                  className="press inline-flex items-center gap-1.5 rounded-full border border-cat-rose/40 px-4 py-2 text-sm font-medium text-cat-rose"
                >
                  <X className="size-4" /> Reject
                </button>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center p-6">
              <EmptyState icon={ShieldCheck} title="Select an item" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

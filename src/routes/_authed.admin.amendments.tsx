import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, AMENDMENT_STATES } from "@/components/app/state-pill";
import { fmtDate } from "@/lib/mock/queries";
import { AmendmentReviewSheet } from "@/components/app/amendment-review-sheet";
import type { AmendmentRequest } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/admin/amendments")({
  head: () => ({ meta: [{ title: "Amendments — Renewably UK" }] }),
  component: AmendmentsQueue,
});

function AmendmentsQueue() {
  const data = useStore();
  const [selected, setSelected] = useState<AmendmentRequest | null>(null);
  const selectedIbg = selected ? data.ibgs.find((i) => i.id === selected.ibgId) ?? null : null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · Onboarding" title="Amendment requests" subtitle="Review IBG correction requests submitted by installers." />

      <div className="mt-6 space-y-3">
        {data.amendments.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-surface/40 p-10 text-center text-sm text-ink-muted">No amendment requests.</div>
        ) : data.amendments.map((a) => {
          const ibg = data.ibgs.find((i) => i.id === a.ibgId);
          return (
            <div key={a.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{ibg?.ref ?? a.ibgId} · {a.field}</div>
                  <div className="mt-1 text-xs text-ink-muted">Requested {fmtDate(a.createdAt)}{a.decidedBy && ` · decided by ${a.decidedBy}`}</div>
                </div>
                <StatePill meta={AMENDMENT_STATES[a.state]} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-cat-rose-bg/40 p-3">
                  <div className="text-[11px] uppercase text-ink-muted">Current</div>
                  <div className="mt-1 text-sm text-foreground">{a.oldValue || "—"}</div>
                </div>
                <div className="rounded-xl bg-cat-green-bg/40 p-3">
                  <div className="text-[11px] uppercase text-ink-muted">Requested</div>
                  <div className="mt-1 text-sm text-foreground">{a.newValue}</div>
                </div>
              </div>

              <p className="mt-3 text-sm text-ink-muted"><strong className="text-foreground">Reason:</strong> {a.reason}</p>

              {a.state === "pending" && (
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => decide(a.id, "rejected", prompt("Reason for rejection?") ?? undefined)} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm">
                    <XCircle className="size-3.5" /> Reject
                  </button>
                  <button onClick={() => decide(a.id, "approved")} className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background">
                    <CheckCircle2 className="size-3.5" /> Approve
                  </button>
                </div>
              )}

              {ibg && (
                <div className="mt-3 text-xs">
                  <Link to="/ibg/$id" params={{ id: ibg.id }} className="text-ink-muted hover:text-foreground">Open {ibg.ref} →</Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

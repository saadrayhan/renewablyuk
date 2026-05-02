import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useStore, update, nid } from "@/lib/mock/store";
import { findFunding, fmtDate, pushAudit, relTime } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import type { FundingState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/funding/$id/tracking")({
  head: () => ({ meta: [{ title: "Tracking — Renewably UK" }] }),
  component: FundingTracking,
});

type Stage = {
  key: string;
  label: string;
  matches: (s: FundingState) => boolean;
};

const PAST_FOR: Record<FundingState, string[]> = {
  incomplete: [],
  "in-progress": [],
  "evidence-required": [],
  "under-review": ["submitted"],
  returned: ["submitted", "under-review"],
  validated: ["submitted", "under-review"],
  "ready-for-submission": [],
  submitted: [],
};

const STAGES: Stage[] = [
  { key: "submitted", label: "Submitted to scheme", matches: (s) => s === "submitted" || s === "under-review" || s === "validated" || s === "returned" },
  { key: "under-review", label: "Under review", matches: (s) => s === "under-review" },
  { key: "info-requested", label: "Information requested", matches: (s) => s === "returned" || s === "evidence-required" },
  { key: "decision", label: "Decision issued", matches: (s) => s === "validated" },
  { key: "closed", label: "Closed", matches: () => false },
];

function stageStatus(stage: Stage, state: FundingState, idx: number) {
  if (stage.matches(state)) return "active" as const;
  const past = PAST_FOR[state] ?? [];
  if (past.includes(stage.key)) return "past" as const;
  // submitted is always past once we're tracking
  if (stage.key === "submitted") return "past" as const;
  // info-requested past only if we moved beyond returned
  if (stage.key === "info-requested" && (state === "validated")) return "past" as const;
  if (stage.key === "decision" && state === "submitted") return "future" as const;
  return idx === 0 ? "past" : "future";
}

function FundingTracking() {
  const { id } = Route.useParams();
  const data = useStore();
  const f = findFunding(data, id);
  const { user } = useAuth();
  if (!f) throw notFound();

  const auditEvents = data.audit
    .filter((a) => a.entityType === "funding" && a.entityId === id)
    .slice()
    .reverse();

  function uploadResponse() {
    const name = prompt("Response filename?", "Information-response.pdf");
    if (!name) return;
    update((d) => {
      const x = d.fundingProjects.find((p) => p.id === id);
      if (!x) return;
      x.evidence.push({ id: nid("ev"), name, category: "Information response", uploadedAt: Date.now() });
      x.state = "under-review";
      pushAudit(d, "funding", id, user.fullName, `Uploaded response document ${name}`);
    });
    toast.success("Response uploaded — moved back to under review");
  }

  function withdraw() {
    if (!confirm("Withdraw this submission? It will return to draft.")) return;
    update((d) => {
      const x = d.fundingProjects.find((p) => p.id === id);
      if (!x) return;
      x.state = "in-progress";
      pushAudit(d, "funding", id, user.fullName, `Withdrew submission`);
    });
    toast.success("Submission withdrawn");
  }

  const closed: FundingState[] = ["validated"];
  const canWithdraw = !closed.includes(f.state);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link
        to="/funding/$id"
        params={{ id }}
        className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Funding project
      </Link>

      <div className="mt-3">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
          {f.scheme} · Tracking
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{f.ref}</h1>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-sm font-medium text-foreground">Submission timeline</div>
          <div className="relative mt-5 pl-7">
            <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border" />
            <ul className="space-y-5">
              {STAGES.map((stage, i) => {
                const status = stageStatus(stage, f.state, i);
                const matchEvent = auditEvents.find((e) =>
                  e.action.toLowerCase().includes(stage.key.split("-")[0]),
                );
                return (
                  <li key={stage.key} className="relative">
                    <span
                      className={
                        "absolute -left-7 top-0 grid size-5 place-items-center rounded-full border-2 " +
                        (status === "past"
                          ? "border-cat-green bg-cat-green-bg text-cat-green"
                          : status === "active"
                          ? "border-cat-amber bg-cat-amber-bg text-cat-amber"
                          : "border-border bg-surface text-ink-muted")
                      }
                    >
                      {status === "past" ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : status === "active" ? (
                        <Clock className="size-3" />
                      ) : null}
                    </span>
                    <div className="text-[13px] font-medium text-foreground">
                      {stage.label}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">
                      {matchEvent ? (
                        <>
                          {fmtDate(matchEvent.at)} · {matchEvent.actor}
                        </>
                      ) : status === "future" ? (
                        "Pending"
                      ) : status === "active" ? (
                        "In progress"
                      ) : (
                        "Completed"
                      )}
                    </div>

                    {status === "active" && stage.key === "info-requested" && (
                      <button
                        type="button"
                        onClick={uploadResponse}
                        className="press mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cat-amber/50 bg-cat-amber-bg/30 px-4 py-4 text-xs font-medium text-foreground hover:bg-cat-amber-bg/50"
                      >
                        <Upload className="size-3.5" /> Upload response document
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {auditEvents.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Recent activity
              </div>
              <ul className="mt-2 space-y-1.5">
                {auditEvents.slice(-5).reverse().map((e) => (
                  <li key={e.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{e.action}</span>
                    <span className="text-ink-muted">{relTime(e.at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-ink-muted">Scheme</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{f.scheme}</div>
            <div className="mt-0.5 text-xs text-ink-muted">{f.measure}</div>
            <div className="mt-3 border-t pt-3 text-xs text-ink-muted">
              Reference <span className="font-mono text-foreground">{f.ref}</span>
            </div>
          </div>

          {canWithdraw && (
            <button
              type="button"
              onClick={withdraw}
              className="press inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-destructive/30 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/5"
            >
              <X className="size-3.5" /> Withdraw submission
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

void LockIcon;

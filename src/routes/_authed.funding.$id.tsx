import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileUp, Send, Check, AlertCircle, Circle, Lock, ArrowRight, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import { findFunding, findJob, pushAudit, fmtDate } from "@/lib/mock/queries";
import { StatePill, FUNDING_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { EvidenceUploadDialog } from "@/components/app/evidence-upload-dialog";
import { useAuth } from "@/lib/auth-context";
import type { FundingState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/funding/$id")({
  head: () => ({ meta: [{ title: "Funding project — Renewably UK" }] }),
  component: FundingDetail,
});

// Review is "done" only when it has actually completed successfully.
// `returned` means review failed and step must re-open.
const REVIEW_DONE: FundingState[] = ["validated", "ready-for-submission", "submitted", "under-review"];
const POST_SUBMIT: FundingState[] = ["submitted", "under-review", "validated", "returned"];

function FundingDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const f = findFunding(data, id);
  const { user } = useAuth();
  const nav = useNavigate();
  if (!f) throw notFound();
  const job = findJob(data, f.jobId);

  const reviewDone = REVIEW_DONE.includes(f.state) && f.state !== "under-review";
  const reviewActive = f.state === "under-review";
  const reviewReturned = f.state === "returned";

  const steps = [
    { label: "Company verified", done: true, hint: "Workspace company on file" },
    { label: "Measure confirmed", done: !!f.measure, hint: f.measure || "Pick a measure" },
    { label: "Evidence uploaded", done: f.evidence.length >= 1, hint: reviewReturned ? "Re-upload required" : `${f.evidence.length} file${f.evidence.length === 1 ? "" : "s"}` },
    {
      label: "Internal review",
      done: reviewDone,
      hint: reviewReturned ? "Returned — fix issues and resubmit" : reviewActive ? "Review in progress" : reviewDone ? "Reviewed" : "Awaiting review",
    },
    { label: "Ready for submission", done: false, hint: "All previous steps complete" },
    { label: "Submitted", done: POST_SUBMIT.includes(f.state), hint: POST_SUBMIT.includes(f.state) ? "Sent to scheme" : "Not yet submitted" },
  ];
  // 5th step done when steps 1-4 are all done
  steps[4].done = steps.slice(0, 4).every((s) => s.done);

  const completed = steps.filter((s) => s.done).length;
  const ready = steps.slice(0, 5).every((s) => s.done);

  // Animate progress bar on mount
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setBarWidth((completed / steps.length) * 100), 30);
    return () => clearTimeout(t);
  }, [completed, steps.length]);

  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [linkJobOpen, setLinkJobOpen] = useState(false);

  function changeJob(newJobId: string) {
    update((d) => {
      const x = d.fundingProjects.find((p) => p.id === id);
      if (!x) return;
      const prev = x.jobId;
      x.jobId = newJobId;
      pushAudit(d, "funding", id, user.fullName, `Re-linked to job`, `${prev} → ${newJobId}`);
    });
    toast.success("Job updated");
    setLinkJobOpen(false);
  }

  function submit() {
    update((d) => {
      const x = d.fundingProjects.find((p) => p.id === id);
      if (!x) return;
      x.state = "submitted";
      const subId = nid("sub");
      d.submissions.unshift({
        id: subId, ref: nref("S"),
        fundingProjectId: id, jobId: x.jobId,
        scheme: x.scheme, state: "submitted", submittedAt: Date.now(),
      });
      pushAudit(d, "funding", id, user.fullName, `Submitted to ${x.scheme}`);
      pushAudit(d, "submission", subId, user.fullName, `Created from ${x.ref}`);
    });
    toast.success("Submitted to scheme");
    nav({ to: "/funding/$id/tracking", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/funding" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Funding
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Funding project · {f.ref}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{f.scheme} · {f.measure}</h1>
          {job && <div className="mt-2 text-sm text-ink-muted">Job <Link to="/jobs/$id" params={{ id: job.id }} className="hover:text-foreground">{job.ref}</Link></div>}
        </div>
        <StatePill meta={FUNDING_STATES[f.state]} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">Readiness</div>
              <div className="text-xs text-ink-muted">{completed} of {steps.length} steps complete</div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-tile">
              <div
                className="h-full rounded-full bg-cat-green transition-[width] duration-[600ms] ease-out"
                style={{ width: `${barWidth}%` }}
              />
            </div>

            <ul className="mt-4 space-y-2">
              {steps.map((s, i) => {
                const priorDone = steps.slice(0, i).every((p) => p.done);
                const locked = !priorDone && !s.done;
                const status: "done" | "warn" | "todo" | "locked" = s.done
                  ? "done"
                  : locked
                  ? "locked"
                  : i === 2 && f.evidence.length === 0
                  ? "warn"
                  : "todo";
                const Icon =
                  status === "done" ? Check :
                  status === "warn" ? AlertCircle :
                  status === "locked" ? Lock : Circle;
                const tone =
                  status === "done" ? "text-cat-green bg-cat-green-bg" :
                  status === "warn" ? "text-cat-amber bg-cat-amber-bg" :
                  status === "locked" ? "text-ink-muted bg-tile" :
                  "text-ink-muted bg-surface";
                return (
                  <li key={s.label} className="flex items-center justify-between rounded-xl bg-surface/40 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-6 place-items-center rounded-full ${tone}`}>
                        <Icon className="size-3.5" />
                      </span>
                      <div>
                        <div className="text-sm font-medium text-foreground">{s.label}</div>
                        <div className="text-xs text-ink-muted">{s.hint}</div>
                      </div>
                    </div>
                    {!s.done && !locked && i === 2 && (
                      <button onClick={() => setEvidenceOpen(true)} className="press text-xs font-medium text-foreground hover:underline">
                        Upload
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={() => setEvidenceOpen(true)} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm">
                <FileUp className="size-3.5" /> Upload evidence
              </button>
              <button
                onClick={submit}
                disabled={!ready || POST_SUBMIT.includes(f.state)}
                className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-3.5" /> Submit to scheme
              </button>
              {POST_SUBMIT.includes(f.state) && (
                <Link
                  to="/funding/$id/tracking"
                  params={{ id }}
                  className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm font-medium"
                >
                  View tracking <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div className="text-sm font-medium">Linked job</div>
              <button onClick={() => setLinkJobOpen(true)} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs">
                <Link2 className="size-3" /> Change
              </button>
            </div>
            <div className="px-5 py-4">
              {job ? (
                <Link to="/jobs/$id" params={{ id: job.id }} className="block">
                  <div className="text-sm font-medium text-foreground">{job.ref} · {job.measure}</div>
                  <div className="text-xs text-ink-muted">Owner {job.owner} · {job.startDate}</div>
                </Link>
              ) : (
                <div className="text-sm text-ink-muted">No job linked.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="border-b px-5 py-3 text-sm font-medium">Evidence</div>
            <div className="divide-y">
              {f.evidence.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-ink-muted">No evidence uploaded yet.</div>
              ) : f.evidence.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{e.name}</div>
                    <div className="text-xs text-ink-muted">{e.category}</div>
                  </div>
                  <div className="text-xs text-ink-muted">{fmtDate(e.uploadedAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <AuditTimeline entityType="funding" entityId={f.id} />
      </div>

      <EvidenceUploadDialog open={evidenceOpen} onOpenChange={setEvidenceOpen} fundingId={id} />

      {linkJobOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setLinkJobOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border bg-card p-5">
            <div className="text-sm font-medium text-foreground">Change linked job</div>
            <p className="mt-1 text-xs text-ink-muted">Move this funding project to a different job.</p>
            <div className="mt-3 max-h-[320px] divide-y overflow-y-auto rounded-xl border">
              {data.jobs.map((j) => (
                <button key={j.id} onClick={() => changeJob(j.id)} className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface ${j.id === f.jobId ? "bg-surface" : ""}`}>
                  <div>
                    <div className="font-medium text-foreground">{j.ref} · {j.measure}</div>
                    <div className="text-[11px] text-ink-muted">{j.owner} · {j.startDate}</div>
                  </div>
                  {j.id === f.jobId && <span className="text-[11px] text-ink-muted">Current</span>}
                </button>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={() => setLinkJobOpen(false)} className="press rounded-full border bg-background px-3 py-1.5 text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

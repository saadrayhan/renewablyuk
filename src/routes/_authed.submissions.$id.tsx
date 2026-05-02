import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { findSubmission, findFunding, findJob, fmtDate, pushAudit } from "@/lib/mock/queries";
import { StatePill, SUBMISSION_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { LockedCard } from "@/components/app/locked-card";
import { PageHeader } from "@/components/app/page-header";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/submissions/$id")({
  head: () => ({ meta: [{ title: "Submission — Renewably UK" }] }),
  component: SubmissionDetail,
});

function SubmissionDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const { user } = useAuth();
  const { permissions } = useDevRole();
  if (!can(permissions, "submissions.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Submission" title="Submission" />
        <div className="mt-6"><LockedCard title="Submission" reason={{ kind: "permission", permission: "submissions.read" }} /></div>
      </div>
    );
  }
  const submission = findSubmission(data, id);
  if (!submission) throw notFound();
  const sub = submission;
  const funding = findFunding(data, sub.fundingProjectId);
  const job = findJob(data, sub.jobId);

  const canUpload = sub.state === "awaiting-information";

  function downloadSnapshot() {
    const blob = new Blob([JSON.stringify({ sub, funding, job }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sub.ref}-snapshot.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Snapshot downloaded");
  }

  function uploadInfo() {
    const name = prompt("Filename for additional info?", "Additional-info.pdf");
    if (!name) return;
    update((d) => {
      const s = d.submissions.find((x) => x.id === id);
      if (!s) return;
      s.state = "under-review";
      pushAudit(d, "submission", id, user.fullName, `Uploaded additional info: ${name}`);
    });
    toast.success("Information uploaded — submission moved to under review");
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/submissions" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Submissions
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Submission</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{sub.ref}</h1>
          <div className="mt-2 text-sm text-ink-muted">
            {sub.scheme} · Submitted {fmtDate(sub.submittedAt)}
          </div>
        </div>
        <StatePill meta={SUBMISSION_STATES[sub.state]} />
      </div>

      {sub.state === "awaiting-information" && (
        <div className="mt-5 rounded-2xl border border-cat-amber/30 bg-cat-amber-bg/40 p-4 text-sm text-cat-amber">
          <strong className="font-semibold">Action required.</strong> The scheme has requested additional information. Upload supporting evidence to resume review.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-sm font-medium text-foreground">Linked records</div>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-muted">Funding project</dt>
                <dd>{funding ? <Link to="/funding/$id" params={{ id: funding.id }} className="text-foreground hover:underline">{funding.ref}</Link> : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Job</dt>
                <dd>{job ? <Link to="/jobs/$id" params={{ id: job.id }} className="text-foreground hover:underline">{job.ref}</Link> : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Scheme</dt>
                <dd className="text-foreground">{sub.scheme}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">State</dt>
                <dd><StatePill meta={SUBMISSION_STATES[sub.state]} /></dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="text-sm font-medium text-foreground">Actions</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={downloadSnapshot} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-2 text-sm font-medium text-foreground">
                <Download className="size-3.5" /> Download snapshot
              </button>
              <button
                onClick={uploadInfo}
                disabled={!canUpload}
                className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-40"
                title={canUpload ? "" : "Only enabled when scheme is awaiting information"}
              >
                <Upload className="size-3.5" /> Upload additional info
              </button>
            </div>
            {!canUpload && (
              <p className="mt-2 text-xs text-ink-muted">Uploads are only enabled when the scheme has requested additional information.</p>
            )}
          </div>
        </div>

        <AuditTimeline entityType="submission" entityId={sub.id} />
      </div>
    </div>
  );
}

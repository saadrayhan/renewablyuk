import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileUp, Send } from "lucide-react";
import { toast } from "sonner";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import { findFunding, findJob, pushAudit, fmtDate } from "@/lib/mock/queries";
import { StatePill, FUNDING_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/funding/$id")({
  head: () => ({ meta: [{ title: "Funding project — Renewably UK" }] }),
  component: FundingDetail,
});

function FundingDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const f = findFunding(data, id);
  const { user } = useAuth();
  if (!f) throw notFound();
  const job = findJob(data, f.jobId);

  function uploadEvidence() {
    const name = prompt("Filename?", "Evidence.pdf");
    if (!name) return;
    const cat = prompt("Category?", "Survey") ?? "Survey";
    update((d) => {
      const x = d.fundingProjects.find((p) => p.id === id);
      if (!x) return;
      x.evidence.push({ id: nid("ev"), name, category: cat, uploadedAt: Date.now() });
      pushAudit(d, "funding", id, user.fullName, `Uploaded evidence ${name}`);
    });
    toast.success("Evidence uploaded");
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
    toast.success("Submitted to scheme — submission record created");
  }

  const checklist = [
    { label: "Evidence uploaded", done: f.evidence.length > 0 },
    { label: "Job linked", done: !!job },
    { label: "Scheme selected", done: !!f.scheme },
  ];

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
            <div className="text-sm font-medium text-foreground">Readiness</div>
            <ul className="mt-3 space-y-2">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center justify-between rounded-xl bg-surface/40 px-3 py-2">
                  <span className="text-sm text-foreground">{c.label}</span>
                  <span className={`text-xs font-medium ${c.done ? "text-cat-green" : "text-cat-amber"}`}>{c.done ? "Done" : "Required"}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={uploadEvidence} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm">
                <FileUp className="size-3.5" /> Upload evidence
              </button>
              <button onClick={submit} disabled={f.state === "submitted"} className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-50">
                <Send className="size-3.5" /> Submit to scheme
              </button>
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
    </div>
  );
}

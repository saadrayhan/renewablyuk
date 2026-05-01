import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, FileBadge, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { StatePill, JOB_STATES, IBG_STATES, FUNDING_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { EmptyState } from "@/components/app/empty-state";
import { useStore, update } from "@/lib/mock/store";
import { findJob, findCustomer, findProperty, ibgsOfJob, fundingOfJob, pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import type { JobState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/jobs/$id")({
  head: () => ({ meta: [{ title: "Job — Renewably UK" }] }),
  component: JobDetail,
});

type Tab = "overview" | "documents" | "ibgs" | "funding" | "audit";

const TRANSITIONS: Partial<Record<JobState, JobState[]>> = {
  draft: ["in-progress", "cancelled"],
  "in-progress": ["awaiting-information", "under-validation", "blocked", "completed", "cancelled"],
  "awaiting-information": ["in-progress", "blocked", "cancelled"],
  "under-validation": ["completed", "blocked", "in-progress"],
  blocked: ["in-progress", "cancelled"],
  completed: ["closed"],
  closed: ["archived"],
};

function JobDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const job = findJob(data, id);
  const [tab, setTab] = useState<Tab>("overview");
  const { user } = useAuth();

  if (!job) throw notFound();
  const customer = findCustomer(data, job.customerId);
  const property = findProperty(data, job.propertyId);
  const ibgs = ibgsOfJob(data, job.id);
  const funding = fundingOfJob(data, job.id);

  function setState(next: JobState) {
    update((d) => {
      const j = d.jobs.find((x) => x.id === id);
      if (!j) return;
      const prev = j.state;
      j.state = next;
      pushAudit(d, "job", id, user.fullName, `Set state ${prev} → ${next}`);
    });
    toast.success(`Job moved to ${JOB_STATES[next].label}`);
  }

  const allowed = TRANSITIONS[job.state] ?? [];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Jobs
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Job · {job.ref}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{job.measure}</h1>
          <div className="mt-2 text-sm text-ink-muted">
            {customer && <Link to="/customers/$id" params={{ id: customer.id }} className="hover:text-foreground">{customer.name}</Link>}
            {property && <> · <Link to="/properties/$id" params={{ id: property.id }} className="hover:text-foreground">{property.address}</Link></>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatePill meta={JOB_STATES[job.state]} />
        </div>
      </div>

      {allowed.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-ink-muted">Move to:</span>
          {allowed.map((s) => (
            <button key={s} onClick={() => setState(s)} className="press rounded-full border bg-background px-3 py-1 text-xs font-medium hover:bg-surface">
              {JOB_STATES[s].label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "documents", label: "Documents" },
            { value: "ibgs", label: "IBGs", count: ibgs.length },
            { value: "funding", label: "Funding", count: funding.length },
            { value: "audit", label: "Audit" },
          ]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {tab === "overview" && (
            <Card title="Job details">
              <Detail label="Owner" value={job.owner} />
              <Detail label="Start date" value={job.startDate} />
              <Detail label="Measure" value={job.measure} />
              <Detail label="State" value={<StatePill meta={JOB_STATES[job.state]} />} />
            </Card>
          )}
          {tab === "documents" && <Card title="Documents"><EmptyState title="No documents uploaded" body="Drop EPCs, surveys and contracts here. Upload is mocked in design mode." /></Card>}
          {tab === "ibgs" && (
            <Card title="IBGs" action={
              <Link to="/ibg/new" className="press inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium">
                <FileBadge className="size-3" /> New IBG
              </Link>
            }>
              {ibgs.length === 0 ? <EmptyState title="No IBGs" body="Issue an IBG against this job." /> : (
                <div className="space-y-1">
                  {ibgs.map((i) => (
                    <Link key={i.id} to="/ibg/$id" params={{ id: i.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                      <div>
                        <div className="text-sm font-medium text-foreground">{i.ref}</div>
                        <div className="text-xs text-ink-muted">{i.policyType} · issued by {i.issuedBy}</div>
                      </div>
                      <StatePill meta={IBG_STATES[i.state]} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
          {tab === "funding" && (
            <Card title="Funding projects" action={
              <Link to="/funding/match" className="press inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium">
                <Sparkles className="size-3" /> Match scheme
              </Link>
            }>
              {funding.length === 0 ? <EmptyState title="No funding projects" body="Open the Match Hub to find a scheme." /> : (
                <div className="space-y-1">
                  {funding.map((f) => (
                    <Link key={f.id} to="/funding/$id" params={{ id: f.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                      <div>
                        <div className="text-sm font-medium text-foreground">{f.ref} · {f.scheme}</div>
                        <div className="text-xs text-ink-muted">{f.measure} · {f.evidence.length} evidence files</div>
                      </div>
                      <StatePill meta={FUNDING_STATES[f.state]} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
          {tab === "audit" && <AuditTimeline entityType="job" entityId={job.id} />}
        </div>
        <aside><AuditTimeline entityType="job" entityId={job.id} /></aside>
      </div>
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2.5 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileBadge, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { StatePill, JOB_STATES, IBG_STATES, FUNDING_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { EmptyState } from "@/components/app/empty-state";
import { useStore, update } from "@/lib/mock/store";
import { findJob, findCustomer, findProperty, ibgsOfJob, fundingOfJob, pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { JobState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/jobs/$id")({
  head: () => ({ meta: [{ title: "Job — Renewably UK" }] }),
  component: JobDetail,
});

type Tab = "overview" | "documents" | "evidence" | "ibgs" | "funding" | "audit";

const EVIDENCE_CHECKLIST: { key: string; label: string; required: boolean }[] = [
  { key: "mcs", label: "MCS Certificate", required: true },
  { key: "epc", label: "EPC (before & after)", required: true },
  { key: "photos", label: "Installation photos (min 3)", required: true },
  { key: "retrofit", label: "Retrofit Assessment", required: false },
  { key: "declaration", label: "Customer declaration", required: true },
];

const TRANSITIONS: Partial<Record<JobState, JobState[]>> = {
  draft: ["in-progress", "cancelled"],
  "in-progress": ["awaiting-information", "under-validation", "blocked", "completed", "cancelled"],
  "awaiting-information": ["in-progress", "blocked", "cancelled"],
  "under-validation": ["completed", "blocked", "in-progress"],
  blocked: ["in-progress", "cancelled"],
  completed: ["closed"],
  closed: ["archived"],
};

const TRACK: { state: JobState; label: string }[] = [
  { state: "draft", label: "Draft" },
  { state: "in-progress", label: "In progress" },
  { state: "under-validation", label: "Under validation" },
  { state: "completed", label: "Completed" },
];

function trackStatus(idx: number, current: JobState) {
  const order = TRACK.map((t) => t.state);
  const currentIdx = order.indexOf(current);
  if (current === "blocked" || current === "cancelled") {
    return idx <= 1 ? "complete" : "future";
  }
  if (currentIdx === -1) return idx === 0 ? "complete" : "future";
  if (idx < currentIdx) return "complete";
  if (idx === currentIdx) return "active";
  return "future";
}

function JobDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const job = findJob(data, id);
  const [tab, setTab] = useState<Tab>("overview");
  const [statusOpen, setStatusOpen] = useState(false);
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
    setStatusOpen(false);
  }

  const allowed = TRANSITIONS[job.state] ?? [];
  const latestIbg = ibgs[0];
  const latestFunding = funding[0];
  const branchActive = job.state === "blocked" || job.state === "cancelled";

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
        <StatePill meta={JOB_STATES[job.state]} />
      </div>

      {/* Status track */}
      <div className="mt-6 rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          {TRACK.map((step, i) => {
            const status = trackStatus(i, job.state);
            const last = i === TRACK.length - 1;
            return (
              <div key={step.state} className="flex flex-1 items-start gap-2">
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={
                      "grid size-4 place-items-center rounded-full transition-colors " +
                      (status === "complete"
                        ? "bg-cat-green text-white"
                        : status === "active"
                        ? "bg-foreground text-background"
                        : "bg-tile text-ink-muted")
                    }
                  >
                    {status === "complete" ? <Check className="size-2.5" strokeWidth={3} /> : null}
                  </span>
                  <span className={
                    "text-[10px] font-medium uppercase tracking-wide " +
                    (status === "active" ? "text-foreground" : "text-ink-muted")
                  }>
                    {step.label}
                  </span>
                </div>
                {!last && (
                  <div className={
                    "mt-1.5 h-px flex-1 " +
                    (trackStatus(i + 1, job.state) === "complete" || status === "complete"
                      ? "bg-cat-green"
                      : "bg-border")
                  } />
                )}
              </div>
            );
          })}
        </div>

        {branchActive && (
          <div className="mt-3 flex items-center gap-2 border-t pt-3">
            <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Branch:</span>
            <div className="flex items-center gap-1.5 rounded-full border border-dashed border-destructive/30 bg-destructive/5 px-2.5 py-1 text-[11px] font-medium text-destructive">
              <span className="size-1.5 rounded-full bg-destructive" />
              {JOB_STATES[job.state].label}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "documents", label: "Documents" },
            { value: "evidence", label: "Evidence" },
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
          {tab === "evidence" && <EvidenceTab jobId={job.id} />}
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

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          {/* Status panel */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Status</div>
            <div className="mt-2"><StatePill meta={JOB_STATES[job.state]} /></div>
            {allowed.length > 0 && (
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <button className="press mt-3 inline-flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-surface">
                    Change status
                    <ChevronDown className="size-3 text-ink-muted" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={6} className="w-56 p-1">
                  <div className="px-2 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    Move to
                  </div>
                  {allowed.map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(s)}
                      className="press flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-surface"
                    >
                      <span>{JOB_STATES[s].label}</span>
                      <ArrowRight className="size-3 text-ink-muted" />
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* IBG panel */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">IBG</div>
            {latestIbg ? (
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-foreground">{latestIbg.ref}</span>
                  <StatePill meta={IBG_STATES[latestIbg.state]} />
                </div>
                <Link
                  to="/ibg/$id"
                  params={{ id: latestIbg.id }}
                  className="press mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
                >
                  Open <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="mt-2">
                <div className="text-xs text-ink-muted">No IBG yet</div>
                <Link
                  to="/ibg/new"
                  className="press mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                >
                  <FileBadge className="size-3" /> Create IBG
                </Link>
              </div>
            )}
          </div>

          {/* Funding panel */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Funding</div>
            {latestFunding ? (
              <div className="mt-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{latestFunding.scheme}</span>
                  <StatePill meta={FUNDING_STATES[latestFunding.state]} />
                </div>
                <Link
                  to="/funding/$id"
                  params={{ id: latestFunding.id }}
                  className="press mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
                >
                  Open <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="mt-2">
                <div className="text-xs text-ink-muted">No funding project</div>
                <Link
                  to="/funding/match"
                  className="press mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                >
                  <Sparkles className="size-3" /> Find scheme
                </Link>
              </div>
            )}
          </div>
        </aside>
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

function EvidenceTab({ jobId }: { jobId: string }) {
  const [items, setItems] = useState<Record<string, { name: string; status: "pending" | "uploaded" | "rejected" } | null>>(() => {
    const init: Record<string, { name: string; status: "pending" | "uploaded" | "rejected" } | null> = {};
    EVIDENCE_CHECKLIST.forEach((c) => { init[c.key] = null; });
    return init;
  });
  function upload(key: string, label: string) {
    const name = `${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${jobId.slice(-4)}.pdf`;
    setItems((p) => ({ ...p, [key]: { name, status: "uploaded" } }));
    toast.success(`${label} uploaded`);
  }
  function remove(key: string) {
    setItems((p) => ({ ...p, [key]: null }));
  }
  const required = EVIDENCE_CHECKLIST.filter((c) => c.required);
  const requiredDone = required.filter((c) => items[c.key]?.status === "uploaded").length;
  const pct = Math.round((requiredDone / required.length) * 100);
  return (
    <div className="rounded-2xl border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">Evidence checklist</div>
          <div className="text-xs text-ink-muted">{requiredDone} of {required.length} required ({pct}%)</div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-tile">
          <div className="h-full rounded-full bg-cat-green transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="divide-y">
        {EVIDENCE_CHECKLIST.map((c) => {
          const it = items[c.key];
          const tone = it?.status === "uploaded" ? "text-cat-green bg-cat-green-bg" : "text-ink-muted bg-tile";
          return (
            <div key={c.key} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.required ? "bg-cat-amber-bg text-cat-amber" : "bg-tile text-ink-muted"}`}>{c.required ? "Required" : "Optional"}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>{it?.status ?? "pending"}</span>
                </div>
                {it && <div className="mt-0.5 text-[11px] text-ink-muted">{it.name}</div>}
              </div>
              {it ? (
                <button onClick={() => remove(c.key)} className="press rounded-full border bg-background px-3 py-1 text-xs">Remove</button>
              ) : (
                <button onClick={() => upload(c.key, c.label)} className="press rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">Upload</button>
              )}
            </div>
          );
        })}
      </div>
      <div className="border-t bg-surface/40 px-5 py-2.5 text-[11px] text-ink-muted">
        Uploaded evidence is automatically validated against the IBG issuance gate.
      </div>
    </div>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { StatePill, RECORD_STATES, JOB_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { useStore } from "@/lib/mock/store";
import { findCustomer, propertiesOfCustomer, jobsOfCustomer, fmtDate } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";

export const Route = createFileRoute("/_authed/customers/$id")({
  head: () => ({ meta: [{ title: "Customer — Renewably UK" }] }),
  component: CustomerDetail,
});

type Tab = "overview" | "properties" | "jobs" | "documents" | "audit";

function CustomerDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const customer = findCustomer(data, id);
  const [tab, setTab] = useState<Tab>("overview");

  if (!customer) throw notFound();

  const props = propertiesOfCustomer(data, customer.id);
  const jobs = jobsOfCustomer(data, customer.id);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <Link to="/customers" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Customers
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Customer · {customer.ref}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{customer.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1"><Mail className="size-3.5" /> {customer.email}</span>
            <span className="inline-flex items-center gap-1"><Phone className="size-3.5" /> {customer.phone}</span>
            {customer.org && <span className="inline-flex items-center gap-1"><Building2 className="size-3.5" /> {customer.org}</span>}
          </div>
        </div>
        <StatePill meta={RECORD_STATES[customer.status]} />
      </div>

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "properties", label: "Properties", count: props.length },
            { value: "jobs", label: "Jobs", count: jobs.length },
            { value: "documents", label: "Documents" },
            { value: "audit", label: "Audit" },
          ]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {tab === "overview" && (
            <div className="space-y-4">
              <Card title="Summary">
                <Detail label="Created" value={fmtDate(customer.createdAt)} />
                <Detail label="Status" value={<StatePill meta={RECORD_STATES[customer.status]} />} />
                <Detail label="Properties" value={`${props.length} linked`} />
                <Detail label="Jobs" value={`${jobs.length} on record`} />
              </Card>
            </div>
          )}
          {tab === "properties" && (
            <Card title="Properties" action={<button className="press inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium"><Plus className="size-3" /> Add property</button>}>
              {props.length === 0 ? <EmptyState icon={Building2} title="No properties yet" body="Add a property to start a job." /> : (
                <div className="space-y-1">
                  {props.map((p) => (
                    <Link key={p.id} to="/properties/$id" params={{ id: p.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                      <div>
                        <div className="text-sm font-medium text-foreground">{p.address}</div>
                        <div className="text-xs text-ink-muted">{p.postcode} · EPC {p.epc ?? "—"}</div>
                      </div>
                      <StatePill meta={RECORD_STATES[p.status]} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
          {tab === "jobs" && (
            <Card title="Jobs">
              {jobs.length === 0 ? <EmptyState title="No jobs yet" body="Create a property, then start a job." /> : (
                <div className="space-y-1">
                  {jobs.map((j) => (
                    <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                      <div>
                        <div className="text-sm font-medium text-foreground">{j.ref} · {j.measure}</div>
                        <div className="text-xs text-ink-muted">Owner · {j.owner} · started {j.startDate}</div>
                      </div>
                      <StatePill meta={JOB_STATES[j.state]} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
          {tab === "documents" && (
            <Card title="Documents">
              <EmptyState title="No documents yet" body="Upload contracts, surveys and EPCs against this customer." />
            </Card>
          )}
          {tab === "audit" && <AuditTimeline entityType="customer" entityId={customer.id} />}
        </div>

        <aside className="space-y-4">
          <AuditTimeline entityType="customer" entityId={customer.id} />
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

void PageHeader;

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, Plus, Building2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { StatePill, RECORD_STATES, JOB_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { useStore, update, nid } from "@/lib/mock/store";
import { findCustomer, propertiesOfCustomer, jobsOfCustomer, fmtDate, pushAudit } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { useAuth } from "@/lib/auth-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/_authed/customers/$id")({
  head: () => ({ meta: [{ title: "Customer — Renewably UK" }] }),
  component: CustomerDetail,
});

type Tab = "overview" | "properties" | "jobs" | "documents" | "audit";

const PROP_TYPES = ["Detached", "Semi-detached", "Terraced", "Flat", "Other"];
const EPC_GRADES = ["A", "B", "C", "D", "E", "F", "G", "Unknown"];

function normalisePostcode(s: string) {
  return s.replace(/\s+/g, "").toLowerCase();
}

function CustomerDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const customer = findCustomer(data, id);
  const [tab, setTab] = useState<Tab>("overview");
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!customer) throw notFound();

  const props = propertiesOfCustomer(data, customer.id);
  const jobs = jobsOfCustomer(data, customer.id);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/customers" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Customers
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Customer · {customer.ref}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
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
            <Card
              title="Properties"
              action={
                <button
                  onClick={() => setSheetOpen(true)}
                  className="press inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                >
                  <Plus className="size-3" /> Add property
                </button>
              }
            >
              {props.length === 0 ? (
                <EmptyState icon={Building2} title="No properties yet" body="Add a property to start a job." />
              ) : (
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

      <AddPropertySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        customerId={customer.id}
      />
    </div>
  );
}

function AddPropertySheet({
  open,
  onOpenChange,
  customerId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customerId: string;
}) {
  const data = useStore();
  const { user } = useAuth();
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [town, setTown] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propType, setPropType] = useState(PROP_TYPES[0]);
  const [epc, setEpc] = useState("Unknown");
  const [uprn, setUprn] = useState("");
  const [duplicate, setDuplicate] = useState<{ id: string; address: string } | null>(null);

  function reset() {
    setLine1(""); setLine2(""); setTown(""); setCounty(""); setPostcode("");
    setPropType(PROP_TYPES[0]); setEpc("Unknown"); setUprn(""); setDuplicate(null);
  }

  function checkDuplicate() {
    if (!postcode) { setDuplicate(null); return; }
    const norm = normalisePostcode(postcode);
    const match = data.properties.find((p) => normalisePostcode(p.postcode) === norm);
    if (match) setDuplicate({ id: match.id, address: match.address });
    else setDuplicate(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!line1 || !town || !postcode) {
      toast.error("Address line 1, town and postcode are required");
      return;
    }
    const address = [line1, line2, town, county].filter(Boolean).join(", ");
    const newId = nid("pro");
    update((d) => {
      d.properties.unshift({
        id: newId,
        customerId,
        address,
        postcode: postcode.toUpperCase(),
        uprn: uprn || undefined,
        epc: epc === "Unknown" ? undefined : epc,
        status: "active",
        createdAt: Date.now(),
      });
      pushAudit(d, "customer", customerId, user.fullName, `Added property ${address}`);
      pushAudit(d, "property", newId, user.fullName, `Created property ${address}`);
    });
    toast.success("Property added");
    onOpenChange(false);
    reset();
  }

  const inputCls =
    "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-[480px]">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold">Add property</SheetTitle>
        </SheetHeader>

        <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <Field label="Address line 1" required>
              <input value={line1} onChange={(e) => setLine1(e.target.value)} className={inputCls} placeholder="14 Birchwood Close" />
            </Field>
            <Field label="Address line 2">
              <input value={line2} onChange={(e) => setLine2(e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Town / City" required>
                <input value={town} onChange={(e) => setTown(e.target.value)} className={inputCls} placeholder="Leeds" />
              </Field>
              <Field label="County">
                <input value={county} onChange={(e) => setCounty(e.target.value)} className={inputCls} placeholder="West Yorkshire" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Postcode" required>
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  onBlur={checkDuplicate}
                  className={inputCls}
                  placeholder="LS8 4NR"
                />
              </Field>
              <Field label="UPRN">
                <input value={uprn} onChange={(e) => setUprn(e.target.value)} className={inputCls} placeholder="Optional" />
              </Field>
            </div>

            {duplicate && (
              <div className="flex items-start gap-2 rounded-lg border border-cat-amber/40 bg-cat-amber-bg/50 px-3 py-2 text-xs text-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-cat-amber" />
                <div className="flex-1">
                  A property at this postcode may already exist —{" "}
                  <span className="font-medium">{duplicate.address}</span>.{" "}
                  <Link
                    to="/properties/$id"
                    params={{ id: duplicate.id }}
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                    onClick={() => onOpenChange(false)}
                  >
                    View →
                  </Link>
                </div>
              </div>
            )}

            <Field label="Property type">
              <select value={propType} onChange={(e) => setPropType(e.target.value)} className={inputCls}>
                {PROP_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="EPC rating">
              <select value={epc} onChange={(e) => setEpc(e.target.value)} className={inputCls}>
                {EPC_GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 border-t bg-background px-5 py-3">
            <button
              type="button"
              onClick={() => { onOpenChange(false); reset(); }}
              className="press rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-surface hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="press rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Add property
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-ink-muted">
        {label}{required && <span className="text-destructive"> *</span>}
      </div>
      {children}
    </label>
  );
}

void PageHeader;

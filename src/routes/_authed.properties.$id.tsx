import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { StatePill, RECORD_STATES, JOB_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { useStore } from "@/lib/mock/store";
import { findProperty, findCustomer, jobsOfProperty } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/properties/$id")({
  head: () => ({ meta: [{ title: "Property — Renewably UK" }] }),
  component: PropertyDetail,
});

function PropertyDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const property = findProperty(data, id);
  if (!property) throw notFound();
  const customer = findCustomer(data, property.customerId);
  const jobs = jobsOfProperty(data, property.id);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <Link to="/properties" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Properties
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Property</div>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight text-ink">
            <MapPin className="size-6 text-cat-teal" /> {property.address}
          </h1>
          <div className="mt-2 text-sm text-ink-muted">
            {property.postcode} · EPC {property.epc ?? "—"} · UPRN {property.uprn ?? "—"}
            {customer && <> · linked to <Link to="/customers/$id" params={{ id: customer.id }} className="text-foreground hover:underline">{customer.name}</Link></>}
          </div>
        </div>
        <StatePill meta={RECORD_STATES[property.status]} />
      </div>

      {property.duplicateFlag && (
        <div className="mt-5 rounded-2xl border border-cat-amber/30 bg-cat-amber-bg/40 p-4 text-sm text-cat-amber">
          <strong className="font-semibold">Duplicate flag.</strong> This address looks similar to another property on file. Verify before issuing an IBG.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-5 py-3 text-sm font-medium">Job history</div>
          <div className="divide-y">
            {jobs.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-ink-muted">No jobs at this property yet.</div>
            ) : jobs.map((j) => (
              <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="flex items-center justify-between px-5 py-3 hover:bg-surface">
                <div>
                  <div className="text-sm font-medium text-foreground">{j.ref} · {j.measure}</div>
                  <div className="text-xs text-ink-muted">Owner · {j.owner} · {j.startDate}</div>
                </div>
                <StatePill meta={JOB_STATES[j.state]} />
              </Link>
            ))}
          </div>
        </div>

        <AuditTimeline entityType="property" entityId={property.id} />
      </div>
    </div>
  );
}

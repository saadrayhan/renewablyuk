import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/admin/audit/$id")({
  head: () => ({ meta: [{ title: "Audit event — Renewably UK" }] }),
  component: AuditDetail,
});

function AuditDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const ev = data.audit.find((a) => a.id === id);
  if (!ev) throw notFound();

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/admin/audit" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Audit logs
      </Link>
      <div className="mt-3">
        <PageHeader eyebrow="Admin · Compliance · Audit" title={ev.action} subtitle={`${ev.entityType} · ${fmtDate(ev.at)}`} />
      </div>

      <section className="mt-6 rounded-2xl border bg-card">
        <header className="border-b px-5 py-3">
          <h2 className="text-base font-semibold text-foreground">Event details</h2>
        </header>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 px-5 py-4 text-sm">
          <Field label="Actor" value={ev.actor} />
          <Field label="Entity type" value={ev.entityType} />
          <Field label="Entity ID" value={ev.entityId} mono />
          <Field label="Timestamp" value={fmtDate(ev.at)} />
          {ev.detail && <div className="col-span-2"><Field label="Detail" value={ev.detail} /></div>}
        </dl>
      </section>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className={`mt-0.5 text-sm font-medium text-foreground ${mono ? "font-mono text-[12px]" : ""}`}>{value}</div>
    </div>
  );
}

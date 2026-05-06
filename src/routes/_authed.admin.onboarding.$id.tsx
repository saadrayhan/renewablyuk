import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/mock/store";
import { fmtDate, findOnboarding } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/admin/onboarding/$id")({
  head: () => ({ meta: [{ title: "Onboarding application — Renewably UK" }] }),
  component: OnboardingDetail,
});

function OnboardingDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const app = findOnboarding(data, id);
  if (!app) throw notFound();

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/admin/onboarding" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Onboarding queue
      </Link>
      <div className="mt-3">
        <PageHeader
          eyebrow="Admin · Operations · Onboarding"
          title={app.companyName}
          subtitle={`${app.tier === "operate" ? "Operate" : "Access"} tier · submitted ${fmtDate(app.submittedAt)}`}
          actions={
            <>
              <Button variant="secondary" size="sm">Reject</Button>
              <Button variant="brand" size="sm">Approve</Button>
            </>
          }
        />
      </div>

      <section className="mt-6 rounded-2xl border bg-card">
        <header className="border-b px-5 py-3"><h2 className="text-base font-semibold text-foreground">Applicant</h2></header>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 px-5 py-4 text-sm md:grid-cols-3">
          <Field label="Contact" value={app.contactName} />
          <Field label="Email" value={app.contactEmail} />
          <Field label="State" value={app.state} />
          <Field label="Companies House #" value={app.companiesHouseNumber ?? "—"} />
          <Field label="Tier" value={app.tier} />
        </dl>
      </section>

      <section className="mt-4 rounded-2xl border bg-card">
        <header className="border-b px-5 py-3"><h2 className="text-base font-semibold text-foreground">Measures requested</h2></header>
        <div className="flex flex-wrap gap-2 px-5 py-4">
          {app.measures.map((m) => (
            <span key={m} className="rounded-full bg-tile px-2.5 py-1 text-xs text-foreground">{m}</span>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border bg-card">
        <header className="border-b px-5 py-3"><h2 className="text-base font-semibold text-foreground">Accreditation files</h2></header>
        <ul className="divide-y">
          {app.accreditationFiles.map((f) => (
            <li key={f} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-foreground">{f}</span>
              <Button variant="ghost" size="sm">Download</Button>
            </li>
          ))}
          {app.accreditationFiles.length === 0 && <li className="px-5 py-6 text-center text-sm text-ink-muted">No files uploaded.</li>}
        </ul>
      </section>

      {app.blockedReason && (
        <div className="mt-4 rounded-2xl border bg-cat-rose-bg px-4 py-3 text-sm text-cat-rose">
          Blocked: {app.blockedReason}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

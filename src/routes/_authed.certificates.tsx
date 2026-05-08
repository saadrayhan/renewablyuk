import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ListRow } from "@/components/app/list-row";
import { SectionHeader } from "@/components/app/section-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatePill } from "@/components/app/state-pill";
import { useStore } from "@/lib/mock/store";
import { useAuth } from "@/lib/auth-context";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/certificates")({
  component: CertificatesPage,
});

function CertificatesPage() {
  const { certificates } = useStore();
  const { user } = useAuth();
  const mine = certificates.filter((c) =>
    c.contractorId.startsWith("contractor.") ? true : c.contractorId === user.id,
  );

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-12">
      <div className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="COMPLIANCE" title="Certificates" />
        <Link
          to="/ibg/new"
          className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" /> New certificate
        </Link>
      </div>

      <SectionHeader title="All certificates" />
      {mine.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          body="Issue your first installation guarantee."
        />
      ) : (
        <ul className="divide-y rounded-2xl border bg-background">
          {mine.map((c) => (
            <li key={c.id}>
              <ListRow
                title={c.ref}
                subtitle={`${c.templateName} · ${c.customerName}`}
                meta={c.propertyAddress}
                right={
                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    {c.issuedAt && <span>Issued {fmtDate(c.issuedAt)}</span>}
                    <StatePill state={c.state} />
                  </div>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

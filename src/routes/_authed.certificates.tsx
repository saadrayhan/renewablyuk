import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionHeader } from "@/components/app/section-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatePill, type StateMeta, type PillTone } from "@/components/app/state-pill";
import { useStore } from "@/lib/mock/store";
import { useAuth } from "@/lib/auth-context";
import { fmtDate } from "@/lib/mock/queries";
import type { CertificateState } from "@/lib/mock/types";

const CERT_STATES: Record<CertificateState, StateMeta> = {
  draft: { label: "Draft", tone: "neutral" },
  pending_review: { label: "Pending review", tone: "warning" },
  issued: { label: "Issued", tone: "active" },
  expiring: { label: "Expiring", tone: "warning" },
  expired: { label: "Expired", tone: "error" },
  revoked: { label: "Revoked", tone: "error" },
};

export const Route = createFileRoute("/_authed/certificates")({
  component: CertificatesPage,
});

function CertificatesPage() {
  const { certificates } = useStore();
  useAuth();
  const mine = certificates;

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-12">
      <div className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="COMPLIANCE" title="Certificates" />
        <Link
          to="/certificates/new"
          className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" /> New certificate
        </Link>
      </div>

      <SectionHeader title="All certificates" />
      {mine.length === 0 ? (
        <EmptyState icon={Award} title="No certificates yet" body="Issue your first installation guarantee." />
      ) : (
        <ul className="divide-y rounded-2xl border bg-background">
          {mine.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-muted">{c.ref}</span>
                  <StatePill meta={CERT_STATES[c.state]} />
                </div>
                <div className="mt-0.5 truncate text-sm font-medium">{c.templateName} · {c.customerName}</div>
                <div className="truncate text-xs text-ink-muted">{c.propertyAddress}</div>
              </div>
              <div className="shrink-0 text-right text-xs text-ink-muted">
                {c.issuedAt ? `Issued ${fmtDate(c.issuedAt)}` : "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// satisfy lint
void ({} as PillTone);


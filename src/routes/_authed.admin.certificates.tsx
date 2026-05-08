import { createFileRoute } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionHeader } from "@/components/app/section-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatePill, type StateMeta } from "@/components/app/state-pill";
import { useStore } from "@/lib/mock/store";
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

export const Route = createFileRoute("/_authed/admin/certificates")({
  component: AdminCertsPage,
});

function AdminCertsPage() {
  const { certificates } = useStore();

  return (
    <div className="space-y-6 px-6 py-8 md:px-10 md:py-12">
      <PageHeader eyebrow="COMPLIANCE" title="Certificate registry" />
      <SectionHeader title={`${certificates.length} certificates`} />
      {certificates.length === 0 ? (
        <EmptyState icon={Award} title="No certificates" />
      ) : (
        <ul className="divide-y rounded-2xl border bg-background">
          {certificates.map((c) => (
            <li key={c.id} className="grid grid-cols-[100px_1fr_180px_120px] items-center gap-4 px-4 py-3 text-sm">
              <span className="font-mono text-xs text-ink-muted">{c.ref}</span>
              <div>
                <div className="font-medium">{c.templateName}</div>
                <div className="text-xs text-ink-muted">{c.contractorName} · {c.customerName}</div>
              </div>
              <span className="text-xs text-ink-muted">{c.issuedAt ? fmtDate(c.issuedAt) : "—"}</span>
              <StatePill meta={CERT_STATES[c.state]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

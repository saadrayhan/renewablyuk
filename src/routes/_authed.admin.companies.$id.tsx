import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { LockedCard } from "@/components/app/locked-card";
import { StatePill, RISK_STATES } from "@/components/app/state-pill";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/admin/companies/$id")({
  head: () => ({ meta: [{ title: "Company — Renewably UK" }] }),
  component: CompanyDetailPage,
});

type Tab = "overview" | "users" | "billing" | "risk" | "activity";

function CompanyDetailPage() {
  const { id } = Route.useParams();
  const data = useStore();
  const { permissions } = useDevRole();
  const [tab, setTab] = useState<Tab>("overview");

  if (!can(permissions, "users.read")) {
    return <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10"><LockedCard title="Company" reason={{ kind: "permission", permission: "users.read" }} /></div>;
  }

  const co = data.users.find((u) => u.id === id);
  if (!co) return <div className="mx-auto max-w-2xl px-4 py-10 text-sm text-ink-muted">Company not found.</div>;

  const isLtd = co.entityType === "limited";
  const membership = co.role === "installer-operate" ? "Operate" : "Access";
  const state = co.accountRiskState ?? "active";
  const ibgs = data.ibgs.slice(0, 5);
  const audit = data.activity.filter((a) => a.target.includes(co.name) || a.actor === co.name).slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <Link to="/admin/companies" className="press inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3" /> All companies
      </Link>
      <PageHeader
        eyebrow="Admin · Company"
        title={co.name}
        subtitle={`${isLtd ? "Limited Company" : "Sole Trader"} · ${membership} plan`}
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link to="/admin/risk/$id" params={{ id: co.id }}>View risk</Link>
          </Button>
        }
      />

      <UnderlineTabs<Tab>
        value={tab} onChange={setTab}
        options={[
          { value: "overview", label: "Overview" },
          { value: "users", label: "Users" },
          { value: "billing", label: "Billing" },
          { value: "risk", label: "Risk" },
          { value: "activity", label: "Activity" },
        ]}
      />

      <div className="rounded-2xl border bg-card p-6">
        {tab === "overview" && (
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm md:grid-cols-3">
            <Field label="Legal name" value={co.name} />
            <Field label="Business type" value={isLtd ? "Limited Company" : "Sole Trader"} />
            <Field label="Membership" value={membership} />
            <Field label="Account state" value={<StatePill meta={RISK_STATES[state]} />} />
            <Field label="Primary contact" value={co.name} />
            <Field label="Email" value={co.email} />
            <Field label="Status" value={co.status} />
            <Field label="Invited" value={fmtDate(co.invitedAt)} />
            <Field label="Last active" value={co.lastActive ? fmtDate(co.lastActive) : "—"} />
          </dl>
        )}
        {tab === "users" && (
          <div className="divide-y">
            {data.users.filter((u) => u.role !== "admin").slice(0, 4).map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <div className="text-sm font-medium text-foreground">{u.name}</div>
                  <div className="text-[11px] text-ink-muted">{u.email} · {u.role}</div>
                </div>
                <span className="text-[11px] text-ink-muted">{u.status}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "billing" && (
          <div className="space-y-3">
            <Row label="Plan" value={membership} />
            <Row label="Status" value="Active" />
            <Row label="Next renewal" value="29 May 2026" />
            <Row label="Stripe customer" value={`cus_${co.id.slice(0, 8)}`} />
            <div className="pt-2">
              <Button variant="secondary" size="sm" asChild>
                <Link to="/admin/stripe-events">View Stripe events</Link>
              </Button>
            </div>
          </div>
        )}
        {tab === "risk" && (
          <div className="space-y-3">
            <Row label="Current state" value={<StatePill meta={RISK_STATES[state]} />} />
            <Row label="Active overrides" value={String(data.riskOverrides.filter((o) => o.organisationId === co.id && o.active).length)} />
            <Row label="Recent signals" value={String(data.riskAssessments.filter((r) => r.organisationId === co.id).length)} />
            <div className="pt-2">
              <Button variant="brand" size="sm" asChild>
                <Link to="/admin/risk/$id" params={{ id: co.id }}>Open risk profile</Link>
              </Button>
            </div>
          </div>
        )}
        {tab === "activity" && (
          audit.length === 0 ? <EmptyState title="No activity" body="No recent events for this company." /> : (
            <ol className="space-y-3">
              {audit.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 rounded-full bg-foreground" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">{a.actor}</span>{" "}
                    <span className="text-ink-muted">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </div>
                  <span className="text-[11px] text-ink-muted">{fmtDate(a.at)}</span>
                </li>
              ))}
            </ol>
          )
        )}
      </div>

      {tab === "overview" && ibgs.length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent IBGs</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/ibg/repository">View all →</Link>
            </Button>
          </div>
          <ul className="mt-3 divide-y">
            {ibgs.map((ibg) => (
              <li key={ibg.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-mono text-[12px]">{ibg.ref}</span>
                <span className="text-ink-muted">{ibg.customerName}</span>
                <span className="text-[11px] text-ink-muted">{ibg.issuedAt ? fmtDate(ibg.issuedAt) : "—"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{typeof value === "string" ? value : value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

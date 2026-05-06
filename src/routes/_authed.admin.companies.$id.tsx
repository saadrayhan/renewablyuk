import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { LockedCard } from "@/components/app/locked-card";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

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

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-6 md:px-8 md:py-10">
      <Link to="/admin/companies" className="press inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3" /> All companies
      </Link>
      <PageHeader eyebrow="Admin · Company" title={co.name} subtitle={`${isLtd ? "Limited Company" : "Sole Trader"} · ${membership} plan`} />

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
            <Field label="Account state" value={co.accountRiskState ?? "active"} />
            <Field label="Primary contact" value={co.fullName} />
            <Field label="Email" value={co.email} />
          </dl>
        )}
        {tab !== "overview" && (
          <div className="py-12 text-center text-sm text-ink-muted">
            {tab === "users" && "Team members and their granted permissions will appear here."}
            {tab === "billing" && "Subscription, invoices and Stripe customer details will appear here."}
            {tab === "risk" && "Companies House signals, risk timeline and overrides will appear here."}
            {tab === "activity" && "Audit feed for this company will appear here."}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{String(value)}</div>
    </div>
  );
}

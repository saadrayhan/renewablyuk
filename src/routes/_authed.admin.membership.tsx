import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/admin/membership")({
  head: () => ({ meta: [{ title: "Membership & Billing — Renewably UK" }] }),
  component: MembershipPage,
});

const SUBS = [
  { co: "GreenSpark Installations", level: "Operate", status: "Active", last: "15 Feb 2026", next: "15 Mar 2026", fails: 0, action: "View Details" },
  { co: "EcoFuture Energy Ltd", level: "Access", status: "Past Due", last: "01 Feb 2026", next: "01 Mar 2026", fails: 2, action: "View Details · Retry Payment" },
  { co: "SolarGrid UK Ltd", level: "Operate", status: "Suspended", last: "10 Jan 2026", next: "—", fails: 3, action: "View Details · Reactivate" },
];

const EVENTS = [
  { ts: "15 Feb 2026 10:02", type: "invoice.payment_succeeded", status: "Success", customer: "GreenSpark Installations", details: "£99" },
  { ts: "01 Feb 2026 09:15", type: "invoice.payment_failed", status: "Failed", customer: "EcoFuture Energy Ltd", details: "£99" },
  { ts: "10 Jan 2026 08:45", type: "customer.subscription.deleted", status: "Success", customer: "SolarGrid UK Ltd", details: "—" },
];

function statusCls(s: string) {
  if (s === "Active" || s === "Success") return "bg-cat-green-bg text-cat-green";
  if (s === "Past Due") return "bg-cat-amber-bg text-cat-amber";
  return "bg-cat-rose-bg text-cat-rose";
}

function MembershipPage() {
  const { permissions } = useDevRole();
  if (!can(permissions, "users.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Membership & Billing" reason={{ kind: "permission", permission: "users.read" }} />
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10 space-y-6">
      <PageHeader
        eyebrow="Admin · Companies & Users"
        title="Membership & Billing"
        subtitle="Manage company membership levels, subscription status, and billing activity via Stripe integration."
        actions={<span className="rounded-full bg-cat-purple-bg px-2 py-0.5 text-[11px] font-medium text-cat-purple">Admin only</span>}
      />

      <div className="rounded-2xl border bg-card p-5">
        <div className="text-sm font-medium text-foreground">Current Status</div>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
          <Field label="Company" value="GreenSpark Installations" />
          <Field label="Membership Level" value="Operate" />
          <Field label="Subscription Status" value={<span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-[11px] font-medium text-cat-green">Active</span>} />
          <Field label="Stripe Customer ID" value={<span className="font-mono text-[11px]">cus_xxxxxxxx</span>} />
          <Field label="Current Plan" value="Operate Plan — Monthly" />
          <Field label="Next Billing Date" value="15 Mar 2026" />
          <Field label="Last Payment" value="15 Feb 2026 — Successful" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Active Subscriptions" value={24} tone="" />
        <Metric label="Past Due" value={3} tone="text-cat-amber" />
        <Metric label="Failed Payments" value={2} tone="text-cat-rose" />
        <Metric label="Suspended Accounts" value={1} tone="text-cat-rose" />
      </div>

      <div className="rounded-2xl border bg-surface/50 p-4 text-xs text-ink-muted">
        All billing operations are synced with Stripe and controlled via webhook events. Subscription status controls platform access.
      </div>

      <Section title="Subscriptions">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              <th className="px-4 py-2.5 text-left">Company</th>
              <th className="px-4 py-2.5 text-left">Membership</th>
              <th className="px-4 py-2.5 text-left">Status</th>
              <th className="px-4 py-2.5 text-left">Last Payment</th>
              <th className="px-4 py-2.5 text-left">Next Billing</th>
              <th className="px-4 py-2.5 text-left">Failures</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {SUBS.map((s) => (
              <tr key={s.co} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{s.co}</td>
                <td className="px-4 py-3">{s.level}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCls(s.status)}`}>{s.status}</span></td>
                <td className="px-4 py-3 text-ink-muted">{s.last}</td>
                <td className="px-4 py-3 text-ink-muted">{s.next}</td>
                <td className="px-4 py-3 tabular-nums">{s.fails}</td>
                <td className="px-4 py-3 text-right text-xs text-ink-muted">{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Stripe Events Log" subtitle="Track Stripe webhook events and billing activity">
        <EventsTable />
      </Section>
    </div>
  );
}

export function EventsTable({ rows = EVENTS }: { rows?: typeof EVENTS }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          <th className="px-4 py-2.5 text-left">Timestamp</th>
          <th className="px-4 py-2.5 text-left">Event Type</th>
          <th className="px-4 py-2.5 text-left">Status</th>
          <th className="px-4 py-2.5 text-left">Customer</th>
          <th className="px-4 py-2.5 text-left">Details</th>
          <th className="px-4 py-2.5 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((e) => (
          <tr key={e.ts + e.type} className="border-b last:border-b-0">
            <td className="px-4 py-3 text-ink-muted">{e.ts}</td>
            <td className="px-4 py-3 font-mono text-[11px]">{e.type}</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCls(e.status)}`}>{e.status}</span></td>
            <td className="px-4 py-3">{e.customer}</td>
            <td className="px-4 py-3 text-ink-muted">{e.details}</td>
            <td className="px-4 py-3 text-right text-xs text-ink-muted">View</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${tone || "text-ink"}`}>{value}</div>
    </div>
  );
}
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="border-b px-5 py-3">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {subtitle && <div className="text-[11px] text-ink-muted">{subtitle}</div>}
      </div>
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

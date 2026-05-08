import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { SectionHeader } from "@/components/app/section-header";
import { useStore } from "@/lib/mock/store";
import { useMembership } from "@/lib/membership";
import { fmtDate } from "@/lib/mock/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/membership")({
  component: MembershipPage,
});

function MembershipPage() {
  const { invoices } = useStore();
  const { tier, activationState } = useMembership();
  const myInvoices = invoices;

  return (
    <div className="space-y-8 px-6 py-8 md:px-10 md:py-12">
      <PageHeader eyebrow="BILLING" title="Membership" />

      <div className="rounded-2xl border bg-background p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-ink-muted">Current plan</div>
            <div className="mt-1 text-3xl font-semibold capitalize">{tier}</div>
            <div className="mt-1 text-sm text-ink-muted">Status: {activationState}</div>
          </div>
          <button className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {tier === "access" ? "Upgrade to Operate" : "Manage subscription"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlanCard
          name="Access"
          price="Free"
          features={["Standalone IBG generator", "Limited certificate history", "5-condition activation"]}
          current={tier === "access"}
        />
        <PlanCard
          name="Operate"
          price="£99/mo"
          features={["Full project pipeline", "Funding match + submission", "Kanban projects", "Priority support"]}
          current={tier === "operate"}
          highlighted
        />
      </div>

      <div>
        <SectionHeader title="Invoices" />
        <ul className="mt-3 divide-y rounded-2xl border bg-background">
          {myInvoices.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <div className="font-mono text-xs text-ink-muted">{inv.ref}</div>
                <div className="font-medium">{inv.description}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">£{inv.amountGbp.toFixed(2)}</div>
                <div className="text-xs text-ink-muted">{fmtDate(inv.issuedAt)} · {inv.state}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  current,
  highlighted,
}: {
  name: string;
  price: string;
  features: string[];
  current: boolean;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6",
        highlighted ? "border-primary bg-primary/5" : "bg-background",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-ink-muted">{name}</div>
          <div className="mt-1 text-3xl font-semibold">{price}</div>
        </div>
        {current && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            Current
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

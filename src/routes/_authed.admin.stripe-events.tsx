import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { FilterPills } from "@/components/app/filter-pills";
import { EventsTable } from "./_authed.admin.membership";

export const Route = createFileRoute("/_authed/admin/stripe-events")({
  head: () => ({ meta: [{ title: "Stripe Events — Renewably UK" }] }),
  component: StripeEventsPage,
});

type F = "succeeded" | "failed" | "subscription" | "refunds";

function StripeEventsPage() {
  const [f, setF] = useState<F | "all">("all");
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5 px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Integrations"
        title="Stripe Events"
        subtitle="Monitor Stripe webhook events and payment activity."
      />
      <FilterPills<F>
        value={f}
        onChange={setF}
        options={[
          { value: "succeeded", label: "Payment Succeeded" },
          { value: "failed", label: "Payment Failed" },
          { value: "subscription", label: "Subscription Events" },
          { value: "refunds", label: "Refunds" },
        ]}
      />
      <div className="overflow-hidden rounded-2xl border bg-card">
        <EventsTable />
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/admin/crm")({
  head: () => ({ meta: [{ title: "CRM / HubSpot — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Admin · Integrations"
      title="CRM / HubSpot"
      body="Two-way sync of customers, jobs and activity with HubSpot. Coming soon."
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/admin/audit")({
  head: () => ({ meta: [{ title: "Audit log — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Admin · Compliance"
      title="Audit log"
      body="Every action across the platform. Filter by actor, event type, target entity. Export to CSV for compliance reviews."
    />
  ),
});

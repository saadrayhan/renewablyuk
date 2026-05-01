import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/admin/activity")({
  head: () => ({ meta: [{ title: "Activity feed — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Admin · Compliance"
      title="Activity feed"
      body="Real-time stream of platform events. Jump straight to the affected record."
    />
  ),
});

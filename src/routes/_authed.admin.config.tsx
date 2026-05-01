import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/admin/config")({
  head: () => ({ meta: [{ title: "System config — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Admin · System"
      title="System configuration"
      body="Platform settings, approved measure types, notification templates, scheme integrations."
    />
  ),
});

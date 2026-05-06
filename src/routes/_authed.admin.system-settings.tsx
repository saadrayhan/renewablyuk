import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/admin/system-settings")({
  head: () => ({ meta: [{ title: "System Settings — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Admin · System"
      title="System Settings"
      body="Platform-wide defaults, retention policy, and environment toggles. Coming soon."
    />
  ),
});

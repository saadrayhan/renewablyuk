import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/settings/profile")({
  head: () => ({ meta: [{ title: "Profile — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Settings"
      title="Profile"
      body="Manage your name, email, password and security settings."
    />
  ),
});

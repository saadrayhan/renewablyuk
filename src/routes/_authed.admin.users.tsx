import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/admin/users")({
  head: () => ({ meta: [{ title: "Users — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Admin · Users"
      title="User directory"
      body="Invite users, assign roles, and grant permissions from the library. Operators can request access — you approve here."
    />
  ),
});

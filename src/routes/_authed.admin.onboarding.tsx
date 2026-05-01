import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/admin/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding queue — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Admin · Onboarding"
      title="Onboarding queue"
      body="Accounts in the pipeline — Companies House lookup, accreditation upload, payment, review. Override blocks and activate."
    />
  ),
});

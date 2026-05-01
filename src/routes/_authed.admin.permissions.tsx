import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/admin/permissions")({
  head: () => ({ meta: [{ title: "Permission library — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Admin · System"
      title="Permission library"
      body="The catalogue of capabilities you can assign to users. Includes presets (Junior Operator, Senior Operator, Compliance Reviewer) plus the full fine-grained matrix."
    />
  ),
});

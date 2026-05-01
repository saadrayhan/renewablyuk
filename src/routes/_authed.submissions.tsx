import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/submissions")({
  head: () => ({ meta: [{ title: "Submissions — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Submissions"
      title="Scheme submissions"
      body="Every formal submission to a government funding scheme. Created automatically when a funding project is submitted."
    />
  ),
});

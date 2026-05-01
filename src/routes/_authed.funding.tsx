import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/funding")({
  head: () => ({ meta: [{ title: "Funding — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Funding"
      title="Funding hub"
      body="Match Hub · Project list · Per-project workflow. Schemes you actually qualify for, scored against your approved measures and geography."
    />
  ),
});

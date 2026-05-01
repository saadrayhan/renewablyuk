import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/ibg/history")({
  head: () => ({ meta: [{ title: "IBG history — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="IBG"
      title="IBG history"
      body="Your issued IBGs will appear here. Filter by customer, status and date — and re-download any certificate."
    />
  ),
});

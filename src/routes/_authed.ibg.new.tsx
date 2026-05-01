import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/ibg/new")({
  head: () => ({ meta: [{ title: "New IBG — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="IBG"
      title="Issue a new IBG"
      body="The IBG generation form ships in the next build. You'll be able to pick a customer + property, choose measures, and download the certificate and policy PDF in one step."
    />
  ),
});

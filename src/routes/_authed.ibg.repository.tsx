import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/ibg/repository")({
  head: () => ({ meta: [{ title: "IBG Repository — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="IBG"
      title="IBG Repository"
      body="Searchable record store of every issued IBG. Filter by reference, customer, address, state. Amendment + cancellation flows live here."
    />
  ),
});

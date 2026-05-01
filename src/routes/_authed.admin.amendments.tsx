import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/admin/amendments")({
  head: () => ({ meta: [{ title: "IBG amendments — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Admin · IBG"
      title="Amendment requests"
      body="Pending IBG amendment requests from Operate installers. Review original vs requested change side by side, approve or reject with reason."
    />
  ),
});

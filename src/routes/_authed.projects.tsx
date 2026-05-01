import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authed/projects")({
  head: () => ({ meta: [{ title: "Projects — Renewably UK" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Projects"
      title="Customers, Properties & Jobs"
      body="One unified record chain — Customer → Property → Job. The full project hub ships in the next pass with the right-rail audit timeline."
    />
  ),
});

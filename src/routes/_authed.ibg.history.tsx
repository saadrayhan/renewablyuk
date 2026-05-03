import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/ibg/history")({
  beforeLoad: () => {
    throw redirect({ to: "/ibg/repository", search: { view: "history" } as never });
  },
  component: () => null,
});

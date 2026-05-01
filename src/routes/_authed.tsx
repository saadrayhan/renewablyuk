import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/app-sidebar";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  // Backend disabled — auth bypassed for design preview.
  const tier = "access" as const;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar tier={tier} />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}

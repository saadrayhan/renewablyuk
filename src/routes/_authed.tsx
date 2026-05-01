import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MiniRail } from "@/components/app/shell/mini-rail";
import { SidePanel } from "@/components/app/shell/side-panel";
import { TopBar } from "@/components/app/shell/top-bar";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const hydrated = useHydrated();
  return (
    <div className="flex min-h-screen w-full bg-background">
      <MiniRail />
      <SidePanel />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex-1">
          {hydrated ? <Outlet /> : <div className="h-full w-full" />}
        </div>
      </main>
    </div>
  );
}

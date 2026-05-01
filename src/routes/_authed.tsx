import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/shell/app-sidebar";
import { TopBar } from "@/components/app/shell/top-bar";
import { SidebarProvider } from "@/components/app/shell/sidebar-context";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const hydrated = useHydrated();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <div className="flex-1">
            {hydrated ? <Outlet /> : <div className="h-full w-full" />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

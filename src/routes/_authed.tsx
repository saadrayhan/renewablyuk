import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/shell/app-sidebar";
import { TopBar } from "@/components/app/shell/top-bar";
import { SidebarProvider } from "@/components/app/shell/sidebar-context";
import { CommandPaletteProvider } from "@/components/app/command-palette";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const hydrated = useHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <SidebarProvider>
      <CommandPaletteProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <div className="flex-1">
              {hydrated ? (
                <div
                  key={pathname}
                  className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200"
                >
                  <Outlet />
                </div>
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          </main>
        </div>
      </CommandPaletteProvider>
    </SidebarProvider>
  );
}

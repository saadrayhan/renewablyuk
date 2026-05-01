import { useEffect } from "react";
import {
  createFileRoute,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { AppSidebar } from "@/components/app/app-sidebar";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.navigate({ to: "/sign-in" });
    }
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  // Tier will eventually come from a profile/membership query.
  // V1 starting state: all new accounts start on Access.
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

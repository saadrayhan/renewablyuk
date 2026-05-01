import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { User, Bell, CreditCard, Wrench, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "Settings — Renewably UK" }] }),
  component: SettingsLayout,
});

function SettingsLayout() {
  const loc = useLocation();
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  // Subscription is only relevant for paid installer tier — admins and read-only never pay.
  const showSubscription = user.role === "installer-operate";

  const items = [
    { to: "/settings/profile", label: "Profile", icon: User, show: true },
    { to: "/settings/notifications", label: "Notifications", icon: Bell, show: true },
    { to: "/settings/subscription", label: "Subscription", icon: CreditCard, show: showSubscription },
    { to: "/settings/integrations", label: "Integrations", icon: Plug, show: isAdmin || user.role === "installer-operate" },
    { to: "/settings/measures", label: "Measures", icon: Wrench, show: true },
  ].filter((i) => i.show);

  // /settings root → redirect to profile via showing the profile content.
  const onRoot = loc.pathname === "/settings";

  return (
    <div className="mx-auto w-full max-w-[1100px] px-8 py-10">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
        Workspace
      </div>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Settings</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const active = loc.pathname === it.to || (onRoot && it.to === "/settings/profile");
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-muted text-ink"
                    : "text-ink-muted hover:bg-muted/40 hover:text-ink",
                )}
              >
                <Icon className="size-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">
          {onRoot ? <SettingsHome /> : <Outlet />}
        </div>
      </div>
    </div>
  );
}

function SettingsHome() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink">Welcome</h2>
      <p className="mt-2 text-sm text-ink-muted">
        Pick a section on the left to manage your account, notifications, billing and approved measures.
      </p>
    </div>
  );
}

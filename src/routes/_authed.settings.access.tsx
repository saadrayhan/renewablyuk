/**
 * /settings/access — operator's read-only view of their own role,
 * granted permissions, and pending requests.
 */

import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Lock, Clock } from "lucide-react";
import { useDevRole } from "@/lib/dev-role";
import { PERMISSIONS, PERMISSION_CATEGORIES, ROLE_META } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/settings/access")({
  head: () => ({ meta: [{ title: "My access — Renewably UK" }] }),
  component: MyAccess,
});

function MyAccess() {
  const { role, permissions, pendingPermissionRequests } = useDevRole();
  const meta = ROLE_META[role];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-cat-purple-bg text-cat-purple">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{meta.label}</div>
            <div className="text-xs text-ink-muted">{meta.description}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat label="Granted" value={permissions.length} />
          <Stat label="Pending" value={pendingPermissionRequests.length} />
          <Stat label="Available" value={PERMISSIONS.length} />
        </div>
      </div>

      {pendingPermissionRequests.length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="size-4 text-cat-amber" /> Pending requests
          </div>
          <div className="mt-3 space-y-1.5">
            {pendingPermissionRequests.map((p) => {
              const def = PERMISSIONS.find((x) => x.id === p);
              return (
                <div key={p} className="flex items-center justify-between rounded-xl border bg-surface/40 px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium text-foreground">{def?.label ?? p}</div>
                    <div className="text-xs text-ink-muted">{def?.description}</div>
                  </div>
                  <span className="rounded-full bg-cat-amber-bg px-2 py-0.5 text-[11px] font-medium text-cat-amber">Awaiting admin</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card">
        <div className="border-b px-5 py-3 text-sm font-medium text-foreground">Permissions by area</div>
        <div className="divide-y">
          {PERMISSION_CATEGORIES.map((cat) => {
            const perms = PERMISSIONS.filter((p) => p.category === cat);
            const granted = perms.filter((p) => permissions.includes(p.id));
            return (
              <div key={cat} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">{cat}</div>
                  <span className="text-[11px] text-ink-muted">{granted.length} of {perms.length}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {perms.map((p) => {
                    const has = permissions.includes(p.id);
                    return (
                      <span
                        key={p.id}
                        className={
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] " +
                          (has
                            ? "bg-cat-green-bg text-cat-green"
                            : "border bg-background text-ink-muted")
                        }
                      >
                        {!has && <Lock className="size-2.5" />}
                        {p.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Need more access? Click the lock icon on any feature to request it from your admin.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface/60 px-3 py-3">
      <div className="text-xl font-semibold text-foreground">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</div>
    </div>
  );
}

/**
 * Inline lock card. Used wherever a feature is gated by a permission,
 * tier, or onboarding state. Operators see a "Request access" button
 * that fires the permission-request flow handled by DevRoleProvider.
 */

import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useDevRole } from "@/lib/dev-role";
import { PERMISSIONS, type Permission } from "@/lib/rbac";

export type LockReason =
  | { kind: "permission"; permission: Permission }
  | { kind: "tier"; required: "operate" }
  | { kind: "onboarding" }
  | { kind: "role"; required: "admin" }
  | { kind: "measure" };

export function LockedCard({
  title,
  body,
  reason,
}: {
  title: string;
  body?: string;
  reason: LockReason;
}) {
  const { role, requestPermission, pendingPermissionRequests } = useDevRole();
  const reasonText = describe(reason);
  const isOperator = role === "operator";
  const isPermissionLock = reason.kind === "permission";
  const alreadyRequested =
    isPermissionLock &&
    pendingPermissionRequests.includes(reason.permission);

  return (
    <div className="rounded-2xl border border-dashed bg-surface/60 p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-background text-ink-muted">
          <Lock className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {body && (
            <p className="mt-1 text-sm text-ink-muted">{body}</p>
          )}
          <div className="mt-2 inline-flex items-center rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium text-ink-muted">
            {reasonText}
          </div>
        </div>
        {isOperator && isPermissionLock && (
          <button
            type="button"
            disabled={alreadyRequested}
            onClick={() => {
              requestPermission(reason.permission);
              toast.success("Request sent to admin", {
                description: PERMISSIONS.find((p) => p.id === reason.permission)?.label,
              });
            }}
            className="press shrink-0 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
          >
            {alreadyRequested ? "Requested" : "Request access"}
          </button>
        )}
      </div>
    </div>
  );
}

function describe(r: LockReason): string {
  switch (r.kind) {
    case "permission": {
      const def = PERMISSIONS.find((p) => p.id === r.permission);
      return `Permission required · ${def?.label ?? r.permission}`;
    }
    case "tier":
      return "Operate plan required";
    case "onboarding":
      return "Finish onboarding to unlock";
    case "role":
      return r.required === "admin" ? "Admin role required" : "Role required";
    case "measure":
      return "Measure not approved";
  }
}

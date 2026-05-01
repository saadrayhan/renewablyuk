/**
 * Dev role switcher — floating bottom-right control.
 * Lets you preview every persona, every onboarding state, and toggle
 * any individual permission (especially useful for Operators).
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ShieldHalf,
  Sparkles,
  X,
  Settings2,
  RotateCcw,
} from "lucide-react";
import { useDevRole, type OnboardingStep } from "@/lib/dev-role";
import {
  DEFAULT_PERMISSIONS,
  OPERATOR_PRESETS,
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  ROLE_META,
  type PermissionCategory,
  type Role,
} from "@/lib/rbac";
import { cn } from "@/lib/utils";

const ROLES: Role[] = [
  "admin",
  "operator",
  "installer-access",
  "installer-operate",
  "readonly",
];

const ONBOARDING_STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "complete", label: "Complete" },
  { id: "signup", label: "Sign-up" },
  { id: "verify-email", label: "Verify email" },
  { id: "company", label: "Company" },
  { id: "measures", label: "Measures" },
  { id: "accreditation", label: "Accreditation" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export function DevSwitcher() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"role" | "perms">("role");
  const {
    role,
    permissions,
    onboardingStep,
    pendingPermissionRequests,
    setRole,
    setOnboardingStep,
    togglePermission,
    setPermissions,
    approvePermissionRequest,
    reset,
  } = useDevRole();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-[0_8px_24px_-8px_oklch(0_0_0/0.2)]"
      >
        <Sparkles className="size-3.5 text-cat-purple" />
        <span>{ROLE_META[role].short}</span>
        {pendingPermissionRequests.length > 0 && (
          <span className="grid size-4 place-items-center rounded-full bg-cat-amber-bg text-[10px] font-semibold text-cat-amber">
            {pendingPermissionRequests.length}
          </span>
        )}
        <ChevronUp className="size-3.5 text-ink-muted" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-h-[80vh] w-[360px] flex-col overflow-hidden rounded-2xl border bg-background shadow-[0_24px_48px_-16px_oklch(0_0_0/0.25)]">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex items-center gap-2">
          <ShieldHalf className="size-4 text-cat-purple" />
          <div className="text-sm font-medium">Preview as</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={reset}
            className="press grid size-7 place-items-center rounded-md text-ink-muted hover:bg-surface"
            title="Reset"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="press grid size-7 place-items-center rounded-md text-ink-muted hover:bg-surface"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex border-b text-xs">
        <TabButton active={tab === "role"} onClick={() => setTab("role")}>
          Role &amp; state
        </TabButton>
        <TabButton active={tab === "perms"} onClick={() => setTab("perms")}>
          Permissions
          <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-surface px-1 text-[10px] text-ink-muted">
            {permissions.length}
          </span>
        </TabButton>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {tab === "role" ? (
          <>
            <SectionLabel>Role</SectionLabel>
            <div className="grid grid-cols-1 gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "press flex items-start gap-2 rounded-xl border bg-background px-2.5 py-2 text-left transition-colors",
                    role === r
                      ? "border-foreground bg-surface"
                      : "border-transparent hover:bg-surface",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 size-1.5 shrink-0 rounded-full",
                      r === "admin" && "bg-cat-purple",
                      r === "operator" && "bg-cat-green",
                      r === "installer-access" && "bg-cat-amber",
                      r === "installer-operate" && "bg-cat-blue",
                      r === "readonly" && "bg-ink-muted",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-foreground">
                      {ROLE_META[r].label}
                    </div>
                    <div className="text-[11px] leading-snug text-ink-muted">
                      {ROLE_META[r].description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <SectionLabel className="mt-4">Onboarding state</SectionLabel>
            <div className="flex flex-wrap gap-1">
              {ONBOARDING_STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setOnboardingStep(s.id)}
                  className={cn(
                    "press rounded-full border px-2.5 py-1 text-[11px]",
                    onboardingStep === s.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-ink-muted hover:bg-surface",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-muted">
              Drives where the installer lands and which gates appear.
            </p>
          </>
        ) : (
          <PermissionsTab
            role={role}
            permissions={permissions}
            pending={pendingPermissionRequests}
            onToggle={togglePermission}
            onSetAll={setPermissions}
            onApprove={approvePermissionRequest}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-ink-muted">
        <span>Backend disabled · preview only</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="press inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-surface"
        >
          Hide <ChevronDown className="size-3" />
        </button>
      </div>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press flex flex-1 items-center justify-center gap-1 px-3 py-2 text-xs font-medium",
        active
          ? "border-b-2 border-foreground text-foreground"
          : "border-b-2 border-transparent text-ink-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PermissionsTab({
  role,
  permissions,
  pending,
  onToggle,
  onSetAll,
  onApprove,
}: {
  role: Role;
  permissions: import("@/lib/rbac").Permission[];
  pending: import("@/lib/rbac").Permission[];
  onToggle: (p: import("@/lib/rbac").Permission) => void;
  onSetAll: (p: import("@/lib/rbac").Permission[]) => void;
  onApprove: (p: import("@/lib/rbac").Permission) => void;
}) {
  return (
    <>
      {pending.length > 0 && (
        <div className="mb-3 rounded-xl border border-cat-amber/40 bg-cat-amber-bg/40 p-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-cat-amber">
            <Settings2 className="size-3" />
            Pending requests ({pending.length})
          </div>
          <div className="space-y-1">
            {pending.map((p) => {
              const def = PERMISSIONS.find((x) => x.id === p);
              return (
                <div key={p} className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] text-foreground">
                    {def?.label ?? p}
                  </span>
                  <button
                    type="button"
                    onClick={() => onApprove(p)}
                    className="press shrink-0 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background"
                  >
                    Approve
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {role === "operator" && (
        <>
          <SectionLabel>Quick presets</SectionLabel>
          <div className="mb-3 grid grid-cols-1 gap-1.5">
            {OPERATOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSetAll(preset.permissions)}
                className="press rounded-lg border bg-background px-2.5 py-1.5 text-left hover:bg-surface"
              >
                <div className="text-[11px] font-medium text-foreground">
                  {preset.label}
                  <span className="ml-1.5 text-ink-muted">
                    ({preset.permissions.length})
                  </span>
                </div>
                <div className="text-[10px] leading-snug text-ink-muted">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mb-2 flex items-center justify-between">
        <SectionLabel className="mb-0">Library</SectionLabel>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onSetAll(DEFAULT_PERMISSIONS[role])}
            className="press rounded-full border px-2 py-0.5 text-[10px] text-ink-muted hover:bg-surface"
          >
            Defaults
          </button>
          <button
            type="button"
            onClick={() => onSetAll([])}
            className="press rounded-full border px-2 py-0.5 text-[10px] text-ink-muted hover:bg-surface"
          >
            Clear
          </button>
        </div>
      </div>

      {PERMISSION_CATEGORIES.map((cat) => {
        const items = PERMISSIONS.filter((p) => p.category === cat);
        return (
          <div key={cat} className="mb-2.5">
            <div className="mb-1 text-[10px] font-medium text-ink-muted">
              {cat as PermissionCategory}
            </div>
            <div className="space-y-0.5">
              {items.map((p) => {
                const checked = permissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(p.id)}
                      className="mt-0.5 size-3 accent-foreground"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-foreground">{p.label}</div>
                      <div className="truncate font-mono text-[10px] text-ink-muted">
                        {p.id}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

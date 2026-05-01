import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Library, UserPlus, Check, X, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import {
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  OPERATOR_PRESETS,
  ROLE_META,
  type Permission,
  type PermissionCategory,
} from "@/lib/rbac";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { useStore, update } from "@/lib/mock/store";
import { findUser, pushAudit, relTime } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/app/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authed/admin/permissions")({
  head: () => ({ meta: [{ title: "Permissions — Renewably UK" }] }),
  component: PermissionsPage,
});

type Tab = "library" | "presets" | "requests";

function PermissionsPage() {
  const data = useStore();
  const [tab, setTab] = useState<Tab>("library");
  const [cat, setCat] = useState<PermissionCategory>(PERMISSION_CATEGORIES[0]);
  const [assignPerm, setAssignPerm] = useState<Permission | null>(null);
  const [assignPreset, setAssignPreset] = useState<string | null>(null);

  const filtered = PERMISSIONS.filter((p) => p.category === cat);
  const pending = data.permissionRequests.filter((r) => r.state === "pending");

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · System"
        title="Permissions"
        subtitle="The catalogue of capabilities you can grant — by individual permission, by preset, or by request."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cat-purple-bg px-3 py-1.5 text-xs font-medium text-cat-purple">
            <Library className="size-3.5" /> {PERMISSIONS.length} permissions
          </span>
        }
      />

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "library", label: "Library" },
            { value: "presets", label: "Presets", count: OPERATOR_PRESETS.length },
            { value: "requests", label: "Requests", count: pending.length },
          ]}
        />
      </div>

      {tab === "library" && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex gap-1 overflow-x-auto lg:flex-col">
            {PERMISSION_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm lg:w-full ${
                  cat === c
                    ? "bg-foreground text-background"
                    : "text-ink-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border bg-card">
            <div className="border-b px-5 py-3 text-sm font-medium">{cat}</div>
            <div className="divide-y">
              {filtered.map((p) => {
                const grantedTo = data.users.filter((u) => u.permissions.includes(p.id));
                return (
                  <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{p.label}</div>
                      <div className="text-xs text-ink-muted">{p.description}</div>
                      <div className="mt-1 text-[11px] text-ink-muted">
                        Granted to {grantedTo.length} user{grantedTo.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <code className="hidden rounded-md bg-tile px-2 py-0.5 text-[11px] text-ink-muted md:inline">
                        {p.id}
                      </code>
                      <button
                        onClick={() => setAssignPerm(p.id)}
                        className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                      >
                        <UserPlus className="size-3" /> Assign
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "presets" && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {OPERATOR_PRESETS.map((p) => (
            <div key={p.id} className="flex flex-col rounded-2xl border bg-card p-5">
              <div className="text-sm font-semibold text-foreground">{p.label}</div>
              <div className="mt-1 text-xs text-ink-muted">{p.description}</div>
              <div className="mt-3 text-[11px] uppercase tracking-wide text-ink-muted">
                {p.permissions.length} permissions
              </div>
              <ul className="mt-2 max-h-40 flex-1 space-y-1 overflow-y-auto">
                {p.permissions.map((perm) => (
                  <li key={perm} className="text-[11px] text-ink-muted">
                    {PERMISSIONS.find((x) => x.id === perm)?.label ?? perm}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setAssignPreset(p.id)}
                className="press mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-xs font-medium text-background"
              >
                <UserPlus className="size-3.5" /> Assign preset to user
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "requests" && <RequestsTab />}

      {assignPerm && (
        <AssignDialog
          mode="permission"
          permission={assignPerm}
          onClose={() => setAssignPerm(null)}
        />
      )}
      {assignPreset && (
        <AssignDialog
          mode="preset"
          presetId={assignPreset}
          onClose={() => setAssignPreset(null)}
        />
      )}
    </div>
  );
}

function RequestsTab() {
  const data = useStore();
  const { user: actor } = useAuth();
  const pending = data.permissionRequests.filter((r) => r.state === "pending");
  const decided = data.permissionRequests.filter((r) => r.state !== "pending");

  function decide(id: string, approve: boolean) {
    update((d) => {
      const req = d.permissionRequests.find((r) => r.id === id);
      if (!req) return;
      req.state = approve ? "approved" : "rejected";
      req.decidedAt = Date.now();
      req.decidedBy = actor.fullName;
      if (approve) {
        const u = d.users.find((x) => x.id === req.userId);
        if (u && !u.permissions.includes(req.permission)) {
          u.permissions.push(req.permission);
        }
      }
      pushAudit(
        d,
        "user",
        req.userId,
        actor.fullName,
        approve ? `Approved permission ${req.permission}` : `Rejected permission ${req.permission}`,
      );
    });
    toast.success(approve ? "Permission granted" : "Request rejected");
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border bg-card">
        <div className="border-b px-5 py-3 text-sm font-medium">
          Pending {pending.length > 0 && <span className="ml-1 text-ink-muted">· {pending.length}</span>}
        </div>
        {pending.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState icon={Check} title="No pending requests" body="Operators can request access from any locked feature." />
          </div>
        ) : (
          <div className="divide-y">
            {pending.map((r) => {
              const u = findUser(data, r.userId);
              const perm = PERMISSIONS.find((p) => p.id === r.permission);
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {u?.name ?? "Unknown user"}{" "}
                      <span className="text-ink-muted">requested</span>{" "}
                      {perm?.label ?? r.permission}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">"{r.reason}"</div>
                    <div className="mt-1 text-[11px] text-ink-muted">
                      {u?.email} · {ROLE_META[u?.role ?? "operator"].short} · {relTime(r.requestedAt)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => decide(r.id, false)}
                      className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"
                    >
                      <X className="size-3" /> Reject
                    </button>
                    <button
                      onClick={() => decide(r.id, true)}
                      className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                    >
                      <Check className="size-3" /> Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-5 py-3 text-sm font-medium">Decided</div>
          <div className="divide-y">
            {decided.slice(0, 8).map((r) => {
              const u = findUser(data, r.userId);
              const perm = PERMISSIONS.find((p) => p.id === r.permission);
              return (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="text-sm text-foreground">
                    {u?.name} · {perm?.label}
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    {r.state === "approved" ? "Approved" : "Rejected"} by {r.decidedBy} · {r.decidedAt && relTime(r.decidedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AssignDialog({
  mode,
  permission,
  presetId,
  onClose,
}: {
  mode: "permission" | "preset";
  permission?: Permission;
  presetId?: string;
  onClose: () => void;
}) {
  const data = useStore();
  const { user: actor } = useAuth();
  const [q, setQ] = useState("");

  const eligible = useMemo(
    () => data.users.filter((u) => u.role !== "admin" && u.status !== "banned"),
    [data.users],
  );
  const filtered = eligible.filter(
    (u) => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()),
  );

  const preset = presetId ? OPERATOR_PRESETS.find((p) => p.id === presetId) : null;
  const permDef = permission ? PERMISSIONS.find((p) => p.id === permission) : null;

  function assign(userId: string) {
    update((d) => {
      const u = d.users.find((x) => x.id === userId);
      if (!u) return;
      if (mode === "permission" && permission) {
        if (!u.permissions.includes(permission)) u.permissions.push(permission);
        pushAudit(d, "user", userId, actor.fullName, `Granted ${permission}`);
      }
      if (mode === "preset" && preset) {
        u.permissions = Array.from(new Set([...u.permissions, ...preset.permissions]));
        pushAudit(d, "user", userId, actor.fullName, `Applied preset: ${preset.label}`);
      }
    });
    toast.success("Assigned");
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "permission" ? `Assign ${permDef?.label}` : `Assign ${preset?.label}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "permission"
              ? "Grant this permission to one or more users."
              : "Apply this preset's permissions to a user (additive — won't remove existing)."}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users"
            className="h-9 w-full rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          <div className="divide-y">
            {filtered.map((u) => {
              const has =
                mode === "permission" && permission
                  ? u.permissions.includes(permission)
                  : false;
              return (
                <div key={u.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-ink-muted">
                      {u.email} · {ROLE_META[u.role].short}
                    </div>
                  </div>
                  <button
                    disabled={has}
                    onClick={() => assign(u.id)}
                    className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
                  >
                    {has ? "Already granted" : "Assign"}
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-6 text-center text-xs text-ink-muted">No matching users.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

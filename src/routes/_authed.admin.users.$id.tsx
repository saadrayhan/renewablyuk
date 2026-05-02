import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, UserMinus, UserCheck, Ban, ShieldAlert, Trash2, RotateCcw, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { findUser, pushAudit, fmtDate } from "@/lib/mock/queries";
import { StatePill, USER_STATES } from "@/components/app/state-pill";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { PERMISSIONS, PERMISSION_CATEGORIES, OPERATOR_PRESETS, ROLE_META, DEFAULT_PERMISSIONS, type Permission } from "@/lib/rbac";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authed/admin/users/$id")({
  head: () => ({ meta: [{ title: "User — Renewably UK" }] }),
  component: UserDetail,
});

type Tab = "overview" | "permissions" | "audit";

function UserDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const u = findUser(data, id);
  const { user: actor } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  if (!u) throw notFound();

  function toggle(p: Permission) {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      const has = x.permissions.includes(p);
      x.permissions = has ? x.permissions.filter((y) => y !== p) : [...x.permissions, p];
      pushAudit(d, "user", id, actor.fullName, has ? `Revoked ${p}` : `Granted ${p}`);
    });
  }

  function grant(p: Permission) {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x || x.permissions.includes(p)) return;
      x.permissions = [...x.permissions, p];
      pushAudit(d, "user", id, actor.fullName, `Granted ${p}`);
    });
    toast.success("Permission granted");
  }

  function revoke(p: Permission) {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.permissions = x.permissions.filter((y) => y !== p);
      pushAudit(d, "user", id, actor.fullName, `Revoked ${p}`);
    });
    toast.success("Permission revoked");
  }

  function clearAll() {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.permissions = [];
      pushAudit(d, "user", id, actor.fullName, "Cleared all custom grants");
    });
    toast.success("All custom grants cleared");
  }

  function resetToRoleDefaults() {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.permissions = [...DEFAULT_PERMISSIONS[x.role]];
      pushAudit(d, "user", id, actor.fullName, "Reset to role defaults");
    });
    toast.success("Reset to role defaults");
  }

  function applyPreset(presetId: string) {
    const preset = OPERATOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.permissions = [...preset.permissions];
      pushAudit(d, "user", id, actor.fullName, `Applied preset: ${preset.label}`);
    });
    toast.success(`Applied ${preset.label}`);
  }

  function setStatus(next: "invited" | "pending" | "active" | "suspended" | "deactivated" | "banned") {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.status = next;
      if (next !== "banned") x.banReason = undefined;
      pushAudit(d, "user", id, actor.fullName, `Status set to ${next}`);
    });
    toast.success(`User ${next}`);
  }

  function confirmBan() {
    if (!banReason.trim()) {
      toast.error("Reason is required");
      return;
    }
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.status = "banned";
      x.banReason = banReason.trim();
      pushAudit(d, "user", id, actor.fullName, "Banned user", banReason.trim());
    });
    toast.success("User banned");
    setBanReason("");
    setBanOpen(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <Link to="/admin/users" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Users
      </Link>

      <div className="mt-3 flex flex-col items-start justify-between gap-4 md:flex-row md:items-start md:gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">User</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{u.name}</h1>
          <div className="mt-2 text-sm text-ink-muted">{u.email} · <span className="rounded-full bg-cat-purple-bg px-2 py-0.5 text-[11px] font-medium text-cat-purple">{ROLE_META[u.role].label}</span></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatePill meta={USER_STATES[u.status]} />
          {u.status === "active" && (
            <button onClick={() => setStatus("suspended")} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"><UserMinus className="size-3" /> Suspend</button>
          )}
          {(u.status === "suspended" || u.status === "deactivated") && (
            <button onClick={() => setStatus("active")} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"><UserCheck className="size-3" /> Reactivate</button>
          )}
          {u.status === "banned" ? (
            <button onClick={() => setStatus("active")} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"><UserCheck className="size-3" /> Unban</button>
          ) : (
            <button onClick={() => setBanOpen(true)} className="press inline-flex items-center gap-1 rounded-full border border-cat-rose/30 bg-cat-rose-bg px-3 py-1.5 text-xs text-cat-rose"><Ban className="size-3" /> Ban</button>
          )}
        </div>
      </div>

      {u.status === "banned" && u.banReason && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-cat-rose/30 bg-cat-rose-bg/50 px-4 py-3 text-sm text-cat-rose">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <div className="font-medium">User is banned</div>
            <div className="text-xs opacity-90">{u.banReason}</div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "permissions", label: "Permissions", count: u.permissions.length },
            { value: "audit", label: "Audit" },
          ]}
        />
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="rounded-2xl border bg-card p-5">
            <div className="space-y-2">
              <Row label="Role" value={ROLE_META[u.role].label} />
              <Row label="Email" value={u.email} />
              <Row label="Invited" value={fmtDate(u.invitedAt)} />
              <Row label="Permissions" value={`${u.permissions.length} granted`} />
              {u.banReason && <Row label="Ban reason" value={u.banReason} />}
            </div>
          </div>
        )}

        {tab === "permissions" && (
          <div className="space-y-4">
            {u.role === "operator" && (
              <div className="rounded-2xl border bg-card p-4">
                <div className="text-sm font-medium text-foreground">Apply preset</div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                  {OPERATOR_PRESETS.map((p) => (
                    <button key={p.id} onClick={() => applyPreset(p.id)} className="press rounded-xl border bg-background p-3 text-left">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground"><ShieldCheck className="size-3.5 text-cat-blue" /> {p.label}</div>
                      <div className="mt-1 text-xs text-ink-muted">{p.description}</div>
                      <div className="mt-2 text-[11px] text-ink-muted">{p.permissions.length} permissions</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {PERMISSION_CATEGORIES.map((cat) => {
              const perms = PERMISSIONS.filter((p) => p.category === cat);
              return (
                <div key={cat} className="rounded-2xl border bg-card">
                  <div className="border-b px-5 py-3 text-sm font-medium text-foreground">{cat}</div>
                  <div className="divide-y">
                    {perms.map((p) => {
                      const granted = u.permissions.includes(p.id);
                      return (
                        <label key={p.id} className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3 hover:bg-surface/40">
                          <div>
                            <div className="text-sm font-medium text-foreground">{p.label}</div>
                            <div className="text-xs text-ink-muted">{p.description}</div>
                          </div>
                          <input type="checkbox" checked={granted} onChange={() => toggle(p.id)} className="size-4 cursor-pointer accent-foreground" />
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "audit" && <AuditTimeline entityType="user" entityId={u.id} />}
      </div>

      <Dialog open={banOpen} onOpenChange={(v) => { if (!v) setBanReason(""); setBanOpen(v); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-cat-rose" /> Ban {u.name}?
            </DialogTitle>
            <DialogDescription>
              They'll lose access immediately. The reason is recorded in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="ban-reason">Reason</Label>
            <Textarea
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Repeated policy violations, fraudulent submissions, etc."
              rows={4}
            />
          </div>
          <DialogFooter>
            <button onClick={() => { setBanReason(""); setBanOpen(false); }} className="press rounded-full border bg-background px-3.5 py-2 text-sm">Cancel</button>
            <button onClick={confirmBan} className="press inline-flex items-center gap-1.5 rounded-full bg-cat-rose px-3.5 py-2 text-sm font-medium text-white">
              <Ban className="size-4" /> Ban user
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2.5 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, UserMinus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { findUser, pushAudit, fmtDate } from "@/lib/mock/queries";
import { StatePill, USER_STATES } from "@/components/app/state-pill";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { PERMISSIONS, PERMISSION_CATEGORIES, OPERATOR_PRESETS, ROLE_META, type Permission } from "@/lib/rbac";
import { useAuth } from "@/lib/auth-context";

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

  function setStatus(next: typeof u.status) {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.status = next;
      pushAudit(d, "user", id, actor.fullName, `Status set to ${next}`);
    });
    toast.success(`User ${next}`);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <Link to="/admin/users" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Users
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">User</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{u.name}</h1>
          <div className="mt-2 text-sm text-ink-muted">{u.email} · <span className="rounded-full bg-cat-purple-bg px-2 py-0.5 text-[11px] font-medium text-cat-purple">{ROLE_META[u.role].label}</span></div>
        </div>
        <div className="flex items-center gap-2">
          <StatePill meta={USER_STATES[u.status]} />
          {u.status === "active" ? (
            <button onClick={() => setStatus("suspended")} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"><UserMinus className="size-3" /> Suspend</button>
          ) : (
            <button onClick={() => setStatus("active")} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"><UserCheck className="size-3" /> Reactivate</button>
          )}
        </div>
      </div>

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

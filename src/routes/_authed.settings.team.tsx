import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Send, Check, X } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { ROLE_META, PERMISSIONS, DEFAULT_PERMISSIONS, type Role as RoleId } from "@/lib/rbac";
import { StatePill, USER_STATES } from "@/components/app/state-pill";
import { InviteDialog } from "@/components/app/invite-dialog";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/settings/team")({
  head: () => ({ meta: [{ title: "Team — Renewably UK" }] }),
  component: TeamPage,
});

function TeamPage() {
  const data = useStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const team = data.users.slice(0, 8);

  // Comparison matrix capabilities
  const matrix: { label: string; check: (r: RoleId) => boolean }[] = [
    { label: "View dashboard & jobs", check: () => true },
    { label: "Issue IBGs", check: (r) => DEFAULT_PERMISSIONS[r].includes("ibg.issue") },
    { label: "Submit funding", check: (r) => DEFAULT_PERMISSIONS[r].includes("funding.submit") },
    { label: "Manage users", check: (r) => DEFAULT_PERMISSIONS[r].includes("users.permissions.assign") },
    { label: "View audit log", check: (r) => DEFAULT_PERMISSIONS[r].includes("audit.read") },
    { label: "Manage risk states", check: (r) => DEFAULT_PERMISSIONS[r].includes("risk.flag") },
  ];
  const roles: RoleId[] = ["admin", "operator", "installer-operate", "installer-access", "readonly"];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Settings"
        title="Team"
        subtitle="Members of your workspace, their roles and access scope."
        actions={
          <button onClick={() => setInviteOpen(true)} className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Send className="size-3.5" /> Invite member
          </button>
        }
      />

      <div className="mt-6 rounded-2xl border bg-card">
        <div className="border-b px-5 py-3 text-sm font-medium">Members ({team.length})</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[12px] font-medium text-ink-muted">
              <th className="px-3 py-2.5 text-left">Name</th>
              <th className="px-3 py-2.5 text-left">Role</th>
              <th className="px-3 py-2.5 text-left">Status</th>
              <th className="px-3 py-2.5 text-left">Last active</th>
              <th className="px-3 py-2.5 text-right">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0 hover:bg-surface/40">
                <td className="px-3 py-3.5">
                  <div className="font-medium text-foreground">{u.name}</div>
                  <div className="text-xs text-ink-muted">{u.email}</div>
                </td>
                <td className="px-3 py-3.5 text-foreground">{ROLE_META[u.role].label}</td>
                <td className="px-3 py-3.5"><StatePill meta={USER_STATES[u.status]} /></td>
                <td className="px-3 py-3.5 text-ink-muted">{u.invitedAt ? fmtDate(u.invitedAt) : "—"}</td>
                <td className="px-3 py-3.5 text-right text-ink-muted">{u.permissions.length} of {PERMISSIONS.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border bg-card">
        <div className="border-b px-5 py-3 text-sm font-medium">Role capabilities</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[12px] font-medium text-ink-muted">
                <th className="px-3 py-2.5 text-left">Capability</th>
                {roles.map((r) => (
                  <th key={r} className="px-4 py-2.5 text-center">
                    <div className="inline-flex items-center gap-1"><ShieldCheck className="size-3 text-cat-blue" /> {ROLE_META[r].label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((m) => (
                <tr key={m.label} className="border-b last:border-b-0">
                  <td className="px-4 py-2.5 text-foreground">{m.label}</td>
                  {roles.map((r) => (
                    <td key={r} className="px-4 py-2.5 text-center">
                      {m.check(r) ? <Check className="mx-auto size-4 text-cat-green" /> : <X className="mx-auto size-3.5 text-ink-muted/60" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

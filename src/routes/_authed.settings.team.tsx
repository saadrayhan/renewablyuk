import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Lock, ShieldCheck, Send } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { ROLE_META } from "@/lib/rbac";
import { StatePill, USER_STATES } from "@/components/app/state-pill";
import { InviteDialog } from "@/components/app/invite-dialog";

export const Route = createFileRoute("/_authed/settings/team")({
  head: () => ({ meta: [{ title: "Team — Renewably UK" }] }),
  component: TeamPage,
});

function TeamPage() {
  const data = useStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const team = data.users.slice(0, 6);

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

      <div className="relative mt-6">
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-5 py-3 text-sm font-medium">Members ({team.length})</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-4 py-2.5 text-left">Name</th>
                <th className="px-4 py-2.5 text-left">Role</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5 text-right">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((u) => (
                <tr key={u.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-ink-muted">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{ROLE_META[u.role].label}</td>
                  <td className="px-4 py-3"><StatePill meta={USER_STATES[u.status]} /></td>
                  <td className="px-4 py-3 text-right text-ink-muted">{u.permissions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-2xl border bg-card">
          <div className="border-b px-5 py-3 text-sm font-medium">Roles in your workspace</div>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            {Object.entries(ROLE_META).map(([key, meta]) => (
              <div key={key} className="rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="size-3.5 text-cat-blue" /> {meta.label}
                </div>
                <p className="mt-1 text-xs text-ink-muted">{meta.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-background/40 backdrop-blur-[1px]">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs font-medium text-ink-muted shadow-sm">
            <Lock className="size-3.5" /> <Users className="size-3.5" /> Team management module coming soon
          </div>
        </div>
      </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

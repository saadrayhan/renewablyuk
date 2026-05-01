import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, USER_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate, relTime } from "@/lib/mock/queries";
import { ROLE_META, type Role } from "@/lib/rbac";
import { EmptyState } from "@/components/app/empty-state";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/users")({
  head: () => ({ meta: [{ title: "Users — Renewably UK" }] }),
  component: UsersList,
});

function UsersList() {
  const data = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Role | "all">("all");

  const rows = data.users
    .filter((u) => filter === "all" || u.role === filter)
    .filter((u) => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <PageHeader
        eyebrow="Admin · Users"
        title="User directory"
        subtitle="Invite, assign roles and grant permissions from the library."
        actions={
          <button onClick={() => toast.info("Invite drawer coming next pass")} className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Plus className="size-4" /> Invite user
          </button>
        }
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <FilterPills<Role>
          value={filter}
          onChange={setFilter}
          options={(Object.keys(ROLE_META) as Role[]).map((r) => ({ value: r, label: ROLE_META[r].short, count: data.users.filter((u) => u.role === r).length }))}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="h-9 w-64 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? <EmptyState icon={Users} title="No users" /> : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">User</th>
                  <th className="px-4 py-2.5 text-left">Role</th>
                  <th className="px-4 py-2.5 text-left">Permissions</th>
                  <th className="px-4 py-2.5 text-left">Last active</th>
                  <th className="px-4 py-2.5 text-left">Invited</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0 hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <Link to="/admin/users/$id" params={{ id: u.id }} className="block">
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-ink-muted">{u.email}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3"><span className="rounded-full bg-cat-purple-bg px-2 py-0.5 text-[11px] font-medium text-cat-purple">{ROLE_META[u.role].short}</span></td>
                    <td className="px-4 py-3 text-foreground">{u.permissions.length || "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{u.lastActive ? relTime(u.lastActive) : "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{fmtDate(u.invitedAt)}</td>
                    <td className="px-4 py-3 text-right"><StatePill meta={USER_STATES[u.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

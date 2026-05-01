import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Users, MoreHorizontal, Ban, UserCheck, ShieldAlert, Mail, Send } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update, nid } from "@/lib/mock/store";
import { StatePill, USER_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate, relTime, pushAudit } from "@/lib/mock/queries";
import { ROLE_META, type Role } from "@/lib/rbac";
import { EmptyState } from "@/components/app/empty-state";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ManagedUser, UserStatus } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/admin/users")({
  head: () => ({ meta: [{ title: "Users — Renewably UK" }] }),
  component: UsersList,
});

function UsersList() {
  const data = useStore();
  const { user: actor } = useAuth();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Role | "all" | "banned">("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<ManagedUser | null>(null);

  const rows = data.users
    .filter((u) => {
      if (filter === "all") return true;
      if (filter === "banned") return u.status === "banned";
      return u.role === filter;
    })
    .filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase()),
    );

  function setStatus(u: ManagedUser, next: UserStatus) {
    update((d) => {
      const x = d.users.find((y) => y.id === u.id);
      if (!x) return;
      x.status = next;
      if (next !== "banned") x.banReason = undefined;
      pushAudit(d, "user", u.id, actor.fullName, `Status set to ${next}`);
    });
    toast.success(`${u.name}: ${next}`);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Users"
        title="User directory"
        subtitle="Invite, assign roles and grant permissions from the library."
        actions={
          <button
            onClick={() => setInviteOpen(true)}
            className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
          >
            <Plus className="size-4" /> Invite user
          </button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterPills<Role | "banned">
          value={filter}
          onChange={setFilter}
          options={[
            ...(Object.keys(ROLE_META) as Role[]).map((r) => ({
              value: r,
              label: ROLE_META[r].short,
              count: data.users.filter((u) => u.role === r).length,
            })),
            {
              value: "banned" as const,
              label: "Banned",
              count: data.users.filter((u) => u.status === "banned").length,
            },
          ]}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email"
            className="h-9 w-full rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring md:w-64"
          />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? (
          <EmptyState icon={Users} title="No users" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">User</th>
                  <th className="px-4 py-2.5 text-left">Role</th>
                  <th className="px-4 py-2.5 text-left">Permissions</th>
                  <th className="px-4 py-2.5 text-left">Last active</th>
                  <th className="px-4 py-2.5 text-left">Invited</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-right" />
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
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cat-purple-bg px-2 py-0.5 text-[11px] font-medium text-cat-purple">
                        {ROLE_META[u.role].short}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{u.permissions.length || "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{u.lastActive ? relTime(u.lastActive) : "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{fmtDate(u.invitedAt)}</td>
                    <td className="px-4 py-3"><StatePill meta={USER_STATES[u.status]} /></td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="press rounded-full p-1.5 text-ink-muted hover:bg-muted hover:text-foreground"
                            aria-label="User actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/users/$id" params={{ id: u.id }}>Open profile</Link>
                          </DropdownMenuItem>
                          {u.status === "invited" && (
                            <DropdownMenuItem
                              onClick={() => {
                                update((d) => {
                                  const x = d.users.find((y) => y.id === u.id);
                                  if (!x) return;
                                  x.invitedAt = Date.now();
                                  pushAudit(d, "user", u.id, actor.fullName, "Invitation resent");
                                });
                                toast.success(`Invitation resent to ${u.email}`);
                              }}
                            >
                              <Mail className="mr-2 size-3.5" /> Resend invite
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {u.status === "active" && (
                            <DropdownMenuItem onClick={() => setStatus(u, "suspended")}>
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {(u.status === "suspended" || u.status === "deactivated") && (
                            <DropdownMenuItem onClick={() => setStatus(u, "active")}>
                              <UserCheck className="mr-2 size-3.5" /> Reactivate
                            </DropdownMenuItem>
                          )}
                          {u.status === "banned" ? (
                            <DropdownMenuItem onClick={() => setStatus(u, "active")}>
                              <UserCheck className="mr-2 size-3.5" /> Unban
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setBanTarget(u)}
                              className="text-cat-rose focus:text-cat-rose"
                            >
                              <Ban className="mr-2 size-3.5" /> Ban user
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InviteSheet open={inviteOpen} onOpenChange={setInviteOpen} actorName={actor.fullName} />
      <BanDialog
        target={banTarget}
        onClose={() => setBanTarget(null)}
        actorName={actor.fullName}
      />
    </div>
  );
}

function InviteSheet({
  open,
  onOpenChange,
  actorName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  actorName: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("operator");

  function reset() {
    setName("");
    setEmail("");
    setRole("operator");
  }

  function send() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const id = nid("usr");
    update((d) => {
      d.users.push({
        id,
        name: name.trim(),
        email: email.trim(),
        role,
        status: "invited",
        permissions: [],
        invitedAt: Date.now(),
      });
      pushAudit(d, "user", id, actorName, `Invited as ${ROLE_META[role].label}`);
    });
    toast.success(`Invitation sent to ${email}`);
    reset();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Invite a user</SheetTitle>
          <SheetDescription>
            They'll receive an email to set a password and join the workspace.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inv-name">Full name</Label>
            <Input id="inv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-email">Email</Label>
            <Input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.uk" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_META) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_META[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-ink-muted">{ROLE_META[role].description}</p>
          </div>

          <div className="rounded-xl border bg-surface/60 p-3 text-xs text-ink-muted">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <Send className="size-3.5" /> What happens next
            </div>
            They receive an email invite. Once accepted, you can grant permissions
            from the user profile or apply a preset.
          </div>
        </div>
        <SheetFooter className="mt-6 flex flex-row justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="press rounded-full border bg-background px-3.5 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={send}
            className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
          >
            <Plus className="size-4" /> Send invite
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function BanDialog({
  target,
  onClose,
  actorName,
}: {
  target: ManagedUser | null;
  onClose: () => void;
  actorName: string;
}) {
  const [reason, setReason] = useState("");

  function confirm() {
    if (!target) return;
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }
    update((d) => {
      const x = d.users.find((y) => y.id === target.id);
      if (!x) return;
      x.status = "banned";
      x.banReason = reason.trim();
      pushAudit(d, "user", target.id, actorName, "Banned user", reason.trim());
    });
    toast.success(`${target.name} banned`);
    setReason("");
    onClose();
  }

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && (setReason(""), onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-cat-rose" /> Ban {target?.name}?
          </DialogTitle>
          <DialogDescription>
            They'll lose access immediately. The reason is recorded in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="ban-reason">Reason</Label>
          <Textarea
            id="ban-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Repeated policy violations, fraudulent submissions, etc."
            rows={4}
          />
        </div>
        <DialogFooter>
          <button
            onClick={() => {
              setReason("");
              onClose();
            }}
            className="press rounded-full border bg-background px-3.5 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="press inline-flex items-center gap-1.5 rounded-full bg-cat-rose px-3.5 py-2 text-sm font-medium text-white"
          >
            <Ban className="size-4" /> Ban user
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

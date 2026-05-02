/**
 * Shared Invite Dialog — used by both /admin/users and the sidebar
 * InviteCard so the entry points are identical.
 */

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { update, nid } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import { ROLE_META, type Role } from "@/lib/rbac";

export function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user: actor } = useAuth();
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
      pushAudit(d, "user", id, actor.fullName, `Invited as ${ROLE_META[role].label}`);
    });
    toast.success(`Invitation sent to ${email}`);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
          <DialogDescription>
            They'll receive an email to set a password and join the workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inv-d-name">Full name</Label>
            <Input id="inv-d-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah Thompson" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-d-email">Email</Label>
            <Input id="inv-d-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@company.uk" />
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

        <DialogFooter>
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
            <Send className="size-3.5" /> Send invite
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

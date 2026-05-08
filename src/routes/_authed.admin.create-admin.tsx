import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ADMIN_ROLE_META } from "@/lib/membership";
import type { AdminRole } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/create-admin")({
  component: CreateAdminPage,
});

function CreateAdminPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AdminRole>("reviewer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Invitation sent to ${email}`);
    setTimeout(() => navigate({ to: "/admin/users" }), 400);
  };

  return (
    <div className="space-y-8 px-6 py-8 md:px-10 md:py-12">
      <PageHeader eyebrow="ADMIN" title="Create admin" />

      <form onSubmit={submit} className="max-w-2xl space-y-6">
        <div>
          <div className="mb-2 text-sm font-medium">1. Pick a role surface</div>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(ADMIN_ROLE_META) as AdminRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "press rounded-2xl border bg-background p-4 text-left",
                  role === r ? "border-primary bg-primary/5" : "hover:bg-surface",
                )}
              >
                <div className="text-sm font-semibold">{ADMIN_ROLE_META[r].label}</div>
                <div className="mt-1 text-xs text-ink-muted">{ADMIN_ROLE_META[r].description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium">2. Invite details</div>
          <div className="space-y-3 rounded-2xl border bg-background p-4">
            <input
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <UserPlus className="size-4" /> Send invitation
        </button>
      </form>
    </div>
  );
}

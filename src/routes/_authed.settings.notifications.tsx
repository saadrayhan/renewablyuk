import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/settings/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Renewably UK" }] }),
  component: NotificationsSettings,
});

const CATEGORIES = [
  { key: "ibg-issued", label: "IBG issued", desc: "When a new IBG is finalised on a job you own." },
  { key: "ibg-amendment", label: "IBG amendments", desc: "Amendment requests, approvals and rejections." },
  { key: "funding-submission", label: "Funding submissions", desc: "State changes on submissions you created." },
  { key: "funding-readiness", label: "Funding readiness", desc: "When a project becomes fully evidenced." },
  { key: "user-invite", label: "User invites accepted", desc: "Admin only — when invited users join." },
  { key: "billing", label: "Billing & invoices", desc: "Payment receipts, failures and renewals." },
];

type Channels = { email: boolean; inapp: boolean };

function NotificationsSettings() {
  const [prefs, setPrefs] = useState<Record<string, Channels>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, { email: true, inapp: true }])),
  );

  function toggle(key: string, ch: keyof Channels) {
    setPrefs((p) => ({ ...p, [key]: { ...p[key], [ch]: !p[key][ch] } }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface">
        <div className="border-b border-border p-6">
          <h2 className="text-base font-semibold text-ink">Notification preferences</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Choose how you want to hear about activity in your workspace.
          </p>
        </div>
        <div>
          <div className="grid grid-cols-[1fr_80px_80px] items-center gap-4 border-b border-border px-6 py-3 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            <span>Category</span>
            <span className="text-center">Email</span>
            <span className="text-center">In-app</span>
          </div>
          {CATEGORIES.map((c) => (
            <div
              key={c.key}
              className="grid grid-cols-[1fr_80px_80px] items-center gap-4 border-b border-border px-6 py-4 last:border-0"
            >
              <div>
                <div className="text-sm font-medium text-ink">{c.label}</div>
                <div className="text-xs text-ink-muted">{c.desc}</div>
              </div>
              <Toggle on={prefs[c.key].email} onChange={() => toggle(c.key, "email")} />
              <Toggle on={prefs[c.key].inapp} onChange={() => toggle(c.key, "inapp")} />
            </div>
          ))}
        </div>
        <div className="flex justify-end p-6">
          <button
            type="button"
            onClick={() => toast.success("Preferences saved")}
            className="press rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Save preferences
          </button>
        </div>
      </section>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "mx-auto flex h-5 w-9 items-center rounded-full p-0.5 transition",
        on ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "size-4 rounded-full bg-white transition",
          on ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

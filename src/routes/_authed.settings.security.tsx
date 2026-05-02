/**
 * /settings/security — 2FA setup + active sessions (mock).
 */

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff, Monitor, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { TwoFactorDialog } from "@/components/app/two-factor-dialog";

export const Route = createFileRoute("/_authed/settings/security")({
  head: () => ({ meta: [{ title: "Security — Renewably UK" }] }),
  component: SecurityPage,
});

type Session = {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  current: boolean;
  lastActive: string;
};

const SESSIONS: Session[] = [
  { id: "s1", device: "MacBook Pro", browser: "Chrome 142", ip: "82.34.117.4", location: "London, UK", current: true, lastActive: "Active now" },
  { id: "s2", device: "iPhone 15", browser: "Safari", ip: "82.34.117.4", location: "London, UK", current: false, lastActive: "2 hours ago" },
  { id: "s3", device: "Windows PC", browser: "Edge 138", ip: "31.94.62.18", location: "Manchester, UK", current: false, lastActive: "Yesterday" },
];

function SecurityPage() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState(SESSIONS);

  useEffect(() => {
    try { setEnabled(localStorage.getItem("renewably:2fa") === "true"); } catch { /* */ }
  }, []);

  function disable() {
    try { localStorage.removeItem("renewably:2fa"); } catch { /* */ }
    setEnabled(false);
    toast.success("Two-factor authentication disabled");
  }

  function revoke(id: string) {
    setSessions((s) => s.filter((x) => x.id !== id));
    toast.success("Session signed out");
  }

  function revokeAll() {
    setSessions((s) => s.filter((x) => x.current));
    toast.success("All other sessions signed out");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={"grid size-10 place-items-center rounded-xl " + (enabled ? "bg-cat-green-bg text-cat-green" : "bg-tile text-ink-muted")}>
              {enabled ? <ShieldCheck className="size-5" /> : <ShieldOff className="size-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-foreground">Two-factor authentication</div>
                {enabled && <span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-[10px] font-medium text-cat-green">Enabled</span>}
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {enabled
                  ? "Your account is protected with an authenticator app. You'll be prompted for a 6-digit code on sign in."
                  : "Add an authenticator app for an extra layer of security on every sign in."}
              </p>
            </div>
          </div>
          {enabled ? (
            <button
              onClick={disable}
              className="press shrink-0 rounded-full border border-cat-rose/30 bg-cat-rose-bg px-3 py-1.5 text-xs text-cat-rose"
            >
              Disable
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="press shrink-0 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
            >
              Enable 2FA
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-medium text-foreground">Active sessions</div>
          {sessions.length > 1 && (
            <button onClick={revokeAll} className="press text-xs text-cat-rose hover:underline">
              Sign out everywhere else
            </button>
          )}
        </div>
        <div className="divide-y">
          {sessions.map((s) => {
            const Icon = s.device.includes("iPhone") || s.device.includes("Android") ? Smartphone : Monitor;
            return (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <Icon className="size-5 text-ink-muted" />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {s.device} · {s.browser}
                      {s.current && <span className="rounded-full bg-cat-green-bg px-1.5 py-0.5 text-[10px] font-medium text-cat-green">This device</span>}
                    </div>
                    <div className="text-[11px] text-ink-muted">{s.location} · {s.ip} · {s.lastActive}</div>
                  </div>
                </div>
                {!s.current && (
                  <button
                    onClick={() => revoke(s.id)}
                    aria-label="Sign out session"
                    className="press grid size-7 place-items-center rounded-full text-ink-muted hover:bg-tile hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <TwoFactorDialog open={open} onOpenChange={setOpen} onEnabled={() => setEnabled(true)} />
    </div>
  );
}

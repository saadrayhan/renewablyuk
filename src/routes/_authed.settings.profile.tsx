import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/settings/profile")({
  head: () => ({ meta: [{ title: "Profile — Renewably UK" }] }),
  component: ProfileSettings,
});

function ProfileSettings() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);

  return (
    <div className="space-y-6">
      <Card title="Personal details">
        <Field label="Full name">
          <Input value={fullName} onChange={(v) => setFullName(v)} />
        </Field>
        <Field label="Work email">
          <Input value={email} onChange={(v) => setEmail(v)} type="email" />
        </Field>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => toast.success("Profile updated")}
            className="press rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Save changes
          </button>
        </div>
      </Card>

      <Card title="Password">
        <Field label="Current password">
          <Input value="" onChange={() => {}} type="password" placeholder="••••••••" />
        </Field>
        <Field label="New password">
          <Input value="" onChange={() => {}} type="password" placeholder="••••••••" />
        </Field>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => toast.success("Password changed")}
            className="press rounded-full border border-border px-4 py-2 text-sm font-medium text-ink"
          >
            Update password
          </button>
        </div>
      </Card>

      <Card title="Two-factor authentication" tone="warning">
        <p className="text-sm text-ink-muted">
          Add an extra layer of security with an authenticator app. Recommended for all admins
          and operators handling funding submissions.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => toast.info("2FA setup flow coming up")}
            className="press rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Enable 2FA
          </button>
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "warning";
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {tone === "warning" && (
          <span className="rounded-full bg-cat-amber-bg px-2 py-0.5 text-[11px] font-medium text-cat-amber">
            Recommended
          </span>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
    />
  );
}

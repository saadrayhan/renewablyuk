import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Renewably UK" },
      { name: "description", content: "Request a password reset link." },
    ],
  }),
  component: ForgotPasswordPage,
});

type Status = "idle" | "loading" | "success";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => setStatus("success"), 800);
  }

  function resend() {
    setStatus("loading");
    setTimeout(() => setStatus("success"), 600);
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link
          to="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </Link>
      }
    >
      {status === "success" ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-cat-green-bg text-cat-green">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-ink">
              Check your email
            </div>
            <p className="mt-1.5 text-sm text-ink-muted">
              We've sent a reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>. It
              may take a minute.
            </p>
          </div>
          <button
            type="button"
            onClick={resend}
            className="text-xs font-medium text-ink-muted hover:text-foreground"
          >
            Resend link
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.co.uk"
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="press inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

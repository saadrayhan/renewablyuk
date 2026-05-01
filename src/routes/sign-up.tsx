import { useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Create your account — Renewably UK" },
      {
        name: "description",
        content:
          "Create a Renewably UK account and start issuing IBGs in minutes.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Backend disabled — go straight to onboarding.
    setTimeout(() => navigate({ to: "/onboarding" }), 200);
  };

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Start free. Upgrade to Operate when you need it."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Sarah Patel"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.co.uk"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-ink-muted">At least 8 characters.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="press inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Continue
        </button>

        <p className="text-center text-xs text-ink-muted">
          Backend is disabled — no account will be created.
        </p>
      </form>
    </AuthLayout>
  );
}

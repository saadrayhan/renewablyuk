import { useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDevRole } from "@/lib/dev-role";
import { useMembership } from "@/lib/membership";
import type { ActivationState, AdminRole, MembershipTier } from "@/lib/mock/types";
import type { Role } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — Renewably UK" },
      {
        name: "description",
        content: "Sign in to your Renewably UK workspace.",
      },
    ],
  }),
  component: SignInPage,
});

type DemoAccount = {
  email: string;
  label: string;
  description: string;
  kind: "contractor" | "admin";
  role: Role;
  tier?: MembershipTier;
  activationState?: ActivationState;
  adminRole?: AdminRole;
  destination: "/dashboard" | "/admin/audit";
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "contractor.access@demo",
    label: "Access — fully active",
    description: "Free tier, all 5 conditions met.",
    kind: "contractor",
    role: "installer-access",
    tier: "access",
    activationState: "active",
    destination: "/dashboard",
  },
  {
    email: "contractor.operate@demo",
    label: "Operate — fully active",
    description: "Paid tier with full pipeline.",
    kind: "contractor",
    role: "installer-operate",
    tier: "operate",
    activationState: "active",
    destination: "/dashboard",
  },
  {
    email: "contractor.expiring@demo",
    label: "Operate — expiring",
    description: "Renewal due in 18 days.",
    kind: "contractor",
    role: "installer-operate",
    tier: "operate",
    activationState: "expiring",
    destination: "/dashboard",
  },
  {
    email: "contractor.suspended@demo",
    label: "Operate — suspended",
    description: "TrustMark lapsed, blocked state.",
    kind: "contractor",
    role: "installer-operate",
    tier: "operate",
    activationState: "suspended",
    destination: "/dashboard",
  },
  {
    email: "admin.super@demo",
    label: "Super Admin",
    description: "Full platform access.",
    kind: "admin",
    role: "admin",
    adminRole: "super_admin",
    destination: "/admin/audit",
  },
  {
    email: "admin.reviewer@demo",
    label: "Reviewer",
    description: "Evidence queue & templates.",
    kind: "admin",
    role: "admin",
    adminRole: "reviewer",
    destination: "/admin/audit",
  },
  {
    email: "admin.support@demo",
    label: "Support",
    description: "Tickets, companies, onboarding.",
    kind: "admin",
    role: "admin",
    adminRole: "support",
    destination: "/admin/audit",
  },
  {
    email: "admin.finance@demo",
    label: "Finance",
    description: "Stripe, payouts, membership.",
    kind: "admin",
    role: "admin",
    adminRole: "finance",
    destination: "/admin/audit",
  },
];

function SignInPage() {
  const navigate = useNavigate();
  const { setRole } = useDevRole();
  const { setTier, setActivationState, setAdminRole } = useMembership();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [demoOpen, setDemoOpen] = useState(true);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 200);
  };

  const useDemo = (acc: DemoAccount) => {
    setRole(acc.role);
    if (acc.tier) setTier(acc.tier);
    if (acc.activationState) setActivationState(acc.activationState);
    if (acc.adminRole) setAdminRole(acc.adminRole);
    setSubmitting(true);
    setTimeout(() => navigate({ to: acc.destination }), 200);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Renewably workspace."
      footer={
        <>
          New to Renewably?{" "}
          <Link to="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
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
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-ink-muted hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="press inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Continue to dashboard
        </button>
      </form>

      <div className="mt-6 rounded-2xl border bg-surface/50">
        <button
          type="button"
          onClick={() => setDemoOpen((v) => !v)}
          className="press flex w-full items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5 text-cat-purple" />
            Demo accounts
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-ink-muted transition-transform",
              demoOpen && "rotate-180",
            )}
          />
        </button>
        {demoOpen && (
          <div className="space-y-3 px-3.5 pb-3.5">
            <DemoSection title="Contractor">
              {DEMO_ACCOUNTS.filter((a) => a.kind === "contractor").map((a) => (
                <DemoButton key={a.email} acc={a} onClick={useDemo} />
              ))}
            </DemoSection>
            <DemoSection title="Admin (internal)">
              {DEMO_ACCOUNTS.filter((a) => a.kind === "admin").map((a) => (
                <DemoButton key={a.email} acc={a} onClick={useDemo} />
              ))}
            </DemoSection>
            <p className="text-[11px] text-ink-muted">
              One-click sign in. Sets tier, activation state, and admin role surface.
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

function DemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
        {title}
      </div>
      <div className="grid grid-cols-1 gap-1">{children}</div>
    </div>
  );
}

function DemoButton({
  acc,
  onClick,
}: {
  acc: DemoAccount;
  onClick: (a: DemoAccount) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(acc)}
      className="press flex items-start justify-between gap-2 rounded-lg border bg-background px-2.5 py-2 text-left hover:bg-surface"
    >
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-foreground">{acc.label}</div>
        <div className="truncate text-[11px] text-ink-muted">{acc.description}</div>
      </div>
      <div className="shrink-0 font-mono text-[10px] text-ink-muted">{acc.email.split("@")[0]}</div>
    </button>
  );
}

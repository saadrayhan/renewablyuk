import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authed/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Renewably UK" }] }),
  component: OnboardingStub,
});

function OnboardingStub() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-8">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
        Step 1 of 6
      </div>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
        Welcome to Renewably.
      </h1>
      <p className="mt-3 text-lg text-ink-muted">
        We'll get your workspace ready in a few short steps. The full
        onboarding wizard ships in the next iteration — for now you can jump
        straight in.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Go to dashboard <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Workflow, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Renewably UK — operations for Net Zero installers" },
      {
        name: "description",
        content:
          "The compliance and operations platform UK Net Zero installers run their work on. IBG, Jobs, Funding Match — in one place.",
      },
      {
        property: "og:title",
        content: "Renewably UK — operations for Net Zero installers",
      },
      {
        property: "og:description",
        content:
          "IBG, Jobs, Funding Match — the operations platform UK Net Zero installers run on.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div
            aria-hidden
            className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"
          >
            <span className="text-sm font-semibold">R</span>
          </div>
          <span className="text-base font-semibold tracking-tight">
            Renewably
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/pricing"
            className="press rounded-full px-4 py-2 text-sm text-ink-muted hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            to="/sign-in"
            className="press rounded-full px-4 py-2 text-sm text-ink-muted hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
              <Sparkles className="size-3.5" />
              Built for UK Net Zero installers
            </span>
            <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
              The operations platform for Net Zero installation companies.
            </h1>
            <p className="mt-6 text-balance text-lg text-ink-muted">
              Issue IBGs, manage jobs, match funding, and keep an audit trail —
              all in one calm, fast workspace.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                to="/sign-up"
                className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
              >
                Start free with Access
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/pricing"
                className="press inline-flex items-center rounded-full border bg-background px-5 py-3 text-sm font-medium text-foreground"
              >
                Compare plans
              </Link>
            </div>
          </div>

          <div className="stagger-in mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard
              tone="green"
              icon={<ShieldCheck className="size-6" />}
              title="IBG, in seconds"
              body="Generate Insurance Backed Guarantees and policy PDFs without leaving the platform."
            />
            <FeatureCard
              tone="blue"
              icon={<Workflow className="size-6" />}
              title="Jobs that link up"
              body="Customers, properties, jobs, submissions and audit — one connected record chain."
            />
            <FeatureCard
              tone="amber"
              icon={<Sparkles className="size-6" />}
              title="Funding Match"
              body="Schemes you actually qualify for, scored against your approved measures."
            />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-ink-muted">
          <span>© {new Date().getFullYear()} Renewably UK</span>
          <Link to="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  tone,
  icon,
  title,
  body,
}: {
  tone: "green" | "blue" | "amber";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const bgClass = {
    green: "bg-cat-green-bg text-cat-green",
    blue: "bg-cat-blue-bg text-cat-blue",
    amber: "bg-cat-amber-bg text-cat-amber",
  }[tone];

  return (
    <div className="rounded-3xl border bg-card p-6">
      <div
        className={`grid size-12 place-items-center rounded-2xl ${bgClass}`}
      >
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
    </div>
  );
}

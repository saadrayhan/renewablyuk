import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Workflow, Sparkles } from "lucide-react";
import { GradientOrb } from "@/components/app/gradient-orb";
import { Button } from "@/components/ui/button";

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
            className="grid size-8 place-items-center rounded-xl bg-brand-blue text-brand-blue-foreground"
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
          <Button asChild size="sm">
            <Link to="/sign-up">
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <GradientOrb variant="mint" size={720} className="-left-32 top-10 opacity-60" />
          <GradientOrb variant="peach" size={560} className="right-0 top-40 opacity-50" />
          <GradientOrb variant="lavender" size={520} className="left-1/3 top-72 opacity-40" />

          <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-20 sm:pt-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-strong)] bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted backdrop-blur">
                <Sparkles className="size-3.5" />
                Built for UK Net Zero installers
              </span>
              <h1 className="font-display mt-8 text-balance text-[44px] leading-[1.02] text-ink sm:text-[72px]">
                The operations platform for{" "}
                <span className="font-display-italic">Net Zero</span> installers.
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-ink-muted sm:text-lg">
                Issue IBGs, manage jobs, match funding, and keep an audit trail —
                all in one calm, fast workspace.
              </p>
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button asChild>
                  <Link to="/sign-up">
                    Start free with Access
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/pricing">Compare plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              What you get
            </div>
            <h2 className="font-display mt-4 text-4xl leading-[1.08] text-ink sm:text-5xl">
              Three tools, one quiet workspace.
            </h2>
          </div>
          <div className="stagger-in mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard
              orb="mint"
              icon={<ShieldCheck className="size-5" />}
              title="IBG, in seconds"
              body="Generate Insurance Backed Guarantees and policy PDFs without leaving the platform."
            />
            <FeatureCard
              orb="sky"
              icon={<Workflow className="size-5" />}
              title="Jobs that link up"
              body="Customers, properties, jobs, submissions and audit — one connected record chain."
            />
            <FeatureCard
              orb="peach"
              icon={<Sparkles className="size-5" />}
              title="Funding Match"
              body="Schemes you actually qualify for, scored against your approved measures."
            />
          </div>
        </section>

        {/* CTA band */}
        <section className="relative isolate overflow-hidden border-t bg-surface">
          <GradientOrb variant="rose" size={520} className="-left-20 top-0 opacity-40" />
          <GradientOrb variant="sky" size={520} className="-right-20 bottom-0 opacity-40" />
          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
            <h2 className="font-display text-4xl leading-[1.08] text-ink sm:text-5xl">
              Start <span className="font-display-italic">today</span>. Issue an IBG in minutes.
            </h2>
            <div className="mt-8">
              <Button asChild>
                <Link to="/sign-up">
                  Create your workspace
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
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
  orb,
  icon,
  title,
  body,
}: {
  orb: "mint" | "sky" | "peach" | "lavender" | "rose";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border bg-card p-6">
      <GradientOrb variant={orb} size={220} className="-right-10 -top-10 opacity-60" />
      <div className="relative grid size-10 place-items-center rounded-xl bg-tile text-ink">
        {icon}
      </div>
      <h3 className="font-display relative mt-6 text-2xl text-ink">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

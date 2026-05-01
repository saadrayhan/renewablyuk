import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Renewably UK" },
      {
        name: "description",
        content:
          "Two plans for Net Zero installers. Access is free. Operate unlocks Jobs, Funding Match, and the IBG repository.",
      },
      { property: "og:title", content: "Pricing — Renewably UK" },
      {
        property: "og:description",
        content:
          "Access is free. Operate unlocks Jobs, Funding Match, and the IBG repository.",
      },
    ],
  }),
  component: PricingPage,
});

const access = [
  "Issue IBG certificates",
  "Recent IBG history (30 days)",
  "Companies House verification",
  "Profile & company settings",
];

const operate = [
  "Everything in Access",
  "Full IBG repository (cancel & amend)",
  "Customers, Properties, Jobs",
  "Submissions tracker",
  "Funding Match (rule-driven)",
  "Reports & audit log",
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="press flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">R</span>
          </div>
          <span className="text-base font-semibold tracking-tight">
            Renewably
          </span>
        </Link>
        <Link
          to="/sign-up"
          className="press rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Get started
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <div className="text-center">
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-ink">
            Simple plans for serious installers.
          </h1>
          <p className="mt-4 text-lg text-ink-muted">
            Start free. Upgrade when you need the full operations stack.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          <PlanCard
            name="Access"
            price="£0"
            cadence="forever"
            blurb="Issue IBGs and keep your basics tidy."
            features={access}
            cta="Start with Access"
          />
          <PlanCard
            name="Operate"
            price="Subscription"
            cadence="billed monthly"
            blurb="Run your whole installation business in one place."
            features={operate}
            cta="Choose Operate"
            featured
          />
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  blurb,
  features,
  cta,
  featured,
}: {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-7 ${
        featured ? "bg-ink text-background" : "bg-card"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
        {featured ? (
          <span className="rounded-full bg-background/10 px-2.5 py-1 text-xs font-medium">
            Recommended
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight">{price}</span>
        <span
          className={`text-sm ${featured ? "text-background/70" : "text-ink-muted"}`}
        >
          {cadence}
        </span>
      </div>
      <p
        className={`mt-2 text-sm ${
          featured ? "text-background/80" : "text-ink-muted"
        }`}
      >
        {blurb}
      </p>

      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check
              className={`mt-0.5 size-4 shrink-0 ${
                featured ? "text-cat-green" : "text-cat-green"
              }`}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/sign-up"
        className={`press mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium ${
          featured
            ? "bg-background text-ink"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

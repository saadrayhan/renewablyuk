/**
 * Onboarding wizard — 6-step flow with stepper, progress persistence,
 * and Access-tier skipping the Payment step.
 *
 * Steps:
 *   1. Sign-up / account
 *   2. Verify email
 *   3. Company details
 *   4. Approved measures
 *   5. Accreditation upload
 *   6. Payment (skipped on Access tier) → Review
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, MailCheck, Building2, Wrench,
  ShieldCheck, CreditCard, ClipboardCheck, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDevRole } from "@/lib/dev-role";
import { StatePill } from "@/components/app/state-pill";

export const Route = createFileRoute("/_authed/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Renewably UK" }] }),
  component: OnboardingPage,
});

type Tier = "access" | "operate";

type WizardData = {
  tier: Tier;
  email: string;
  emailVerified: boolean;
  companyName: string;
  companyNumber: string;
  companyAddress: string;
  measures: string[];
  trustmarkId: string;
  accreditationFile: string;
  paymentMethod: "card" | "bacs" | "";
  cardLast4: string;
};

const STORAGE = "renewably:onboarding-wizard:v1";

const DEFAULT_DATA: WizardData = {
  tier: "operate",
  email: "",
  emailVerified: false,
  companyName: "",
  companyNumber: "",
  companyAddress: "",
  measures: [],
  trustmarkId: "",
  accreditationFile: "",
  paymentMethod: "",
  cardLast4: "",
};

const ALL_MEASURES = [
  "Cavity wall insulation",
  "Loft insulation",
  "Solid wall insulation (External)",
  "Solid wall insulation (Internal)",
  "Heat pump (ASHP)",
  "Heat pump (GSHP)",
  "Solar PV",
  "Solar thermal",
  "Smart heating controls",
  "Underfloor insulation",
];

function loadData(): WizardData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE);
    if (!raw) return DEFAULT_DATA;
    return { ...DEFAULT_DATA, ...(JSON.parse(raw) as Partial<WizardData>) };
  } catch {
    return DEFAULT_DATA;
  }
}

const STEPS = [
  { key: "account", label: "Account", icon: Sparkles },
  { key: "verify", label: "Verify", icon: MailCheck },
  { key: "company", label: "Company", icon: Building2 },
  { key: "measures", label: "Measures", icon: Wrench },
  { key: "accreditation", label: "Accreditation", icon: ShieldCheck },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: ClipboardCheck },
] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const { setOnboardingStep } = useDevRole();
  const [data, setData] = useState<WizardData>(DEFAULT_DATA);
  const [step, setStep] = useState(0);

  // Hydrate from localStorage after mount.
  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    if (typeof window !== "undefined") {
      const s = Number(window.localStorage.getItem(`${STORAGE}:step`) ?? 0);
      if (!Number.isNaN(s)) setStep(s);
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE, JSON.stringify(data));
    window.localStorage.setItem(`${STORAGE}:step`, String(step));
  }, [data, step]);

  const visibleSteps = useMemo(
    () => (data.tier === "access" ? STEPS.filter((s) => s.key !== "payment") : STEPS),
    [data.tier],
  );

  const current = visibleSteps[step];

  function patch(p: Partial<WizardData>) {
    setData((d) => ({ ...d, ...p }));
  }

  function next() {
    if (step < visibleSteps.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function finish() {
    setOnboardingStep("complete");
    toast.success("Welcome to Renewably UK");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE);
      window.localStorage.removeItem(`${STORAGE}:step`);
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-8 py-10">
      {/* Stepper */}
      <Stepper steps={visibleSteps} current={step} />

      {/* Card */}
      <div className="mt-10 rounded-3xl border border-border bg-surface p-10 shadow-sm">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
          Step {step + 1} of {visibleSteps.length}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            {titleFor(current.key)}
          </h1>
          <StatePill meta={statusFor(current.key, data)} />
        </div>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          {subtitleFor(current.key)}
        </p>

        <div className="mt-8">
          {current.key === "account" && <StepAccount data={data} patch={patch} />}
          {current.key === "verify" && <StepVerify data={data} patch={patch} />}
          {current.key === "company" && <StepCompany data={data} patch={patch} />}
          {current.key === "measures" && <StepMeasures data={data} patch={patch} />}
          {current.key === "accreditation" && <StepAccreditation data={data} patch={patch} />}
          {current.key === "payment" && <StepPayment data={data} patch={patch} />}
          {current.key === "review" && <StepReview data={data} />}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="press inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Back
          </button>

          {current.key === "review" ? (
            <button
              type="button"
              onClick={finish}
              className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Finish setup <Check className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance(current.key, data)}
              className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Stepper ──────────────────────────────────────────── */

function Stepper({
  steps,
  current,
}: {
  steps: ReadonlyArray<{ key: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
  current: number;
}) {
  return (
    <ol className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = s.icon;
        return (
          <li key={s.key} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full border text-xs font-medium",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary/10 text-primary",
                !done && !active && "border-border bg-surface text-ink-muted",
              )}
            >
              {done ? <Check className="size-4" /> : <Icon className="size-4" />}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                active ? "text-ink" : "text-ink-muted",
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="ml-1 h-px w-8 bg-border" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ─── Steps ──────────────────────────────────────────── */

function StepAccount({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-6">
      <Field label="Work email">
        <input
          type="email"
          value={data.email}
          onChange={(e) => patch({ email: e.target.value })}
          placeholder="you@company.co.uk"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>

      <Field label="Account tier">
        <div className="grid grid-cols-2 gap-3">
          <TierCard
            selected={data.tier === "access"}
            onClick={() => patch({ tier: "access" })}
            title="Access"
            desc="Issue and view IBGs. No payment required."
          />
          <TierCard
            selected={data.tier === "operate"}
            onClick={() => patch({ tier: "operate" })}
            title="Operate"
            desc="Full ops: jobs, funding, submissions, billing."
          />
        </div>
      </Field>
    </div>
  );
}

function TierCard({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-5 text-left transition press",
        selected ? "border-primary bg-primary/5" : "border-border bg-surface hover:bg-muted/40",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-ink">{title}</span>
        {selected && <Check className="size-4 text-primary" />}
      </div>
      <p className="mt-1 text-xs text-ink-muted">{desc}</p>
    </button>
  );
}

function StepVerify({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">
            We sent a verification link to{" "}
            <span className="font-semibold">{data.email || "your inbox"}</span>.
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Open the link to confirm. (Demo mode — click the button below to mark as verified.)
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                patch({ emailVerified: true });
                toast.success("Email verified");
              }}
              disabled={data.emailVerified}
              className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {data.emailVerified ? "Verified" : "Mark as verified"}
            </button>
            <button
              type="button"
              onClick={() => toast.info("Verification link resent")}
              className="press inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-ink"
            >
              Resend link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCompany({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Company name">
        <input
          value={data.companyName}
          onChange={(e) => patch({ companyName: e.target.value })}
          placeholder="Evergreen Installs Ltd"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>
      <Field label="Companies House number">
        <input
          value={data.companyNumber}
          onChange={(e) => patch({ companyNumber: e.target.value })}
          placeholder="12345678"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>
      <Field label="Registered address">
        <textarea
          value={data.companyAddress}
          onChange={(e) => patch({ companyAddress: e.target.value })}
          placeholder="Street, city, postcode"
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>
    </div>
  );
}

function StepMeasures({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  function toggle(m: string) {
    patch({
      measures: data.measures.includes(m)
        ? data.measures.filter((x) => x !== m)
        : [...data.measures, m],
    });
  }
  return (
    <div>
      <p className="mb-4 text-xs text-ink-muted">
        Select the measures your team installs. Admin will review and approve.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {ALL_MEASURES.map((m) => {
          const on = data.measures.includes(m);
          return (
            <button
              key={m}
              type="button"
              onClick={() => toggle(m)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition press",
                on
                  ? "border-primary bg-primary/5 text-ink"
                  : "border-border bg-surface text-ink hover:bg-muted/40",
              )}
            >
              <span>{m}</span>
              {on && <Check className="size-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepAccreditation({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="TrustMark Licence ID">
        <input
          value={data.trustmarkId}
          onChange={(e) => patch({ trustmarkId: e.target.value })}
          placeholder="TM-000-000-00"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>
      <Field label="Accreditation document">
        <button
          type="button"
          onClick={() => {
            patch({ accreditationFile: "trustmark-cert.pdf" });
            toast.success("Document uploaded");
          }}
          className="press flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-sm text-ink-muted hover:bg-muted/40"
        >
          {data.accreditationFile ? (
            <span className="flex items-center gap-2 text-ink">
              <Check className="size-4 text-primary" /> {data.accreditationFile}
            </span>
          ) : (
            "Click to upload PDF (demo)"
          )}
        </button>
      </Field>
    </div>
  );
}

function StepPayment({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Payment method">
        <div className="grid grid-cols-2 gap-3">
          <TierCard
            selected={data.paymentMethod === "card"}
            onClick={() => patch({ paymentMethod: "card", cardLast4: "4242" })}
            title="Card"
            desc="Stripe-secured. Charged monthly in arrears."
          />
          <TierCard
            selected={data.paymentMethod === "bacs"}
            onClick={() => patch({ paymentMethod: "bacs", cardLast4: "" })}
            title="BACS direct debit"
            desc="UK bank transfer. 2-day setup."
          />
        </div>
      </Field>
      {data.paymentMethod === "card" && (
        <div className="rounded-xl border border-border bg-background p-4 text-xs text-ink-muted">
          Card ending in <span className="font-medium text-ink">{data.cardLast4}</span>{" "}
          (demo — no real charge).
        </div>
      )}
    </div>
  );
}

function StepReview({ data }: { data: WizardData }) {
  return (
    <div className="space-y-3">
      <ReviewRow label="Tier" value={data.tier === "access" ? "Access" : "Operate"} />
      <ReviewRow label="Email" value={data.email || "—"} />
      <ReviewRow label="Email verified" value={data.emailVerified ? "Yes" : "No"} />
      <ReviewRow label="Company" value={data.companyName || "—"} />
      <ReviewRow label="Companies House" value={data.companyNumber || "—"} />
      <ReviewRow label="Measures" value={data.measures.length ? `${data.measures.length} selected` : "None"} />
      <ReviewRow label="TrustMark" value={data.trustmarkId || "—"} />
      <ReviewRow label="Accreditation" value={data.accreditationFile || "—"} />
      {data.tier === "operate" && (
        <ReviewRow
          label="Payment"
          value={
            data.paymentMethod === "card"
              ? `Card •••• ${data.cardLast4}`
              : data.paymentMethod === "bacs"
              ? "BACS direct debit"
              : "—"
          }
        />
      )}
      <p className="pt-3 text-xs text-ink-muted">
        Submitting will queue your account for admin review. You can sign in immediately
        and start in read-only mode while we verify.
      </p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

/* ─── Field primitive ──────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

/* ─── Helpers ──────────────────────────────────────────── */

function titleFor(key: string) {
  switch (key) {
    case "account": return "Create your account";
    case "verify": return "Verify your email";
    case "company": return "Company details";
    case "measures": return "Approved measures";
    case "accreditation": return "Upload accreditation";
    case "payment": return "Payment setup";
    case "review": return "Review & submit";
    default: return "";
  }
}

function subtitleFor(key: string) {
  switch (key) {
    case "account": return "Pick a tier — you can upgrade later from Settings.";
    case "verify": return "We sent you a confirmation link to keep your account secure.";
    case "company": return "We use this for compliance, billing, and TrustMark verification.";
    case "measures": return "Tell us what your team installs. Admin will approve before they appear in IBG flows.";
    case "accreditation": return "Upload your TrustMark certificate. PAS 2030 / 2035 docs may follow.";
    case "payment": return "Required for Operate tier — you won't be charged today.";
    case "review": return "Final check — confirm everything looks right before we submit.";
    default: return "";
  }
}

function statusFor(key: string, data: WizardData) {
  if (key === "verify") {
    return data.emailVerified
      ? { label: "Verified", tone: "active" as const }
      : { label: "Awaiting verification", tone: "warning" as const };
  }
  return { label: "In progress", tone: "info" as const };
}

function canAdvance(key: string, data: WizardData): boolean {
  switch (key) {
    case "account": return /\S+@\S+\.\S+/.test(data.email);
    case "verify": return data.emailVerified;
    case "company": return data.companyName.length > 1 && data.companyNumber.length > 1;
    case "measures": return data.measures.length > 0;
    case "accreditation": return data.trustmarkId.length > 1 && data.accreditationFile.length > 0;
    case "payment": return data.paymentMethod !== "";
    default: return true;
  }
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { StatePill } from "@/components/app/state-pill";
import { PaymentMethodDialog } from "@/components/app/payment-method-dialog";

export const Route = createFileRoute("/_authed/settings/subscription")({
  head: () => ({ meta: [{ title: "Subscription — Renewably UK" }] }),
  component: SubscriptionSettings,
});

type State = "active" | "payment-failed" | "cancelled";

function SubscriptionSettings() {
  const [last4, setLast4] = useState("4242");
  const [payOpen, setPayOpen] = useState(false);
  const [state, setState] = useState<State>("active");

  const meta =
    state === "active"
      ? { label: "Active", tone: "active" as const }
      : state === "payment-failed"
      ? { label: "Payment failed", tone: "error" as const }
      : { label: "Cancelled", tone: "neutral" as const };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Operate plan</h2>
            <p className="mt-1 text-xs text-ink-muted">£249 per month — billed in arrears.</p>
          </div>
          <StatePill meta={meta} />
        </div>

        {state === "payment-failed" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-cat-rose/30 bg-cat-rose-bg p-4 text-sm text-cat-rose">
            <AlertTriangle className="mt-0.5 size-4" />
            <div>
              Last charge failed on the card ending •••• 4242. Update your payment method to keep
              full access — you have 7 days before features are restricted.
            </div>
          </div>
        )}

        {state === "cancelled" && (
          <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm text-ink-muted">
            Your subscription is cancelled. You can keep using Operate features until the end of
            the current billing period.
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Stat label="Current period" value="1 May → 31 May 2026" />
          <Stat label="Next invoice" value="£249.00 on 1 Jun" />
          <Stat label="Payment method" value={`Card •••• ${last4}`} />
          <Stat label="Submissions this month" value="14" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPayOpen(true)}
            className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <CreditCard className="size-4" /> Update payment method
          </button>
          <button
            type="button"
            onClick={() => toast.info("Invoice downloaded (demo)")}
            className="press rounded-full border border-border px-4 py-2 text-sm font-medium text-ink"
          >
            Download invoices
          </button>
          {state !== "cancelled" ? (
            <button
              type="button"
              onClick={() => {
                setState("cancelled");
                toast("Subscription cancelled");
              }}
              className="press ml-auto rounded-full border border-border px-4 py-2 text-sm font-medium text-cat-rose"
            >
              Cancel subscription
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setState("active");
                toast.success("Subscription reactivated");
              }}
              className="press ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <CheckCircle2 className="size-4" /> Reactivate
            </button>
          )}
        </div>
      </section>

      {/* Demo state switcher (no backend) */}
      <section className="rounded-2xl border border-dashed border-border bg-background p-4 text-xs text-ink-muted">
        <span className="font-medium text-ink">Demo:</span> simulate billing state
        <div className="mt-2 flex gap-2">
          {(["active", "payment-failed", "cancelled"] as State[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setState(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                state === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-ink-muted hover:bg-muted/40",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

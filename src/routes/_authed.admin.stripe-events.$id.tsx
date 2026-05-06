import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, KeyRound } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/mock/queries";
import { retryStripeWebhook, type RetryAttempt } from "@/server/stripe.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/stripe-events/$id")({
  head: () => ({ meta: [{ title: "Stripe event — Renewably UK" }] }),
  component: StripeEventDetail,
});

function StripeEventDetail() {
  const { id } = Route.useParams();
  const retry = useServerFn(retryStripeWebhook);
  const [attempts, setAttempts] = useState<RetryAttempt[]>([]);
  const [pending, setPending] = useState(false);
  const [secretMissing, setSecretMissing] = useState(false);

  const payload = {
    id: `evt_${id}`,
    type: "invoice.payment_succeeded",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    api_version: "2024-04-10",
    data: {
      object: {
        id: `in_${id}`,
        amount_paid: 4900,
        currency: "gbp",
        customer: `cus_${id.slice(0, 8)}`,
        status: "paid",
      },
    },
  };

  async function onRetry() {
    setPending(true);
    try {
      const res = await retry({ data: { eventId: id } });
      setAttempts((xs) => [res.attempt, ...xs]);
      if (res.needsSecret) {
        setSecretMissing(true);
        toast.error("STRIPE_WEBHOOK_SECRET is not set. Add it to enable retries.");
      } else if (res.ok) {
        toast.success(`Webhook redelivered · ${res.attempt.status}`);
      } else {
        toast.error(`Retry failed · ${res.attempt.status || "network"}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Retry failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/admin/stripe-events" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Stripe events
      </Link>
      <div className="mt-3">
        <PageHeader
          eyebrow="Admin · Integrations · Stripe"
          title={payload.type}
          subtitle={`Event ${payload.id} · ${fmtDate(payload.created * 1000)}`}
          actions={
            <Button variant="primary" size="sm" disabled={pending} onClick={onRetry}>
              <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} />
              {pending ? "Redelivering…" : "Retry webhook"}
            </Button>
          }
        />
      </div>

      {secretMissing && (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border bg-brand-blue-tint px-4 py-3 text-xs text-brand-blue">
          <div className="flex items-start gap-2">
            <KeyRound className="size-4 shrink-0" />
            <span>
              Add the <span className="font-mono">STRIPE_WEBHOOK_SECRET</span> server secret to sign retries.
              Once set, click Retry again to redeliver.
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border bg-brand-blue-tint px-4 py-3 text-xs text-brand-blue">
        Test mode event — no production funds were moved.
      </div>

      <section className="mt-4 rounded-2xl border bg-card">
        <header className="border-b px-5 py-3">
          <h2 className="text-base font-semibold text-foreground">Payload</h2>
        </header>
        <pre className="overflow-x-auto px-5 py-4 text-[12px] leading-relaxed text-foreground">
{JSON.stringify(payload, null, 2)}
        </pre>
      </section>

      <section className="mt-4 rounded-2xl border bg-card">
        <header className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-base font-semibold text-foreground">Delivery attempts</h2>
          <span className="text-[11px] text-ink-muted">{attempts.length} this session</span>
        </header>
        {attempts.length === 0 ? (
          <div className="px-5 py-6 text-sm text-ink-muted">
            No retry attempts yet. Click <span className="text-foreground">Retry webhook</span> to redeliver.
          </div>
        ) : (
          <div className="divide-y">
            {attempts.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                <div className="flex items-start gap-3">
                  {a.ok ? (
                    <CheckCircle2 className="mt-0.5 size-4 text-cat-green" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 text-destructive" />
                  )}
                  <div>
                    <div className="text-foreground">
                      {a.ok ? "Delivered" : "Failed"} · HTTP {a.status || "—"} · {a.latencyMs}ms
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-muted break-all">{a.responseExcerpt}</div>
                  </div>
                </div>
                <div className="shrink-0 text-[11px] text-ink-muted">{fmtDate(a.at)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-[10px] uppercase tracking-wide text-ink-muted">Related customer</div>
          <div className="mt-1 font-mono text-sm text-foreground">{payload.data.object.customer}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-[10px] uppercase tracking-wide text-ink-muted">Related invoice</div>
          <div className="mt-1 font-mono text-sm text-foreground">{payload.data.object.id}</div>
        </div>
      </section>
    </div>
  );
}

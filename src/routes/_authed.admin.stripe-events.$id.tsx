import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/admin/stripe-events/$id")({
  head: () => ({ meta: [{ title: "Stripe event — Renewably UK" }] }),
  component: StripeEventDetail,
});

function StripeEventDetail() {
  const { id } = Route.useParams();
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
          actions={<Button variant="secondary" size="sm"><RefreshCw className="size-4" /> Retry webhook</Button>}
        />
      </div>

      <div className="mt-6 rounded-2xl border bg-brand-blue-tint px-4 py-3 text-xs text-brand-blue">
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

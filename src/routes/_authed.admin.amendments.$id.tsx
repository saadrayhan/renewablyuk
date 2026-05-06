import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { useStore, update } from "@/lib/mock/store";
import { fmtDate } from "@/lib/mock/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/amendments/$id")({
  head: () => ({ meta: [{ title: "Amendment — Renewably UK" }] }),
  component: AmendmentDetail,
});

function AmendmentDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const amd = data.amendments.find((a) => a.id === id);
  if (!amd) throw notFound();
  const ibg = data.ibgs.find((i) => i.id === amd.ibgId);

  function decide(state: "approved" | "rejected") {
    update((d) => {
      const x = d.amendments.find((a) => a.id === id);
      if (!x) return;
      x.state = state;
      x.decidedAt = Date.now();
      x.decidedBy = "Admin";
    });
    toast.success(`Amendment ${state}`);
  }

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/admin/amendments" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Amendments queue
      </Link>
      <div className="mt-3">
        <PageHeader
          eyebrow="Admin · Operations · Amendments"
          title={`Amend ${amd.field}`}
          subtitle={ibg ? `IBG ${ibg.ref} · ${ibg.customerName}` : "Amendment request"}
          actions={
            amd.state === "pending" ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => decide("rejected")}>Reject</Button>
                <Button variant="brand" size="sm" onClick={() => decide("approved")}>Approve</Button>
              </>
            ) : (
              <span className={`text-xs ${amd.state === "approved" ? "text-cat-green" : "text-cat-rose"}`}>{amd.state}</span>
            )
          }
        />
      </div>

      <section className="mt-6 rounded-2xl border bg-card">
        <header className="border-b px-5 py-3"><h2 className="text-base font-semibold text-foreground">Change requested</h2></header>
        <div className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-2">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-ink-muted">Field</div>
            <div className="mt-0.5 text-sm font-medium text-foreground">{amd.field}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-ink-muted">Requested</div>
            <div className="mt-0.5 text-sm text-foreground">{fmtDate(amd.createdAt)}</div>
          </div>
          <div className="rounded-xl border bg-surface/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-ink-muted">From</div>
            <div className="mt-0.5 text-sm text-foreground">{amd.oldValue}</div>
          </div>
          <div className="rounded-xl border bg-surface/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-ink-muted">To</div>
            <div className="mt-0.5 text-sm font-medium text-foreground">{amd.newValue}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-wide text-ink-muted">Reason</div>
            <div className="mt-0.5 text-sm text-foreground">{amd.reason}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

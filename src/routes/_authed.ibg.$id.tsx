import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Download, FileWarning, Ban } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { findIbg, fmtDate, pushAudit } from "@/lib/mock/queries";
import { StatePill, IBG_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/ibg/$id")({
  head: () => ({ meta: [{ title: "IBG — Renewably UK" }] }),
  component: IbgDetail,
});

function IbgDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const ibg = findIbg(data, id);
  const { user } = useAuth();
  const { permissions } = useDevRole();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!ibg) throw notFound();

  const sameMonth = ibg.issuedAt ? new Date(ibg.issuedAt).getMonth() === new Date().getMonth() && new Date(ibg.issuedAt).getFullYear() === new Date().getFullYear() : false;
  const canRequestAmendment = can(permissions, "ibg.amendment.request") && ibg.state === "issued";
  const canCancel = can(permissions, "ibg.cancel") && ibg.state === "issued" && sameMonth;

  function download() {
    const blob = new Blob([`Renewably UK\nIBG Certificate\nReference: ${ibg!.ref}\nIssued by: ${ibg!.issuedBy}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${ibg!.ref}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function cancelIbg() {
    update((d) => {
      const i = d.ibgs.find((x) => x.id === id);
      if (!i) return;
      i.state = "cancelled";
      pushAudit(d, "ibg", id, user.fullName, "Cancelled IBG");
    });
    toast.success("IBG cancelled");
    setConfirmCancel(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <Link to="/ibg/repository" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Repository
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">IBG · {ibg.ref}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{ibg.measure}</h1>
          <div className="mt-2 text-sm text-ink-muted">{ibg.customerName} · {ibg.propertyAddress}</div>
        </div>
        <StatePill meta={IBG_STATES[ibg.state]} />
      </div>

      {/* State machine */}
      <StateRail current={ibg.state} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={download} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm">
          <Download className="size-3.5" /> Download certificate
        </button>
        {canRequestAmendment && (
          <Link to="/ibg/$id/amendment" params={{ id: ibg.id }} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm">
            <FileWarning className="size-3.5" /> Request amendment
          </Link>
        )}
        {canCancel && (
          <button onClick={() => setConfirmCancel(true)} className="press inline-flex items-center gap-1.5 rounded-full border border-cat-rose/30 bg-cat-rose-bg px-3 py-1.5 text-sm text-cat-rose">
            <Ban className="size-3.5" /> Cancel IBG
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-sm font-medium text-foreground">Cover details</div>
          <div className="mt-3 space-y-2">
            <Row label="Customer" value={ibg.customerName} />
            <Row label="Property" value={ibg.propertyAddress} />
            <Row label="Measure" value={ibg.measure} />
            <Row label="Policy" value={ibg.policyType} />
            <Row label="Issued by" value={ibg.issuedBy} />
            <Row label="Issued at" value={ibg.issuedAt ? fmtDate(ibg.issuedAt) : "—"} />
          </div>
        </div>
        <AuditTimeline entityType="ibg" entityId={ibg.id} />
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-5">
            <div className="text-sm font-semibold">Cancel {ibg.ref}?</div>
            <div className="mt-1 text-sm text-ink-muted">This permanently cancels the IBG. The action is logged in the audit trail.</div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setConfirmCancel(false)} className="press rounded-full border px-3 py-1.5 text-sm">Keep</button>
              <button onClick={cancelIbg} className="press rounded-full bg-cat-rose px-3 py-1.5 text-sm text-white">Cancel IBG</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const STATE_ORDER = ["draft", "initiated", "awaiting-validation", "validated", "ready-for-issue", "issued"] as const;

function StateRail({ current }: { current: string }) {
  const idx = STATE_ORDER.indexOf(current as never);
  const offTrack = idx === -1;
  return (
    <div className="mt-6 rounded-2xl border bg-card p-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">Lifecycle</div>
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto">
        {STATE_ORDER.map((s, i) => {
          const reached = !offTrack && i <= idx;
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${reached ? "bg-foreground text-background" : "bg-tile text-ink-muted"}`}>
                {IBG_STATES[s].label}
              </div>
              {i < STATE_ORDER.length - 1 && <div className={`h-px w-6 ${i < idx ? "bg-foreground" : "bg-border"}`} />}
            </div>
          );
        })}
        {offTrack && (
          <span className="ml-3 text-[11px] text-ink-muted">Currently · <StatePill meta={IBG_STATES[current]} /></span>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

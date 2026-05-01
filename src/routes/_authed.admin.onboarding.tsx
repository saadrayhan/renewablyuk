import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update } from "@/lib/mock/store";
import { StatePill, ONBOARDING_STATES } from "@/components/app/state-pill";
import { fmtDate, pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import { FilterPills } from "@/components/app/filter-pills";
import type { OnboardingApplicationState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/admin/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding queue — Renewably UK" }] }),
  component: OnboardingQueue,
});

function OnboardingQueue() {
  const data = useStore();
  const { user } = useAuth();
  const [filter, setFilter] = useState<OnboardingApplicationState | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = data.onboarding.filter((o) => filter === "all" || o.state === filter);
  const open = data.onboarding.find((o) => o.id === openId);

  function setState(id: string, next: OnboardingApplicationState) {
    update((d) => {
      const x = d.onboarding.find((y) => y.id === id);
      if (!x) return;
      x.state = next;
      pushAudit(d, "user", id, user.fullName, `Onboarding → ${next}`);
    });
    toast.success(`Application ${next}`);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10">
      <PageHeader eyebrow="Admin · Onboarding" title="Onboarding queue" subtitle="Review submitted applications. Verify, activate or reject." />

      <div className="mt-6">
        <FilterPills<OnboardingApplicationState>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "awaiting-review", label: "Awaiting review" },
            { value: "awaiting-verification", label: "Awaiting verification" },
            { value: "blocked", label: "Blocked" },
            { value: "activated", label: "Activated" },
          ].map((f) => ({ ...f, count: data.onboarding.filter((o) => o.state === f.value as OnboardingApplicationState).length })) as never}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {rows.map((o) => (
          <button key={o.id} onClick={() => setOpenId(o.id)} className="press rounded-2xl border bg-card p-5 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">{o.companyName}</div>
                <div className="text-xs text-ink-muted">{o.contactName} · {o.contactEmail}</div>
              </div>
              <StatePill meta={ONBOARDING_STATES[o.state]} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {o.measures.map((m) => <span key={m} className="rounded-full bg-tile px-2 py-0.5 text-[11px] text-ink-muted">{m}</span>)}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted">
              <span>Submitted {fmtDate(o.submittedAt)}</span>
              <span>{o.tier === "operate" ? "Operate" : "Access"}</span>
            </div>
            {o.blockedReason && (
              <div className="mt-3 rounded-xl bg-cat-rose-bg/50 px-3 py-2 text-[11px] text-cat-rose">{o.blockedReason}</div>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setOpenId(null)}>
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-xs uppercase tracking-wide text-ink-muted">Application</div>
            <h2 className="mt-1 text-xl font-semibold">{open.companyName}</h2>
            <div className="mt-1 text-sm text-ink-muted">{open.contactName} · {open.contactEmail}</div>

            <div className="mt-4 space-y-2 text-sm">
              <div><span className="text-ink-muted">Companies House</span> · {open.companiesHouseNumber}</div>
              <div><span className="text-ink-muted">Tier</span> · {open.tier}</div>
              <div><span className="text-ink-muted">Measures</span> · {open.measures.join(", ")}</div>
              <div><span className="text-ink-muted">Accreditations</span> · {open.accreditationFiles.join(", ") || "None"}</div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setState(open.id, "blocked"); setOpenId(null); }} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm">
                <XCircle className="size-3.5" /> Reject
              </button>
              <button onClick={() => { setState(open.id, "ready-for-activation"); setOpenId(null); }} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm">
                <Clock className="size-3.5" /> Mark ready
              </button>
              <button onClick={() => { setState(open.id, "activated"); setOpenId(null); }} className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background">
                <CheckCircle2 className="size-3.5" /> Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

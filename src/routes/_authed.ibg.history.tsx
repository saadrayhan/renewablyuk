import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileBadge, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { StatePill, IBG_STATES } from "@/components/app/state-pill";
import { fmtDate } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";

export const Route = createFileRoute("/_authed/ibg/history")({
  head: () => ({ meta: [{ title: "IBG history — Renewably UK" }] }),
  component: IbgHistory,
});

function IbgHistory() {
  const data = useStore();
  const { role } = useDevRole();
  const isAccessTier = role === "installer-access";
  const all = [...data.ibgs].sort((a, b) => b.createdAt - a.createdAt);
  const rows = isAccessTier ? all.slice(0, 5) : all;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="IBG"
        title="IBG history"
        subtitle={isAccessTier ? "Your 5 most recent IBGs. Upgrade to Operate for full history." : "Every IBG issued from your workspace."}
        actions={
          <Link to="/ibg/new" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <FileBadge className="size-4" /> New IBG
          </Link>
        }
      />

      {rows.length === 0 ? (
        <div className="mt-6"><EmptyState icon={FileBadge} title="No IBGs yet" body="Issue your first one." /></div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-4 py-2.5 text-left">Ref</th>
                <th className="px-4 py-2.5 text-left">Customer</th>
                <th className="px-4 py-2.5 text-left">Property</th>
                <th className="px-4 py-2.5 text-left">Measure</th>
                <th className="px-4 py-2.5 text-left">Issued</th>
                <th className="px-4 py-2.5 text-right">State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className="border-b last:border-b-0 hover:bg-surface/60">
                  <td className="px-4 py-3"><Link to="/ibg/$id" params={{ id: i.id }} className="font-medium text-foreground hover:underline">{i.ref}</Link></td>
                  <td className="px-4 py-3 text-foreground">{i.customerName}</td>
                  <td className="px-4 py-3 text-ink-muted">{i.propertyAddress}</td>
                  <td className="px-4 py-3 text-foreground">{i.measure}</td>
                  <td className="px-4 py-3 text-ink-muted">{i.issuedAt ? fmtDate(i.issuedAt) : "—"}</td>
                  <td className="px-4 py-3 text-right"><StatePill meta={IBG_STATES[i.state]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAccessTier && all.length > 5 && (
        <div className="mt-5 flex items-center justify-between rounded-2xl border bg-foreground p-5 text-background">
          <div>
            <div className="text-sm font-semibold">{all.length - 5} more IBGs locked</div>
            <div className="text-xs text-background/70">Upgrade to Operate for full history, repository search, amendments and funding.</div>
          </div>
          <Link to="/pricing" className="press inline-flex items-center gap-1 rounded-full bg-background px-4 py-2 text-xs font-medium text-foreground">
            <Sparkles className="size-3" /> Upgrade <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

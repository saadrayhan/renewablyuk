import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, MapPin, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/funding/match")({
  head: () => ({ meta: [{ title: "Match Hub — Renewably UK" }] }),
  component: MatchHub,
});

function MatchHub() {
  const data = useStore();
  const { user } = useAuth();
  const nav = useNavigate();
  const matches = [...data.fundingMatches].sort((a, b) => b.score - a.score);

  function startProject(scheme: string, measure: string) {
    const job = data.jobs[0];
    if (!job) {
      toast.error("Add a job before creating a funding project");
      return;
    }
    const id = nid("fp");
    update((d) => {
      d.fundingProjects.unshift({
        id,
        ref: nref("F"),
        jobId: job.id,
        scheme,
        measure,
        state: "incomplete",
        createdAt: Date.now(),
        evidence: [],
      });
      pushAudit(d, "funding", id, user.fullName, `Started from Match Hub · ${scheme}`);
    });
    toast.success(`Started funding project for ${scheme}`);
    nav({ to: "/funding/$id", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Funding"
        title="Match Hub"
        subtitle="Schemes scored against your approved measures and operating geography."
      />

      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {matches.map((m) => (
          <div key={m.scheme} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-cat-rose-bg text-cat-rose">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-foreground">{m.scheme}</div>
                    <div className="inline-flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin className="size-3" /> {m.region}
                    </div>
                  </div>
                </div>
              </div>
              <ScoreRing score={m.score} />
            </div>

            <p className="mt-3 text-sm text-ink-muted">{m.description}</p>

            <div className="mt-3 flex flex-wrap gap-1">
              {m.measures.map((mz) => (
                <span key={mz} className="inline-flex items-center gap-1 rounded-full bg-tile px-2 py-0.5 text-[11px] text-ink-muted">
                  <Check className="size-3 text-cat-green" /> {mz}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.state === "active" ? "bg-cat-green-bg text-cat-green" : m.state === "opportunity" ? "bg-cat-amber-bg text-cat-amber" : "bg-tile text-ink-muted"}`}>
                {m.state === "active" ? "Active match" : m.state === "opportunity" ? "Opportunity" : "No match"}
              </span>
              <button
                type="button"
                onClick={() => startProject(m.scheme, m.measures[0] ?? "Insulation")}
                disabled={m.state === "no-match"}
                className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
              >
                Start funding project <ArrowRight className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const tone = score > 80 ? "text-cat-green" : score > 50 ? "text-cat-amber" : "text-ink-muted";
  return (
    <div className={`grid size-14 place-items-center rounded-full border-2 ${tone}`}>
      <div className={`text-sm font-semibold ${tone}`}>{score}</div>
    </div>
  );
}

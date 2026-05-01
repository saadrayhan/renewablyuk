import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, MapPin, ArrowRight, Check } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";

export const Route = createFileRoute("/_authed/funding/match")({
  head: () => ({ meta: [{ title: "Match Hub — Renewably UK" }] }),
  component: MatchHub,
});

function MatchHub() {
  const data = useStore();
  const matches = [...data.fundingMatches].sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-8 py-10">
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
              <Link to="/funding" className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background">
                Start funding project <ArrowRight className="size-3" />
              </Link>
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

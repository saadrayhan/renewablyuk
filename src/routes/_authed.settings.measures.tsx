import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { StatePill } from "@/components/app/state-pill";

export const Route = createFileRoute("/_authed/settings/measures")({
  head: () => ({ meta: [{ title: "Measures — Renewably UK" }] }),
  component: MeasuresSettings,
});

const APPROVED = [
  "Cavity wall insulation",
  "Loft insulation",
  "Solar PV",
  "Smart heating controls",
];

const CATALOG = [
  "Solid wall insulation (External)",
  "Solid wall insulation (Internal)",
  "Heat pump (ASHP)",
  "Heat pump (GSHP)",
  "Solar thermal",
  "Underfloor insulation",
  "Window glazing upgrade",
  "Mechanical ventilation",
];

function MeasuresSettings() {
  const [requested, setRequested] = useState<string[]>([]);

  function request(m: string) {
    if (requested.includes(m)) return;
    setRequested([...requested, m]);
    toast.success("Request sent to admin");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-base font-semibold text-ink">Approved measures</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Measures your team is currently authorised to install. Used to match funding schemes.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {APPROVED.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1.5 rounded-full bg-cat-green-bg px-3 py-1 text-xs font-medium text-cat-green"
            >
              <Check className="size-3.5" />
              {m}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface">
        <div className="border-b border-border p-6">
          <h2 className="text-base font-semibold text-ink">Request a new measure</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Select from the catalog. Admin will review accreditation before adding it to your approved list.
          </p>
        </div>
        <ul>
          {CATALOG.map((m) => {
            const isRequested = requested.includes(m);
            return (
              <li
                key={m}
                className="flex items-center justify-between border-b border-border px-6 py-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ink">{m}</span>
                  {isRequested && <StatePill meta={{ label: "Pending review", tone: "warning" }} />}
                </div>
                <button
                  type="button"
                  disabled={isRequested}
                  onClick={() => request(m)}
                  className={cn(
                    "press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                    isRequested
                      ? "border border-border text-ink-muted"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {isRequested ? (
                    <>
                      <Clock className="size-3.5" /> Requested
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" /> Request
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

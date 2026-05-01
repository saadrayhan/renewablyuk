import { createFileRoute } from "@tanstack/react-router";
import { Activity as ActIcon } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { relTime } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/admin/activity")({
  head: () => ({ meta: [{ title: "Activity — Renewably UK" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const data = useStore();
  const rows = [...data.activity].sort((a, b) => b.at - a.at);

  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-10">
      <PageHeader eyebrow="Admin · Compliance" title="Activity" subtitle="Live platform feed." />

      <div className="mt-6 rounded-2xl border bg-card">
        {rows.map((act) => (
          <div key={act.id} className="flex items-center justify-between gap-3 border-b px-5 py-3 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-cat-green-bg text-cat-green"><ActIcon className="size-4" /></div>
              <div className="text-sm text-foreground">
                <span className="font-medium">{act.actor}</span> <span className="text-ink-muted">{act.action}</span> <span className="font-medium">{act.target}</span>
              </div>
            </div>
            <div className="text-xs text-ink-muted">{relTime(act.at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

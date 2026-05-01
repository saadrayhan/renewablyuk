/**
 * AuditTimeline — right-rail vertical list of AuditEvent items, used on
 * every record detail screen (Customer, Property, Job, IBG, Funding,
 * Submission). Reads from the mock store filtered by entity.
 */

import { useStore } from "@/lib/mock/store";
import type { AuditEvent } from "@/lib/mock/types";
import { History } from "lucide-react";

export function AuditTimeline({
  entityType,
  entityId,
}: {
  entityType: AuditEvent["entityType"];
  entityId: string;
}) {
  const data = useStore();
  const events = data.audit
    .filter((e) => e.entityType === entityType && e.entityId === entityId)
    .sort((a, b) => b.at - a.at);

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-ink-muted">
        <History className="size-3.5" /> Audit timeline
      </div>
      {events.length === 0 ? (
        <div className="rounded-xl bg-surface px-3 py-4 text-xs text-ink-muted">
          No events recorded yet.
        </div>
      ) : (
        <ol className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="relative pl-4">
              <span className="absolute left-0 top-1.5 size-2 rounded-full bg-foreground" />
              <div className="text-sm text-foreground">{e.action}</div>
              {e.detail && (
                <div className="text-xs text-ink-muted">{e.detail}</div>
              )}
              <div className="text-[11px] text-ink-muted">
                {e.actor} · {fmt(e.at)}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

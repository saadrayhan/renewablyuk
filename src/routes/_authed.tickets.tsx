import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LifeBuoy, Plus, Send } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { useStore } from "@/lib/mock/store";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  const { tickets, ticketMessages } = useStore();
  const [activeId, setActiveId] = useState<string | null>(tickets[0]?.id ?? null);
  const active = tickets.find((t) => t.id === activeId);
  const thread = ticketMessages.filter((m) => m.ticketId === activeId);

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <div className="flex items-end justify-between gap-4 px-6 pb-4 pt-8 md:px-10 md:pt-12">
        <PageHeader eyebrow="SUPPORT" title="Tickets" />
        <button className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="size-4" /> New ticket
        </button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden border-t md:grid-cols-[320px_1fr]">
        <aside className="overflow-y-auto border-r">
          {tickets.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={LifeBuoy} title="No tickets" body="Open one when you need help." />
            </div>
          ) : (
            <ul className="divide-y">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    className={cn(
                      "press w-full px-4 py-3 text-left transition-colors",
                      activeId === t.id ? "bg-surface" : "hover:bg-surface/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-ink-muted">{t.ref}</span>
                      <span className="text-[10px] uppercase tracking-wide text-ink-muted">{t.state}</span>
                    </div>
                    <div className="mt-1 truncate text-sm font-medium text-foreground">{t.subject}</div>
                    <div className="mt-0.5 text-xs text-ink-muted">{t.category} · {fmtDate(t.updatedAt)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="flex flex-col overflow-hidden">
          {active ? (
            <>
              <div className="border-b px-6 py-4">
                <div className="text-xs font-mono text-ink-muted">{active.ref}</div>
                <div className="mt-0.5 text-base font-semibold">{active.subject}</div>
                <div className="mt-1 text-xs text-ink-muted">
                  {active.contractorName} · {active.category} · {active.priority} priority
                </div>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {thread.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      m.authorRole === "contractor"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-surface text-foreground",
                    )}
                  >
                    <div className="mb-1 text-[10px] uppercase tracking-wide opacity-70">
                      {m.authorName} · {fmtDate(m.at)}
                    </div>
                    <div>{m.body}</div>
                  </div>
                ))}
              </div>
              <div className="border-t p-4">
                <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2">
                  <input
                    placeholder="Reply…"
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <button className="press grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center p-6">
              <EmptyState icon={LifeBuoy} title="Select a ticket" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

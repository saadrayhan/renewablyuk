/**
 * Notifications popover — right-side panel of "Introducing X" cards
 * matching the ElevenLabs notification panel.
 */

import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const NOTES = [
  {
    id: "1",
    eyebrow: "Introducing IBG Repository",
    body: "Searchable record store for every issued IBG. Filter by state, customer or measure.",
    when: "about 7 hours ago",
    accent: "from-cat-green to-cat-blue",
  },
  {
    id: "2",
    eyebrow: "Funding Match scoring",
    body: "Schemes are now scored against your approved measures and geography.",
    when: "2 days ago",
    accent: "from-cat-amber to-cat-rose",
  },
  {
    id: "3",
    eyebrow: "Operator permission requests",
    body: "Operators can now request access from any locked feature. Admins see them in queue.",
    when: "5 days ago",
    accent: "from-cat-purple to-cat-blue",
  },
];

export function NotificationsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="press relative grid size-8 place-items-center rounded-full text-ink-muted hover:bg-surface hover:text-foreground"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-cat-blue" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-3">
        <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
          What's new
        </div>
        <div className="space-y-2">
          {NOTES.map((n) => (
            <div key={n.id} className="rounded-xl border bg-background p-3">
              <div className="text-sm font-medium text-foreground">{n.eyebrow}</div>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{n.body}</p>
              <div className={`mt-3 h-24 rounded-lg bg-gradient-to-br ${n.accent}`} />
              <div className="mt-2 text-[11px] text-ink-muted">{n.when}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Notifications popover — refined to match the reference:
 *  · "Introducing X" eyebrow + body
 *  · large hero gradient card with title overlay
 *  · timestamp underneath
 *  · scrollable column inside a wider panel
 */

import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Note = {
  id: string;
  eyebrow: string;
  heroTitle: string;
  body: string;
  when: string;
  gradient: string;
};

const NOTES: Note[] = [
  {
    id: "1",
    eyebrow: "Introducing IBG Repository",
    heroTitle: "Searchable IBG record store",
    body: "Filter by state, customer or measure. Every record, one query away.",
    when: "about 7 hours ago",
    gradient:
      "bg-[radial-gradient(120%_120%_at_20%_0%,#FFD7B5_0%,#FF8A4C_45%,#E0563B_100%)]",
  },
  {
    id: "2",
    eyebrow: "Funding Match scoring",
    heroTitle: "Schemes scored against your measures",
    body: "Match Hub now ranks ECO4, GBIS, BUS and HUG by fit and region.",
    when: "2 days ago",
    gradient:
      "bg-[radial-gradient(120%_120%_at_20%_0%,#C7E8FF_0%,#5A9BFF_50%,#2046C7_100%)]",
  },
  {
    id: "3",
    eyebrow: "Operator permission requests",
    heroTitle: "Request access from any locked feature",
    body: "Operators see a request button on locked tiles. Admins approve from the Requests tab.",
    when: "5 days ago",
    gradient:
      "bg-[radial-gradient(120%_120%_at_20%_0%,#E9D6FF_0%,#A26BFF_45%,#5B27C9_100%)]",
  },
  {
    id: "4",
    eyebrow: "Integrations",
    heroTitle: "Zapier, HubSpot, Slack and webhooks",
    body: "Pipe IBG, job and submission events straight into your existing stack.",
    when: "1 week ago",
    gradient:
      "bg-[radial-gradient(120%_120%_at_20%_0%,#C8F3D8_0%,#3FBE6E_50%,#0F6B3A_100%)]",
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
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(380px,calc(100vw-1rem))] overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-semibold text-foreground">What's new</div>
          <button
            type="button"
            className="text-[11px] text-ink-muted hover:text-foreground"
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-[70vh] divide-y overflow-y-auto">
          {NOTES.map((n) => (
            <article key={n.id} className="px-4 py-4">
              <h3 className="text-[13px] font-semibold text-foreground">
                {n.eyebrow}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {n.body}
              </p>
              <div
                className={`relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl ${n.gradient}`}
              >
                <div className="absolute inset-0 flex items-end p-4">
                  <div className="text-[15px] font-semibold leading-tight text-white drop-shadow-sm">
                    {n.heroTitle}
                  </div>
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur">
                  Renewably
                </div>
              </div>
              <div className="mt-2 text-[11px] text-ink-muted">{n.when}</div>
            </article>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

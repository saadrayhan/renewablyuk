/**
 * Workspace switcher row at the top of the secondary sidebar — the
 * ElevenLabs "ElevenCreative" pill with avatar + name + chevrons.
 */

import { ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const WORKSPACES = [
  { id: "renewably-uk", name: "Renewably UK", plan: "Operate" },
  { id: "northwarmth", name: "Northwarmth Ltd", plan: "Access" },
];

export function WorkspaceSwitcher() {
  const current = WORKSPACES[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="press flex w-full items-center gap-2 rounded-xl border bg-background px-2 py-1.5 text-left hover:bg-surface"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-blue text-[10px] font-semibold text-brand-blue-foreground">
            R
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {current.name}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-ink-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
          Workspaces
        </div>
        <div className="space-y-0.5">
          {WORKSPACES.map((w, i) => {
            const active = i === 0;
            return (
              <button
                key={w.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface"
              >
                <span className={`grid size-6 shrink-0 place-items-center rounded-md text-[10px] font-semibold ${active ? "bg-brand-blue text-brand-blue-foreground" : "bg-tile text-foreground"}`}>
                  {w.name[0]}
                </span>
                <span className="min-w-0 flex-1 truncate">{w.name}</span>
                {active && <span className="size-1.5 rounded-full bg-brand-blue" aria-hidden />}
                <span className="text-[10px] text-ink-muted">{w.plan}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

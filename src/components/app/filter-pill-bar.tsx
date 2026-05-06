/**
 * FilterPillBar — ElevenLabs-style filter row.
 *
 *   [Language ▾] [Accent ▾] | [Conversational] [Narration] [Characters] …  ›
 *
 * Sits above content. Pills are flat and horizontally scrollable. The
 * leading dropdown slot is optional. Trailing chevron scrolls right.
 *
 * Pure presentation — caller wires state for active pill / dropdown values.
 */

import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";

export type Pill = {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  count?: number;
};

export function FilterPillBar({
  dropdowns,
  pills,
  active,
  onChange,
  className,
  trailing,
}: {
  /** Optional leading dropdown buttons (e.g. Language, Accent). */
  dropdowns?: { label: string; value?: string; onClick?: () => void }[];
  pills: Pill[];
  /** Currently-active pill value. `null`/undefined = nothing selected. */
  active?: string | null;
  onChange?: (value: string | null) => void;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative -mx-4 mt-4 md:-mx-6", className)}>
      <div
        className="flex items-center gap-2 overflow-x-auto px-4 pb-1 md:px-6 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {dropdowns?.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={d.onClick}
            className="press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[13px] text-foreground hover:bg-surface"
          >
            <span className="text-ink-muted">{d.label}</span>
            {d.value && <span className="font-medium">{d.value}</span>}
            <ChevronDown className="size-3.5 text-ink-muted" />
          </button>
        ))}

        {dropdowns && dropdowns.length > 0 && pills.length > 0 && (
          <div className="mx-1 h-5 w-px shrink-0 bg-border" />
        )}

        {pills.map((p) => {
          const Icon = p.icon;
          const isActive = active === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange?.(isActive ? null : p.value)}
              className={cn(
                "press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-surface",
              )}
            >
              {Icon && <Icon className="size-3.5" />}
              <span>{p.label}</span>
              {typeof p.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-medium tabular-nums",
                    isActive ? "bg-background/15 text-background" : "bg-tile text-ink-muted",
                  )}
                >
                  {p.count}
                </span>
              )}
            </button>
          );
        })}

        {trailing ?? (
          <button
            type="button"
            aria-label="Scroll filters"
            className="press grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card text-ink-muted hover:bg-surface"
          >
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

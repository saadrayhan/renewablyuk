/**
 * ListRow — flat list-item primitive used across dashboards & section panels.
 *
 *   [tile]   Title text                              [meta]
 *            Subtitle text                           [meta]
 *
 * No per-row border. Hover swaps the bg in 80ms. Use with a stack of rows
 * directly on the canvas — no card wrapper.
 */

import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ReactNode, ComponentType } from "react";

export function ListRow({
  to,
  onClick,
  leading,
  icon: Icon,
  iconTone = "neutral",
  title,
  subtitle,
  meta,
  className,
}: {
  to?: string;
  onClick?: () => void;
  /** Custom leading slot. If absent, a 36px tinted square holds `icon`. */
  leading?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  iconTone?: "neutral" | "green" | "blue" | "amber" | "purple" | "rose" | "teal";
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  const tone = TONE[iconTone];
  const content = (
    <>
      {leading ?? (
        Icon && (
          <div className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tone.bg, tone.ink)}>
            <Icon className="size-4" />
          </div>
        )
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-foreground">{title}</div>
        {subtitle && <div className="truncate text-[12px] text-ink-muted">{subtitle}</div>}
      </div>
      {meta && <div className="flex shrink-0 items-center gap-2 text-[12px] text-ink-muted">{meta}</div>}
    </>
  );

  const cls = cn(
    "group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 -mx-2 text-left transition-[background-color] duration-[80ms] ease-out hover:bg-surface",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={cls}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}

const TONE = {
  neutral: { bg: "bg-tile", ink: "text-ink-muted" },
  green: { bg: "bg-cat-green-bg", ink: "text-cat-green" },
  blue: { bg: "bg-cat-blue-bg", ink: "text-cat-blue" },
  amber: { bg: "bg-cat-amber-bg", ink: "text-cat-amber" },
  purple: { bg: "bg-cat-purple-bg", ink: "text-cat-purple" },
  rose: { bg: "bg-cat-rose-bg", ink: "text-cat-rose" },
  teal: { bg: "bg-cat-teal-bg", ink: "text-cat-teal" },
} as const;

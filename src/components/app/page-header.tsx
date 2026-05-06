import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * PageHeader — quiet editorial header.
 *
 *   WORKSPACE NAME
 *   Good afternoon, Sam
 *
 * The page title IS the H1. Subtitle and right-side actions are accepted for
 * back-compat but intentionally NOT rendered — they cluttered the canvas.
 * Inline actions belong with their respective sections below.
 */
export function PageHeader({
  eyebrow,
  title,
  className,
  dense,
  // Accepted for back-compat with existing routes; not rendered.
  subtitle: _subtitle,
  actions: _actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  /** Smaller variant for sub-pages. */
  dense?: boolean;
  className?: string;
  /** @deprecated kept for compat — no longer rendered. */
  subtitle?: ReactNode;
  /** @deprecated kept for compat — no longer rendered. */
  actions?: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      {eyebrow && (
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
          {eyebrow}
        </div>
      )}
      <h1
        className={cn(
          "font-display mt-1.5 text-ink",
          dense
            ? "text-[28px] leading-[1.1] md:text-[32px]"
            : "text-[36px] leading-[1.05] md:text-[44px]",
        )}
      >
        {title}
      </h1>
    </div>
  );
}

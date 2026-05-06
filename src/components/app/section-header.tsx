/**
 * SectionHeader — "Title ›" link, sits flush above content with no card.
 *
 *   Latest from the library  ›
 *
 * Replaces the old SectionRow + SectionCard title-bar pattern wherever the
 * card chrome itself isn't needed.
 */

import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionHeader({
  title,
  to,
  action,
  className,
}: {
  title: ReactNode;
  /** When provided, the title becomes a link with a trailing chevron. */
  to?: string;
  /** Optional right-side control (e.g. a small underline tab strip). */
  action?: ReactNode;
  className?: string;
}) {
  const titleNode = (
    <span className="inline-flex items-center gap-1 text-[15px] font-semibold text-foreground">
      {title}
      {to && (
        <ChevronRight className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5" />
      )}
    </span>
  );

  return (
    <div className={cn("mb-3 mt-12 flex items-end justify-between gap-4", className)}>
      {to ? (
        <Link to={to} className="press group">
          {titleNode}
        </Link>
      ) : (
        titleNode
      )}
      {action}
    </div>
  );
}

import { cn } from "@/lib/utils";

/**
 * PageHeader — quiet editorial header.
 *
 *   WORKSPACE NAME
 *   Good afternoon, Sam
 *
 * No subtitle, no actions cluster. The page title IS the H1 — actions live
 * inline with content sections below, never crammed into the header right rail.
 */
export function PageHeader({
  eyebrow,
  title,
  className,
  dense,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  /** Smaller variant for sub-pages. */
  dense?: boolean;
  className?: string;
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

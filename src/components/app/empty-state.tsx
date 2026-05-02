import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-surface/40 px-6 py-16 text-center",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full text-foreground opacity-[0.04]"
      >
        <circle cx="100" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="60" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="60" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="relative flex flex-col items-center animate-in fade-in-0 duration-300 [animation-delay:150ms] fill-mode-both">
        {Icon && (
          <div className="grid size-14 place-items-center rounded-2xl bg-background text-ink-muted shadow-sm">
            <Icon className="size-6" />
          </div>
        )}
        <div className="mt-4 text-sm font-medium text-foreground">{title}</div>
        {body && <p className="mt-1 max-w-sm text-sm text-ink-muted">{body}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

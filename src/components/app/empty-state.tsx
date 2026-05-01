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
    <div className={cn(
      "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-surface/40 px-6 py-16 text-center",
      className,
    )}>
      {Icon && (
        <div className="grid size-12 place-items-center rounded-2xl bg-background text-ink-muted">
          <Icon className="size-5" />
        </div>
      )}
      <div className="mt-4 text-sm font-medium text-foreground">{title}</div>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

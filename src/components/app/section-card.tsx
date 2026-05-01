import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionCard({
  title, action, children, className, padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div>{action}</div>
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  );
}

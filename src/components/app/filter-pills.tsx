import { cn } from "@/lib/utils";

export function FilterPills<T extends string>({
  value,
  onChange,
  options,
  allowAll = true,
  className,
}: {
  value: T | "all";
  onChange: (v: T | "all") => void;
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }>; count?: number }[];
  allowAll?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {allowAll && (
        <Pill active={value === "all"} onClick={() => onChange("all")}>
          All
        </Pill>
      )}
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <Pill key={opt.value} active={value === opt.value} onClick={() => onChange(opt.value)}>
            {Icon && <Icon className="size-3.5" />}
            <span>{opt.label}</span>
            {typeof opt.count === "number" && (
              <span className="ml-0.5 text-ink-muted">{opt.count}</span>
            )}
          </Pill>
        );
      })}
    </div>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-ink-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

import { cn } from "@/lib/utils";

export function UnderlineTabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }>; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cn("flex h-10 items-center gap-1 border-b", className)}>
      {options.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "press relative -mb-px flex h-10 items-center gap-1.5 px-3 text-[13px] font-medium transition-colors",
              active ? "text-foreground" : "text-ink-muted hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-4" />}
            <span>{opt.label}</span>
            {typeof opt.count === "number" && (
              <span className={cn(
                "ml-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-medium",
                active ? "bg-foreground text-background" : "bg-tile text-ink-muted",
              )}>
                {opt.count}
              </span>
            )}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />}
          </button>
        );
      })}
    </div>
  );
}

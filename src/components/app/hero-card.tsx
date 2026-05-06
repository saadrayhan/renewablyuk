import { cn } from "@/lib/utils";
import { GradientOrb } from "./gradient-orb";

type Variant = "mint" | "peach" | "lavender" | "sky" | "rose";

/**
 * Atmospheric hero card — large rounded surface with a single orb behind
 * centered display copy.
 */
export function HeroCard({
  orb = "mint",
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  orb?: Variant;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[28px] border bg-card px-6 py-14 md:px-12 md:py-20",
        className,
      )}
    >
      <GradientOrb
        variant={orb}
        size={640}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <div className="relative z-10 mx-auto max-w-[760px] text-center">
        {eyebrow && (
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-4xl leading-[1.05] text-ink md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-muted md:text-lg">
            {subtitle}
          </p>
        )}
        {actions && (
          <div className="mt-8 flex items-center justify-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

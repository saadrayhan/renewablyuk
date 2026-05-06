import { cn } from "@/lib/utils";

type Variant = "mint" | "peach" | "lavender" | "sky" | "rose";

const COLORS: Record<Variant, string> = {
  mint: "var(--orb-mint)",
  peach: "var(--orb-peach)",
  lavender: "var(--orb-lavender)",
  sky: "var(--orb-sky)",
  rose: "var(--orb-rose)",
};

/**
 * Soft atmospheric radial bloom. Pure decoration — never wrap content in this.
 * Place absolute-positioned inside a `relative overflow-hidden` parent.
 */
export function GradientOrb({
  variant = "mint",
  size = 480,
  className,
  style,
}: {
  variant?: Variant;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const color = COLORS[variant];
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 65%)`,
        filter: "blur(40px)",
        opacity: 0.55,
        ...style,
      }}
    />
  );
}

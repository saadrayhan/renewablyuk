import { cn } from "@/lib/utils";

/**
 * Editorial section wrapper — enforces 96px vertical rhythm at desktop,
 * 64px at mobile. Children compose their own content.
 */
export function Section({
  children,
  className,
  tone = "canvas",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "canvas" | "soft" | "ink";
  id?: string;
}) {
  const bg =
    tone === "ink"
      ? "bg-ink text-[color:var(--brand-blue-foreground)]"
      : tone === "soft"
        ? "bg-surface"
        : "bg-background";
  return (
    <section
      id={id}
      className={cn("relative overflow-hidden py-16 md:py-24", bg, className)}
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-8">
        {children}
      </div>
    </section>
  );
}

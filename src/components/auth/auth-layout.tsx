import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { GradientOrb } from "@/components/app/gradient-orb";

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link to="/" className="press inline-flex items-center gap-2">
          <BrandMark className="size-8" />
          <span className="text-base font-semibold tracking-tight">
            Renewably
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-4xl leading-[1.05] text-ink">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
          ) : null}

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-8 text-center text-sm text-ink-muted">
              {footer}
            </div>
          ) : null}
        </div>
      </div>

      {/* Marketing side — atmospheric orbs */}
      <aside aria-hidden className="relative hidden overflow-hidden bg-surface lg:block">
        <GradientOrb variant="mint" size={620} className="-left-20 top-10 opacity-65" />
        <GradientOrb variant="peach" size={520} className="right-0 top-1/2 opacity-55" />
        <GradientOrb variant="lavender" size={460} className="left-1/3 bottom-0 opacity-50" />

        <div className="absolute inset-0 p-12">
          <div className="flex h-full flex-col justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Operations · UK Net Zero installers
            </div>

            <div className="max-w-md">
              <div className="font-display text-5xl leading-[1.05] text-ink">
                The calm operating layer beneath every <span className="font-display-italic">install</span>.
              </div>
            </div>

            <div className="space-y-3">
              <FloatingChip tone="green" title="IBG #4421 issued" meta="Mrs A. Patel · 14 Elm Road" />
              <FloatingChip tone="blue" title="Funding Match · ECO4 + GBIS" meta="3 schemes unlocked" offset />
              <FloatingChip tone="amber" title="Job J-118 ready for submission" meta="Workflow complete" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function FloatingChip({
  tone,
  title,
  meta,
  offset,
}: {
  tone: "green" | "blue" | "amber";
  title: string;
  meta: string;
  offset?: boolean;
}) {
  const dot = {
    green: "bg-cat-green",
    blue: "bg-cat-blue",
    amber: "bg-cat-amber",
  }[tone];
  return (
    <div
      className={`flex max-w-md items-center gap-3 rounded-2xl border bg-background/80 p-3 shadow-sm backdrop-blur ${
        offset ? "ml-10" : ""
      }`}
    >
      <span className={`size-2.5 rounded-full ${dot}`} />
      <div className="flex-1">
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-ink-muted">{meta}</div>
      </div>
    </div>
  );
}

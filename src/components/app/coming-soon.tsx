import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function ComingSoon({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-8 py-16">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
        {eyebrow}
      </div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-muted">{body}</p>
      <div className="mt-8">
        <Link
          to="/dashboard"
          className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-2 text-sm font-medium text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}

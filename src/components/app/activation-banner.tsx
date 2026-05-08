/**
 * 7-state contractor activation banner.
 *
 * Renders nothing for `active`. Surfaces a contextual band for every other
 * state with the right CTA and tone:
 *   empty / partial → checklist (5 conditions)
 *   expiring        → renewal nudge
 *   expired         → blocking, read-only
 *   suspended       → blocking, contact support
 *   locked          → admin-imposed lock
 */

import { Link } from "@tanstack/react-router";
import {
  CheckCircle2, Circle, Clock, AlertTriangle, Lock,
  ShieldAlert, ArrowRight, type LucideIcon,
} from "lucide-react";
import { ACTIVATION_CONDITIONS, useActivationGate, useMembership } from "@/lib/membership";
import type { ActivationState } from "@/lib/mock/types";

type Tone = "info" | "amber" | "rose" | "neutral";

const TONE: Record<Tone, { wrap: string; icon: string; chip: string }> = {
  info: {
    wrap: "border-cat-blue-bg bg-cat-blue-bg/40",
    icon: "text-cat-blue",
    chip: "bg-cat-blue text-white",
  },
  amber: {
    wrap: "border-cat-amber-bg bg-cat-amber-bg/50",
    icon: "text-cat-amber",
    chip: "bg-cat-amber text-white",
  },
  rose: {
    wrap: "border-cat-rose-bg bg-cat-rose-bg/40",
    icon: "text-cat-rose",
    chip: "bg-cat-rose text-white",
  },
  neutral: {
    wrap: "border-border bg-tile",
    icon: "text-ink-muted",
    chip: "bg-foreground text-background",
  },
};

const META: Record<
  Exclude<ActivationState, "active">,
  { tone: Tone; icon: LucideIcon; chip: string; title: string; body: string; cta?: { label: string; to: string } }
> = {
  empty: {
    tone: "info", icon: CheckCircle2, chip: "Activate",
    title: "Finish activating your account",
    body: "Complete the 5 steps below to start issuing certificates.",
  },
  partial: {
    tone: "info", icon: CheckCircle2, chip: "Almost there",
    title: "A few items left to activate",
    body: "Tick off the remaining items to unlock the workspace.",
  },
  expiring: {
    tone: "amber", icon: Clock, chip: "Expiring",
    title: "Your membership is expiring soon",
    body: "Renew within 30 days to avoid a service interruption.",
    cta: { label: "Renew now", to: "/membership" },
  },
  expired: {
    tone: "rose", icon: AlertTriangle, chip: "Expired",
    title: "Your membership has expired",
    body: "Read-only mode. Renew to issue certificates and submit jobs.",
    cta: { label: "Renew membership", to: "/membership" },
  },
  suspended: {
    tone: "rose", icon: ShieldAlert, chip: "Suspended",
    title: "Your account is suspended",
    body: "Contact support to resolve outstanding issues.",
    cta: { label: "Open a ticket", to: "/tickets" },
  },
  locked: {
    tone: "neutral", icon: Lock, chip: "Locked",
    title: "Account locked by admin",
    body: "An administrator has paused this workspace. Contact support.",
    cta: { label: "Open a ticket", to: "/tickets" },
  },
};

export function ActivationBanner() {
  const { activationState } = useActivationGate();
  if (activationState === "active") return null;
  const meta = META[activationState];
  const tone = TONE[meta.tone];
  const Icon = meta.icon;
  const showChecklist = activationState === "empty" || activationState === "partial";

  return (
    <div className={`mt-8 rounded-2xl border ${tone.wrap} px-5 py-4`}>
      <div className="flex items-start gap-3">
        <div className={`grid size-9 shrink-0 place-items-center rounded-xl bg-background ${tone.icon}`}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone.chip}`}>
              {meta.chip}
            </span>
            <div className="text-[14px] font-medium text-foreground">{meta.title}</div>
          </div>
          <div className="mt-0.5 text-[13px] text-ink-muted">{meta.body}</div>
        </div>
        {meta.cta && (
          <Link
            to={meta.cta.to}
            className="press inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground px-3.5 py-1.5 text-[12px] font-medium text-background"
          >
            {meta.cta.label} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      {showChecklist && <ActivationChecklist />}
    </div>
  );
}

function ActivationChecklist() {
  const { conditions, toggleCondition } = useMembership();
  const done = Object.values(conditions).filter(Boolean).length;
  const total = ACTIVATION_CONDITIONS.length;
  return (
    <div className="mt-4 rounded-xl border bg-background p-3">
      <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
        <span>Activation checklist</span>
        <span>{done} / {total}</span>
      </div>
      <ul className="divide-y">
        {ACTIVATION_CONDITIONS.map((c) => {
          const ok = conditions[c.id];
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => toggleCondition(c.id)}
                className="flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-surface"
              >
                {ok ? (
                  <CheckCircle2 className="size-4 shrink-0 text-cat-green" />
                ) : (
                  <Circle className="size-4 shrink-0 text-ink-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <div className={`text-[13px] font-medium ${ok ? "text-ink-muted line-through" : "text-foreground"}`}>
                    {c.label}
                  </div>
                  <div className="text-[12px] text-ink-muted">{c.description}</div>
                </div>
                {!ok && <ArrowRight className="size-4 text-ink-muted" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * StatePill — visual representation of every state in the IA.
 * Categorised tone matching the IA HTML colour key:
 *   active    → green
 *   warning   → amber
 *   error     → rose
 *   info      → blue
 *   neutral   → grey
 */

import { cn } from "@/lib/utils";

export type PillTone = "active" | "warning" | "error" | "info" | "neutral";

export type StateMeta = { label: string; tone: PillTone };

const ACTIVE = (label: string): StateMeta => ({ label, tone: "active" });
const WARN = (label: string): StateMeta => ({ label, tone: "warning" });
const ERR = (label: string): StateMeta => ({ label, tone: "error" });
const INFO = (label: string): StateMeta => ({ label, tone: "info" });
const NEU = (label: string): StateMeta => ({ label, tone: "neutral" });

export const JOB_STATES: Record<string, StateMeta> = {
  draft: NEU("Draft"),
  created: NEU("Created"),
  "in-progress": ACTIVE("In progress"),
  "awaiting-information": WARN("Awaiting information"),
  "under-validation": WARN("Under validation"),
  blocked: ERR("Blocked"),
  completed: ACTIVE("Completed"),
  closed: NEU("Closed"),
  cancelled: ERR("Cancelled"),
  archived: NEU("Archived"),
};

export const IBG_STATES: Record<string, StateMeta> = {
  draft: NEU("Draft"),
  initiated: NEU("Initiated"),
  "awaiting-validation": WARN("Awaiting validation"),
  incomplete: ERR("Incomplete"),
  validated: ACTIVE("Validated"),
  processing: WARN("Processing"),
  "ready-for-issue": ACTIVE("Ready for issue"),
  issued: ACTIVE("Issued"),
  amended: INFO("Amended"),
  superseded: NEU("Superseded"),
  cancelled: ERR("Cancelled"),
  archived: NEU("Archived"),
};

export const FUNDING_STATES: Record<string, StateMeta> = {
  incomplete: ERR("Incomplete"),
  "in-progress": ACTIVE("In progress"),
  "evidence-required": WARN("Evidence required"),
  "under-review": WARN("Under review"),
  returned: ERR("Returned"),
  validated: ACTIVE("Validated"),
  "ready-for-submission": ACTIVE("Ready for submission"),
  submitted: INFO("Submitted"),
};

export const SUBMISSION_STATES: Record<string, StateMeta> = {
  submitted: INFO("Submitted"),
  "under-review": WARN("Under review"),
  "awaiting-information": WARN("Awaiting information"),
  accepted: ACTIVE("Accepted"),
  rejected: ERR("Rejected"),
  withdrawn: NEU("Withdrawn"),
};

export const RECORD_STATES: Record<string, StateMeta> = {
  draft: NEU("Draft"),
  active: ACTIVE("Active"),
  inactive: WARN("Inactive"),
  archived: NEU("Archived"),
};

export const USER_STATES: Record<string, StateMeta> = {
  invited: WARN("Invited"),
  pending: WARN("Pending"),
  active: ACTIVE("Active"),
  suspended: ERR("Suspended"),
  deactivated: NEU("Deactivated"),
  banned: ERR("Banned"),
};

export const AMENDMENT_STATES: Record<string, StateMeta> = {
  pending: WARN("Pending"),
  approved: ACTIVE("Approved"),
  rejected: ERR("Rejected"),
};

export const ONBOARDING_STATES: Record<string, StateMeta> = {
  "in-progress": ACTIVE("In progress"),
  "awaiting-verification": WARN("Awaiting verification"),
  "awaiting-review": WARN("Awaiting review"),
  "ready-for-activation": ACTIVE("Ready for activation"),
  blocked: ERR("Blocked"),
  activated: ACTIVE("Activated"),
};

export const RISK_STATES: Record<string, StateMeta> = {
  active: ACTIVE("Active"),
  flagged: WARN("Flagged"),
  paused: WARN("Paused"),
  suspended: ERR("Suspended"),
};

const TONE_CLASSES: Record<PillTone, string> = {
  active: "bg-cat-green-bg text-cat-green",
  warning: "bg-cat-amber-bg text-cat-amber",
  error: "bg-cat-rose-bg text-cat-rose",
  info: "bg-cat-blue-bg text-cat-blue",
  neutral: "bg-tile text-ink-muted",
};

export function StatePill({
  meta,
  className,
}: {
  meta: StateMeta;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        TONE_CLASSES[meta.tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClass(meta.tone))} />
      {meta.label}
    </span>
  );
}

function dotClass(tone: PillTone) {
  switch (tone) {
    case "active":
      return "bg-cat-green";
    case "warning":
      return "bg-cat-amber";
    case "error":
      return "bg-cat-rose";
    case "info":
      return "bg-cat-blue";
    default:
      return "bg-ink-muted";
  }
}

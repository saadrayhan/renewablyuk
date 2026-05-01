/**
 * Top bar — breadcrumb on the left, action cluster on the right.
 * Mirrors ElevenLabs: Feedback / Docs / Ask / Files / Bell / Avatar.
 */

import { FileText, FolderOpen, MessageSquare, Sparkles } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { NotificationsPopover } from "./notifications-popover";
import { ProfilePopover } from "./profile-popover";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/90 px-5 backdrop-blur">
      <Breadcrumbs />
      <div className="flex items-center gap-1">
        <PillButton icon={MessageSquare} label="Feedback" />
        <PillButton icon={FileText} label="Docs" href="https://docs.lovable.dev" />
        <PillButton icon={Sparkles} label="Ask" highlight />
        <button
          type="button"
          aria-label="Files"
          className="press grid size-8 place-items-center rounded-full text-ink-muted hover:bg-surface hover:text-foreground"
        >
          <FolderOpen className="size-[18px]" />
        </button>
        <NotificationsPopover />
        <ProfilePopover />
      </div>
    </header>
  );
}

function PillButton({
  icon: Icon,
  label,
  href,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  highlight?: boolean;
}) {
  const cls =
    "press inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface" +
    (highlight ? " ring-1 ring-cat-blue/20" : "");
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        <Icon className="size-3.5" />
        {label}
      </a>
    );
  }
  return (
    <button type="button" className={cls}>
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

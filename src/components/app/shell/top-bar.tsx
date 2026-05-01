/**
 * Top bar — sidebar toggle + breadcrumb on the left, notifications +
 * profile on the right. Trimmed: Feedback / Docs / Ask / Files removed
 * per product request.
 */

import { PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { NotificationsPopover } from "./notifications-popover";
import { ProfilePopover } from "./profile-popover";
import { useSidebarState } from "./sidebar-context";

export function TopBar() {
  const { collapsed, toggleCollapsed, setMobileOpen } = useSidebarState();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-3 backdrop-blur md:px-5">
      <div className="flex min-w-0 items-center gap-2">
        {/* Mobile menu */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="press grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-foreground md:hidden"
        >
          <Menu className="size-[18px]" />
        </button>
        {/* Desktop collapse toggle */}
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleCollapsed}
          className="press hidden size-8 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-foreground md:grid"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[18px]" />
          ) : (
            <PanelLeftClose className="size-[18px]" />
          )}
        </button>
        <div className="min-w-0 truncate">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <NotificationsPopover />
        <ProfilePopover />
      </div>
    </header>
  );
}

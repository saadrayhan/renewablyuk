/**
 * Top bar — sidebar toggle + breadcrumb on the left, search + notifications +
 * profile on the right.
 */

import { PanelLeftClose, PanelLeftOpen, Menu, Search } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import { NotificationsPopover } from "./notifications-popover";
import { ProfilePopover } from "./profile-popover";
import { useSidebarState } from "./sidebar-context";
import { useCommandPalette } from "@/components/app/command-palette";

export function TopBar() {
  const { collapsed, toggleCollapsed, setMobileOpen } = useSidebarState();
  const { setOpen } = useCommandPalette();
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-3 backdrop-blur md:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="press grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-foreground md:hidden"
        >
          <Menu className="size-[18px]" />
        </button>
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
        <a
          href="https://docs.lovable.dev"
          target="_blank"
          rel="noreferrer"
          className="press hidden h-7 items-center rounded-full px-3 text-[12px] text-ink-muted hover:bg-surface hover:text-foreground md:inline-flex"
        >
          Docs
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press hidden h-7 items-center gap-1.5 rounded-full px-3 text-[12px] text-ink-muted hover:bg-surface hover:text-foreground md:inline-flex"
        >
          <Search className="size-3.5" />
          <span>Ask</span>
          <kbd className="ml-1 rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
            {isMac ? "⌘" : "Ctrl"}K
          </kbd>
        </button>
        <button
          type="button"
          aria-label="Search"
          onClick={() => setOpen(true)}
          className="press grid size-7 place-items-center rounded-full text-ink-muted hover:bg-surface hover:text-foreground md:hidden"
        >
          <Search className="size-[16px]" />
        </button>
        <NotificationsPopover />
        <ProfilePopover />
      </div>
    </header>
  );
}

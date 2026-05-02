/**
 * Profile popover — exact ElevenLabs structure:
 *   Balance → Workspace → Settings/Subscription/Theme → Sign out.
 */

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/lib/auth-context";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowLeftRight,
  CreditCard,
  Crown,
  KeyRound,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";

export function ProfilePopover() {
  const { user, isAdmin, isOperator } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Account"
          className="press grid size-8 place-items-center rounded-full bg-gradient-to-br from-cat-blue to-cat-purple text-xs font-semibold text-white"
        >
          {user.initials}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] p-2">
        <div className="rounded-xl bg-surface p-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            <span>Balance</span>
            <button className="press inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
              <Crown className="size-3" /> Upgrade
            </button>
          </div>
          <div className="mt-2 flex items-end justify-between text-sm">
            <span className="text-ink-muted">Total IBGs this month</span>
            <span className="font-medium text-foreground">12 / 25</span>
          </div>
        </div>

        <div className="mt-2 px-1 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
          Current workspace
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">Renewably UK</div>
            <div className="text-[11px] text-ink-muted">Operate plan</div>
          </div>
          <ArrowLeftRight className="size-3.5 text-ink-muted" />
        </button>

        <div className="my-1.5 h-px bg-border" />

        <MenuLink to="/settings/profile" icon={Settings} label="Settings" />
        <MenuLink to="/settings/subscription" icon={CreditCard} label="Subscription" />
        <MenuButton
          icon={theme === "dark" ? Sun : Moon}
          label={theme === "dark" ? "Light mode" : "Dark mode"}
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />

        <div className="my-1.5 h-px bg-border" />

        <a
          href="https://docs.lovable.dev"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-ink-muted hover:bg-surface"
        >
          <span>Docs</span>
          <ArrowUpRight className="size-3.5" />
        </a>

        <div className="my-1.5 h-px bg-border" />

        <Link
          to="/sign-in"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-surface"
        >
          <LogOut className="size-3.5" />
          Sign out
        </Link>
      </PopoverContent>
    </Popover>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-surface">
      <Icon className="size-3.5 text-ink-muted" />
      {label}
    </Link>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-foreground hover:bg-surface"
    >
      <Icon className="size-3.5 text-ink-muted" />
      {label}
    </button>
  );
}

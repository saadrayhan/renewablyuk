/**
 * TileRow — ElevenLabs-style horizontal scroller of large icon tiles.
 *
 * Each tile is a soft-grey rounded square with a centered icon cluster.
 * The label sits *below* the tile in canvas text (not inside it).
 *
 * Use for a Home page's "destinations" row. Not for compact action grids
 * (use a plain grid + ListRow for those).
 */

import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export type Tile = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  /** Optional second icon — used to compose a small icon cluster (matches EL). */
  accent?: ComponentType<{ className?: string }>;
  /** Tile dim color tone for the tile bg + accent dot. Defaults to neutral. */
  tone?: "neutral" | "green" | "blue" | "amber" | "purple" | "rose" | "teal";
  /** Optional badge in the top-right of the tile (e.g. "Locked", "New"). */
  badge?: string;
  disabled?: boolean;
};

const TONE_DOT: Record<NonNullable<Tile["tone"]>, string> = {
  neutral: "bg-foreground/80 text-background",
  green: "bg-cat-green text-background",
  blue: "bg-cat-blue text-background",
  amber: "bg-cat-amber text-background",
  purple: "bg-cat-purple text-background",
  rose: "bg-cat-rose text-background",
  teal: "bg-cat-teal text-background",
};

export function TileRow({ tiles, className }: { tiles: Tile[]; className?: string }) {
  return (
    <div className={cn("relative -mx-4 mt-8 md:-mx-6", className)}>
      <div
        className="stagger-in flex gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:px-6 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {tiles.map((t) => (
          <TileItem key={t.label + t.to} tile={t} />
        ))}
      </div>
    </div>
  );
}

function TileItem({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  const Accent = tile.accent;
  const tone = tile.tone ?? "neutral";

  const inner = (
    <>
      <div
        className={cn(
          "tile relative grid h-[140px] w-[180px] place-items-center overflow-hidden rounded-2xl bg-tile",
          tile.disabled && "opacity-60",
        )}
      >
        {tile.badge && (
          <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-ink-muted">
            {tile.badge}
          </span>
        )}
        <div className="relative">
          <div className={cn("grid size-12 place-items-center rounded-2xl", TONE_DOT[tone])}>
            <Icon className="size-6" />
          </div>
          {Accent && (
            <div
              className={cn(
                "absolute -right-3 -top-3 grid size-7 place-items-center rounded-full ring-4 ring-tile",
                TONE_DOT[tone],
              )}
            >
              <Accent className="size-3.5" />
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 px-1 text-center text-[13px] font-medium text-foreground">
        {tile.label}
      </div>
    </>
  );

  if (tile.disabled) {
    return (
      <div className="press shrink-0 cursor-not-allowed" aria-disabled>
        {inner}
      </div>
    );
  }
  return (
    <Link to={tile.to} className="press shrink-0">
      {inner}
    </Link>
  );
}

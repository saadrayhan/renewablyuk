# Renewably UK — Design Spec for Figma Make

> **Purpose.** This file is a single source of truth that lets Figma Make (or any
> other generative design tool) reproduce the exact visual language of the
> Renewably UK admin app. It encodes every token, every primitive, every layout
> rule and the art direction. If a screen is built from this spec it should be
> indistinguishable from the live React app.
>
> **Read order.** 1) Art direction → 2) Tokens → 3) Primitives → 4) Page
> templates → 5) Reference material. Do not skip Section 1; the rest only makes
> sense once the aesthetic is internalised.

---

## 0. Where to look for inspiration

Render the following before generating anything. The aesthetic is **ElevenLabs
admin / Developer console**, applied to a UK retrofit-funding back office.

| Source | What to take from it |
|---|---|
| **elevenlabs.io/app/home** | Editorial Home: huge H1, no card chrome, horizontal tile scroller, "Section title ›" pattern, generous vertical rhythm. |
| **elevenlabs.io/app/developers** | Tab anatomy (underline, not pill), promo card with thumbnail tile + ghost CTA, two‑column quickstart, usage / top‑up balance card, 2×3 Quick Links grid, request log table. |
| **elevenlabs.io/app/voice-library** | FilterPillBar pattern (leading dropdowns + scrollable pill row), tile card with bottom‑aligned label. |
| **elevenlabs.io/app/usage** | Borderless table chrome, soft hover, divide‑y rows, tabular numerals on right‑aligned columns. |
| **Linear settings** (secondary ref) | Topbar density, breadcrumb weight, ghost pill buttons with `kbd`. |
| **Stripe Dashboard** (secondary ref) | Restraint with colour, mono‑palette inks, brand blue used surgically. |

**Anti‑references.** Do **not** look at: Material Design, Ant Design, Bootstrap
admin themes, Tailwind UI marketing pages, "glassmorphism", neumorphism,
purple‑gradient SaaS, Vercel‑style dark dashboards. None of those match.

---

## 1. Art direction

### 1.1 One‑sentence brief
A warm, editorial, near‑mono admin surface — closer to a design tool than a
CRM — where typography and whitespace do the work and colour is reserved for
state and the brand‑blue signature CTA.

### 1.2 Principles (apply on every screen)
1. **Canvas, not cards.** Default surface is the warm off‑white canvas
   `#F5F5F5`. Cards are the exception, not the rule. If a section can be a
   `SectionHeader` + flat list of `ListRow`s on the canvas, do that.
2. **One H1 per page, big.** 36–44px display, `-0.015em` tracking. Always
   preceded by a 11px uppercase eyebrow in `text-ink-muted`.
3. **Hairlines over boxes.** Borders are `#E7E5E4`. No drop shadows on chrome.
   Tables: only a single `border-b` on `<thead>` + `divide-y` between rows.
4. **One brand‑blue CTA per destination.** `#0F47A8` rounded‑full pill. Every
   other action is secondary (bordered pill) or ghost.
5. **Tone via tinted plates.** Status pills use `cat-*-bg` plate + `cat-*` ink.
   Never use a saturated background on a button.
6. **Animate transform & opacity only.** Never `transition: all`. Curves are
   in `--ease-out` / `--ease-in-out` / `--ease-drawer`. Durations 100/160/200/250 ms.
7. **Editorial spacing.** Sections separate with `mt-12` (48px). Page top
   padding is `pt-10` (40px). Sidebars/tables get `gap-6`.
8. **Number with intent.** All metrics use `tabular-nums`. Right‑align numeric
   columns. Subdue units (`/ mo`) in `text-ink-muted`.

### 1.3 Voice in microcopy
Plain sentence case. No exclamation marks. Prefer noun phrases for headers
("External APIs"), imperative for buttons ("Add webhook"). Never "Awesome!".

---

## 2. Design tokens

> All tokens are CSS custom properties defined in `src/styles.css`. Figma
> Make should mirror them as Variables → `Color`, `Number`, `String`. Hex is
> preferred for canvas/ink; oklch is used for the category palette so it
> survives in dark mode.

### 2.1 Colour — light mode (default)

| Token | Value | Use |
|---|---|---|
| `--background` | `#F5F5F5` | Canvas. Body bg. |
| `--surface` | `#FAFAFA` | Alt band, hover bg. |
| `--tile` | `#F0EFED` | Tile plates, kbd, leading squares. |
| `--foreground` / `--ink` | `#0C0A09` | All H1–H4, primary body. |
| `--ink-muted` | `#777169` | Secondary text, eyebrows, table headers. |
| `--border` | `#E7E5E4` | Hairlines (default). |
| `--border-strong` | `#D6D3D1` | Inputs on focus, divider columns. |
| `--card` | `#FFFFFF` | Cards (sparingly), popovers, dropdown buttons. |
| `--primary` | near‑black | Black pill button (legacy). |
| `--brand` | green `oklch(0.62 0.16 152)` | Renewably brand mark only. |
| `--brand-blue` | `#0F47A8` | Signature CTA, active workspace tab. |
| `--brand-blue-foreground` | `#FFFFFF` | Text on brand‑blue. |
| `--brand-blue-tint` | `#E8F0FC` | Informational notice background. |
| `--destructive` | `oklch(0.58 0.21 27)` | Destructive only. |
| `--ring` | `#0C0A09` | 1px focus ring. |

### 2.2 Category palette (status, leading squares, charts)

Each category has a saturated ink and a low‑chroma background plate. **Never**
use the ink as a button bg.

| Token | Ink | Plate (`-bg`) | Used by |
|---|---|---|---|
| green  | `oklch(0.55 0.17 152)` | `oklch(0.94 0.05 152)` | active / completed states, chart‑1 |
| blue   | `oklch(0.55 0.18 250)` | `oklch(0.94 0.04 250)` | info states, chart‑2 |
| amber  | `oklch(0.66 0.16 70)`  | `oklch(0.95 0.06 80)`  | warning states, chart‑3 |
| purple | `oklch(0.55 0.18 295)` | `oklch(0.94 0.04 295)` | chart‑4 |
| rose   | `oklch(0.6 0.19 15)`   | `oklch(0.95 0.04 15)`  | error / destructive states, chart‑5 |
| teal   | `oklch(0.6 0.12 195)`  | `oklch(0.94 0.04 195)` | accents |

### 2.3 Atmospheric orbs (decoration only)

`--orb-mint #A7E5D3`, `--orb-peach #F4C5A8`, `--orb-lavender #C8B8E0`,
`--orb-sky #A8C8E8`, `--orb-rose #E8B8C4`. Used in `<GradientOrb>` for hero
backgrounds. Never on CTAs, never on text.

### 2.4 Typography

- **Family.** Inter (sans). `font-feature-settings: "cv02","cv03","cv04","cv11"`.
  Body letter‑spacing `+0.01em` (editorial dialect). No serifs anywhere.
- **Display utility (`.font-display`).** Inter 600, `letter-spacing -0.02em`.
- **Headings.** Inter 600, `letter-spacing -0.015em`.

| Role | Size / line | Weight | Tracking | Notes |
|---|---|---|---|---|
| Page eyebrow | 11 / 16 | 500 (medium) | `+0.12em` uppercase | Always above H1. |
| H1 (default) | 36 → 44 / 1.05 | 600 | `-0.015em` | `font-display` class. |
| H1 (dense)   | 28 → 32 / 1.10 | 600 | `-0.015em` | Sub‑pages. |
| H2 / Section title | 15 / 1.3 | 600 | normal | Sits flush above content, no border. |
| Body | 14 / 1.5 | 400 | `+0.01em` | Default paragraph. |
| Body small | 13 / 1.4 | 400 | `+0.01em` | Tabs, pills, table cells. |
| Meta / muted | 12 / 1.4 | 400 | `+0.01em` | `text-ink-muted`. |
| Micro / kbd | 10–11 / 1.2 | 500 | `+0.01em` | Status pills, kbd shortcuts. |

### 2.5 Spacing scale

Tailwind default (4px grid). Canonical paddings:

- Page container: `px-4 md:px-6 lg:px-8 pt-10 pb-24`, `max-w-[1180px]`.
- Section gap (between H2 sections): `mt-12` (48px).
- ListRow padding: `py-2.5 px-2 -mx-2` (negative margin so hover bleeds out).
- Tile: `h-[140px] w-[180px]`, `rounded-2xl`, gap `gap-4`.
- Table cell: `px-3 py-3.5`, header `px-3 py-2.5`.

### 2.6 Radii

`--radius: 0.625rem` (10px) base. Map: `sm 6 / md 8 / lg 10 / xl 14 / 2xl 18 / 3xl 22 / 4xl 26`.
Defaults used: pills `rounded-full`, tiles `rounded-2xl`, inputs `rounded-md`,
list rows `rounded-xl`, leading squares `rounded-xl`.

### 2.7 Elevation

There are essentially **no shadows on chrome**. The only allowed shadow is
the subtle hover lift on `.tile`:
`box-shadow: 0 4px 14px -8px oklch(0 0 0 / 0.15)`. Popovers/menus rely on
border + `bg-popover`.

### 2.8 Motion tokens

```
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
--dur-1: 100ms; --dur-2: 160ms; --dur-3: 200ms; --dur-4: 250ms;
```

Rules:
- Hover bg fades on rows: 80 ms.
- Press feedback: `transform: scale(0.97)` over 160 ms `--ease-out`,
  only inside `@media (hover: hover) and (pointer: fine)`.
- Tile lift: `translateY(-1px)` + the shadow above, 200 ms.
- List entrance: `.stagger-in` — children fade up `+6px scale(0.98) → 0/1` in
  250 ms, staggered by 40 ms.
- Exit faster than enter (e.g., enter 250 ms, exit 160 ms).
- Honour `prefers-reduced-motion` — kill transforms, keep opacity.

### 2.9 Dark mode

A dark variant exists (`.dark` class on root). All tokens have dark values.
For the spec, design **light mode first**; dark mode is a recolour using the
tokens, not a redesign.

---

## 3. Component primitives

Build each of these as a Figma Make component. Names match the React files in
`src/components/app/*` so naming stays coherent.

### 3.1 `Button` (`src/components/ui/button.tsx`)

Five variants × two heights. **Pill (`rounded-full`) for everything except
inline ghost & icon.**

| Variant | Bg | Text | Border | Use |
|---|---|---|---|---|
| `primary` / `brand` | `--brand-blue` | white | none | The single signature CTA per page. |
| `secondary` | `--card` (white) | `--foreground` | 1px `--border` | Cancel, Filter, Export. |
| `ghost` | transparent | `--ink-muted` → `--foreground` on hover | none, `rounded-md` | Inline / table row actions. |
| `icon` | transparent | `--ink-muted` | none, `rounded-md`, square | Tooltip required. |
| `destructive` | `--destructive` | white | none | Destructive only. |

Sizes: `sm 32px / px-3.5 / 13px`, `md 40px / px-5 / 14px`, `topbar 28px / px-3 / 12px`.
SVG icons inside buttons are `size-4`, gap `1.5` (6px).

### 3.2 `PageHeader` (editorial)
```
[ EYEBROW IN UPPERCASE 11px / +0.12em / ink-muted ]
[ H1 36–44px display ]
```
No subtitle, no right‑side actions. Inline actions live with the section
they affect.

### 3.3 Tabs (`src/components/ui/tabs.tsx` + `underline-tabs.tsx`)
- `TabsList` is a flat 40px row, `border-b`, `bg-transparent`.
- `TabsTrigger` is 40px tall, 13px medium, `text-ink-muted` → `text-foreground`
  active. Active state draws a 2px bar via `::after` flush with the bottom
  border (use `-mb-px` so it overlaps the list border). No pill, no shadow,
  `rounded-none`. Spacing between tabs: `gap-1` + `px-3` per trigger.

### 3.4 `DataTable` (`src/components/app/data-table.tsx`)
- No outer border, no card wrapper, no header background.
- `<thead>`: single `border-b`, header text 12px medium `text-ink-muted`,
  normal case (NOT uppercase, NOT tracked).
- `<tbody>`: `divide-y` (no per‑row border).
- Row: 50px tall (`px-3 py-3.5`), text `--foreground`, hover `bg-surface/60`
  fade 80 ms.
- Numeric columns: `text-right` + `tabular-nums`.
- If row links, the `<Link>` fills the cell (anchors get `block px-3 py-3.5`,
  cell padding becomes `p-0`).

### 3.5 `ListRow`
```
[ 36px tinted square w/ category icon ]   Title 14/medium
                                          Subtitle 12/ink-muted        [meta]
```
- Hover swaps bg to `--surface` in 80 ms with `-mx-2` so the hover bleeds
  into the page gutter.
- Leading square uses category tone plate `bg-cat-{tone}-bg` + ink
  `text-cat-{tone}`. Default neutral = `bg-tile text-ink-muted`.

### 3.6 `TileRow`
- Horizontal scroller, hides scrollbar, `gap-4`, `-mx-4 md:-mx-6` so tiles
  bleed to canvas edge.
- Tile: `180×140 rounded-2xl bg-tile`. Centred 48px square in tone colour
  with the icon. Optional 28px accent disc top‑right with `ring-4 ring-tile`.
- Label sits **below** the tile (`mt-3`, 13px medium, centered).
- Optional badge top‑right of tile: `rounded-full bg-background/90 px-2 text-[10px]`.

### 3.7 `SectionHeader`
- 15px semibold "Title" with optional trailing `ChevronRight` (only when the
  whole header links). Sits 48px above its section content (`mt-12 mb-3`).
- Optional right‑side `action` slot (e.g., a small underline tab strip).

### 3.8 `FilterPillBar`
- Optional leading dropdown buttons (h‑8, rounded‑full, bordered). Then a
  vertical 1px divider `mx-1 h-5 w-px bg-border`.
- Pills: h‑8 rounded‑full bordered. Active = `bg-foreground text-background`.
- Optional count badge inside pill (`bg-tile text-ink-muted`, or
  `bg-background/15` when active).
- Trailing 32px round chevron button to scroll right.

### 3.9 `StatePill`
- `rounded-full px-2 py-0.5 text-[11px] font-medium` + 6px dot.
- Tone → plate + ink: active=green, warning=amber, error=rose, info=blue,
  neutral=`bg-tile text-ink-muted`.

### 3.10 Top bar
- 56px tall, `sticky top-0 z-30`, `border-b`, `bg-background/90 backdrop-blur`.
- Left: sidebar toggle (`size-8 rounded-lg ghost`), then breadcrumbs
  (12–13px, separators are `/` in `text-ink-muted`).
- Right: ghost pill links ("Docs"), an "Ask … ⌘K" pill with a small `<kbd>`
  badge (`rounded bg-background px-1.5 py-0.5 font-mono text-[10px]`),
  notifications icon button, profile avatar (28px circle).

### 3.11 Sidebar
- 248px expanded / 56px collapsed. `bg-sidebar` (off‑white), `border-r`.
- Workspace switcher at top (24px square brand chip + name + chevron).
- Nav: 13px medium, 32px row, leading 16px icon, 8px gap. Active = `bg-tile
  text-foreground`, idle = `text-ink-muted`. Section labels: 11px uppercase
  `text-ink-muted` with `+0.12em` tracking.

### 3.12 Cards (when you must use one)
- `rounded-xl bg-card border border-border`. Padding `p-5` (or `p-6` for hero).
- No drop shadow. Header inside card: 14px semibold + 12px ink‑muted subtitle.

---

## 4. Page templates

Each template below maps 1:1 to a route in `src/routes/`. Use them as Figma
Make page recipes.

### 4.1 Dashboard home — `_authed.dashboard.tsx`
```
PageHeader( eyebrow="WORKSPACE NAME", title="Good afternoon, Sam" )

TileRow( 5–7 destination tiles, mixed tones )

SectionHeader( "Latest from your library", to="/customers" )
  stack of ListRow (4–6)

SectionHeader( "Funding in flight", to="/funding" )
  stack of ListRow with StatePill in meta

SectionHeader( "Get inspired" )
  3‑col grid of small promo cards (icon top‑left, 13px title, 12px muted)
```
No cards around the lists. 48px gaps between sections.

### 4.2 Index / list page — e.g. `admin.companies.tsx`, `customers.tsx`
```
PageHeader( eyebrow, title )
FilterPillBar( leading dropdowns + 4–8 pills + trailing chevron )
DataTable( columns: [name, status (StatePill), meta..., updated (right, tabular-nums)] )
```
Single brand‑blue CTA in the top right of the page **only if** the destination
has one (e.g., "New customer"). Otherwise none.

### 4.3 Detail page — e.g. `customers.$id.tsx`, `jobs.$id.tsx`
```
Breadcrumbs (top bar)
PageHeader dense, with StatePill inline next to the title
Underline Tabs (Overview, Activity, Documents, Settings)
Tab content: 12‑col grid; left 8 = stacked sections of ListRow; right 4 =
  "Quick facts" (key/value rows, key in ink-muted, value in foreground).
```

### 4.4 Developer / API page — `admin.external-apis.tsx` (canonical)
```
PageHeader with right‑side outbound links (small ghost pills with ↗)
Underline Tabs: Overview | Quotas | Throttling | Request log | Webhooks | Settings

— Overview —
Promo card: 80px tile thumbnail (left, bg-tile, icon) + headline +
  one‑line description + ghost "Learn more" button. rounded-xl bg-card border.
2‑column quickstart: numbered steps left, code block right (dark mono panel,
  `rounded-lg bg-foreground text-background px-4 py-3 text-[12px] font-mono`).
Usage band: balance card on left (large number 32px tabular-nums + "credits"
  in ink-muted + brand-blue "Top up" pill); chart on right.
Quick Links: 2×3 grid of icon+label tiles, 96px tall, `bg-card ring-1
  ring-border/60`, hover `bg-surface/60`.

— Request log —
DataTable columns: Method (StatePill info), Path, Status (StatePill by 2xx/4xx/5xx),
  Latency (right tabular-nums), Time (right ink-muted).
```

### 4.5 Settings — `_authed.settings.*`
- Two‑column layout: left rail of 13px nav links (no icons), right pane of
  stacked `Section` blocks. Each Section: 15px semibold title + 12px ink‑muted
  description + form rows. Save button is bottom‑right, brand variant.

### 4.6 Empty / locked / coming‑soon
- Centred, max‑width 420px. 48px tinted icon (category plate), 18px semibold
  headline, 13px ink‑muted body, single secondary CTA. Never use illustration
  art beyond a single icon.

---

## 5. Layout grid

- Container: `max-w-[1180px] mx-auto`.
- Gutter: 16 / 24 / 32 px (mobile / md / lg).
- Columns: 12. Most page bodies use a single column; detail pages use 8 + 4
  with a 24px gap.
- Breakpoints: `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`. Sidebar
  collapses to icon‑only at `< md`.

---

## 6. Iconography

- **Library:** Lucide (`lucide-react`). Stroke 1.5, size 16 (`size-4`) inside
  buttons, 14 (`size-3.5`) inside pills, 18 inside top‑bar buttons, 24 inside
  tile clusters.
- Never mix icon families. No emoji in chrome.

---

## 7. Imagery & illustration

There are no marketing illustrations in the admin app. The only "imagery" is:
- Tile clusters (icon + accent disc).
- Optional `GradientOrb` blob behind the dashboard hero — soft, blurred, low
  opacity, drawn from the orb palette in §2.3.

---

## 8. Accessibility hard requirements

- Min contrast 4.5:1 for body, 3:1 for ≥18px / bold ≥14px.
- Focus ring: 1px `--ring` with 2px offset on interactive elements.
- All `icon` buttons require a `aria-label` and a tooltip.
- Hit area ≥ 32×32 even when the visual is smaller.
- Honour `prefers-reduced-motion` (already wired in CSS).

---

## 9. Reproducing this in Figma Make — checklist

1. **Create variables** for every token in §2 (Color, Number, String). Group:
   `canvas/*`, `ink/*`, `border/*`, `brand/*`, `cat/*`, `radius/*`, `dur/*`.
2. **Build the 12 primitives** in §3, in this order: Button, StatePill,
   PageHeader, Tabs, ListRow, TileRow, FilterPillBar, SectionHeader, DataTable,
   TopBar, Sidebar, Card. Wire variants to the variables.
3. **Build the 6 page templates** in §4 using only those primitives. No
   loose styling on instances.
4. **QA pass.** Compare side‑by‑side with the references in §0. If anything
   looks more "SaaS dashboard" than "ElevenLabs editorial", you've added a
   border, a shadow, or a bg you shouldn't have.

---

## 10. Code references (read these for ground truth)

When in doubt, the React source wins. Key files:

| File | What lives there |
|---|---|
| `src/styles.css` | Every token, every keyframe, motion rules. |
| `src/components/ui/button.tsx` | Button variants + sizes. |
| `src/components/ui/tabs.tsx` | Underline tab anatomy. |
| `src/components/app/data-table.tsx` | Borderless table. |
| `src/components/app/page-header.tsx` | Eyebrow + H1. |
| `src/components/app/list-row.tsx` | Flat list row. |
| `src/components/app/tile-row.tsx` | Horizontal tile scroller. |
| `src/components/app/filter-pill-bar.tsx` | Filter pills. |
| `src/components/app/section-header.tsx` | "Title ›" header. |
| `src/components/app/state-pill.tsx` | Status pill + tone map. |
| `src/components/app/shell/top-bar.tsx` | Top bar. |
| `src/components/app/shell/app-sidebar.tsx` | Sidebar. |
| `src/routes/_authed.dashboard.tsx` | Canonical dashboard layout. |
| `src/routes/_authed.admin.external-apis.tsx` | Canonical "Developer" layout. |

---

## 11. Things that are explicitly forbidden

- `transition: all`.
- Drop shadows on chrome (cards, buttons, inputs, the topbar).
- Pill‑style tabs with a filled background.
- Tables with outer borders, header backgrounds, or per‑row borders.
- Uppercase + tracked table headers.
- More than one brand‑blue CTA per page.
- Saturated category colours used as button backgrounds.
- Purple gradients, glassmorphism, neumorphism, generic SaaS hero blobs.
- Default Tailwind/system font stacks. Always Inter.
- Decorative emoji inside chrome.
- Re‑introducing `subtitle` or right‑side `actions` to `PageHeader`.

---

## 12. Full source appendix (ground truth for Figma Make)

The sections below contain the **complete, verbatim source** of every canonical
file referenced in §10. If any rule above is ambiguous, the code wins.
Reproduce class names, structure, motion timings, and token references exactly.

> Conventions used in the codebase:
> - `cn()` is `clsx + tailwind-merge` from `src/lib/utils.ts`.
> - `@/` resolves to `src/`.
> - Tailwind v4 — design tokens are CSS custom properties, not a JS config.
> - All colour utilities (`bg-foreground`, `text-ink-muted`, `ring-border`, etc.)
>   are driven by the tokens in `src/styles.css` (§12.1). Never use raw hex.


### 12.1 Design tokens & motion

### styles.css

`src/styles.css`

```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/*
 * Renewably UK — design system
 *
 * Visual language: ElevenLabs.
 *   bright white canvas, near-black ink, soft grey surfaces,
 *   vibrant illustration palette for category tiles, generous whitespace.
 *
 * Motion: see "Motion tokens" block. Animate only transform & opacity.
 *   Never `transition: all`. Enter from scale(0.95), never scale(0).
 */

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-ring-offset-background: var(--background);

  /* Surfaces unique to Renewably */
  --color-surface: var(--surface);
  --color-tile: var(--tile);
  --color-tile-foreground: var(--tile-foreground);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);

  /* Brand */
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --color-brand-blue: var(--brand-blue);
  --color-brand-blue-foreground: var(--brand-blue-foreground);
  --color-brand-blue-tint: var(--brand-blue-tint);

  /* Category illustration palette (soft tile background + vivid icon) */
  --color-cat-green: var(--cat-green);
  --color-cat-blue: var(--cat-blue);
  --color-cat-amber: var(--cat-amber);
  --color-cat-purple: var(--cat-purple);
  --color-cat-rose: var(--cat-rose);
  --color-cat-teal: var(--cat-teal);

  --color-cat-green-bg: var(--cat-green-bg);
  --color-cat-blue-bg: var(--cat-blue-bg);
  --color-cat-amber-bg: var(--cat-amber-bg);
  --color-cat-purple-bg: var(--cat-purple-bg);
  --color-cat-rose-bg: var(--cat-rose-bg);
  --color-cat-teal-bg: var(--cat-teal-bg);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans:
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  --font-display: var(--font-sans);

  --color-orb-mint:     var(--orb-mint);
  --color-orb-peach:    var(--orb-peach);
  --color-orb-lavender: var(--orb-lavender);
  --color-orb-sky:      var(--orb-sky);
  --color-orb-rose:     var(--orb-rose);

  --color-border-strong: var(--border-strong);
}

:root {
  --radius: 0.625rem; /* tightened toward ElevenLabs proportions */

  /* Canvas — warm off-white per ElevenLabs editorial pass */
  --background: #F5F5F5;                     /* canvas */
  --surface:    #FAFAFA;                     /* alt band */
  --tile:       #F0EFED;                     /* badge/voice plate */
  --tile-foreground: #292524;

  --foreground: #0C0A09;                     /* warm near-black */
  --ink:        #0C0A09;                     /* H1 ink */
  --ink-muted:  #777169;                     /* warm muted */

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.16 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.16 0 0);

  /* Primary = black pill (ElevenLabs) */
  --primary: oklch(0.16 0 0);
  --primary-foreground: oklch(0.99 0 0);

  --secondary: oklch(0.965 0.003 250);
  --secondary-foreground: oklch(0.16 0 0);

  --muted: oklch(0.965 0.003 250);
  --muted-foreground: oklch(0.55 0 0);

  --accent: oklch(0.965 0.003 250);
  --accent-foreground: oklch(0.16 0 0);

  --destructive: oklch(0.58 0.21 27);
  --destructive-foreground: oklch(0.99 0 0);

  --border:        #E7E5E4;                  /* warm hairline */
  --border-strong: #D6D3D1;
  --input:         #E7E5E4;
  --ring:          #0C0A09;

  /* Renewably brand green */
  --brand: oklch(0.62 0.16 152);
  --brand-foreground: oklch(0.99 0 0);

  /* Renewably brand blue (#0F47A8) — used sparingly: active workspace tab,
     primary CTAs, and informational notice tint (#E8F0FC). */
  --brand-blue: #0F47A8;
  --brand-blue-foreground: #FFFFFF;
  --brand-blue-tint: #E8F0FC;

  /* Atmospheric gradient orb palette — pure decoration, never on CTAs */
  --orb-mint:     #A7E5D3;
  --orb-peach:    #F4C5A8;
  --orb-lavender: #C8B8E0;
  --orb-sky:      #A8C8E8;
  --orb-rose:     #E8B8C4;

  /* Category illustration palette — soft tile bg + vivid icon ink */
  --cat-green:     oklch(0.55 0.17 152);
  --cat-green-bg:  oklch(0.94 0.05 152);
  --cat-blue:      oklch(0.55 0.18 250);
  --cat-blue-bg:   oklch(0.94 0.04 250);
  --cat-amber:     oklch(0.66 0.16 70);
  --cat-amber-bg:  oklch(0.95 0.06 80);
  --cat-purple:    oklch(0.55 0.18 295);
  --cat-purple-bg: oklch(0.94 0.04 295);
  --cat-rose:      oklch(0.6 0.19 15);
  --cat-rose-bg:   oklch(0.95 0.04 15);
  --cat-teal:      oklch(0.6 0.12 195);
  --cat-teal-bg:   oklch(0.94 0.04 195);

  --chart-1: var(--cat-green);
  --chart-2: var(--cat-blue);
  --chart-3: var(--cat-amber);
  --chart-4: var(--cat-purple);
  --chart-5: var(--cat-rose);

  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.16 0 0);
  --sidebar-primary: oklch(0.16 0 0);
  --sidebar-primary-foreground: oklch(0.99 0 0);
  --sidebar-accent: oklch(0.95 0.002 250);
  --sidebar-accent-foreground: oklch(0.16 0 0);
  --sidebar-border: oklch(0.93 0.002 250);
  --sidebar-ring: oklch(0.55 0 0);

  /* ─── Motion tokens ─────────────────────────────────────────────
     Strong custom curves. Built-in CSS easings are too weak. */
  --ease-out:    cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

  --dur-1: 100ms;
  --dur-2: 160ms;
  --dur-3: 200ms;
  --dur-4: 250ms;
}

.dark {
  /* Dark mode — refined ElevenLabs-style: deep neutral with subtle warmth,
     softer borders, vivid category accents that survive on a dark canvas. */
  --background: oklch(0.145 0.003 264);      /* near-black, hint of cool */
  --surface:    oklch(0.185 0.004 264);      /* raised surface */
  --tile:       oklch(0.225 0.005 264);
  --tile-foreground: oklch(0.97 0 0);

  --foreground: oklch(0.97 0 0);
  --ink:        oklch(0.99 0 0);
  --ink-muted:  oklch(0.68 0.01 264);

  --card:       oklch(0.185 0.004 264);
  --card-foreground: oklch(0.97 0 0);
  --popover:    oklch(0.205 0.005 264);
  --popover-foreground: oklch(0.97 0 0);

  --primary: oklch(0.97 0 0);
  --primary-foreground: oklch(0.145 0.003 264);

  --secondary: oklch(0.235 0.005 264);
  --secondary-foreground: oklch(0.97 0 0);

  --muted: oklch(0.225 0.005 264);
  --muted-foreground: oklch(0.68 0.01 264);

  --accent: oklch(0.235 0.005 264);
  --accent-foreground: oklch(0.97 0 0);

  --destructive: oklch(0.62 0.21 22);
  --destructive-foreground: oklch(0.99 0 0);

  --border: oklch(1 0 0 / 8%);
  --input:  oklch(1 0 0 / 10%);
  --ring:   oklch(0.6 0.01 264);

  /* Brand */
  --brand: oklch(0.7 0.17 152);
  --brand-foreground: oklch(0.13 0 0);

  /* Brand blue — same hex in dark mode; tint slightly translucent on dark */
  --brand-blue: #0F47A8;
  --brand-blue-foreground: #FFFFFF;
  --brand-blue-tint: oklch(0.32 0.06 255 / 35%);

  /* Category palette — brighter inks, low-chroma backgrounds for dark canvas */
  --cat-green:     oklch(0.78 0.18 152);
  --cat-green-bg:  oklch(0.32 0.07 152 / 50%);
  --cat-blue:      oklch(0.78 0.16 250);
  --cat-blue-bg:   oklch(0.32 0.06 250 / 50%);
  --cat-amber:     oklch(0.82 0.16 80);
  --cat-amber-bg:  oklch(0.34 0.07 75 / 50%);
  --cat-purple:    oklch(0.78 0.16 295);
  --cat-purple-bg: oklch(0.32 0.07 295 / 50%);
  --cat-rose:      oklch(0.78 0.17 18);
  --cat-rose-bg:   oklch(0.34 0.08 18 / 50%);
  --cat-teal:      oklch(0.78 0.13 195);
  --cat-teal-bg:   oklch(0.32 0.06 195 / 50%);

  --sidebar: oklch(0.165 0.003 264);
  --sidebar-foreground: oklch(0.97 0 0);
  --sidebar-primary: oklch(0.97 0 0);
  --sidebar-primary-foreground: oklch(0.145 0.003 264);
  --sidebar-accent: oklch(0.235 0.005 264);
  --sidebar-accent-foreground: oklch(0.97 0 0);
  --sidebar-border: oklch(1 0 0 / 8%);
  --sidebar-ring: oklch(0.6 0.01 264);
}

@layer base {
  * {
    border-color: var(--color-border);
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    letter-spacing: 0.01em; /* +0.16px editorial dialect */
  }

  h1, h2, h3, h4 {
    font-family: var(--font-sans);
    font-weight: 600;
    letter-spacing: -0.015em;
  }

  /* Display utility — kept as sans for in-app surfaces */
  .font-display {
    font-family: var(--font-sans);
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .font-display-italic {
    font-family: var(--font-sans);
    font-weight: 600;
    font-style: normal;
    letter-spacing: -0.02em;
  }
}

/* ─── Craft layer ────────────────────────────────────────────────
   Component-agnostic motion rules applied across the app. */

@layer components {
  /* Pressable feedback. Only enable on devices that actually point. */
  @media (hover: hover) and (pointer: fine) {
    .press {
      transition: transform var(--dur-2) var(--ease-out);
    }
    .press:active {
      transform: scale(0.97);
    }

    .tile {
      transition:
        transform var(--dur-3) var(--ease-out),
        box-shadow var(--dur-3) var(--ease-out);
    }
    .tile:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 14px -8px oklch(0 0 0 / 0.15);
    }
  }

  /* List / tile entrance — first mount only. Caller adds .stagger-in
     to the parent and each child gets a nth-child delay. */
  .stagger-in > * {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
    animation: rn-fade-up var(--dur-4) var(--ease-out) forwards;
  }
  .stagger-in > *:nth-child(1) { animation-delay: 0ms; }
  .stagger-in > *:nth-child(2) { animation-delay: 40ms; }
  .stagger-in > *:nth-child(3) { animation-delay: 80ms; }
  .stagger-in > *:nth-child(4) { animation-delay: 120ms; }
  .stagger-in > *:nth-child(5) { animation-delay: 160ms; }
  .stagger-in > *:nth-child(6) { animation-delay: 200ms; }
  .stagger-in > *:nth-child(7) { animation-delay: 240ms; }
  .stagger-in > *:nth-child(8) { animation-delay: 280ms; }

  @keyframes rn-fade-up {
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Status pill / label crossfade — mask with a soft blur */
  .swap-blur {
    transition:
      opacity var(--dur-3) var(--ease-out),
      filter  var(--dur-3) var(--ease-out);
  }
  .swap-blur[data-swapping="true"] {
    opacity: 0.6;
    filter: blur(2px);
  }
}

/* Radix Popover/Dropdown/Menu: scale from trigger, not center.
   Modals are exempt (they use transform-origin: center by default). */
[data-radix-popper-content-wrapper] > * {
  transform-origin: var(--radix-popper-transform-origin) !important;
}

/* prefers-reduced-motion: keep opacity, drop transforms. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .stagger-in > * {
    transform: none !important;
  }
}

/* ─── IBG issued celebration ──────────────────────────────────── */
@keyframes issued-pop {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes issued-burst {
  0%   { transform: translate(0,0) scale(0); opacity: 1; }
  100% { transform: var(--burst-end) scale(1); opacity: 0; }
}
.ibg-pop {
  display: inline-grid;
  place-items: center;
  animation: issued-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  transform-origin: center;
}
.ibg-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: var(--cat-green);
  opacity: 0;
  animation: issued-burst 300ms ease-out forwards;
  animation-delay: 100ms;
}
.ibg-burst-1 { --burst-end: translate(28px, -28px); }
.ibg-burst-2 { --burst-end: translate(28px,  28px); }
.ibg-burst-3 { --burst-end: translate(-28px, 28px); }
.ibg-burst-4 { --burst-end: translate(-28px,-28px); }
@media (prefers-reduced-motion: reduce) {
  .ibg-pop, .ibg-burst { animation: none !important; opacity: 1 !important; transform: none !important; }
}

```

### 12.2 Utilities

### lib/utils.ts

`src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

### 12.3 Primitives — shadcn/ui (customised)

### ui/button.tsx

`src/components/ui/button.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Renewably button system — five variants, two sizes. Single source of truth.
 *
 *   primary    — black pill, ONE per view (default save / submit)
 *   brand      — brand-blue pill, ONLY for the signature CTA of a destination
 *                (Issue IBG, Save changes, Apply override). At most one per page.
 *   secondary  — bordered pill (Cancel, Filter, Export)
 *   ghost      — inline / table-row text action
 *   icon       — square icon-only action; tooltip required
 *
 * Sizes: sm (h-8) and md (h-9). No lg.
 *
 * Legacy variant aliases (default, outline, destructive, link) are kept so
 * shadcn-generated usages don't break the build, but new code should use the
 * five variants above.
 */
const buttonVariants = cva(
  "press inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "rounded-full bg-brand-blue text-brand-blue-foreground hover:bg-brand-blue/90",
        brand:
          "rounded-full bg-brand-blue text-brand-blue-foreground hover:bg-brand-blue/90",
        secondary:
          "rounded-full border bg-card text-foreground hover:bg-surface",
        ghost:
          "rounded-md text-ink-muted hover:bg-surface hover:text-foreground",
        icon:
          "rounded-md text-ink-muted hover:bg-surface hover:text-foreground",
        // legacy aliases
        default: "rounded-full bg-brand-blue text-brand-blue-foreground hover:bg-brand-blue/90",
        outline: "rounded-full border bg-card text-foreground hover:bg-surface",
        destructive:
          "rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-foreground underline-offset-4 hover:underline rounded-md",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px]",
        md: "h-10 px-5",
        icon: "h-9 w-9 p-0",
        topbar: "h-7 px-3 text-[12px] rounded-full",
        // legacy
        default: "h-10 px-5",
        lg: "h-10 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const resolvedSize = variant === "icon" && !size ? "icon" : size;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size: resolvedSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

```

### ui/tabs.tsx

`src/components/ui/tabs.tsx`

```tsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 w-full items-center justify-start gap-1 rounded-none border-b bg-transparent p-0 text-ink-muted",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex h-10 -mb-px items-center gap-1.5 whitespace-nowrap rounded-none bg-transparent px-3 text-[13px] font-medium text-ink-muted shadow-none ring-offset-background transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

```

### ui/badge.tsx

`src/components/ui/badge.tsx`

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

```

### ui/card.tsx

`src/components/ui/card.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

```

### ui/input.tsx

`src/components/ui/input.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-[color:var(--border-strong)] bg-card px-4 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

```

### ui/select.tsx

`src/components/ui/select.tsx`

```tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

```

### ui/table.tsx

`src/components/ui/table.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

```

### ui/separator.tsx

`src/components/ui/separator.tsx`

```tsx
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className,
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

```

### ui/dialog.tsx

`src/components/ui/dialog.tsx`

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border bg-background p-6 shadow-xl outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=open]:duration-200 data-[state=closed]:duration-150",
        "data-[state=open]:ease-out",
        className,
      )}
      style={{ transformOrigin: "center" }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

```

### ui/sheet.tsx

`src/components/ui/sheet.tsx`

```tsx
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

```

### ui/popover.tsx

`src/components/ui/popover.tsx`

```tsx
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

```

### ui/dropdown-menu.tsx

`src/components/ui/dropdown-menu.tsx`

```tsx
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

```

### 12.4 App components

### app/page-header.tsx

`src/components/app/page-header.tsx`

```tsx
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * PageHeader — quiet editorial header.
 *
 *   WORKSPACE NAME
 *   Good afternoon, Sam
 *
 * The page title IS the H1. Subtitle and right-side actions are accepted for
 * back-compat but intentionally NOT rendered — they cluttered the canvas.
 * Inline actions belong with their respective sections below.
 */
export function PageHeader({
  eyebrow,
  title,
  className,
  dense,
  // Accepted for back-compat with existing routes; not rendered.
  subtitle: _subtitle,
  actions: _actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  /** Smaller variant for sub-pages. */
  dense?: boolean;
  className?: string;
  /** @deprecated kept for compat — no longer rendered. */
  subtitle?: ReactNode;
  /** @deprecated kept for compat — no longer rendered. */
  actions?: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      {eyebrow && (
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
          {eyebrow}
        </div>
      )}
      <h1
        className={cn(
          "font-display mt-1.5 text-ink",
          dense
            ? "text-[28px] leading-[1.1] md:text-[32px]"
            : "text-[36px] leading-[1.05] md:text-[44px]",
        )}
      >
        {title}
      </h1>
    </div>
  );
}

```

### app/section-header.tsx

`src/components/app/section-header.tsx`

```tsx
/**
 * SectionHeader — "Title ›" link, sits flush above content with no card.
 *
 *   Latest from the library  ›
 *
 * Replaces the old SectionRow + SectionCard title-bar pattern wherever the
 * card chrome itself isn't needed.
 */

import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionHeader({
  title,
  to,
  action,
  className,
}: {
  title: ReactNode;
  /** When provided, the title becomes a link with a trailing chevron. */
  to?: string;
  /** Optional right-side control (e.g. a small underline tab strip). */
  action?: ReactNode;
  className?: string;
}) {
  const titleNode = (
    <span className="inline-flex items-center gap-1 text-[15px] font-semibold text-foreground">
      {title}
      {to && (
        <ChevronRight className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5" />
      )}
    </span>
  );

  return (
    <div className={cn("mb-3 mt-12 flex items-end justify-between gap-4", className)}>
      {to ? (
        <Link to={to} className="press group">
          {titleNode}
        </Link>
      ) : (
        titleNode
      )}
      {action}
    </div>
  );
}

```

### app/section-card.tsx

`src/components/app/section-card.tsx`

```tsx
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionCard({
  title, action, children, className, padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div>{action}</div>
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  );
}

```

### app/data-table.tsx

`src/components/app/data-table.tsx`

```tsx
/**
 * Lightweight data table — ElevenLabs-style: borderless, flat header,
 * generous row height, soft hover.
 */
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "right";
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  rowHref,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  rowHref?: (row: T) => string;
  empty?: ReactNode;
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cn(
                  "px-3 py-2.5 text-[12px] font-medium text-ink-muted",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <Row key={row.id} row={row} columns={columns} href={rowHref?.(row)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row<T extends { id: string }>({
  row, columns, href,
}: { row: T; columns: Column<T>[]; href?: string }) {
  if (href) {
    return (
      <tr className="group cursor-pointer transition-colors hover:bg-surface/60">
        {columns.map((c) => (
          <td
            key={c.key}
            className={cn(
              "p-0 text-foreground",
              c.align === "right" ? "text-right" : "text-left",
            )}
          >
            <Link to={href} className="block px-3 py-3.5">{c.render(row)}</Link>
          </td>
        ))}
      </tr>
    );
  }
  return (
    <tr className="hover:bg-surface/60">
      {columns.map((c) => (
        <td
          key={c.key}
          className={cn(
            "px-3 py-3.5 text-foreground",
            c.align === "right" ? "text-right" : "text-left",
          )}
        >
          {c.render(row)}
        </td>
      ))}
    </tr>
  );
}

```

### app/list-row.tsx

`src/components/app/list-row.tsx`

```tsx
/**
 * ListRow — flat list-item primitive used across dashboards & section panels.
 *
 *   [tile]   Title text                              [meta]
 *            Subtitle text                           [meta]
 *
 * No per-row border. Hover swaps the bg in 80ms. Use with a stack of rows
 * directly on the canvas — no card wrapper.
 */

import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ReactNode, ComponentType } from "react";

export function ListRow({
  to,
  onClick,
  leading,
  icon: Icon,
  iconTone = "neutral",
  title,
  subtitle,
  meta,
  className,
}: {
  to?: string;
  onClick?: () => void;
  /** Custom leading slot. If absent, a 36px tinted square holds `icon`. */
  leading?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  iconTone?: "neutral" | "green" | "blue" | "amber" | "purple" | "rose" | "teal";
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  const tone = TONE[iconTone];
  const content = (
    <>
      {leading ?? (
        Icon && (
          <div className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tone.bg, tone.ink)}>
            <Icon className="size-4" />
          </div>
        )
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-foreground">{title}</div>
        {subtitle && <div className="truncate text-[12px] text-ink-muted">{subtitle}</div>}
      </div>
      {meta && <div className="flex shrink-0 items-center gap-2 text-[12px] text-ink-muted">{meta}</div>}
    </>
  );

  const cls = cn(
    "group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 -mx-2 text-left transition-[background-color] duration-[80ms] ease-out hover:bg-surface",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={cls}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}

const TONE = {
  neutral: { bg: "bg-tile", ink: "text-ink-muted" },
  green: { bg: "bg-cat-green-bg", ink: "text-cat-green" },
  blue: { bg: "bg-cat-blue-bg", ink: "text-cat-blue" },
  amber: { bg: "bg-cat-amber-bg", ink: "text-cat-amber" },
  purple: { bg: "bg-cat-purple-bg", ink: "text-cat-purple" },
  rose: { bg: "bg-cat-rose-bg", ink: "text-cat-rose" },
  teal: { bg: "bg-cat-teal-bg", ink: "text-cat-teal" },
} as const;

```

### app/tile-row.tsx

`src/components/app/tile-row.tsx`

```tsx
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

```

### app/filter-pill-bar.tsx

`src/components/app/filter-pill-bar.tsx`

```tsx
/**
 * FilterPillBar — ElevenLabs-style filter row.
 *
 *   [Language ▾] [Accent ▾] | [Conversational] [Narration] [Characters] …  ›
 *
 * Sits above content. Pills are flat and horizontally scrollable. The
 * leading dropdown slot is optional. Trailing chevron scrolls right.
 *
 * Pure presentation — caller wires state for active pill / dropdown values.
 */

import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType, ReactNode } from "react";

export type Pill = {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  count?: number;
};

export function FilterPillBar({
  dropdowns,
  pills,
  active,
  onChange,
  className,
  trailing,
}: {
  /** Optional leading dropdown buttons (e.g. Language, Accent). */
  dropdowns?: { label: string; value?: string; onClick?: () => void }[];
  pills: Pill[];
  /** Currently-active pill value. `null`/undefined = nothing selected. */
  active?: string | null;
  onChange?: (value: string | null) => void;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative -mx-4 mt-4 md:-mx-6", className)}>
      <div
        className="flex items-center gap-2 overflow-x-auto px-4 pb-1 md:px-6 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {dropdowns?.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={d.onClick}
            className="press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[13px] text-foreground hover:bg-surface"
          >
            <span className="text-ink-muted">{d.label}</span>
            {d.value && <span className="font-medium">{d.value}</span>}
            <ChevronDown className="size-3.5 text-ink-muted" />
          </button>
        ))}

        {dropdowns && dropdowns.length > 0 && pills.length > 0 && (
          <div className="mx-1 h-5 w-px shrink-0 bg-border" />
        )}

        {pills.map((p) => {
          const Icon = p.icon;
          const isActive = active === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange?.(isActive ? null : p.value)}
              className={cn(
                "press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-surface",
              )}
            >
              {Icon && <Icon className="size-3.5" />}
              <span>{p.label}</span>
              {typeof p.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-medium tabular-nums",
                    isActive ? "bg-background/15 text-background" : "bg-tile text-ink-muted",
                  )}
                >
                  {p.count}
                </span>
              )}
            </button>
          );
        })}

        {trailing ?? (
          <button
            type="button"
            aria-label="Scroll filters"
            className="press grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card text-ink-muted hover:bg-surface"
          >
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

```

### app/state-pill.tsx

`src/components/app/state-pill.tsx`

```tsx
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

```

### app/underline-tabs.tsx

`src/components/app/underline-tabs.tsx`

```tsx
import { cn } from "@/lib/utils";

export function UnderlineTabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }>; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cn("flex h-10 items-center gap-1 border-b", className)}>
      {options.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "press relative -mb-px flex h-10 items-center gap-1.5 px-3 text-[13px] font-medium transition-colors",
              active ? "text-foreground" : "text-ink-muted hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-4" />}
            <span>{opt.label}</span>
            {typeof opt.count === "number" && (
              <span className={cn(
                "ml-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-medium",
                active ? "bg-foreground text-background" : "bg-tile text-ink-muted",
              )}>
                {opt.count}
              </span>
            )}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground" />}
          </button>
        );
      })}
    </div>
  );
}

```

### app/empty-state.tsx

`src/components/app/empty-state.tsx`

```tsx
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-surface/40 px-6 py-16 text-center",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full text-foreground opacity-[0.04]"
      >
        <circle cx="100" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="60" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="60" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="relative flex flex-col items-center animate-in fade-in-0 duration-300 [animation-delay:150ms] [animation-fill-mode:both]">
        {Icon && (
          <div className="grid size-14 place-items-center rounded-2xl bg-background text-ink-muted shadow-sm">
            <Icon className="size-6" />
          </div>
        )}
        <div className="mt-4 text-sm font-medium text-foreground">{title}</div>
        {body && <p className="mt-1 max-w-sm text-sm text-ink-muted">{body}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

```

### app/locked-card.tsx

`src/components/app/locked-card.tsx`

```tsx
/**
 * Inline lock card. Used wherever a feature is gated by a permission,
 * tier, or onboarding state. Operators see a "Request access" button
 * that fires the permission-request flow handled by DevRoleProvider.
 */

import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useDevRole } from "@/lib/dev-role";
import { PERMISSIONS, type Permission } from "@/lib/rbac";

export type LockReason =
  | { kind: "permission"; permission: Permission }
  | { kind: "tier"; required: "operate" }
  | { kind: "onboarding" }
  | { kind: "role"; required: "admin" }
  | { kind: "measure" };

export function LockedCard({
  title,
  body,
  reason,
}: {
  title: string;
  body?: string;
  reason: LockReason;
}) {
  const { role, requestPermission, pendingPermissionRequests } = useDevRole();
  const reasonText = describe(reason);
  const isOperator = role === "operator";
  const isPermissionLock = reason.kind === "permission";
  const alreadyRequested =
    isPermissionLock &&
    pendingPermissionRequests.includes(reason.permission);

  return (
    <div className="rounded-2xl border border-dashed bg-surface/60 p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-background text-ink-muted">
          <Lock className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {body && (
            <p className="mt-1 text-sm text-ink-muted">{body}</p>
          )}
          <div className="mt-2 inline-flex items-center rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium text-ink-muted">
            {reasonText}
          </div>
        </div>
        {isOperator && isPermissionLock && (
          <button
            type="button"
            disabled={alreadyRequested}
            onClick={() => {
              requestPermission(reason.permission);
              toast.success("Request sent to admin", {
                description: PERMISSIONS.find((p) => p.id === reason.permission)?.label,
              });
            }}
            className="press shrink-0 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
          >
            {alreadyRequested ? "Requested" : "Request access"}
          </button>
        )}
      </div>
    </div>
  );
}

function describe(r: LockReason): string {
  switch (r.kind) {
    case "permission": {
      const def = PERMISSIONS.find((p) => p.id === r.permission);
      return `Permission required · ${def?.label ?? r.permission}`;
    }
    case "tier":
      return "Operate plan required";
    case "onboarding":
      return "Finish onboarding to unlock";
    case "role":
      return r.required === "admin" ? "Admin role required" : "Role required";
    case "measure":
      return "Measure not approved";
  }
}

```

### app/coming-soon.tsx

`src/components/app/coming-soon.tsx`

```tsx
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

```

### app/hero-card.tsx

`src/components/app/hero-card.tsx`

```tsx
import { cn } from "@/lib/utils";
import { GradientOrb } from "./gradient-orb";

type Variant = "mint" | "peach" | "lavender" | "sky" | "rose";

/**
 * Atmospheric hero card — large rounded surface with a single orb behind
 * centered display copy.
 */
export function HeroCard({
  orb = "mint",
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  orb?: Variant;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[28px] border bg-card px-6 py-14 md:px-12 md:py-20",
        className,
      )}
    >
      <GradientOrb
        variant={orb}
        size={640}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <div className="relative z-10 mx-auto max-w-[760px] text-center">
        {eyebrow && (
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-4xl leading-[1.05] text-ink md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-muted md:text-lg">
            {subtitle}
          </p>
        )}
        {actions && (
          <div className="mt-8 flex items-center justify-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

```

### app/gradient-orb.tsx

`src/components/app/gradient-orb.tsx`

```tsx
import { cn } from "@/lib/utils";

type Variant = "mint" | "peach" | "lavender" | "sky" | "rose";

const COLORS: Record<Variant, string> = {
  mint: "var(--orb-mint)",
  peach: "var(--orb-peach)",
  lavender: "var(--orb-lavender)",
  sky: "var(--orb-sky)",
  rose: "var(--orb-rose)",
};

/**
 * Soft atmospheric radial bloom. Pure decoration — never wrap content in this.
 * Place absolute-positioned inside a `relative overflow-hidden` parent.
 */
export function GradientOrb({
  variant = "mint",
  size = 480,
  className,
  style,
}: {
  variant?: Variant;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const color = COLORS[variant];
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 65%)`,
        filter: "blur(40px)",
        opacity: 0.55,
        ...style,
      }}
    />
  );
}

```

### 12.5 App shell

### app/shell/top-bar.tsx

`src/components/app/shell/top-bar.tsx`

```tsx
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

```

### app/shell/app-sidebar.tsx

`src/components/app/shell/app-sidebar.tsx`

```tsx
/**
 * Single ElevenLabs-style sidebar.
 *
 * Three modes:
 *  - desktop expanded   (240px, full labels + section headers)
 *  - desktop collapsed  (60px, icons + tooltips on hover)
 *  - mobile drawer      (off-canvas, controlled by mobileOpen)
 *
 * Replaces the previous MiniRail + SidePanel pair.
 */

import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { InviteDialog } from "@/components/app/invite-dialog";
import {
  Home,
  FolderKanban,
  FileBadge,
  Database,
  Send,
  Sparkles,
  Settings as SettingsIcon,
  Users,
  ScrollText,
  Activity,
  History,
  ClipboardList,
  FileWarning,
  Library,
  SlidersHorizontal,
  Lock,
  Shield,
  ShieldAlert,
  Plug,
  BarChart2,
  Building2,
  CreditCard,
  Receipt,
  Workflow,
  ToggleRight,
  Clock,
  DollarSign,
  ListChecks,
  Layers,
  KeyRound,
  Globe,
  ShieldOff,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { canAny, type Permission } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useSidebarState } from "./sidebar-context";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleIf?: Permission[];
  showLockedIfNot?: Permission[];
  hideForRoles?: Role[];
};

const main: NavItem[] = [
  { label: "Home", to: "/dashboard", icon: Home },
  {
    label: "Projects",
    to: "/projects",
    icon: FolderKanban,
    showLockedIfNot: ["customers.read", "jobs.read", "properties.read"],
  },
  {
    label: "IBG Generator",
    to: "/ibg/new",
    icon: FileBadge,
    showLockedIfNot: ["ibg.issue"],
    hideForRoles: ["admin"],
  },
  {
    label: "IBG Repository",
    to: "/ibg/repository",
    icon: Database,
    showLockedIfNot: ["ibg.repository.read"],
  },
  {
    label: "IBG History",
    to: "/ibg/history",
    icon: History,
    showLockedIfNot: ["ibg.repository.read"],
  },
  {
    label: "Submissions",
    to: "/submissions",
    icon: Send,
    showLockedIfNot: ["submissions.read"],
  },
  {
    label: "Funding",
    to: "/funding",
    icon: Sparkles,
    showLockedIfNot: ["funding.match.read", "funding.projects.read"],
  },
  {
    label: "Reports",
    to: "/reports",
    icon: BarChart2,
    showLockedIfNot: ["reports.read"],
  },
];

type AdminGroup = { label: string; items: NavItem[] };

const adminGroups: AdminGroup[] = [
  {
    label: "Companies & Users",
    items: [
      { label: "Companies", to: "/admin/companies", icon: Building2, visibleIf: ["users.read"] },
      { label: "Users", to: "/admin/users", icon: Users, visibleIf: ["users.read"] },
      { label: "Membership & Billing", to: "/admin/membership", icon: CreditCard, visibleIf: ["users.read"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Onboarding", to: "/admin/onboarding", icon: ClipboardList, visibleIf: ["onboarding.queue.read"] },
      { label: "Amendments", to: "/admin/amendments", icon: FileWarning, visibleIf: ["amendments.queue.read"] },
      { label: "Activity", to: "/admin/activity", icon: Activity, visibleIf: ["activity.read"] },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Configuration", to: "/admin/config", icon: SlidersHorizontal, visibleIf: ["config.read"] },
      { label: "Measure Policy & Pricing", to: "/admin/measure-policy", icon: DollarSign, visibleIf: ["config.read"] },
      { label: "Evidence Requirements", to: "/admin/evidence-requirements", icon: ListChecks, visibleIf: ["config.read"] },
      { label: "Installation & System Types", to: "/admin/installation-types", icon: Layers, visibleIf: ["config.read"] },
      { label: "Funding Schemes", to: "/admin/funding-schemes", icon: Globe, visibleIf: ["config.read"] },
      { label: "Measure Access Control", to: "/admin/measure-access", icon: KeyRound, visibleIf: ["config.read"] },
    ],
  },
  {
    label: "Risk & Compliance",
    items: [
      { label: "Risk Monitoring", to: "/admin/risk", icon: ShieldAlert, visibleIf: ["risk.read"] },
      { label: "Risk Overrides", to: "/admin/risk-overrides", icon: ShieldOff, visibleIf: ["risk.read"] },
      { label: "Audit Logs", to: "/admin/audit", icon: ScrollText, visibleIf: ["audit.read"] },
    ],
  },
  {
    label: "Integrations",
    items: [
      { label: "Integrations Hub", to: "/admin/integrations", icon: Plug, visibleIf: ["config.read"] },
      { label: "External APIs", to: "/admin/external-apis", icon: Activity, visibleIf: ["config.read"] },
      { label: "Cron Jobs", to: "/admin/cron", icon: Clock, visibleIf: ["config.read"] },
      { label: "Stripe Events", to: "/admin/stripe-events", icon: Receipt, visibleIf: ["config.read"] },
      { label: "CRM / HubSpot", to: "/admin/crm", icon: Workflow, visibleIf: ["config.read"] },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Access Control", to: "/admin/permissions", icon: Library, visibleIf: ["permissions.library.manage"] },
      { label: "Feature Flags", to: "/admin/feature-flags", icon: ToggleRight, visibleIf: ["config.read"] },
      { label: "System Settings", to: "/admin/system-settings", icon: SlidersHorizontal, visibleIf: ["config.read"] },
    ],
  },
];

export function AppSidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebarState();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] border-r bg-sidebar transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        <SidebarBody collapsed={false} onItemClick={() => setMobileOpen(false)} mobile />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r bg-sidebar transition-[width] duration-200 md:block",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>
    </>
  );
}

function SidebarBody({
  collapsed,
  onItemClick,
  mobile,
}: {
  collapsed: boolean;
  onItemClick?: () => void;
  mobile?: boolean;
}) {
  const { permissions, isAdmin } = useAuth();
  const { onboardingStep, role } = useDevRole();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { setMobileOpen } = useSidebarState();

  const visibleMain = main.filter((i) => !i.hideForRoles || !i.hideForRoles.includes(role));
  const visibleAdminGroups = adminGroups
    .map((g) => ({
      label: g.label,
      items: g.items.filter((i) => !i.visibleIf || canAny(permissions, i.visibleIf)),
    }))
    .filter((g) => g.items.length > 0);
  const onboardingActive = onboardingStep !== "complete";

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2 px-3 pt-3", collapsed && "justify-center px-2")}>
        {collapsed ? (
          <Link
            to="/dashboard"
            aria-label="Renewably home"
            className="press grid size-8 place-items-center rounded-lg bg-brand-blue text-[11px] font-semibold text-brand-blue-foreground"
          >
            R
          </Link>
        ) : (
          <div className="flex w-full items-center gap-2">
            <div className="min-w-0 flex-1">
              <WorkspaceSwitcher />
            </div>
            {mobile && (
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setMobileOpen(false)}
                className="press grid size-8 place-items-center rounded-lg text-ink-muted hover:bg-surface hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-3">
        {!collapsed && <SectionLabel>Workspace</SectionLabel>}
        {visibleMain.map((item) => (
          <Row
            key={item.to}
            item={item}
            permissions={permissions}
            path={path}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}

        {onboardingActive && !collapsed && (
          <Link
            to="/onboarding"
            onClick={onItemClick}
            className="mt-2 flex items-center gap-2 rounded-lg bg-cat-amber-bg px-3 py-2 text-xs font-medium text-cat-amber"
          >
            <ClipboardList className="size-3.5" />
            Continue onboarding
          </Link>
        )}

        {visibleAdminGroups.length > 0 && (
          <>
            {!collapsed && <SectionLabel icon={Shield}>Admin</SectionLabel>}
            {collapsed && <Divider />}
            {visibleAdminGroups.map((group, gi) => (
              <div key={group.label} className={cn(gi > 0 && "mt-2")}>
                {!collapsed && (
                  <div className="px-3 pb-1 pt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted/80">
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => (
                  <Row
                    key={`${group.label}-${item.label}`}
                    item={item}
                    permissions={permissions}
                    path={path}
                    collapsed={collapsed}
                    onClick={onItemClick}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </nav>

      <div className={cn("border-t", collapsed ? "px-2 py-2" : "px-2 py-3")}>
        <Row
          item={{ label: "Settings", to: "/settings/profile", icon: SettingsIcon }}
          permissions={permissions}
          path={path}
          collapsed={collapsed}
          onClick={onItemClick}
        />
        {!collapsed && isAdmin && <InviteCard onClick={onItemClick} />}
      </div>
    </div>
  );
}

function Row({
  item,
  permissions,
  path,
  collapsed,
  onClick,
}: {
  item: NavItem;
  permissions: Permission[];
  path: string;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const locked = !!item.showLockedIfNot && !canAny(permissions, item.showLockedIfNot);
  const active = isActive(path, item.to);

  return (
    <Link
      to={item.to}
      onClick={onClick}
      aria-label={item.label}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 overflow-hidden rounded-lg text-sm",
        collapsed ? "mx-auto h-9 w-9 justify-center" : "px-2.5 py-1.5",
        active
          ? "bg-sidebar-accent text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-foreground"
          : "text-ink-muted hover:bg-sidebar-accent hover:text-foreground",
      )}
    >
      <Icon className="size-[16px] shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {locked && <Lock className="size-3 text-ink-muted/70" />}
        </>
      )}
      {collapsed && (
        <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background group-hover:block">
          {item.label}
        </span>
      )}
    </Link>
  );
}

function isActive(path: string, to: string) {
  if (to === "/dashboard") return path === "/dashboard";
  return path === to || path.startsWith(to + "/");
}

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mt-3 flex items-center gap-1.5 px-3 pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
      {Icon && <Icon className="size-3" />}
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-2 h-px bg-sidebar-border" />;
}

function InviteCard({ onClick }: { onClick?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-3 rounded-2xl border bg-background p-3">
        <div className="grid size-7 place-items-center rounded-lg bg-cat-blue-bg text-cat-blue">
          <Send className="size-3.5" />
        </div>
        <div className="mt-2 text-[13px] font-medium text-foreground">
          Invite team members
        </div>
        <div className="mt-1 text-[11px] leading-snug text-ink-muted">
          Bring your team into your workspace.
        </div>
        <button
          type="button"
          onClick={() => {
            onClick?.();
            setOpen(true);
          }}
          className="press mt-2 inline-flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-1.5 text-[11px] font-medium text-background"
        >
          Invite
        </button>
      </div>
      <InviteDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

```

### 12.6 Canonical page templates

### routes/_authed.dashboard.tsx

`src/routes/_authed.dashboard.tsx`

```tsx
/**
 * Dashboard — ElevenLabs-style editorial home for all 5 roles.
 *
 *   eyebrow
 *   Greeting, name
 *
 *   TileRow             ← role-specific destinations
 *   Section ›           ← work to do today (flat ListRows)
 *   Section ›           ← recent / activity
 *   Section ›           ← optional third
 *
 * No bordered metric grids. No card chrome on the canvas.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileBadge, FolderKanban, Send, Sparkles, Database, ArrowRight,
  Users, ScrollText, Activity, ClipboardList, FileWarning,
  ShieldAlert, Building2, Plug, BarChart2, BookOpen,
  CheckCircle2, AlertTriangle, Clock, Lock, CreditCard, Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { useStore } from "@/lib/mock/store";
import { TileRow, type Tile } from "@/components/app/tile-row";
import { ListRow } from "@/components/app/list-row";
import { SectionHeader } from "@/components/app/section-header";
import { StatePill, JOB_STATES, IBG_STATES, ONBOARDING_STATES } from "@/components/app/state-pill";
import { fmtDate, relTime } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Home — Renewably UK" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { role } = useDevRole();
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-8 md:px-8 md:pt-12">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        {workspaceName(role)}
      </div>
      <h1 className="font-display mt-2 text-[36px] leading-[1.05] text-ink md:text-[44px]">
        {greet()}, {firstName}
      </h1>

      {role === "admin" && <AdminDash />}
      {role === "operator" && <OperatorDash />}
      {role === "installer-access" && <AccessDash />}
      {role === "installer-operate" && <OperateDash />}
      {role === "readonly" && <ReadonlyDash />}
    </div>
  );
}

/* ─── Admin ──────────────────────────────────────────── */

function AdminDash() {
  const data = useStore();
  const onboardingPending = data.onboarding.filter((o) => o.state !== "activated");
  const amendmentsPending = data.amendments.filter((a) => a.state === "pending");
  const recent = data.activity.slice(0, 6);
  const flagged = data.users.filter((u) => u.accountRiskState === "flagged" || u.accountRiskState === "paused").slice(0, 4);

  const tiles: Tile[] = [
    { label: "Onboarding", to: "/admin/onboarding", icon: ClipboardList, tone: "amber" },
    { label: "Amendments", to: "/admin/amendments", icon: FileWarning, tone: "purple" },
    { label: "Risk", to: "/admin/risk", icon: ShieldAlert, tone: "rose" },
    { label: "Companies", to: "/admin/companies", icon: Building2, tone: "blue" },
    { label: "Audit", to: "/admin/audit", icon: ScrollText, tone: "teal" },
    { label: "Integrations", to: "/admin/integrations", icon: Plug, tone: "green" },
  ];

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Today" to="/admin/onboarding" />
      <div className="space-y-0.5">
        {onboardingPending.length === 0 && flagged.length === 0 ? (
          <EmptyRow text="Nothing waiting on you." />
        ) : (
          <>
            {onboardingPending.slice(0, 4).map((o) => (
              <ListRow
                key={o.id}
                to="/admin/onboarding"
                icon={ClipboardList}
                iconTone="amber"
                title={o.companyName}
                subtitle={`${o.contactName} · ${o.tier === "operate" ? "Operate" : "Access"}`}
                meta={<StatePill meta={ONBOARDING_STATES[o.state]} />}
              />
            ))}
            {flagged.map((u) => (
              <ListRow
                key={u.id}
                to="/admin/risk"
                icon={ShieldAlert}
                iconTone="rose"
                title={u.name}
                subtitle={u.email}
                meta={<span className="rounded-full bg-cat-rose-bg px-2 py-0.5 text-[11px] font-medium text-cat-rose">{u.accountRiskState}</span>}
              />
            ))}
          </>
        )}
      </div>

      <SectionHeader title="Latest activity" to="/admin/activity" />
      <div className="space-y-0.5">
        {recent.map((a) => (
          <ListRow
            key={a.id}
            icon={Activity}
            title={<><span className="font-medium">{a.actor}</span> <span className="font-normal text-ink-muted">{a.action}</span> <span className="font-medium">{a.target}</span></>}
            meta={relTime(a.at)}
          />
        ))}
      </div>

      <SectionHeader title="Platform health" to="/admin/integrations" />
      <div className="space-y-0.5">
        <HealthRow label="Companies House sync" status="ok" detail="Last run 03:00 UTC" />
        <HealthRow label="Stripe webhooks" status="ok" detail="100% delivery (24h)" />
        <HealthRow label="Email notifications" status="ok" detail="Delivered" />
        <HealthRow label="Amendments queue" status={amendmentsPending.length > 5 ? "warn" : "ok"} detail={`${amendmentsPending.length} pending review`} />
      </div>
    </>
  );
}

/* ─── Operator ───────────────────────────────────────── */

function OperatorDash() {
  const { permissions, pendingPermissionRequests } = useDevRole();
  const groups = [
    { label: "Customers", icon: FolderKanban, to: "/customers", perm: "customers.read" as const, tone: "blue" as const },
    { label: "Jobs", icon: Database, to: "/jobs", perm: "jobs.read" as const, tone: "teal" as const },
    { label: "IBG Repository", icon: FileBadge, to: "/ibg/repository", perm: "ibg.repository.read" as const, tone: "green" as const },
    { label: "Submissions", icon: Send, to: "/submissions", perm: "submissions.read" as const, tone: "purple" as const },
    { label: "Funding", icon: Sparkles, to: "/funding", perm: "funding.projects.read" as const, tone: "amber" as const },
    { label: "Audit", icon: ScrollText, to: "/admin/audit", perm: "audit.read" as const, tone: "rose" as const },
  ];

  const tiles: Tile[] = groups.map((g) => ({
    label: g.label,
    to: g.to,
    icon: g.icon,
    tone: g.tone,
    badge: can(permissions, g.perm) ? undefined : "Locked",
    disabled: !can(permissions, g.perm),
  }));

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Your access" to="/settings/profile" />
      <div className="space-y-0.5">
        <ListRow
          icon={CheckCircle2}
          iconTone="green"
          title={`${permissions.length} permission${permissions.length === 1 ? "" : "s"} granted`}
          subtitle="Open a locked tile to request access."
        />
        {pendingPermissionRequests.length > 0 && (
          <ListRow
            icon={Clock}
            iconTone="amber"
            title={`${pendingPermissionRequests.length} request${pendingPermissionRequests.length === 1 ? "" : "s"} awaiting admin`}
            subtitle="You'll be notified when reviewed."
          />
        )}
      </div>
    </>
  );
}

/* ─── Installer Access ───────────────────────────────── */

function AccessDash() {
  const data = useStore();
  const recent = data.ibgs.filter((i) => i.state === "issued").slice(0, 5);

  const tiles: Tile[] = [
    { label: "Issue an IBG", to: "/ibg/new", icon: FileBadge, tone: "green" },
    { label: "My IBGs", to: "/ibg/history", icon: Database, tone: "blue" },
    { label: "Templates", to: "/ibg/repository", icon: BookOpen, tone: "purple" },
    { label: "Pricing", to: "/pricing", icon: Sparkles, tone: "amber" },
    { label: "Account", to: "/settings/profile", icon: Settings, tone: "neutral" },
    { label: "Help", to: "/settings/profile", icon: BookOpen, tone: "teal" },
  ];

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Recent IBGs" to="/ibg/history" />
      <div className="space-y-0.5">
        {recent.length === 0 ? (
          <EmptyRow text="No IBGs yet — issue your first one." />
        ) : (
          recent.map((i) => (
            <ListRow
              key={i.id}
              to="/ibg/history"
              icon={FileBadge}
              iconTone="green"
              title={`${i.ref} · ${i.customerName}`}
              subtitle={i.propertyAddress}
              meta={<StatePill meta={IBG_STATES[i.state]} />}
            />
          ))
        )}
      </div>

      <SectionHeader title="Upgrade" to="/pricing" />
      <div className="space-y-0.5">
        <ListRow
          to="/pricing"
          icon={Sparkles}
          iconTone="amber"
          title="Operate plan"
          subtitle="Unlock Projects, Funding Match and the IBG Repository."
          meta={<ArrowRight className="size-4" />}
        />
      </div>
    </>
  );
}

/* ─── Installer Operate ──────────────────────────────── */

function OperateDash() {
  const data = useStore();
  const attention = data.jobs.filter((j) => j.state === "blocked" || j.state === "awaiting-information").slice(0, 5);
  const recentIbgs = data.ibgs.slice(0, 5);
  const fundingReady = data.fundingProjects.filter((f) => f.state === "ready-for-submission").slice(0, 4);

  const tiles: Tile[] = [
    { label: "New IBG", to: "/ibg/new", icon: FileBadge, tone: "green" },
    { label: "Projects", to: "/projects", icon: FolderKanban, tone: "blue" },
    { label: "IBG Repository", to: "/ibg/repository", icon: Database, tone: "teal" },
    { label: "Submissions", to: "/submissions", icon: Send, tone: "purple" },
    { label: "Funding", to: "/funding", icon: Sparkles, tone: "amber" },
    { label: "Reports", to: "/reports", icon: BarChart2, tone: "rose" },
  ];

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Jobs needing attention" to="/jobs" />
      <div className="space-y-0.5">
        {attention.length === 0 ? (
          <EmptyRow text="All jobs are progressing." />
        ) : (
          attention.map((j) => {
            const c = data.customers.find((c) => c.id === j.customerId);
            return (
              <ListRow
                key={j.id}
                to="/jobs"
                icon={AlertTriangle}
                iconTone="amber"
                title={`${j.ref} · ${j.measure}`}
                subtitle={c?.name}
                meta={<StatePill meta={JOB_STATES[j.state]} />}
              />
            );
          })
        )}
      </div>

      <SectionHeader title="Recently issued IBGs" to="/ibg/repository" />
      <div className="space-y-0.5">
        {recentIbgs.map((i) => (
          <ListRow
            key={i.id}
            to="/ibg/repository"
            icon={FileBadge}
            iconTone="green"
            title={`${i.ref} · ${i.customerName}`}
            subtitle={`${i.measure} · ${i.issuedAt ? fmtDate(i.issuedAt) : "—"}`}
            meta={<StatePill meta={IBG_STATES[i.state]} />}
          />
        ))}
      </div>

      <SectionHeader title="Funding-ready projects" to="/funding" />
      <div className="space-y-0.5">
        {fundingReady.length === 0 ? (
          <EmptyRow text="No projects ready for submission." />
        ) : (
          fundingReady.map((f) => (
            <ListRow
              key={f.id}
              to="/funding"
              icon={Sparkles}
              iconTone="amber"
              title={f.ref}
              subtitle={`${f.scheme} · ${f.measure}`}
            />
          ))
        )}
      </div>
    </>
  );
}

/* ─── Readonly ───────────────────────────────────────── */

function ReadonlyDash() {
  const data = useStore();
  const recent = data.ibgs.slice(0, 5);

  const tiles: Tile[] = [
    { label: "Customers", to: "/customers", icon: FolderKanban, tone: "blue", badge: "Read-only" },
    { label: "Properties", to: "/properties", icon: Building2, tone: "teal", badge: "Read-only" },
    { label: "Jobs", to: "/jobs", icon: Database, tone: "amber", badge: "Read-only" },
    { label: "IBG Repository", to: "/ibg/repository", icon: FileBadge, tone: "green", badge: "Read-only" },
    { label: "Submissions", to: "/submissions", icon: Send, tone: "purple", badge: "Read-only" },
    { label: "Audit log", to: "/admin/audit", icon: ScrollText, tone: "rose", badge: "Read-only" },
  ];

  return (
    <>
      <TileRow tiles={tiles} />

      <SectionHeader title="Recent records" to="/ibg/repository" />
      <div className="space-y-0.5">
        {recent.map((i) => (
          <ListRow
            key={i.id}
            to="/ibg/repository"
            icon={FileBadge}
            iconTone="green"
            title={`${i.ref} · ${i.customerName}`}
            subtitle={i.propertyAddress}
            meta={<StatePill meta={IBG_STATES[i.state]} />}
          />
        ))}
      </div>
    </>
  );
}

/* ─── Pieces ─────────────────────────────────────────── */

function EmptyRow({ text }: { text: string }) {
  return <div className="px-2 py-6 text-[13px] text-ink-muted">{text}</div>;
}

function HealthRow({ label, status, detail }: { label: string; status: "ok" | "warn" | "error"; detail: string }) {
  const tone = status === "ok" ? "bg-cat-green" : status === "warn" ? "bg-cat-amber" : "bg-cat-rose";
  return (
    <div className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-[80ms] hover:bg-surface">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-tile">
        <span className={`size-2 rounded-full ${tone}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-foreground">{label}</div>
        <div className="text-[12px] text-ink-muted">{detail}</div>
      </div>
      <CheckCircle2 className="size-4 text-cat-green" />
    </div>
  );
}

function workspaceName(role: string) {
  if (role === "admin") return "Renewably HQ";
  if (role === "operator") return "Renewably Ops";
  if (role === "installer-access") return "Northwarmth Ltd · Access";
  if (role === "installer-operate") return "Evergreen Installs · Operate";
  return "External · Read-only";
}

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// silence unused
void Users; void Lock; void CreditCard;

```

### routes/_authed.admin.external-apis.tsx

`src/routes/_authed.admin.external-apis.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  Copy,
  KeyRound,
  Library,
  Receipt,
  Webhook,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { LockedCard } from "@/components/app/locked-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/app/empty-state";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/external-apis")({
  head: () => ({ meta: [{ title: "External APIs — Renewably UK" }] }),
  component: ExternalAPIs,
});

type LogStatus = "Success" | "Failed" | "Rate Limited";
type Log = {
  id: string;
  ts: string;
  source: string;
  endpoint: string;
  method: string;
  status: LogStatus;
  ms: number;
  statusCode: number;
  payload?: string;
  response?: string;
};

const QUOTAS = [
  { name: "Companies House", used: 847, limit: 1000, reset: "00:00 UTC", status: "Warning" as const },
  { name: "HubSpot", used: 1245, limit: 2000, reset: "00:00 UTC", status: "Normal" as const },
  { name: "Stripe", used: 423, limit: 1000, reset: "00:00 UTC", status: "Normal" as const },
  { name: "Lovable AI Gateway", used: 38, limit: 500, reset: "Hourly", status: "Normal" as const },
];

const LOGS: Log[] = [
  { id: "L-1", ts: "2026-05-06 09:42:18", source: "Companies House", endpoint: "/company/12345678", method: "GET", status: "Success", ms: 184, statusCode: 200, response: '{ "company_status": "active" }' },
  { id: "L-2", ts: "2026-05-06 09:41:02", source: "HubSpot", endpoint: "/crm/v3/objects/contacts", method: "POST", status: "Success", ms: 312, statusCode: 201, payload: '{ "email": "j@acme.io" }' },
  { id: "L-3", ts: "2026-05-06 09:39:55", source: "Companies House", endpoint: "/search/companies", method: "GET", status: "Rate Limited", ms: 28, statusCode: 429 },
  { id: "L-4", ts: "2026-05-06 09:38:11", source: "Stripe", endpoint: "/v1/customers/cus_X", method: "GET", status: "Failed", ms: 5012, statusCode: 504, response: "Gateway timeout" },
];

const SNIPPET = `import { RenewablyClient } from "@renewably/sdk";

const renewably = new RenewablyClient({
  apiKey: process.env.RENEWABLY_API_KEY,
});

const lookup = await renewably.companies.lookup({
  number: "12345678",
});

console.log(lookup.status);`;

const QUICK_LINKS = [
  { icon: KeyRound, label: "Create an API key", href: "#" },
  { icon: Boxes, label: "Browse providers", href: "#" },
  { icon: BookOpen, label: "API reference", href: "#" },
  { icon: Library, label: "Libraries & SDKs", href: "#" },
  { icon: Webhook, label: "Webhooks", href: "#" },
  { icon: Receipt, label: "Pricing overview", href: "#" },
];

function ExternalAPIs() {
  const { permissions } = useDevRole();
  const [throttle, setThrottle] = useState(true);
  const [queue, setQueue] = useState(false);
  const [priority, setPriority] = useState(false);
  const [open, setOpen] = useState<Log | null>(null);

  if (!can(permissions, "config.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="External APIs" reason={{ kind: "permission", permission: "config.read" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-end justify-between gap-4">
        <PageHeader eyebrow="Admin · Integrations" title="External APIs" dense />
        <div className="flex items-center gap-2">
          <a href="#" className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-surface/60">
            API pricing <ArrowUpRight className="size-3.5" />
          </a>
          <a href="#" className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-surface/60">
            Documentation <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quotas">Quotas</TabsTrigger>
          <TabsTrigger value="throttling">Throttling</TabsTrigger>
          <TabsTrigger value="logs">Request log</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Promo card */}
          <div className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/60">
            <div className="size-20 shrink-0 rounded-xl bg-gradient-to-br from-cat-amber/40 via-cat-rose/30 to-cat-blue/30" />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-foreground">Companies House lookups now cached</div>
              <div className="mt-1 text-[13px] text-ink-muted">
                Repeated company queries are deduped server-side for 24h. Cuts quota usage by ~40% with no code changes.
              </div>
            </div>
            <Button variant="outline" size="sm">Learn more</Button>
          </div>

          {/* Quickstart */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <div className="flex flex-col justify-end">
              <div className="text-[18px] font-semibold text-foreground">Developer quickstart</div>
              <div className="mt-1.5 text-[13px] text-ink-muted">
                Wire the Renewably SDK into your service in under a minute. All connected providers route through one client.
              </div>
              <div className="mt-4">
                <Button>Configure</Button>
              </div>
            </div>
            <CodeBlock code={SNIPPET} />
          </div>

          {/* Usage + Quick links */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
            <section>
              <div className="text-[15px] font-semibold text-foreground">Usage</div>
              <div className="mt-3 rounded-2xl bg-card p-5 ring-1 ring-border/60">
                <div className="text-[12px] text-ink-muted">Top up balance</div>
                <div className="mt-1 text-[28px] font-semibold text-ink">£0</div>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm">+ Add credits</Button>
                  <button className="press inline-flex h-8 items-center gap-2 rounded-full border bg-background px-3 text-[13px] font-medium text-foreground hover:bg-surface/60">
                    Auto top up <span className="text-ink-muted">Off</span>
                  </button>
                </div>
              </div>
            </section>
            <section>
              <div className="text-[15px] font-semibold text-foreground">Quick links</div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {QUICK_LINKS.map((q) => {
                  const Icon = q.icon;
                  return (
                    <a key={q.label} href={q.href} className="press group flex items-center gap-3 rounded-xl bg-card px-4 py-3.5 ring-1 ring-border/60 transition-colors hover:bg-surface/60">
                      <span className="grid size-8 place-items-center rounded-md bg-tile">
                        <Icon className="size-4 text-foreground" />
                      </span>
                      <span className="text-[13px] font-medium text-foreground">{q.label}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="quotas">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {QUOTAS.map((q) => {
              const pct = Math.round((q.used / q.limit) * 100);
              const tone = pct > 80 ? "bg-cat-rose" : pct > 60 ? "bg-cat-amber" : "bg-foreground";
              return (
                <div key={q.name} className="rounded-2xl bg-card p-5 ring-1 ring-border/60">
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] text-ink-muted">{q.name}</div>
                    {q.status === "Warning" ? <AlertTriangle className="size-4 text-cat-amber" /> : <CheckCircle2 className="size-4 text-cat-green" />}
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-ink">{q.used.toLocaleString()}<span className="text-sm text-ink-muted"> / {q.limit.toLocaleString()}</span></div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-tile">
                    <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 text-[11px] text-ink-muted">Resets {q.reset}</div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="throttling">
          <div className="divide-y rounded-2xl bg-card ring-1 ring-border/60">
            <ToggleRow label="Enable request throttling" desc="Smooth bursts to stay under per-second limits." checked={throttle} onChange={setThrottle} />
            <ToggleRow label="Queue requests on rate-limit" desc="Hold and retry instead of failing fast." checked={queue} onChange={setQueue} />
            <ToggleRow label="Priority mode" desc="Always reserve 10% of quota for IBG issuance flows." checked={priority} onChange={setPriority} />
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[12px] font-medium text-ink-muted">
                  <th className="px-3 py-2.5 text-left">Time</th>
                  <th className="px-3 py-2.5 text-left">Source</th>
                  <th className="px-3 py-2.5 text-left">Endpoint</th>
                  <th className="px-3 py-2.5 text-left">Method</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {LOGS.map((l) => (
                  <tr key={l.id} onClick={() => setOpen(l)} className="cursor-pointer hover:bg-surface/60">
                    <td className="px-3 py-3.5 font-mono text-[12px] text-ink-muted">{l.ts}</td>
                    <td className="px-3 py-3.5 text-foreground">{l.source}</td>
                    <td className="px-3 py-3.5 font-mono text-[12px] text-ink-muted">{l.endpoint}</td>
                    <td className="px-3 py-3.5 text-ink-muted">{l.method}</td>
                    <td className="px-3 py-3.5">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        l.status === "Success" ? "bg-cat-green-bg text-cat-green" :
                        l.status === "Rate Limited" ? "bg-cat-amber-bg text-cat-amber" :
                        "bg-cat-rose-bg text-cat-rose",
                      )}>{l.status}</span>
                    </td>
                    <td className="px-3 py-3.5 text-right text-ink-muted">{l.ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <EmptyState title="No webhooks configured" body="Forward platform events to an external URL when integrations need realtime updates." />
        </TabsContent>

        <TabsContent value="settings">
          <EmptyState title="Per-provider settings" body="Override credentials, regions and timeouts for individual integrations." />
        </TabsContent>
      </Tabs>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-[520px] sm:max-w-[520px]">
          <SheetHeader>
            <SheetTitle>{open?.source} — {open?.endpoint}</SheetTitle>
          </SheetHeader>
          {open && (
            <div className="mt-6 space-y-4 text-sm">
              <Field label="Status code" value={String(open.statusCode)} />
              <Field label="Latency" value={`${open.ms} ms`} />
              <Field label="Method" value={open.method} />
              {open.payload && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-muted">Request payload</div>
                  <pre className="mt-1 overflow-auto rounded-lg bg-surface p-3 font-mono text-[11px]">{open.payload}</pre>
                </div>
              )}
              {open.response && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-muted">Response</div>
                  <pre className="mt-1 overflow-auto rounded-lg bg-surface p-3 font-mono text-[11px]">{open.response}</pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface ring-1 ring-border/60">
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied"); }}
        className="press absolute right-2 top-2 grid size-7 place-items-center rounded-md text-ink-muted hover:bg-tile hover:text-foreground"
        aria-label="Copy code"
      >
        <Copy className="size-3.5" />
      </button>
      <pre className="overflow-auto px-4 py-4 font-mono text-[12px] leading-[1.55]">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 inline-block w-6 select-none text-right text-ink-muted/60">{i + 1}</span>
              <span className="text-foreground">{line || " "}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="mt-0.5 text-[12px] text-ink-muted">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-mono text-[12px] text-foreground">{value}</span>
    </div>
  );
}

export default ExternalAPIs;

```

---

## 13. Notes for Figma Make

When asked to "build a page like the Renewably app":

1. Start from §1 (art direction) and §2 (tokens). Recreate the tokens in your
   Figma variables — never hard-code hex or oklch values inside components.
2. Use §3 for the primitives library. Match the variant names exactly; a Lovable
   developer should be able to swap a Figma component for the React equivalent
   without renaming props.
3. For any new page, pick the closest template from §6, then mix in primitives
   from §3. Never invent a new layout system.
4. If a Figma asset disagrees with the source in §12, the source wins — the
   code is the production design system, the spec is its readable index.
5. Do not introduce: shadows on chrome, pill-style tabs, outer table borders,
   purple gradients, or any of the items listed in §11.

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

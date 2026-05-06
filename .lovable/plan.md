## Reading the references

I went back through every panel of the PDF and the 6 screenshots. The thing that makes ElevenLabs feel different isn't the layout — it's a set of tiny, consistent decisions that repeat on every screen:

- **No card chrome on the canvas.** Sections live on bare background, separated by ~80px of whitespace. The only borders are tables, popovers, and a single thin border-bottom on the topbar.
- **Topbar is a breadcrumb, not a title.** Left: square sidebar-toggle (28×28) + crumb path. Right: 3 ghost pill buttons (`Feedback`, `Docs`, `Ask`) at h-7 with text-[12px], then 2 icon buttons at 28×28, then a 28×28 avatar. No shadows. No sticky page heading.
- **Sidebar is two zones.** Workspace switcher (small, with arrows, color dot) → primary nav (flat icons, 13px, 28px row height) → "Pinned" group → bottom slot with one promo card + `Developers` link + `Upgrade` button.
- **Page title is the H1.** Small uppercase eyebrow above. No subtitle. No actions cluster on the right of the header.
- **Tabs sit directly under the title.** Plain underline, 14px, uppercase-ish weight on active. No background, no card.
- **Tile rows.** Big rounded-2xl tiles (~180×130) with `bg-tile`, a centered icon-cluster, label *below the tile in normal canvas text*. Horizontal scrollable.
- **Filter pills.** A row of pill chips above content. Two dropdowns first (`Language ▾`), a thin vertical divider, then category pills. The whole row is one horizontal scroll surface with a `>` chevron.
- **Tables/lists are flat.** No borders per row. Avatar (rounded-square 36×36 in pastel) + 2-line text + meta chips on the right. Hover swaps to `bg-surface`. Sticky column headers, no zebra.
- **Sections.** Title + small `>` chevron link, never a "View all" button. Content sits below at the same indent.
- **Type.** Inter 13–14px body, 11px eyebrow with 0.08em tracking, large display H1. Numbers are tabular.
- **Buttons.** Black pill stays, but `sm` is h-8 px-3.5 text-[13px]. Ghost in topbar is h-7 with optional 1px border on hover only.
- **Motion.** ElevenLabs is restrained. Hover bg color in 80ms ease, list-row enter in 150ms ease-out. Sidebar collapse uses cubic-bezier(0.32, 0.72, 0, 1) at 200ms.

## Two design principles guiding this pass

1. **Subtract chrome before adding anything.** Every existing bordered card on the dashboard is a candidate for deletion. Only keep a border when it groups data the eye can't otherwise distinguish (tables, popovers, cards inside dialogs).
2. **One craft language, repeated.** Five new primitives — `TopBar`, `PageHeader`, `TileRow`, `UnderlineTabs`, `FilterPillBar`, `ListRow` — replace ad-hoc patterns wherever they appear. Every dashboard, every list page, every settings page.

## Motion calibration (applies globally)

Add to `src/styles.css`:

```text
--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);
--ease-drawer:    cubic-bezier(0.32, 0.72, 0, 1);
--ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1);
```

| Element | Before | After | Why |
|---|---|---|---|
| Button `:active` | none | `transform: scale(0.97); transition: transform 140ms var(--ease-out-strong)` | buttons must telegraph press |
| Sidebar collapse width | `transition-[width] duration-200` | `200ms var(--ease-drawer)` | iOS-style settle |
| Route fade-in | `slide-in-from-bottom-1 duration-200` | `opacity+translateY(4px) → 0, 180ms ease-out, no scale` | scale on every nav feels heavy at 50+ navs/day |
| List row hover | `hover:bg-surface` no transition | `bg-color 80ms ease` | invisible-but-felt |
| Popover/Dropdown | default Radix `data-[state]` | `transform-origin: var(--radix-*-content-transform-origin); enter 160ms var(--ease-out-strong) from scale(0.97)+opacity` | origin-aware |
| Tooltip | full anim every hover | first 200ms with delay; subsequent within 500ms `data-instant` skip | toolbars feel faster |
| Dialog | scale(0.95) center | keep center, 200ms ease-out from scale(0.96)+opacity | modals stay center |
| Underline tab indicator | none | absolutely-positioned bar that translates between tabs in 220ms `var(--ease-out-strong)` | smooth, not jumpy |
| Switch thumb | default | `transition: transform 180ms var(--ease-out-strong)` + scale(0.92) on press | matches button feel |

`@media (prefers-reduced-motion: reduce)` block removes translates/scales but keeps opacity — added once globally.

## New / replaced primitives

| File | Purpose |
|---|---|
| `src/components/app/shell/top-bar.tsx` *(rewrite)* | Sidebar toggle + breadcrumb (derived from route) + right cluster (Feedback/Docs/Ask ghost pills, bell + folder icon buttons, avatar). Removes today's page-title + actions row. |
| `src/components/app/shell/breadcrumbs.tsx` *(rewrite)* | Small `›`-separated trail driven by the matched route; supports a per-route `crumb` head meta. |
| `src/components/app/page-header.tsx` *(simplify)* | Eyebrow + H1. No subtitle, no actions slot. Optional `dense` (small variant for sub-pages). |
| `src/components/app/tile-row.tsx` *(new)* | Horizontal scroll row of `bg-tile rounded-2xl` 180×130 tiles, centered icon stack, label rendered *outside* and below the tile. |
| `src/components/app/underline-tabs.tsx` *(rebuild)* | Replace the existing one with a sliding-indicator version (motion-aware). |
| `src/components/app/filter-pill-bar.tsx` *(new)* | Dropdown pills + divider + scrollable category pills + trailing chevron. |
| `src/components/app/list-row.tsx` *(new)* | Flat row primitive: leading slot (avatar/icon tile) + 2-line text + right meta cluster. No border. Hover bg-surface 80ms. |
| `src/components/app/section-header.tsx` *(new)* | `Title ›` link + optional right control. Replaces today's `SectionRow`/`SectionCard` title bar where the card itself isn't needed. |
| `src/components/ui/button.tsx` *(extend)* | Add `topbar` size (h-7 px-3 text-[12px]) + `:active` scale(0.97). |

## Dashboard rewrite — all 5 roles

Same skeleton on every role:

```text
[ workspace eyebrow ]
Good <time>, <name>

TileRow             ← 6 role-specific destinations
Section ›           ← primary list (work to do today)
Section ›           ← secondary list (recent)
Section ›           ← optional third (health / shortcuts)
```

No bordered metric grids. Numbers move into right-side meta chips on `ListRow`. No `HeroCard`, no `SectionCard` wrappers, no `QuickAction` boxes — those primitives stay in the codebase but are no longer used by the dashboard.

### Per-role tile rows + sections

**Admin**
- Tiles: Onboarding · Amendments · Risk · Companies · Audit · Integrations
- Sections: *Today* (pending onboardings + flagged risk, max 6 rows) · *Latest activity* · *Platform health* (3 flat status rows, no card)

**Operator**
- Tiles: granted permissions only (Customers, Jobs, IBG Repository, Submissions, Funding, Audit — locked ones are dimmed in the same row, not a separate grid)
- Sections: *Pending requests* (your permission requests + their status) · *Latest in your areas*

**Installer-Access**
- Tiles: Issue an IBG · My IBGs · Pricing · Help · Templates · Account
- Sections: *Recent IBGs* (5 ListRows) · *Tips* (3 ListRows linking to docs) · *Upgrade* (single inline row, no card)

**Installer-Operate**
- Tiles: New IBG · Projects · IBG Repository · Submissions · Funding · Settings
- Sections: *Jobs needing attention* · *Recently issued IBGs* · *Funding-ready projects*

**Read-only**
- Tiles: Customers · Properties · Jobs · IBG Repository · Submissions · Funding (all read-only badge)
- Sections: *Recent records* · *Pinned reports*

## Shell + cross-cutting

- **Sidebar**: keep current 5-role visibility logic. Restyle: 28px row, 13px label, 16px icon, 4px gutter, smaller "Admin" group titles (`text-[10px]` 0.08em). Add a "Pinned" group between Workspace and Admin (default empty; pin icon appears on row hover; pinned routes persist in `localStorage`). Bottom slot: Invite card → small `Developers` link → `Upgrade` brand pill (only for installer-access).
- **TopBar**: rewritten per above. Page title moves *out* of the topbar entirely.
- **Settings**: drop the welcome card, use new `PageHeader` (just eyebrow + title), keep side-nav.

## Pages that pick up the new primitives

These get a light touch — outer card chrome removed, `FilterPillBar` + `UnderlineTabs` wired in, table styling changed to flat (no border per row, sticky header):

- `/ibg/repository`, `/ibg/history`
- `/funding`, `/funding/match`
- `/submissions`
- `/customers`, `/properties`, `/jobs`, `/projects`
- `/reports`
- `/admin/onboarding`, `/admin/amendments`, `/admin/users`, `/admin/companies`, `/admin/risk`, `/admin/audit`, `/admin/activity`, `/admin/integrations`
- The 8 admin config pages already use `PageHeader` — they pick up the simpler version automatically.

## Out of scope (intentionally)

- No font swap, no color palette change, no dark mode work.
- Public landing/pricing/sign-in pages stay exactly as they are (gradients live there).
- No new database tables or edge functions; mocks remain.
- No custom illustration art for tiles — Lucide icon clusters only. (Custom art is a separate later pass.)

## Files I'll touch (summary)

- New: `tile-row.tsx`, `filter-pill-bar.tsx`, `list-row.tsx`, `section-header.tsx`
- Rewritten: `shell/top-bar.tsx`, `shell/breadcrumbs.tsx`, `underline-tabs.tsx`, `page-header.tsx`
- Extended: `ui/button.tsx`, `ui/switch.tsx`, `ui/dialog.tsx`, `ui/popover.tsx`, `ui/dropdown-menu.tsx`, `ui/tooltip.tsx` (motion calibration only)
- `styles.css` (easing tokens + reduced-motion block)
- `_authed.tsx` (route fade calibration)
- `shell/app-sidebar.tsx` (Pinned group, bottom slot, sizing)
- `_authed.dashboard.tsx` (full rewrite, all 5 roles)
- `_authed.settings.tsx` (drop welcome card)
- ~12 list/table routes listed above (FilterPillBar wiring, drop outer card)

Approve and I'll implement in one pass.

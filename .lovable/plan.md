# Page-by-page polish: Tabs, Tables, External APIs

Three focused changes, in this order. Nothing else touched this round.

---

## 1. Tabs — match ElevenLabs underline style

Right now we have two systems:
- `src/components/ui/tabs.tsx` (Radix, **pill style** with `bg-muted` + `data-[state=active]:bg-background`) — used by 9 routes incl. `admin.config`, `admin.crm`, `admin.users.$id`, `admin.companies.$id`, `customers.$id`, `jobs.$id`, `reports`, `admin.permissions`, `admin.system-settings`, `admin.risk`.
- `src/components/app/underline-tabs.tsx` — closer to ElevenLabs but spacing/weight/underline are off.

ElevenLabs (from screenshots): no background chip, just text + optional icon, tighter row, **2px** active underline directly under the label, label gets full ink color when active, `border-b` separator runs the full width below the row.

**Edit `src/components/ui/tabs.tsx`** (the Radix one — covers all 9 existing pages with zero call-site changes):
- `TabsList`: replace pill chrome with `inline-flex h-10 items-center gap-1 border-b w-full justify-start rounded-none bg-transparent p-0 text-ink-muted`.
- `TabsTrigger`: `relative inline-flex items-center gap-1.5 px-3 h-10 -mb-px text-[13px] font-medium text-ink-muted transition-colors hover:text-foreground data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground rounded-none shadow-none`.
- `TabsContent`: `mt-6` (more breathing room).

**Edit `src/components/app/underline-tabs.tsx`** to mirror the same look (h-10 row, foreground active color, 2px underline using `bg-foreground` not `bg-brand-blue` — ElevenLabs uses ink not accent).

Result: every existing page picks up the new look automatically.

---

## 2. Table — match ElevenLabs Voices/Explore style

ElevenLabs tables have **no outer card border**, **no header bg**, header text is regular sentence case (not uppercase tracking), rows are flat with subtle bottom hairline, hover is a soft surface tint, and there's generous row height (`h-14`-ish).

**Edit `src/components/app/data-table.tsx`:**
- Drop outer `rounded-2xl border bg-card`. Wrap in a plain `div` (overflow-x for narrow viewports only).
- `thead tr`: remove `bg-surface/40`; keep `border-b`.
- `th`: `px-3 py-3 text-[12px] font-medium normal-case tracking-normal text-ink-muted` (kills uppercase + letter-spacing).
- `td`: `px-3 py-3.5` for taller rows.
- Row hover: keep `hover:bg-surface/60` but remove the per-row `border-b last:border-b-0` and use a `divide-y` on `tbody` instead (cleaner hairlines).

Also update the inline table inside `_authed.admin.external-apis.tsx` (recent calls) and the `_authed.admin.audit.tsx` style table to match — same classes.

---

## 3. External APIs — redesign to match Developers overview screenshot

Current page is a stacked list of cards. Restructure into the ElevenLabs Developers layout: **header with right-side outbound links → underline tabs → hero promo card → content sections → quick-links grid.**

New structure for `src/routes/_authed.admin.external-apis.tsx`:

```text
┌─ PageHeader: "External APIs" + right slot: [API Pricing ↗] [Documentation ↗]
├─ Tabs: Overview · Quotas · Throttling · Request Log · Webhooks · Settings
│
├─ (Overview tab)
│   ┌─ Promo card: thumbnail tile + title "Companies House lookups now cached"
│   │              + subtitle + "Learn more" ghost button on the right
│   ├─ Two-column section: left "Quick start" (small copy + CTA "Configure"),
│   │                      right code snippet block (mono, line numbers, copy btn)
│   ├─ "Usage" section (left) — top-up balance card pattern, mirrors screenshot
│   └─ "Quick Links" 2×3 grid: Create API Key · Browse Models · API Reference ·
│       Libraries & SDKs · Webhooks · Pricing Overview (icon + label tile,
│       borderless, hover: bg-surface/60)
│
├─ (Quotas tab)        → existing quota cards, restyled (no heavy border, just
│                        bg-card with subtle ring-1 ring-border/60)
├─ (Throttling tab)    → existing toggle list, no outer card border
├─ (Request Log tab)   → uses redesigned DataTable from §2; row click → Sheet
├─ (Webhooks tab)      → empty-state placeholder for now
└─ (Settings tab)      → empty-state placeholder for now
```

Implementation notes:
- Reuse the new `Tabs` from §1 — gives the underline row that matches the screenshot.
- Promo card pattern lives inline (small enough): rounded-xl, `ring-1 ring-border/60`, `bg-card`, 96px square thumbnail with a soft gradient (`bg-gradient-to-br from-cat-amber/30 to-cat-rose/20`), text block, right-side Button (`variant="outline"` size="sm").
- Quick Links tile: `flex items-center gap-3 rounded-xl ring-1 ring-border/60 px-4 py-3.5 hover:bg-surface/60` with a 32px icon square (`bg-tile rounded-md grid place-items-center`) and label.
- Code snippet: simple `<pre>` with `bg-surface rounded-xl p-4 font-mono text-[12px]` and a copy button absolutely positioned top-right; keep static for now (no syntax highlighter dep).

---

## Files touched

- `src/components/ui/tabs.tsx` — rewrite styles (no API change)
- `src/components/app/underline-tabs.tsx` — match new look
- `src/components/app/data-table.tsx` — strip card chrome, redo header/row styles
- `src/routes/_authed.admin.external-apis.tsx` — full restructure into tabs + promo + quick links
- `src/routes/_authed.admin.audit.tsx` — apply matching table classes to its inline table

## Out of scope (next rounds)

- Migrating other admin pages page-by-page
- Sidebar polish, command palette, dashboard tile spacing
- Replacing per-route inline tables with the shared `DataTable`

Approve and I'll ship these in one pass.
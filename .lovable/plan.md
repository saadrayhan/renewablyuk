
# Renewably Admin — Design Restoration & Functional Parity Pass

The redesign drifted away from ElevenLabs. This pass restores the visual language, dials brand blue back, redesigns Configuration intelligently, and corrects Integrations placement. Functionality from the client's screenshots is the spec; the presentation is ours.

## Design rules to re-enforce (apply globally)

ElevenLabs language we'll re-apply, not invent:
- White canvas (`bg-background`), tile surfaces (`bg-tile` / `bg-card`), 1px hairline borders, generous padding (`p-5`/`p-6`), `rounded-2xl` on cards.
- Typography: `text-3xl/4xl` page titles with `tracking-tight`; eyebrow in `text-[11px] uppercase tracking-[0.08em] text-ink-muted`; supporting copy `text-sm text-ink-muted`.
- Primary actions: black pill (`bg-foreground text-background rounded-full`). Secondary: bordered ghost. No filled green/blue buttons except the single brand CTA.
- Status uses the soft `cat-*-bg` + `cat-*` ink pills already in the system (green/amber/rose/purple). Numbers in cards are large, neutral ink — no colored backgrounds on KPI tiles.
- Motion: keep `.press`, `.tile`, `.stagger-in`. No new animations.

Brand blue (`#0F47A8`) — strict 10% rule:
- Allowed: workspace switcher active state, the single primary CTA per page (e.g. "Update Rule", "Save"), and the `--brand-blue-tint` info notice background.
- Remove from: KPI cards, dashboard tiles, table headers, sidebar active state (revert to neutral `bg-sidebar-accent` + neutral indicator).
- Audit `_authed.dashboard.tsx`, `_authed.admin.companies.tsx`, `_authed.admin.membership.tsx`, `_authed.admin.stripe-events.tsx`, `_authed.settings.integrations.tsx` and strip any blue fills/borders that crept in.

KPI / metric card pattern (single source of truth):
```text
┌──────────────────────────┐
│ Label             icon   │   label: text-xs text-ink-muted
│                          │
│ 247                      │   value: text-3xl font-semibold ink
│ ▲ 12 this week           │   delta: text-[11px] text-ink-muted
└──────────────────────────┘
```
No colored fills. Status is conveyed via a small pill under the number when relevant.

## Sidebar cleanup (`src/components/app/shell/app-sidebar.tsx`)

Current admin groups duplicate routes (Configuration has 4 items all pointing at `/admin/config`). Fix:
- **Companies & Users**: Companies, Users, Membership & Billing
- **Configuration**: single "Configuration" entry → tabbed page (see below)
- **Risk & Compliance**: Risk Monitoring, Overrides (deep-link tab on Risk page), Audit Logs
- **Integrations**: External APIs, Stripe Events, CRM (HubSpot) — these are the **read-only/observability** views
- **System**: Access Control, Feature Flags, System Settings — separate routes (stub pages OK), not all pointing to `/admin/config`
- Active row indicator: revert to neutral foreground ink + a 2px neutral left bar (drop the brand color bar).

## Configuration redesign (`/_authed/admin/config`)

Replace the current dump with one ElevenLabs-style hub:
- Page header + horizontal `UnderlineTabs` for: Installation & System Types · Measures & Warranty · Evidence Requirements · Funding Schemes · Email Templates · Feature Flags.
- Each tab = a single airy section: title + one-line helper + list/grid of cards. Add primary action ("Add installation type", etc.) as a black pill in the section's right-aligned toolbar — not at the top of the page.
- Installation & System Types: parent–child nested cards (Installation Type → System Types as a soft sub-list with mono `id` chips). Inline add via a ghost row at the bottom of each group, not a giant button.
- Evidence Requirements: card grid; each card shows scope chip (Installation/Project/Company), required toggle, effective date, edit pencil. Edit opens an existing dialog pattern.
- Drop the "Admin only" red badge from this page; the route is already RBAC-gated.

## Integrations split (this is the part I missed)

Two surfaces, different jobs:
1. **`/admin/integrations`** (admin observability — read-only)
   - System Health row (Companies House, Stripe, HubSpot — Operational/Degraded pills, no colored fills, just dotted status + label).
   - API Usage panel (existing `ApiUsagePanel` moves here from Settings).
   - Sub-pages already exist: Stripe Events, CRM/HubSpot — link out as cards from this hub.
   - No connect/disconnect buttons here.
2. **`/settings/integrations`** (workspace-level — owners only)
   - Connect / disconnect Zapier, Make, HubSpot, Salesforce, Slack, Webhooks (existing UI). Remove the API Usage panel from here — it belongs in admin.

Update sidebar so admin sees an "Integrations" hub link, and Stripe Events / CRM live as children of that hub conceptually (still in the Integrations group).

## Admin Dashboard polish (`_authed.dashboard.tsx` → `AdminDash`)

Keep the section structure (Companies & Users, Risk Overview, IBG Activity, System Health) but restyle:
- Section header: small icon + title + right-aligned ghost link ("View all →"), no boxed background.
- KPI cards: switch from current colored treatments to the neutral pattern above. Status meaning lives in a tiny pill, not a fill.
- Add a 4th row: **Quick Actions** strip (Approve Users, Review High Risk, Approve Amendments, Failed Payments) as 4 minimal cards with icon + label + count, linking to the relevant queue.
- Remove brand blue from any tile.

## Companies / Membership / Stripe Events table polish

- Tables: hairline borders only, `bg-surface/40` header row, `text-[11px] uppercase` column labels, row hover `bg-surface/60`. No zebra. Action icons in a single right-aligned cluster with tooltips (matches client's icon row functionally without copying their dense layout).
- Status pills use existing `cat-*-bg`/`cat-*` tokens; never blue.
- Membership page: keep "Current Status" summary, KPI row, Subscriptions table, Stripe Events log — but restyle KPIs to neutral pattern.

## Nested pages (drill-downs the user couldn't screenshot)

Add stubs that already match design system, so the navigation graph is complete:
- `/admin/companies/$id` — company profile with tabs (Overview · Users · Billing · Risk · Activity).
- `/admin/users/$id` — already exists; align styling.
- `/admin/risk/$id` — already exists; ensure the override sheet matches the screenshot's structure (Risk Evaluation → System Impact → Admin Override Section) but in our card language.
- `/admin/integrations` — new hub page (described above).
- `/admin/system-settings`, `/admin/feature-flags`, `/admin/access-control` — split out from `/admin/config`.

## Out of scope (explicit)

- No new colors, no new fonts, no new icon set.
- No backend / Supabase changes.
- No copying the client's exact tables, modals, or icon strips pixel-for-pixel — functionality only.
- IBG Generator stays hidden from admin (already done).

## File-level summary

Edited:
- `src/components/app/shell/app-sidebar.tsx` (group cleanup, neutral active state)
- `src/routes/_authed.dashboard.tsx` (admin section restyle, quick actions row)
- `src/routes/_authed.admin.config.tsx` (rebuild as unified tabbed hub)
- `src/routes/_authed.admin.companies.tsx` (table restyle, neutral status)
- `src/routes/_authed.admin.membership.tsx` (KPI restyle)
- `src/routes/_authed.admin.stripe-events.tsx` (filter pills + table restyle)
- `src/routes/_authed.admin.risk.tsx` (drop blue, neutralize tier cards)
- `src/routes/_authed.settings.integrations.tsx` (remove API Usage panel)

Created:
- `src/routes/_authed.admin.integrations.tsx` (new observability hub)
- `src/routes/_authed.admin.companies.$id.tsx` (drill-down stub)
- `src/routes/_authed.admin.system-settings.tsx`, `_authed.admin.feature-flags.tsx`, `_authed.admin.access-control.tsx` (split stubs)

Approve and I'll execute in one pass.

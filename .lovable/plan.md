
# Button system + brand blue + missing detail pages

Three issues to fix in one pass: (1) buttons are inconsistent across pages — primary, ghost, icon-only, and bare text are mixed without rule; (2) brand blue (#0F47A8) has been almost entirely removed and is now invisible; (3) several detail pages referenced in the client's screenshots don't exist (notably risk detail polish + a few more), and IBG History needs to be restored as its own route alongside IBG Repository.

## 1. One button system (single source of truth)

Define the rule once, apply everywhere. Rule lives in `src/components/ui/button.tsx` as variants + sizes; nothing else should hand-roll button classes.

Variants — only these five exist:

```text
primary    bg-foreground text-background  rounded-full   black pill, ONE per view
brand      bg-brand-blue text-white        rounded-full   used ONLY for the workspace's signature CTA
                                                          (e.g. "Issue IBG", "Save changes" on Configuration)
secondary  border bg-card text-foreground rounded-full   "Cancel", "Filter", "Export"
ghost      text-ink-muted hover:bg-surface rounded-md    inline / table-row actions
icon       size-8 rounded-md text-ink-muted              tooltip required, used in icon clusters only
```

Sizes: `sm` (h-8) and `md` (h-9). No `lg`, no custom heights.

Rules of placement:
- One **primary** OR one **brand** per page header — never both, never two of either.
- Brand blue is reserved for the *signature save/issue action* of a destination, so it shows up exactly once per major page (Dashboard "New IBG", IBG editor "Issue IBG", Configuration tab "Save changes", Risk override sheet "Apply override", Settings "Save"). Everywhere else uses `primary` (black pill) or `secondary`.
- Table row actions are always `icon` variant in a single right-aligned cluster with tooltips. No mixing with text buttons in the same row.
- "View →" / "View all →" patterns become `ghost` with a trailing arrow icon — no underlines, no boxed treatment.
- Bare text-as-action (e.g. clickable spans) is removed; replace with `ghost`.

Implementation:
- Extend `buttonVariants` in `src/components/ui/button.tsx` with the five variants and two sizes above. Keep `default`/`outline` as deprecated aliases mapping to `primary`/`secondary` so the build doesn't break.
- Add `<Button variant="brand">` that consumes `--brand-blue` / `--brand-blue-foreground` (already in `styles.css`).
- Sweep these files and replace ad-hoc `inline-flex … rounded-full bg-foreground …` with `<Button>`:
  - `_authed.dashboard.tsx`, `_authed.ibg.repository.tsx`, `_authed.ibg.new.tsx`, `_authed.admin.config.tsx`, `_authed.admin.companies.tsx`, `_authed.admin.companies.$id.tsx`, `_authed.admin.membership.tsx`, `_authed.admin.risk.tsx`, `_authed.admin.risk.$id.tsx`, `_authed.admin.integrations.tsx`, `_authed.admin.stripe-events.tsx`, `_authed.settings.integrations.tsx`, `_authed.settings.profile.tsx`, `_authed.settings.team.tsx`, `_authed.settings.subscription.tsx`, `_authed.settings.security.tsx`, `_authed.settings.measures.tsx`, `_authed.settings.notifications.tsx`, `_authed.settings.access.tsx`, `_authed.admin.feature-flags.tsx`, `_authed.admin.system-settings.tsx`, `_authed.admin.amendments.tsx`, `_authed.admin.audit.tsx`, `_authed.admin.users.tsx`, `_authed.admin.users.$id.tsx`, `_authed.admin.onboarding.tsx`, `_authed.customers.tsx`, `_authed.customers.$id.tsx`, `_authed.properties.tsx`, `_authed.jobs.tsx`, `_authed.funding.tsx`, `_authed.submissions.tsx`, `_authed.reports.tsx`.
- Page headers: each page declares **at most one** primary/brand action via `<PageHeader actions={…} />`. Anything secondary moves into the section toolbar inside the page body.

## 2. Bring back brand blue (#0F47A8) at exactly 10%

Brand blue currently appears nowhere. Re-introduce, sparingly, in these specific spots only:

- **Workspace switcher**: small blue dot + active state on the selected workspace.
- **Single signature CTA per page** (the `brand` button variant above).
- **Info notices**: `bg-brand-blue-tint` with `text-brand-blue` body — used for "Read-only", "Sandbox mode", "Override active" banner strips at the top of relevant pages (Risk detail, Stripe Events when in test mode, Integrations Hub when a service is degraded).
- **Active link underline** in `UnderlineTabs`: 2px `bg-brand-blue` under the active tab (currently neutral). This gives every tabbed page a visible blue accent without coloring fills.
- **Sidebar workspace logo mark**: replace the green/blue gradient `R` with a solid `bg-brand-blue` `R`.

NOT allowed (keep neutral):
- KPI numbers and tile fills.
- Sidebar active row indicator (stays neutral foreground bar).
- Status pills (stay green/amber/rose/purple).
- Table headers, hovers, borders.
- Icon backgrounds in section headers.

## 3. Missing detail pages

Audit against the client's screenshots — these are the gaps:

- **`/admin/risk/$id`** — exists but doesn't match the screenshot's structure. Restructure into three stacked cards inside the existing route: **Risk Evaluation** (Companies House status, signal list with timestamps), **System Impact** (what's blocked: IBG issuance, submissions, payouts), **Admin Override Section** (current override card if any, with revoke; "Apply override" button opens the existing high/critical sheets). Keep our card language, not the client's dense layout.
- **`/admin/companies/$id`** — exists as a stub. Flesh out the five tabs (Overview, Users, Billing, Risk, Activity) with real content from the mock store (subscription summary, user list, recent IBGs, audit feed, linked risk state).
- **`/admin/stripe-events/$id`** — create. Detail view for one Stripe event (raw JSON payload card, retry button as `secondary`, related subscription link).
- **`/admin/integrations/$id`** — create. One page per integration (Companies House, Stripe, HubSpot) with health timeline, last sync, API usage chart, recent errors. Linked from the Integrations Hub cards.
- **`/admin/audit/$id`** — create. Single audit-event detail with actor, target, before/after diff, related entity links.
- **`/admin/amendments/$id`** — create. Single amendment review (already partially handled by `AmendmentReviewSheet`; promote to a full route for deep-linking).
- **`/admin/onboarding/$id`** — create. Single onboarding application detail (KYC checks, documents, decision actions).

All new detail pages follow the same shell: `PageHeader` with back link in eyebrow, one primary action max, body in `rounded-2xl` cards with hairline borders, ghost row actions.

## 4. IBG History vs IBG Repository (separate again)

Current state: `/ibg/history` redirects to `/ibg/repository?view=history`. Per clarification these are different concepts:

- **`/ibg/repository`** — document storage. The PDF + audit-artefact store. Columns: ref, customer, property, state pill, issued at, **Download PDF** (icon), **View** (icon). Searchable + state filter (already mostly built — restyle table actions to `icon` variant cluster).
- **`/ibg/history`** — activity log. Columns: timestamp, ref, event (`generated`, `issued`, `sent`, `resent`, `delivery: bounced`, `viewed by customer`, `amended`, `cancelled`), actor, target email, status pill. Filterable by event type and date range. Reads from existing `data.activity` and `data.ibgs` joined on ref.

Implementation:
- Remove the redirect in `_authed.ibg.history.tsx` and replace with a real component.
- Restore `IBG History` in the sidebar `main` group, between IBG Repository and Submissions, gated by `ibg.repository.read`.
- Drop the `?view=history` query handling from `_authed.ibg.repository.tsx`; that page is documents only.

## File-level summary

Edited:
- `src/components/ui/button.tsx` — five variants, two sizes, `brand` variant added
- `src/components/app/shell/app-sidebar.tsx` — restore IBG History entry, brand-blue logo mark
- `src/components/app/shell/workspace-switcher.tsx` — brand-blue dot/active state
- `src/components/app/underline-tabs.tsx` — brand-blue active underline
- `src/styles.css` — confirm `--brand-blue` tokens are wired (no new tokens)
- `src/routes/_authed.ibg.repository.tsx` — drop history view, polish actions
- `src/routes/_authed.ibg.history.tsx` — replace redirect with real activity log
- `src/routes/_authed.admin.risk.$id.tsx` — restructure into three-card layout
- `src/routes/_authed.admin.companies.$id.tsx` — flesh out tabs with real data
- All page files listed in §1 — sweep ad-hoc buttons → `<Button>` variants

Created:
- `src/routes/_authed.admin.stripe-events.$id.tsx`
- `src/routes/_authed.admin.integrations.$id.tsx`
- `src/routes/_authed.admin.audit.$id.tsx`
- `src/routes/_authed.admin.amendments.$id.tsx`
- `src/routes/_authed.admin.onboarding.$id.tsx`

## Out of scope (explicit)

- No new colors beyond restoring `#0F47A8`.
- No backend changes.
- No copying client screenshots pixel-for-pixel — functional parity only, our visual language.

Approve and I'll execute in one pass.

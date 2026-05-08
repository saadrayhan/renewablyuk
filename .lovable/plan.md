
# Renewably — Complete Build Plan

Goal: ship a fully interactive product on the mock store with no "coming soon" anywhere, no real backend, in the ElevenLabs editorial visual system already established.

---

## 1. Foundations (locked from prior turns)

**User model — two axes, kept distinct everywhere:**
- **Membership tier** (contractor-facing, drives nav + paywalls): `access` (free, 5-condition gated) · `operate` (paid, V1.2 capabilities unlocked).
- **Internal admin roles** (kept granular, never marketed): `super_admin` · `reviewer` · `support` · `finance`. Externally these are all just "Admin"; internally each sees a different nav surface and permission set.

**Seeded mock accounts** (auto-login from sign-in screen via "Demo accounts" panel):
- `contractor.access@demo` · `contractor.operate@demo` · `contractor.expiring@demo` · `contractor.suspended@demo`
- `admin.super@demo` · `admin.reviewer@demo` · `admin.support@demo` · `admin.finance@demo`

**Dev-switcher** (bottom-right, dev builds only) gains: tier toggle, activation-state toggle, dashboard-state toggle (empty/partial/active/expiring/expired/suspended/locked), and a one-click admin-role flip that re-renders nav without re-login.

**No backend.** Everything runs through `src/lib/mock/store.tsx` with realistic latency (200–600ms), session-scoped state, and a "Reset demo data" button in the dev-switcher.

---

## 2. Visual system from ElevenLabs references

Direct adoption (already partially in place — gaps will be closed):

| ElevenLabs pattern | Renewably surface |
|---|---|
| Slim sidebar with icon+label rows, grouped sections (Playground / Products), bottom "My Account" card, collapsible toggle | `app-sidebar.tsx` — restructure into Workspace / Compliance / Operations / Settings / Admin groups; add bottom account card with credit/usage indicator |
| Page header: title + small status pill + ID below + right-side action cluster (primary CTA, copy-link icon, overflow `…`) | Certificate detail, Evidence detail, Ticket detail, Company detail, IBG detail |
| Sub-tabs under header (Agent/Voice/Analysis/Security/Advanced/Widget) | Certificate (Overview/Evidence/Activity/Documents), Settings, Admin Company detail |
| Form sections as bordered cards: title + helper text + single control + sticky "You have unsaved changes — Clear / Save" footer | All wizards, template editor, settings pages, admin config pages |
| Compact single-column modals with footer-right action (Add data collection item, Add URL, Create API Key) | Confirm/create dialogs across the app |
| Empty state: centered glyph + label + primary CTA + secondary description | Empty Certificates, Tickets, Evidence Queue, Funding |
| Split-pane: list on left, full detail panel + closeable Metadata sidebar on right (Conversation history) | Evidence Queue review, Tickets inbox, Audit detail |
| Template picker grid (Create AI agent: Blank / Support / Tutor / Game) | Certificate Template picker, Create-Admin role picker, IBG New flow |
| Auth screens: split layout, social buttons stacked, "or continue with email", separate password-reset modal sequence (enter / confirm / success toast), 2FA OTP grid | Sign-in, sign-up, forgot-password, reset, 2FA, account-deleted |
| Pricing: monthly/annual toggle, 4-tier card row, "Most popular" highlight | Membership/Subscription page, Operate upsell |
| Filter pills + right-side dropdowns above tables (All results / All agents) | Every list view |
| Notifications popover with stacked rich cards | Top-bar bell |
| Profile popover with credit usage at top + grouped menu (Profile / API Keys / Subscription / Payouts / Become an affiliate / Usage analytics / Docs / Terms / Sign out) | Top-bar profile menu |
| Usage analytics: line chart + breakdown filters + secondary chart below | Admin → System / Contractor → Membership usage tab |
| Account deletion: confirmation modal with red warning block, type-to-confirm, irreversible notice | Settings → Security → Delete account |
| Knowledge base modal flow (pick type → upload → progress) | Document upload, evidence upload |

**Ignored (per "ignore design aspect that doesn't fit"):** the animated gradient orb / "Listening" voice agent visuals — replaced with appropriate compliance visuals (status badges, progress rings, document previews).

---

## 3. Workstream breakdown

### A — Mock data model
Extend `src/lib/mock/types.ts` and `seed.ts`:
- Contractor: `membership_tier`, `activation_state`, `activation_conditions` (5 booleans: company_verified · trustmark_linked · insurance_uploaded · payment_method · profile_complete), `tier_expires_at`, `suspended_reason?`.
- New entities: `certificates`, `certificate_templates`, `products`, `tickets` (+ `ticket_messages`), `evidence_items` (+ `evidence_decisions`), `notifications`, `payouts`, `usage_events`.
- Hooks: `useMembership()`, `useActivationGate()`, `useAdminRole()`, `useNotifications()`.

### B — Auth & onboarding (full flows, mock)
- `/sign-in` — split layout, social buttons (Google/GitHub/SSO mock), email+password, "Demo accounts" expandable panel for one-click seeded login.
- `/sign-up` — Access tier signup: step 1 account → step 2 company → step 3 verification; creates user immediately on step 1.
- `/register/operate` — Operate paid signup: account → company → plan → payment → success.
- `/forgot-password` → email-sent toast → `/reset-password` (new pw + confirm, validation states) → success modal.
- `/verify` — 2FA OTP grid (6 digits, auto-advance, resend).
- `/account-deleted` — terminal screen.

### C — Contractor product (full)
- `/dashboard` — 7-state machine driven by `activation_state`:
  - empty / partial → 5-condition activation checklist with per-row CTAs
  - active → KPI tiles, recent certificates, expiring soon, open tickets, funding shortlist
  - expiring (≤30d) → amber banner + renewal CTA
  - expired → red banner, read-only mode
  - suspended → blocking modal with reason + support CTA
  - locked → identical visual but admin-imposed
- `/certificates` — list with filter pills + search, empty state, row → detail
- `/certificates/$id` — header + sub-tabs (Overview / Evidence / Activity / Documents), issue/revoke/download PDF actions, evidence sub-table
- `/certificates/new` — wizard: pick template → fill fields → upload evidence → preview → issue
- `/documents` — grid of uploaded docs with preview dialog, replace/delete, evidence linkage
- `/tickets` — split-pane inbox (list left, thread right) with new-ticket composer, status pills, attach files
- `/membership` — current plan card + usage chart + invoices table + payment method + upgrade to Operate CTA + cancel flow
- `/projects` (Operate) — fully built kanban + detail (brief, milestones, files, messages, billing)
- `/funding` (Operate) — pipeline list + match wizard + tracking detail (stages, evidence, payout schedule)
- `/settings/*` — profile, security (2FA, sessions, delete account), notifications, integrations, team (invite + roles), measures, access

### D — Admin product (full, all roles)
Per-role nav surface:
- **super_admin**: everything + Platform group (feature flags, system settings, cron, integrations, external APIs, stripe events)
- **reviewer**: Evidence Queue, Certificates, Templates, Companies (read+amend), Audit, Risk
- **support**: Tickets, Companies, Users, Activity, CRM, Onboarding queue
- **finance**: Stripe events, Membership, Funding schemes, Payouts, Subscription oversight

New admin routes:
- `/_authed/admin/evidence` — split-pane queue (list + review panel with approve / request-changes / reject + decision audit)
- `/_authed/admin/certificates` — global certificate registry, bulk actions
- `/_authed/admin/templates` — list + editor (drag-order fields, brand color, preview)
- `/_authed/admin/products` — Operate product catalog editor
- `/_authed/admin/tickets` — global ticket inbox
- `/_authed/admin/payouts` — payout runs + Stripe Connect mock
- `/_authed/admin/create-admin` — role picker + invite flow

Existing ~20 legacy admin pages: keep all, restyle to the editorial system, regroup into Compliance / Operations / Platform / System sections in the sidebar.

### E — Shared primitives (new + audited)
- `confirm-dialog.tsx` — destructive variant with red header + type-to-confirm
- `document-preview-dialog.tsx` — PDF/image preview with download + replace
- `wizard.tsx` — multi-step shell with progress, sticky footer (Back / Continue), step validation
- `unsaved-changes-bar.tsx` — sticky bottom save bar
- `split-pane.tsx` — generic list+detail layout used by Evidence, Tickets, Audit
- `pricing-cards.tsx` — 4-tier with monthly/annual toggle
- `kpi-tile.tsx`, `progress-ring.tsx`, `status-pill.tsx` audit pass

### F — Navigation, top-bar, dev tooling
- Restructure `app-sidebar.tsx` per role + tier
- Top-bar: notifications popover (rich cards) + profile popover (credit/usage + grouped menu) matching ElevenLabs
- Command palette: extend with role-aware actions
- Dev-switcher: tier · activation · dashboard-state · admin-role · "Reset demo data"

### G — Marketing / public
- `/` — keep current home, polish hero
- `/pricing` — restyle to ElevenLabs 4-tier pattern, monthly/annual toggle, Access/Operate clearly differentiated

---

## 4. Out of scope

- Real Stripe / Companies House / TrustMark calls (remain mocked with realistic latency + state)
- Email sending (toast confirmations only)
- Database migrations (mock store only)
- Visual redesign beyond closing gaps to ElevenLabs references
- Accessibility audit beyond keeping existing semantic structure

---

## 5. Sequencing (phased so each phase ships a usable product)

**Phase 1 — Data + Auth + Shells**
Mock model extension, seeded accounts, full auth flows, dev-switcher upgrade, sidebar restructure, top-bar polish.

**Phase 2 — Contractor V1 (Access tier)**
Dashboard 7 states, Certificates (list/detail/new), Documents, Tickets, Membership, Settings.

**Phase 3 — Admin (all roles)**
Evidence Queue, Certificates, Templates, Products, Tickets, Create-Admin, Payouts. Restyle all legacy admin pages.

**Phase 4 — Contractor V1.2 (Operate tier)**
Operate signup + payment, Projects (kanban + detail), Funding (pipeline + match + tracking), pricing page.

**Phase 5 — Polish pass**
Empty states, loading skeletons, error boundaries on every route, command palette actions, notifications population, final visual diff against ElevenLabs references.

---

## 6. Open questions (non-blocking, decide during Phase 1)

1. Operate pricing — single price (£/month) or tiered by certificate volume? Default to single + "Contact for enterprise" if undecided.
2. Tickets — free-form, or structured categories (billing/technical/evidence/other)? Default to structured + free-form subject.
3. Should the 5 deprecated *contractor* legacy surfaces (customers, properties, jobs, reports, ibg) also be parked under a `legacy` flag visible to super-admin only, or hidden entirely? Default to hidden in nav, route still resolvable.

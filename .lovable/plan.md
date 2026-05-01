# Renewably UK Platform — V1.0

A private operational and compliance platform for UK Net Zero installation companies. Built around the linked record chain **Customer → Property → Job → Workflow → Output → Audit**, with two live membership tiers (**Access** and **Operate**) plus stakeholder onboarding for non-installer user types.

Visual language is taken wholesale from ElevenLabs: bright white canvas, slim left sidebar, bold black headings, soft rounded grey tiles with vibrant illustrated icons, black pill primary buttons, generous whitespace, no chrome. Every interaction is held to a craft standard — the aggregate of invisible correctness is the differentiator.

---

## Visual System

**Theme** — Light. Background `#FFFFFF`, surface `#FAFAFA`, soft tile `#F4F4F5`, borders `#E5E5E5`, ink `#0A0A0A`, muted `#6B6B6B`.
**Accent** — Renewably green used sparingly on status, charts, and Funding Match. Category illustration tiles use a small palette: green, blue, amber, purple, rose — same energy as ElevenLabs' Audiobook / AI Agent / Podcast tiles.
**Type** — Inter (or similar geometric sans). Black weight for H1 ("Good morning, Sarah"), regular for body, small uppercase muted for section labels.
**Components** — Rounded-2xl cards, pill buttons, slim sidebar with icon + label rows, status as small pills, slim progress bars, soft hover states.
**Illustrated tiles** — Each category (IBG, Jobs, Customers, Properties, Submissions, Funding) gets its own bright illustrated icon on a soft grey square — the "Instant speech / Audiobook / AI agent" row.
**Auth** — Split layout: form left (white), gradient marketing card right with floating sample chips.

---

## Motion & Craft

Motion is a feature, not decoration. It runs on these rules:

**Tokens** (in `styles.css`):
```text
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1)
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)
durations: 100 / 160 / 200 / 250 ms
```

**Rules applied everywhere:**
- Animate only `transform` and `opacity`. No `transition: all`.
- Enter from `scale(0.95)` + `opacity:0`, never `scale(0)`.
- Pressable elements scale to `0.97` on `:active`, 160ms.
- Popovers/dropdowns/menus use `transform-origin: var(--radix-*-content-transform-origin)`. Modals stay centered.
- Tooltips: 150ms delay on first hover, instant on subsequent.
- High-frequency actions (sidebar nav clicks, keyboard shortcuts) get **no** animation.
- Hover effects gated behind `@media (hover: hover) and (pointer: fine)`.
- Lists stagger at 40ms on first mount only; no stagger on filter/refetch.
- Status-pill changes and button label swaps use `filter: blur(2px)` to mask the crossfade.
- Irreversible actions (Cancel IBG, archive) use a **hold-to-confirm** pattern: 2s linear `clip-path` fill on press, 200ms ease-out snap-back on release.
- Sidebar collapse uses `--ease-drawer`, 250ms, transform only.
- Onboarding step transitions: 200ms enter / 160ms exit, slide+fade via `@starting-style`.
- `prefers-reduced-motion`: keep opacity transitions, drop transforms.
- CSS transitions for reactive UI (interruptible). WAAPI for JS-driven (clip-path fills). Never Framer `x`/`y` shorthand under load — use full `transform` strings.
- Slow-motion QA pass on dashboard tiles, sidebar collapse, onboarding steps, popover origins, and IBG cancel hold before each ships.

---

## Information Architecture (V1)

```text
Public                  Authenticated                 Operate-only
─────                   ─────────────                 ─────────────
/                       /dashboard                    /jobs
/sign-in                /onboarding                   /jobs/$id
/sign-up                /settings                     /customers
/reset-password         /settings/profile             /customers/$id
/pricing                /settings/company             /properties
                        /settings/measures            /properties/$id
                        /settings/billing             /submissions
                        /settings/team                /submissions/$id
                        /ibg/new                      /funding
                        /ibg/history                  /funding/match
                                                      /ibg/repository
                                                      /ibg/repository/$id
                                                      /reports
```

Sidebar visibility follows membership; the platform also enforces access on the server. Stakeholder user types (Assessor, Coordinator, Designer, Funding Partner, Scheme Provider, Architect) get a slimmer experience — Dashboard + Settings only — while their record sits in HubSpot for CRM follow-up.

---

## Sidebar Layout

```text
┌──────────────────────┐
│  Renewably           │   logo + collapse trigger
│  ─────────           │
│  ⌂  Dashboard        │
│  ✦  IBG          [+] │   New IBG quick-add
│                      │
│  OPERATE             │   muted section label
│  ⊟  Jobs             │
│  ◉  Customers        │
│  ⌂  Properties       │
│  ⇪  Submissions      │
│  ◈  Funding          │
│                      │
│  INSIGHTS            │
│  ▤  Reports          │
│  ▦  IBG Repository   │
│                      │
│  ⌥  Settings         │
│  ⚐  Notifications    │
│  ─────────           │
│  ◐ Sarah        ›    │   account footer
└──────────────────────┘
```

Locked items for Access render with a small lock icon and route to an Operate upgrade modal. Active-route highlight uses `clip-path` reveal so it slides between items.

---

## Authentication & Onboarding

**Sign-up captures** name, email, phone, password, company name, registration number, address, optional TrustMark licence, **user type** (8 options), consent.

**Routing branches off user type:**
- **Installation Company** → choose **Access** (£0) or **Operate** (subscription) → Stripe Checkout → return to onboarding wizard
- **All other types** → straight to lighter stakeholder onboarding (no Stripe)

**Installation Company wizard** (ElevenLabs-style — slim progress bar, one question per screen, big bold question, Skip / Next pills):
1. Confirm company details
2. Companies House verification (auto-lookup; mismatch → manual review)
3. TrustMark licence (manual, optional)
4. **Approved measures** (drives Funding Match) — *unlock*
5. **Optional measures** (advisory only) — *suggest*
6. Readiness review → Activate

States: `not_started`, `in_progress`, `awaiting_company_verification`, `awaiting_review`, `ready_for_activation`, `completed`, `blocked`, `cancelled`. Resumable from a persistent banner on Dashboard.

**Stakeholder onboarding**: identity, role, organisation, reason for access — submitted to HubSpot, may sit in `awaiting_review`.

---

## Dashboard

```text
┌────────────────────────────────────────────────────────────┐
│  [New • Funding Match now live for Operate     →]          │
│                                                            │
│  My Workspace                                              │
│  Good morning, Sarah                                       │
│                                                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                │
│  │ ✦  │ │ ⊟  │ │ ◉  │ │ ⇪  │ │ ◈  │ │ ▦  │   quick-tiles  │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                │
│  New IBG  Jobs  Customers Submit Funding Repository        │
│                                                            │
│  ┌─ Recent activity ─────┐  ┌─ Get more from Renewably ─┐  │
│  │ • IBG #4421 issued    │  │ ◐ Add a property          │  │
│  │ • Job J-118 in review │  │ ◑ Run Funding Match       │  │
│  │ • Submission accepted │  │ ◒ Invite teammate         │  │
│  └───────────────────────┘  └───────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

Tiles stagger in at 40ms on first mount only. Access users see only New IBG, Recent IBG history, and an Upgrade-to-Operate prompt card.

---

## IBG Workflow

- **`/ibg/new`** — single-page form: customer + property (existing or inline-create), measure(s), policy detail. Submit → generation → success screen with downloadable certificate + policy PDF + "Send to customer" (Operate) or "Available in your account" (Access).
- **`/ibg/history`** — list view, filter by status / date / customer. Access sees limited history (e.g. last 30 days).
- **`/ibg/repository`** *(Operate)* — full searchable repository with filters and bulk export. Per-record drawer: certificate + policy detail, status timeline, **Cancel** (within calendar month, hold-to-confirm), **Request amendment** (name/address only, routes to admin approval queue).

---

## Operate Modules

All four follow the same pattern: list view (search + filter + status pills) → record detail (header, key facts, related-records tabs, evidence drawer, audit timeline).

- **Customers** (`/customers`) — durable account record. Tabs: Properties, Jobs, Communications, History.
- **Properties** (`/properties`) — site record. Tabs: Customer, Jobs, Evidence, History.
- **Jobs** (`/jobs`) — central operational record. Tabs: Workflow, Evidence, IBG, Funding, Audit. Full lifecycle (`draft → created → in_progress → under_validation → blocked → completed → closed → archived`).
- **Submissions** (`/submissions`) — workflow record linked to a Job. Readiness checklist → Active progression → Post-submission tracking.

List rows: clean, left-aligned name, muted metadata, status pill on right, hover highlight, three-dot menu.

---

## Funding (`/funding`, Operate)

**Funding Match** — rule-driven, measure-led. Two columns:
- **Active matches** — schemes unlocked by approved measures (ECO4, GBIS, BUS, WH:LG, WH:SHF, HEEPS, Nest, NISEP — geography-aware)
- **Opportunity matches** — adjacent suggestions from optional measures (Warm Homes Fund, Consumer Loans, specialist Heat Network routes)

Each scheme card: name, category badge (Direct / Finance / Specialist / Reference), matched measures, geography, eligibility blurb, "Prepare project" CTA. Warm Homes Plan shown as umbrella resolving into BUS / WH:LG / WH:SHF / specialist routes.

**Funding Hub** — initiate a funding project from a job → readiness checklist → evidence collection → internal review → submission preparation → funder email handoff (V1: no direct submission).

---

## Reports (`/reports`, Operate)

Tabbed dashboards with filterable lists:
- **Operational** — jobs by status, submissions awaiting action, blocked records
- **Workflow** — submissions by readiness, IBG by issue status, funding by stage
- **Management** — volumes over time, owner workload, completion trends
- **Audit** — record changes by date range, user-attributed events

Charts are minimal — thin lines, soft fills, no heavy gridlines.

---

## Settings

- **Profile** — name, email, phone, password, MFA
- **Company** — registered details, Companies House status (re-verify), TrustMark
- **Measures** — Approved (live, fixed) vs Optional (advisory). Hard reminder that approved-measure changes affect active Funding Match
- **Billing** — plan, Stripe customer portal link, invoices, upgrade Access → Operate
- **Team** — placeholder for V1 ("Coming soon")
- **Notifications** — email preferences

---

## Backend & Data

- **Lovable Cloud** for auth, database, storage. Tables: `profiles`, `user_roles` (separate, `has_role` security definer), `organisations`, `customers`, `properties`, `jobs`, `submissions`, `ibg_records`, `funding_projects`, `measures_approved`, `measures_optional`, `documents`, `audit_events`, `onboarding_state`, `companies_house_verifications`.
- **RLS everywhere**, scoped by organisation.
- **Audit table** — every material action (status changes, attachments, IBG issuance, cancellations, amendments) writes to `audit_events` with user, timestamp, before/after. 7-year retention.
- **Server functions**: Companies House lookup (`COMPANIES_HOUSE_API_KEY`), Stripe checkout + webhook, HubSpot sync (`HUBSPOT_PRIVATE_APP_TOKEN`), IBG PDF generation, Funding Match rule engine.
- **Stripe** — Access = £0 setup (customer creation), Operate = subscription. Stripe → Zapier → HubSpot for installer lifecycle (Zapier handled outside Lovable; the platform emits the right Stripe state).
- **Companies House** — onboarding lookup + scheduled cron at `/api/public/cron/companies-house` checking strike-off / late accounts / dissolution; flagged accounts move to `suspended` review state.
- **HubSpot** — non-installer signups posted directly via platform → HubSpot API.

---

## Build Order

1. Design tokens + motion tokens, sidebar shell, auth pages, dashboard skeleton — lock the look and feel
2. Sign-up + user-type routing + Stripe (installer) / direct (stakeholder)
3. Installation Company onboarding wizard (Companies House + Approved/Optional measures)
4. Dashboard with quick-tiles, recent activity, onboarding-resume banner
5. IBG: `/ibg/new`, `/ibg/history`, then `/ibg/repository` with cancel + amendment (hold-to-confirm)
6. Customers, Properties, Jobs (list + detail + linkage)
7. Submissions module + Job→Submission workflow
8. Funding Match (rule engine over approved/optional measures + geography) + Funding Hub
9. Reports
10. Settings (Company, Measures, Billing, Notifications) + audit log surfacing
11. Stakeholder onboarding (lighter path) + admin review states
12. Companies House cron, HubSpot sync polish, audit retention

---

## Out of Scope for V1

Multi-user / roles within an organisation, advanced compliance tooling, direct funder submission (V1 is email handoff), Comply / Deliver / Enterprise tiers, mobile app.
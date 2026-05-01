# Renewably UK — Design Specification

> Single source of truth for designers, developers, and AI no-code builders.
> Read top-to-bottom to rebuild the product **pixel-for-pixel** with the same
> tokens, components, page anatomies, state machines, and interactions.
>
> Version 1.0 · Date 2026-05-01

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [Information architecture](#2-information-architecture)
3. [Design tokens](#3-design-tokens)
4. [Typography](#4-typography)
5. [Spacing, radii, shadows, motion](#5-spacing-radii-shadows-motion)
6. [Component inventory](#6-component-inventory)
7. [Page specifications](#7-page-specifications)
8. [State machines](#8-state-machines)
9. [Permission model](#9-permission-model)
10. [Interaction & animation rules](#10-interaction--animation-rules)
11. [Responsive behaviour](#11-responsive-behaviour)
12. [Mock data shape](#12-mock-data-shape)
13. [Source code index](#13-source-code-index)

---

## 1. Product overview

**What it is.** Renewably UK is a workspace for UK Net Zero installation companies.
It owns the post-sale lifecycle: customer → property → job → IBG (Installer Backed
Guarantee) → funding scheme match → submission → ongoing audit.

**Visual language.** ElevenLabs-inspired: bright white canvas (deep neutral in dark
mode), near-black ink, soft grey surfaces, vibrant illustration palette for category
tiles, generous whitespace, single-typeface (Inter) hierarchy.

**Personas / roles**

| Role                | Persona                                    | Primary needs                              |
|---------------------|--------------------------------------------|--------------------------------------------|
| Admin               | Platform owner / compliance officer        | Approvals, permissions, audit, config      |
| Operator            | Office manager with delegated capabilities | Granular tasks assigned by Admin           |
| Installer · Operate | Installer on the full plan                 | Jobs, IBGs, funding, submissions           |
| Installer · Access  | Free-tier installer                        | Standalone IBG generation only             |
| Read-Only           | Auditor / partner                          | Browse records, no actions                 |

**Tier rules**

- **Access tier** sees: New IBG, IBG history (last 5), Upgrade card. Nothing else.
- **Operate tier** sees the full ops surface, plus its own subscription billing.
- **Admin** never sees a Subscription tab — they're the platform owner.
- **Read-Only** sees record browsers with action buttons removed.

---

## 2. Information architecture

### Sitemap

```
/
├── /sign-in, /sign-up, /reset-password, /pricing
├── /onboarding                       6-step company application
└── /_authed (sidebar + topbar layout)
    ├── /dashboard                    role-aware home
    ├── /customers
    │   ├── /                         list
    │   ├── /new                      create
    │   └── /$id                      detail (Overview · Properties · Jobs · Audit)
    ├── /properties
    │   ├── /                         list (duplicate flag warning)
    │   └── /$id                      detail
    ├── /jobs
    │   ├── /                         list (state filter)
    │   ├── /new                      create
    │   └── /$id                      hub (Overview · Documents · IBGs · Funding · Audit)
    ├── /projects                     index of Customers / Properties / Jobs
    ├── /ibg
    │   ├── /new                      issue wizard
    │   ├── /history                  Access tier limited view
    │   ├── /repository               Operate tier full repository
    │   ├── /$id                      detail (12-state pill, gated actions)
    │   └── /$id/amendment            request correction
    ├── /funding
    │   ├── /                         project list
    │   ├── /match                    Match Hub (scored cards)
    │   └── /$id                      project hub (evidence + submit inline)
    ├── /submissions
    │   ├── /                         list (state filter, search)
    │   └── /$id                      detail (snapshot + upload-info gating)
    ├── /settings
    │   ├── /profile                  account
    │   ├── /notifications            preferences
    │   ├── /measures                 request measure addition
    │   ├── /integrations             Zapier · HubSpot · Slack · Salesforce …
    │   └── /subscription             Operate only, hidden for Admin
    └── /admin                        admin-only
        ├── /users, /users/$id        directory + invite + ban + permissions
        ├── /permissions              Library · Presets · Requests · Assign
        ├── /onboarding               application queue + inline review
        ├── /amendments               IBG correction queue + approve/reject
        ├── /audit                    filterable compliance trail (CSV export)
        ├── /activity                 live platform feed
        └── /config                   workspace configuration
```

### Access matrix (page-level)

| Path                | Admin | Operator         | Operate | Access           | Read-Only |
|---------------------|:-----:|:----------------:|:-------:|:----------------:|:---------:|
| /dashboard          |  ✓    | ✓                | ✓       | ✓                | ✓         |
| /customers          |  ✓    | perm gated       | ✓       | ✗                | view-only |
| /jobs               |  ✓    | perm gated       | ✓       | ✗                | view-only |
| /ibg/new            |  ✓    | perm gated       | ✓       | ✓                | ✗         |
| /ibg/history        |  —    | —                | —       | ✓ (5 most recent)| —         |
| /ibg/repository     |  ✓    | perm gated       | ✓       | ✗                | view-only |
| /ibg/$id/amendment  |  ✓    | perm gated       | ✓ ¹     | ✗                | ✗         |
| /funding/*          |  ✓    | perm gated       | ✓       | ✗                | view-only |
| /submissions/*      |  ✓    | perm gated       | ✓       | ✗                | view-only |
| /settings/subscription | hidden | ✓             | ✓       | ✓                | ✓         |
| /admin/*            |  ✓    | ✗                | ✗       | ✗                | ✗         |

¹ Operate can request amendments only on **issued** IBGs within the **current calendar
month**. Outside that window, the action is disabled with a tooltip.

---

## 3. Design tokens

All colors in **OKLCH**. Defined in `src/styles.css`.

### Light theme

| Token                 | Value                            | Use                                |
|-----------------------|----------------------------------|------------------------------------|
| `--background`        | `oklch(1 0 0)`                   | Page canvas                        |
| `--surface`           | `oklch(0.985 0 0)`               | Sidebar bg, hover bg               |
| `--tile`              | `oklch(0.965 0.003 250)`         | Chip bg, table header bg           |
| `--foreground`        | `oklch(0.16 0 0)`                | Body text                          |
| `--ink`               | `oklch(0.13 0 0)`                | H1 text                            |
| `--ink-muted`         | `oklch(0.55 0 0)`                | Secondary text                     |
| `--border`            | `oklch(0.93 0.002 250)`          | Cards, table separators            |
| `--primary`           | `oklch(0.16 0 0)`                | Black pill CTAs                    |
| `--primary-foreground`| `oklch(0.99 0 0)`                | Text on primary                    |
| `--ring`              | `oklch(0.55 0 0)`                | Focus ring                         |
| `--destructive`       | `oklch(0.58 0.21 27)`            | Errors, ban actions                |
| `--brand`             | `oklch(0.62 0.16 152)`           | Renewably green                    |

### Category palette (illustration tiles)

Each color comes as `--cat-X` (vivid icon ink) and `--cat-X-bg` (soft tile background).

| Family | Ink                          | Background                       |
|--------|------------------------------|----------------------------------|
| green  | `oklch(0.55 0.17 152)`       | `oklch(0.94 0.05 152)`           |
| blue   | `oklch(0.55 0.18 250)`       | `oklch(0.94 0.04 250)`           |
| amber  | `oklch(0.66 0.16 70)`        | `oklch(0.95 0.06 80)`            |
| purple | `oklch(0.55 0.18 295)`       | `oklch(0.94 0.04 295)`           |
| rose   | `oklch(0.6 0.19 15)`         | `oklch(0.95 0.04 15)`            |
| teal   | `oklch(0.6 0.12 195)`        | `oklch(0.94 0.04 195)`           |

### Dark theme

Deep neutral with a subtle cool tint. Same category families, brighter inks against
darker backgrounds.

| Token            | Value                         |
|------------------|-------------------------------|
| `--background`   | `oklch(0.145 0.003 264)`      |
| `--surface`      | `oklch(0.185 0.004 264)`      |
| `--tile`         | `oklch(0.225 0.005 264)`      |
| `--foreground`   | `oklch(0.97 0 0)`             |
| `--border`       | `oklch(1 0 0 / 8%)`           |
| `--primary`      | `oklch(0.97 0 0)` (inverted)  |

> See `src/styles.css` for the complete palette including chart colors, sidebar tokens,
> and dark-mode category overrides.

---

## 4. Typography

- **Family**: Inter, weights 400 / 500 / 600 / 700.
- **Loading**: Google Fonts with `display=swap`. No 800 weight (drop for performance).
- **Numerals**: tabular for tables and timestamps (`font-variant-numeric: tabular-nums`).

| Style          | Class / size                                        | Use                                |
|----------------|-----------------------------------------------------|------------------------------------|
| Display H1     | `text-3xl sm:text-4xl md:text-[44px]` `font-semibold` `leading-[1.05]` `tracking-tight` | Dashboard greeting, hero |
| Page H1        | `text-3xl font-semibold tracking-tight text-ink`    | Standard page title                |
| Section title  | `text-base font-semibold` or `text-sm font-medium`  | Card headers                       |
| Eyebrow        | `text-xs font-medium uppercase tracking-[0.08em] text-ink-muted` | Above H1               |
| Body           | `text-sm text-foreground`                           | Default body                       |
| Body muted     | `text-sm text-ink-muted`                            | Subtitles, descriptions            |
| Caption        | `text-xs text-ink-muted`                            | Timestamps, helper                 |
| Mini caption   | `text-[11px] text-ink-muted`                        | Tile descriptions                  |

---

## 5. Spacing, radii, shadows, motion

### Spacing scale

Tailwind defaults. Layout norms:
- Page container: `mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10`
- Card padding: `p-5` (small) or `p-6` (large)
- Card gap: `gap-3` for tile grids, `gap-6` for split layouts

### Radii

- `--radius: 0.875rem` (14px) — default
- Cards: `rounded-2xl` (1rem)
- Pills / buttons: `rounded-full`
- Tile icon container: `rounded-xl` (0.75rem)

### Borders & shadows

- Borders: `border-color: var(--border)` — almost invisible but defines structure
- No drop shadows on cards. Depth comes from background contrast (`bg-card` vs `bg-background`)
- Modals: subtle backdrop only (`bg-foreground/40 backdrop-blur-sm`)

### Motion tokens

| Token            | Value                                       |
|------------------|---------------------------------------------|
| `--ease-out`     | `cubic-bezier(0.23, 1, 0.32, 1)`            |
| `--ease-in-out`  | `cubic-bezier(0.77, 0, 0.175, 1)`           |
| `--ease-drawer`  | `cubic-bezier(0.32, 0.72, 0, 1)`            |
| `--dur-1`        | `100ms` (press)                             |
| `--dur-2`        | `160ms` (hover)                             |
| `--dur-3`        | `200ms` (modal/sheet enter)                 |
| `--dur-4`        | `250ms` (drawer)                            |

**Rules**: Animate only `transform` and `opacity`. Never `transition: all`. Enter modals
from `scale(0.95)`, never `scale(0)` (no flying from corner).

---

## 6. Component inventory

For each component: **anatomy → states → file location**.

### 6.1 Sidebar (`src/components/app/shell/app-sidebar.tsx`)

- **Layout**: `width 240px` expanded, `width 64px` collapsed, full-height fixed left.
- **Mobile**: hidden by default; mounts as a `Sheet`-style drawer (off-canvas) opened
  via the topbar menu icon.
- **Anatomy**: Workspace switcher row → primary nav (Home, Projects, IBG, Funding,
  Submissions, Settings) → Admin section (admin role only) → "Invite team members"
  pinned bottom card.
- **States**: default, hover (`bg-surface`), active (`bg-tile font-medium`), collapsed
  (icon-only with tooltip on hover).
- **Persistence**: collapsed state stored in `localStorage` key
  `renewably:sidebar-collapsed:v1`.

### 6.2 TopBar (`src/components/app/shell/top-bar.tsx`)

- **Anatomy**: sidebar toggle (mobile menu / desktop collapse) · Breadcrumbs · spacer ·
  NotificationsPopover · ProfilePopover.
- **Height**: `h-14`. **Border**: bottom only.
- **Backdrop blur** on scroll (`bg-background/90 backdrop-blur`).

### 6.3 NotificationsPopover (`shell/notifications-popover.tsx`)

- Opens a right-aligned panel ~360px wide.
- Cards have an eyebrow ("New", "Update"), gradient hero band, title, body, relative
  timestamp.
- Empty state: "You're all caught up" with check icon.

### 6.4 ProfilePopover (`shell/profile-popover.tsx`)

- Card-style menu: avatar + name row → Workspace row with swap icon → Settings ·
  Subscription (hidden if admin) · Theme · Sign out.

### 6.5 PageHeader (`components/app/page-header.tsx`)

- **Anatomy**: eyebrow (uppercase tracked) → H1 → subtitle → optional actions slot
  (right-aligned on desktop, below H1 on mobile).

### 6.6 StatePill (`components/app/state-pill.tsx`)

- Rounded-full chip, 11px text, semibold, pseudo-icon dot in matching color.
- Each state has `{ label, ink, bg }` defined in registries: `JOB_STATES`,
  `IBG_STATES`, `FUNDING_STATES`, `SUBMISSION_STATES`, `ONBOARDING_STATES`,
  `AMENDMENT_STATES`, `RECORD_STATES`.

### 6.7 DataTable (`components/app/data-table.tsx`)

- Generic `<table>` with surface header (`bg-surface/40`), hover row (`bg-surface/60`),
  bottom borders only, last row borderless.

### 6.8 SectionCard (`components/app/section-card.tsx`)

- `rounded-2xl border bg-card p-5` with header (`text-sm font-medium`) + body slot.

### 6.9 AuditTimeline (`components/app/audit-timeline.tsx`)

- Right-rail card listing audit events for an entity.
- Each event: actor (bold) → action → optional detail → relative time.
- Empty state: "No activity yet."

### 6.10 FilterPills (`components/app/filter-pills.tsx`)

- Horizontal scrollable row of rounded-full chips. Selected: `bg-foreground text-background`.
  Each chip optionally shows a count badge.

### 6.11 EmptyState (`components/app/empty-state.tsx`)

- Centered: large icon in `bg-tile` circle → title → body → optional CTA.

### 6.12 LockedCard (`components/app/locked-card.tsx`)

- Inline banner with lock icon, single-line message, "Request access" pill on right.

### 6.13 Dialog & Sheet (`components/ui/dialog.tsx`, `sheet.tsx`)

- **Modal entry**: center-anchored fade + zoom from `scale(0.95)` to `scale(1)`,
  duration `var(--dur-3)`.
- **Sheet**: slides from right with `var(--ease-drawer)`.
- **Overlay**: `bg-foreground/40 backdrop-blur-sm`.

### 6.14 Buttons

- **Primary pill**: `bg-foreground text-background rounded-full px-4 py-2 text-sm font-medium`
- **Secondary pill**: `border bg-background text-foreground rounded-full px-4 py-2`
- **Ghost icon**: `size-8 rounded-lg text-ink-muted hover:bg-surface hover:text-foreground`
- All interactive elements get the `.press` utility class:
  `transition-transform active:scale-[0.97]` (duration 100ms).

---

## 7. Page specifications

### 7.1 Dashboard (`/dashboard`)

- **Hero**: workspace eyebrow → "Good {morning|afternoon|evening}, {firstName}" giant H1.
- **Body**: 5 distinct compositions branched on role (`AdminDash`, `OperatorDash`,
  `AccessDash`, `OperateDash`, `ReadonlyDash`).
- **Tile grid**: 6 large illustration tiles (148px tall), each with colored icon
  square, label, mini description.
- **Section panels**: 1 or 2-column grid below tiles for queues / activity / stats.
- **Empty state**: friendly inline rows ("No accounts waiting").

### 7.2 IBG repository (`/ibg/repository`)

- PageHeader → FilterPills (state) + search → DataTable.
- Row: `ref · customer · property · measure · issued date · StatePill`.
- Click → `/ibg/$id`.

### 7.3 IBG detail (`/ibg/$id`)

- Back link → eyebrow ("IBG") → H1 (ref) → subtitle (customer · property · measure).
- Right of header: large StatePill.
- Two-column body: meta card (left) + AuditTimeline (right rail, 320px).
- Action buttons gated: Download (always when issued), Request amendment (Operate
  only, only `state === "issued"`, only current calendar month), Cancel (Operate
  only, current calendar month).

### 7.4 Funding Match Hub (`/funding/match`)

- Cards in 2-column grid. Each card: scheme icon → name → region → score ring (3 tones:
  green >80, amber 50-80, muted ≤50) → description → matched-measures chips → state
  pill (active match / opportunity / no match) → "Start funding project" CTA.

### 7.5 Permissions (`/admin/permissions`)

- **Tabs**: Library · Presets · Requests · Assigned.
- **Library**: list of capabilities grouped by area; each row has Assign button
  opening a user-search dialog.
- **Presets**: bundle of capabilities. Card with included permissions chip-list and
  Assign action.
- **Requests**: pending PermissionRequest objects with Approve / Reject (logs to
  audit, updates user's permissions on approve).

### 7.6 Submission detail (`/submissions/$id`)

- Back link → eyebrow → H1 (ref) → subtitle (scheme + submitted date) → StatePill.
- **Awaiting-info banner** (amber) when applicable.
- Linked-records card (Funding project, Job, Scheme, State).
- Actions card: Download snapshot (always) + Upload additional info (only enabled
  when `state === "awaiting-information"`; tooltip explains).
- Right rail: AuditTimeline.

### 7.7 Onboarding wizard (`/onboarding`)

- 6 stages displayed as a stepper at top: Sign up → Verify → Company →
  Measures → Accreditation → Payment → Review (Access tier skips Payment).
- Each stage shows correct state pill (`in-progress`, `awaiting-verification`,
  `blocked`, etc.).
- Progress persists to `localStorage`.

> Every other route follows the same shell: PageHeader → optional FilterPills →
> DataTable / cards / form. Detail pages all use the back link + eyebrow + H1 + StatePill
> + 2-column body + AuditTimeline pattern.

---

## 8. State machines

### 8.1 IBG (12 states)

```
draft → initiated → awaiting-validation → incomplete ⤴ (back to initiated)
                                       → validated → processing → ready-for-issue
                                                                → issued → amended (admin-approved correction)
                                                                        → superseded (replaced by new IBG)
                                                                        → cancelled (only same calendar month)
                                                                        → archived (after retention window)
```

| From state          | Can transition to                                | Who                |
|---------------------|--------------------------------------------------|--------------------|
| draft               | initiated                                        | system on submit   |
| initiated           | awaiting-validation, incomplete                  | system             |
| awaiting-validation | validated, incomplete                            | admin / system     |
| incomplete          | initiated                                        | issuer             |
| validated           | processing                                       | system             |
| processing          | ready-for-issue                                  | system             |
| ready-for-issue     | issued                                           | system             |
| issued              | amended, superseded, cancelled, archived         | admin / Operate ¹  |
| amended             | issued (after admin approves)                    | admin              |

¹ Operate-tier can only request amendment / cancel within the current calendar month.

### 8.2 Job (9 states)

`draft → created → in-progress → awaiting-information → under-validation →
{blocked | completed} → closed → cancelled → archived`

### 8.3 Funding tracking

`incomplete → in-progress → evidence-required → under-review → {returned, validated} →
ready-for-submission → submitted`

### 8.4 Submission

`submitted → under-review → {awaiting-information ⇄ under-review, accepted, rejected,
withdrawn}`

### 8.5 Onboarding

`in-progress → awaiting-verification → awaiting-review → ready-for-activation →
{activated | blocked}`

---

## 9. Permission model

- **Permissions** are flat strings, e.g. `customers.read`, `ibg.repository.read`,
  `funding.projects.write`. The full catalogue lives in `src/lib/rbac.ts`.
- **Library** = the catalogue, browsable in `/admin/permissions`.
- **Presets** = named bundles (e.g. "Operations Lead", "Funding Coordinator") that
  group several permissions.
- **Assignment**: Admin opens Library or Presets → clicks **Assign** → picks user(s)
  in a search dialog → confirms. The user's `permissions[]` array is updated.
- **Request flow**: Operator hits a locked page → "Request access" → creates a
  `PermissionRequest` with reason → appears in `/admin/permissions` Requests tab →
  Admin approves (auto-grants permission) or rejects.
- `can(permissions, perm)` is the single check used everywhere (`src/lib/rbac.ts`).

---

## 10. Interaction & animation rules

- **`.press` utility**: every clickable element. `active:scale-[0.97]` over 100ms.
- **Hover**: `transition-colors duration-160`. Surfaces darken to `bg-surface`.
- **Modal enter**: 200ms, center-anchored, fade + zoom from 0.95 to 1. **Never** fly
  in from a corner.
- **Sheet enter**: 250ms, slide from right with `--ease-drawer`.
- **Toasts (sonner)**: top-right, 3s default, `success` / `error` / `info` variants.
- **Hover-preload**: `<Link>` preloads route data on `mouseenter` (TanStack
  `defaultPreload: "intent"`, stale time 30s).
- **Optimistic UI**: mock store mutations are synchronous; UI updates the same tick.

---

## 11. Responsive behaviour

| Breakpoint | Width   | Layout change                                       |
|------------|---------|-----------------------------------------------------|
| `<sm`      | <640px  | Single column, sidebar becomes drawer, padding `px-4` |
| `sm`       | ≥640px  | 2-column tile grids, search inputs widen            |
| `md`       | ≥768px  | Sidebar visible (collapsible), padding `px-8 py-10` |
| `lg`       | ≥1024px | 6-column tile grid, 2-column dashboard panels       |
| `xl`       | ≥1280px | Container max width 1200px, content centered        |

**Mobile sidebar**: Hamburger in topbar opens a left-side `Sheet` containing the same
nav. Backdrop closes it. ESC closes it. Auto-closes on route change.

**Tables**: collapse to stacked cards below `sm`. Horizontal scroll fallback for very
wide tables (e.g. audit log).

---

## 12. Mock data shape

Reproduced verbatim from `src/lib/mock/types.ts`:

```ts
export type RecordStatus = "draft" | "active" | "inactive" | "archived";

export type JobState =
  | "draft" | "created" | "in-progress" | "awaiting-information"
  | "under-validation" | "blocked" | "completed" | "closed"
  | "cancelled" | "archived";

export type IbgState =
  | "draft" | "initiated" | "awaiting-validation" | "incomplete"
  | "validated" | "processing" | "ready-for-issue" | "issued"
  | "amended" | "superseded" | "cancelled" | "archived";

export type FundingState =
  | "incomplete" | "in-progress" | "evidence-required" | "under-review"
  | "returned" | "validated" | "ready-for-submission" | "submitted";

export type SubmissionState =
  | "submitted" | "under-review" | "awaiting-information"
  | "accepted" | "rejected" | "withdrawn";

export type AmendmentState = "pending" | "approved" | "rejected";

export type OnboardingApplicationState =
  | "in-progress" | "awaiting-verification" | "awaiting-review"
  | "ready-for-activation" | "blocked" | "activated";

export type Customer = {
  id: string; ref: string; name: string; email: string; phone: string;
  org?: string; status: RecordStatus; createdAt: number;
};

export type Property = {
  id: string; customerId: string; address: string; postcode: string;
  uprn?: string; epc?: string; duplicateFlag?: boolean;
  status: RecordStatus; createdAt: number;
};

export type Job = {
  id: string; ref: string; customerId: string; propertyId: string;
  measure: string; owner: string; state: JobState;
  startDate: string; createdAt: number;
};

export type IBG = {
  id: string; ref: string;
  customerId?: string; propertyId?: string; jobId?: string;
  customerName: string; propertyAddress: string;
  measure: string; policyType: string;
  state: IbgState; issuedAt?: number; createdAt: number; issuedBy: string;
};

export type FundingProject = {
  id: string; ref: string; jobId: string; scheme: string; measure: string;
  state: FundingState; createdAt: number;
  evidence: { id: string; name: string; category: string; uploadedAt: number }[];
};

export type Submission = {
  id: string; ref: string; fundingProjectId: string; jobId: string;
  scheme: string; state: SubmissionState; submittedAt: number;
};

export type AuditEvent = {
  id: string;
  entityType: "customer" | "property" | "job" | "ibg" | "funding"
            | "submission" | "user" | "amendment";
  entityId: string; actor: string; action: string;
  detail?: string; at: number;
};

export type ManagedUser = {
  id: string; name: string; email: string;
  role: "admin" | "operator" | "installer-access" | "installer-operate" | "readonly";
  status: "invited" | "pending" | "active" | "suspended" | "deactivated" | "banned";
  permissions: string[]; invitedAt: number; lastActive?: number; banReason?: string;
};

export type PermissionRequest = {
  id: string; userId: string; permission: string; reason: string;
  state: "pending" | "approved" | "rejected";
  requestedAt: number; decidedAt?: number; decidedBy?: string;
};

export type Integration = {
  key: "zapier" | "hubspot" | "slack" | "salesforce" | "webhooks" | "make";
  name: string; category: "Automation" | "CRM" | "Comms" | "Developer";
  description: string; connected: boolean;
  account?: string; connectedAt?: number;
};
```

---

## 13. Source code index

The implementation is small enough that an AI rebuilder can reproduce it from this
repo directly. Below is the **file-by-file index** with each file's purpose. To
replicate:

1. Scaffold a TanStack Start v1 project: `bunx create-tsrouter-app my-app --template start`.
2. Install deps: `bun add lucide-react sonner zod` plus shadcn/ui primitives.
3. Copy `src/styles.css` (the design tokens block) verbatim.
4. Recreate each file below, using the same paths.

### Shell & layout

| Path                                             | Purpose                                       |
|--------------------------------------------------|-----------------------------------------------|
| `src/router.tsx`                                 | Router instance, error boundary, preload tuning |
| `src/routes/__root.tsx`                          | HTML shell, head meta, providers              |
| `src/routes/_authed.tsx`                         | Authenticated layout: sidebar + topbar + outlet |
| `src/components/app/shell/sidebar-context.tsx`   | Collapsed/mobile drawer state                 |
| `src/components/app/shell/app-sidebar.tsx`       | Collapsible sidebar (desktop + drawer mobile) |
| `src/components/app/shell/top-bar.tsx`           | Top bar with breadcrumbs + popovers           |
| `src/components/app/shell/breadcrumbs.tsx`       | Route-derived breadcrumbs                     |
| `src/components/app/shell/notifications-popover.tsx` | Notifications panel                       |
| `src/components/app/shell/profile-popover.tsx`   | Profile menu                                  |
| `src/components/app/shell/workspace-switcher.tsx`| Workspace picker                              |

### App composites

| Path                                       | Purpose                              |
|--------------------------------------------|--------------------------------------|
| `src/components/app/page-header.tsx`       | Eyebrow + H1 + subtitle + actions    |
| `src/components/app/state-pill.tsx`        | All state chip registries            |
| `src/components/app/data-table.tsx`        | Generic record table                 |
| `src/components/app/section-card.tsx`      | Card with header + body              |
| `src/components/app/audit-timeline.tsx`    | Right-rail audit log                 |
| `src/components/app/filter-pills.tsx`      | State filter chip row                |
| `src/components/app/empty-state.tsx`       | Empty-data placeholder               |
| `src/components/app/locked-card.tsx`       | "Request access" inline banner       |
| `src/components/app/dev-switcher.tsx`      | Floating role switcher (dev only)    |
| `src/components/app/coming-soon.tsx`       | Placeholder for stub pages           |

### Library

| Path                                  | Purpose                                        |
|---------------------------------------|------------------------------------------------|
| `src/lib/auth-context.tsx`            | Mock auth provider (resumable)                 |
| `src/lib/dev-role.tsx`                | Active role + permission state                 |
| `src/lib/rbac.ts`                     | Permission catalogue + `can()` check           |
| `src/lib/mock/types.ts`               | All TypeScript types                           |
| `src/lib/mock/seed.ts`                | Initial seed data                              |
| `src/lib/mock/store.tsx`              | Lazy in-memory store + `localStorage` persist  |
| `src/lib/mock/queries.ts`             | Typed find/filter helpers                      |
| `src/lib/use-hydrated.ts`             | SSR-safe hydration hook                        |
| `src/lib/utils.ts`                    | `cn()` + small helpers                         |

### Routes (file-based)

Every file under `src/routes/_authed.*.tsx` corresponds 1:1 to a sitemap node in
section 2. They follow the page-spec patterns in section 7. Auth routes
(`sign-in`, `sign-up`, `reset-password`, `pricing`) live at the top level under
`src/routes/`.

### Fonts & assets

- Inter loaded via Google Fonts CDN (`<link rel="stylesheet">` in
  `__root.tsx`). To self-host, install `@fontsource-variable/inter` and import in
  `styles.css`.
- No image assets shipped. Tile illustrations are pure CSS (colored rounded square +
  lucide icon).

---

## Appendix A — Common utility classes

| Class             | Purpose                                                |
|-------------------|--------------------------------------------------------|
| `.press`          | `active:scale-[0.97] transition-transform duration-100`|
| `.tile`           | `transition-colors hover:bg-surface`                   |
| `.stagger-in`     | Children fade-in with index delay (defined in CSS)     |

## Appendix B — Test checklist for parity

When rebuilding, verify in this order:

1. `/dashboard` Admin: 6 quick-action tiles + 2 queue panels + activity feed.
2. `/dashboard` Access: 3 tiles + Recent IBGs + Upgrade card.
3. `/ibg/repository`: state filter pills + search + clickable rows.
4. `/ibg/$id`: state-gated action buttons (Download enabled when issued, Request
   amendment disabled outside current calendar month).
5. `/funding/match`: score rings render in 3 tones; "Start funding project" links to
   funding list.
6. `/admin/permissions`: 4 tabs, Assign dialog opens centered (not from corner),
   Request approval grants permission to user.
7. `/submissions/$id`: Upload-info button is disabled unless `awaiting-information`.
8. Sidebar: collapses on desktop, opens as drawer on mobile, persists across reload.
9. Dark mode: toggle via Profile → Theme; verify all category accents survive.
10. Modal entry: scale from 0.95 to 1 in 200ms, never from a corner.

---

_End of specification. Update version + date when changing tokens, components, or
state machines._

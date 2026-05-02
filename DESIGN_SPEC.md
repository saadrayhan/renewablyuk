# Renewably UK — Design & Development Specification
*Self-contained reproduction document. Generated from the live codebase. Every value, file, and prompt below is exact.*

---
## Section 1 — Project Overview

**Product**: Renewably UK — an internal operations platform for installers and the central admin team running ECO4 / GBIS / WHF energy-efficiency funding submissions across the United Kingdom. It manages customers, properties, jobs, IBG (Installation Booking Grant) records, funding match-making, submission packs, and the audit/compliance trail behind every payout.

**Target user**:
- **Admin** (Renewably staff): full access; reviews submissions, manages installer accounts, approves IBG amendments, configures funder rules, runs audit reports.
- **Installer-Operate** (paying installer org): runs the day-to-day funnel — adds customers/properties/jobs, raises IBGs, builds submission packs, tracks funding projects.
- **Operator** (delegated installer staff): granular per-permission access scoped by an admin (read jobs, write IBGs, etc.).
- **Read-only** (auditor / observer): browse-only access to selected modules, useful for compliance reviews and demo walkthroughs.

**Core screens / routes**:
- Public marketing & auth: `/`, `/pricing`, `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
- Onboarding: `/onboarding`
- Workspace shell (every route below sits inside `/_authed`): top bar, collapsible sidebar, command palette
- Dashboard: `/dashboard`
- Customers: `/customers`, `/customers/new`, `/customers/$id`
- Properties: `/properties`, `/properties/$id`
- Jobs: `/jobs`, `/jobs/new`, `/jobs/$id`
- IBG: `/ibg/new`, `/ibg/$id`, `/ibg/$id/amendment`, `/ibg/history`, `/ibg/repository`
- Submissions: `/submissions`, `/submissions/$id`
- Funding: `/funding`, `/funding/match`, `/funding/$id`, `/funding/$id/tracking`
- Projects (read-only roll-up): `/projects`
- Admin: `/admin/users`, `/admin/users/$id`, `/admin/permissions`, `/admin/amendments`, `/admin/audit`, `/admin/activity`, `/admin/config`, `/admin/onboarding`
- Settings: `/settings/profile`, `/settings/security`, `/settings/access`, `/settings/notifications`, `/settings/subscription`, `/settings/integrations`, `/settings/measures`

**Primary interactions**:
- Wizard-style IBG creation (multi-step) with inline validation and an autosave indicator.
- Drag-free funding match: Match Hub recommends funder × measure combos; clicking "Start funding project" instantiates a `FundingProject`.
- Slide-over Sheets for amendment review, invites, and detail edits — never full-page modals for short tasks.
- Command palette (⌘K / Ctrl-K) for instant navigation and entity search.
- Role-based gating: every route checks `can()` / `canAny()`; restricted areas render the `LockedCard` rather than redirecting, so users always see *why* they cannot enter.
- Toast feedback (Sonner, top-right) on every mutation; never silent.
- Dev role switcher (bottom-left, dev-only) for instant role hopping in demos.

---
## Section 2 — Design System (exact values)

The single source of truth is `src/styles.css`. All tokens below are pulled directly from that file.

### Typography

- **Font family (sans + display)**: `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
  Inter is loaded via system fallback chain — if you self-host, use Inter Variable. No serif anywhere.
- **Mono** (monospace fallback for IBG refs / IDs): browser default monospace stack via Tailwind's `font-mono`.

| Role | Class composition | Effective size / weight | Line-height | Tracking |
|---|---|---|---|---|
| Display H1 (page hero) | `text-3xl font-semibold tracking-tight text-ink` | 30px / 600 | 1.2 | `-0.01em` (`tracking-tight`) |
| Section H2 | `text-xl font-semibold tracking-tight text-ink` | 20px / 600 | 1.3 | `-0.01em` |
| Section H3 / card title | `text-sm font-medium text-foreground` | 14px / 500 | 1.45 | normal |
| Eyebrow / overline | `text-xs font-medium uppercase tracking-[0.08em] text-ink-muted` | 12px / 500 / UPPERCASE | 1.4 | `0.08em` |
| Body | `text-sm text-foreground` | 14px / 400 | 1.5 | normal |
| Body small / caption | `text-xs text-ink-muted` | 12px / 400 | 1.4 | normal |
| Label | `text-xs font-medium text-ink-muted` | 12px / 500 | 1.4 | normal |
| Pill / badge | `text-[10px] font-medium uppercase tracking-[0.06em]` | 10px / 500 | 1 | `0.06em` |
| Mono ref | `font-mono text-[11px]` | 11px / 400 | 1.4 | normal |

### Colors (light mode — light-only product)

Stored as `oklch(...)` CSS variables. Hex equivalents below are perceptually correct conversions for designers needing absolute values.

| Token | OKLCH | Hex (≈) | Role |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `#FFFFFF` | Page canvas |
| `--surface` | `oklch(0.985 0 0)` | `#FAFAFA` | Cards / panels above canvas |
| `--tile` | `oklch(0.965 0.003 250)` | `#F4F4F5` | Quiet surfaces (icon tiles, chips) |
| `--foreground` | `oklch(0.16 0 0)` | `#1A1A1A` | Body text |
| `--ink` | `oklch(0.13 0 0)` | `#0F0F0F` | Headings |
| `--ink-muted` | `oklch(0.55 0 0)` | `#878787` | Secondary text |
| `--primary` | `oklch(0.16 0 0)` | `#1A1A1A` | Primary action (black pill) |
| `--primary-foreground` | `oklch(0.99 0 0)` | `#FCFCFC` | Text on primary |
| `--secondary` | `oklch(0.965 0.003 250)` | `#F4F4F5` | Secondary action surface |
| `--muted` | (matches tile) | `#F4F4F5` | Muted surface |
| `--accent` | (matches tile) | `#F4F4F5` | Hover bg |
| `--destructive` | rose family (cat-rose) | `#E11D48` | Errors / destructive actions |
| `--border` | `oklch(0.92 0 0)` | `#EAEAEA` | 1px hairlines |
| `--input` | matches border | `#EAEAEA` | Inputs |
| `--ring` | matches `--primary` | `#1A1A1A` | Focus ring |
| `--brand` | `oklch(0.62 0.19 145)` | `#2DA84A` | Renewably green |
| `--cat-green` | green icon | `#16A34A` | Eligible / success |
| `--cat-green-bg` | green soft tint | `#DCFCE7` | Success surface |
| `--cat-blue` | blue icon | `#2563EB` | Information |
| `--cat-blue-bg` | blue soft tint | `#DBEAFE` | Info surface |
| `--cat-amber` | amber icon | `#D97706` | Warning |
| `--cat-amber-bg` | amber soft tint | `#FEF3C7` | Warning surface |
| `--cat-rose` | rose icon | `#E11D48` | Error / destructive |
| `--cat-rose-bg` | rose soft tint | `#FFE4E6` | Error surface |
| `--cat-purple` | purple icon | `#7C3AED` | IBG / wizard accent |
| `--cat-purple-bg` | purple soft tint | `#EDE9FE` | Wizard surface |
| `--cat-teal` | teal icon | `#0D9488` | Funding accent |
| `--cat-teal-bg` | teal soft tint | `#CCFBF1` | Funding surface |

Sidebar tokens (`--sidebar`, `--sidebar-foreground`, `--sidebar-border`, etc.) mirror canvas tokens — the sidebar uses the same white canvas as the main content; separation is purely a 1px right border.

**Dark mode**: NOT shipped. The product is light-only by design (matches the ElevenLabs reference brief). All `.dark` overrides in the file are scaffolded but unused.

### Spacing

- Base unit: **4px** (Tailwind default), 8pt-aligned at every standard rhythm point.
- Page shell padding: `px-4 py-6` mobile, `px-8 py-8` from `md` up. Max content width `1280px` for list/data routes, `1100px` for settings.
- Card padding: `p-5` (20px) standard, `p-8` (32px) for major panels.
- Stack gaps: `gap-2` (8px) within pills, `gap-3` (12px) within rows, `gap-5` (20px) between cards, `gap-8` (32px) between sections.
- Form field stack: `space-y-1.5` between label and input, `space-y-4` between fields.

### Border & Shadow

- Border width: `1px` everywhere (`border` Tailwind default), color `--border` (`#EAEAEA`).
- Border radius scale (from `--radius: 0.625rem`):
  - `sm` 6px, `md` 8px, `lg` 10px, `xl` 14px, `2xl` 18px, `3xl` 22px, `4xl` 26px.
- Pills: `rounded-full`.
- Cards: `rounded-2xl` (18px).
- Inputs / buttons: `rounded-lg` (10px) for inline controls, `rounded-full` for top-level CTAs.
- Shadows: deliberately minimal. Only the command palette and Sheets carry a shadow (shadcn defaults). Cards use border + surface elevation, **never** drop shadows.

### Iconography

- Library: **lucide-react** (the icon set declared in `package.json`).
- Default icon size: `size-4` (16px) inline, `size-5` (20px) in tile contexts, `size-3.5` (14px) inside small pills.
- Stroke width: lucide default (`1.5`). Color always inherits `currentColor`.

### Motion

Defined in `src/styles.css` (do not change):

- Easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`, `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`.
- Durations: `--dur-fast: 120ms`, `--dur-base: 180ms`, `--dur-slow: 260ms`.
- Rule: animate **only** `transform` and `opacity`. Never `transition: all`. Enter from `scale(0.95)`, never `scale(0)`.
- Route transitions: `animate-in fade-in-0 slide-in-from-bottom-1 duration-200` applied in `_authed.tsx`.

---
## Section 3 — Component Inventory

All custom components live under `src/components/app/`. shadcn primitives live under `src/components/ui/` and are configured via `components.json`. Every visual token referenced below is from Section 2.

### Shell components (`src/components/app/shell/`)

#### `AppSidebar` (`shell/app-sidebar.tsx`)
- **Purpose**: persistent left nav, collapsible to icon rail; mobile becomes off-canvas drawer driven by `SidebarProvider`.
- **Variants**: `expanded` (default 240px), `collapsed` (icon-only, 60px), `mobile-drawer`.
- **Slots**: workspace switcher (top), nav groups (Customers/Jobs/IBG/Funding/Admin/Settings), `InviteCard` (admin only, expanded only), profile popover trigger (bottom).
- **Behaviour**: toggles via `useSidebarState().toggleCollapsed()` (persisted to localStorage `renewably:sidebar-collapsed:v1`).

#### `TopBar` (`shell/top-bar.tsx`)
- **Purpose**: breadcrumbs left, command-palette opener centre/right, notifications + avatar far right.
- **Sticky**: `sticky top-0 z-30 bg-background/80 backdrop-blur` — translucent on scroll.

#### `Breadcrumbs` (`shell/breadcrumbs.tsx`)
- **Purpose**: derives chain from `useRouterState().location.pathname`. Clickable parents.

#### `NotificationsPopover` (`shell/notifications-popover.tsx`)
- **Purpose**: bell icon → popover list of recent audit + system events. Empty state when none.

#### `ProfilePopover` (`shell/profile-popover.tsx`)
- **Purpose**: avatar trigger → menu with Profile, Security, My access (operator only), Subscription (installer-operate only), Sign out.

#### `WorkspaceSwitcher` (`shell/workspace-switcher.tsx`)
- **Purpose**: shows current org; for admins also reveals the role-presets shortcut.

#### `SidebarProvider` (`shell/sidebar-context.tsx`)
- See file inline — manages `collapsed` (localStorage-persisted) and `mobileOpen` state.

### Dialogs & Sheets

#### `InviteDialog` (`invite-dialog.tsx`)
- **Trigger**: sidebar `InviteCard` (admin), `/admin/users` "Invite" button.
- **Fields**: email, role (`admin` / `installer-operate` / `operator` / `readonly`), optional message.
- **Behaviour**: submit → toast success → `onOpenChange(false)`. Mock-only (no real email).

#### `TwoFactorDialog` (`two-factor-dialog.tsx`)
- **3-step wizard**: (1) scan QR, (2) enter 6-digit code, (3) backup codes shown once.
- **Persistence**: `localStorage.setItem("renewably:2fa", "true")` on success; the security page reads this on mount.
- **States**: `step=1|2|3`, `error` (invalid code), `loading` (verifying).

#### `PaymentMethodDialog` (`payment-method-dialog.tsx`)
- **Fields**: card number, expiry, CVC, postcode. Validation is pattern-only.
- **Returns**: last4 string via `onSaved(last4)` so the subscription card updates immediately.

#### `TemplateEditorDialog` (`template-editor-dialog.tsx`)
- **Purpose**: edit notification templates from `/admin/config`.
- **Variables panel**: clickable chips like `{{ibgRef}}`, `{{customerName}}` insert at cursor.

#### `AmendmentReviewSheet` (`amendment-review-sheet.tsx`)
- **Right slide-over**, width `sm:max-w-lg`.
- **Two modes**: `view` (Approve / Reject buttons) and `rejecting` (textarea + required reason).
- **Side-effect on approve**: sets the related IBG state to `amended` and pushes audit entry via `pushAudit`.

### Shared building blocks

| Component | File | Purpose | Key variants |
|---|---|---|---|
| `PageHeader` | `page-header.tsx` | Eyebrow + H1 + subtitle + right-aligned actions | `tone="default" | "warning"` |
| `SectionCard` | `section-card.tsx` | `rounded-2xl border bg-card p-5` wrapper with optional title row | — |
| `StatePill` | `state-pill.tsx` | Coloured status chip; maps domain states (e.g. `submitted`, `returned`, `paid`) to cat-* tokens | per state |
| `DataTable` | `data-table.tsx` | Headerless table primitive used by every list route. Sticky header, zebra rows off, hover row highlight `hover:bg-tile/40`. | sortable, selectable |
| `FilterPills` | `filter-pills.tsx` | Single-select pill row used above tables | active/inactive |
| `EmptyState` | `empty-state.tsx` | Icon + title + body + optional CTA | `tone` |
| `LockedCard` | `locked-card.tsx` | Permission-denied placeholder. Props: `title`, `body?`, `reason: { kind: "permission" | "plan", permission?, plan? }` | — |
| `ComingSoon` | `coming-soon.tsx` | Reserved for unbuilt routes (currently unused). | — |
| `AuditTimeline` | `audit-timeline.tsx` | Vertical timeline used on detail pages and `/admin/audit` | — |
| `UnderlineTabs` | `underline-tabs.tsx` | In-page tab strip with sliding underline indicator | — |
| `DevSwitcher` | `dev-switcher.tsx` | Bottom-left dev-only role switcher; reads/writes `useDevRole()` | — |
| `CommandPalette` | `command-palette.tsx` | ⌘K palette. Provider mounted in `_authed.tsx`. | — |

### Auth shell

#### `AuthLayout` (`src/components/auth/auth-layout.tsx`)
- **Purpose**: split layout for sign-in / sign-up / password flows. Left pane: brand panel with quote/illustration. Right pane: form card.
- **Responsive**: stacks vertically below `md`.

### shadcn primitives (`src/components/ui/*`)

The project uses the standard shadcn-new-york preset (configured in `components.json`). Files map 1:1 to shadcn components:

`accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip`.

These are stock shadcn — install with `npx shadcn@latest add <name>` if recreating from scratch. Section 5 inlines every file verbatim regardless.

### Animation summary

Every interactive surface uses the `.press` utility (defined in `styles.css`):

```
.press { transition: transform var(--dur-fast) var(--ease-out); }
.press:active { transform: scale(0.97); }
```

Route transitions: `animate-in fade-in-0 slide-in-from-bottom-1 duration-200`.
Dialog/Sheet: shadcn defaults (`duration-200` enter, `duration-150` exit).

---
## Section 4 — Screen-by-Screen Layout Spec

All authed routes share the same outer chrome from `_authed.tsx`:

```
<SidebarProvider>
  <CommandPaletteProvider>
    <div class="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main class="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div class="flex-1"><Outlet /> (with route transition wrapper)</div>
      </main>
    </div>
  </CommandPaletteProvider>
</SidebarProvider>
```

Inside each route, the standard content shell is:

```
<div class="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
  <PageHeader ... />
  <... section content ...>
</div>
```

Settings routes use `max-w-[1100px]`. Funding/IBG detail routes use a 2-column grid `md:grid-cols-[1fr_320px]` (main content + side rail).

### Public

#### `/` (`routes/index.tsx`)
Marketing landing page. Hero (left text, right product mock) → feature grid (3-up) → social proof → CTA band → footer.

#### `/pricing`
Three plan cards in a `md:grid-cols-3` row. Each card: name, price, feature list, primary CTA.

#### `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
All wrapped in `AuthLayout`. Card width `max-w-[420px]`. Single column form with email + password. Google OAuth button below divider.

### Onboarding

#### `/onboarding`
Stepped intro (workspace name, role, invite teammates). Linear progress bar at top. Final step routes to `/dashboard`.

### Workspace (`_authed`)

#### `/dashboard`
- Welcome row (greeting + role pill).
- Read-only banner if `permissions` are restricted (lists which areas the user *can* browse).
- Quick stats grid: 4 KPI tiles (`md:grid-cols-4`).
- "Pick up where you left off" recent items list (`md:grid-cols-2`).
- Activity feed (uses `AuditTimeline`).

#### `/customers`
List route. Header → filter pills → `DataTable` with columns: Name, Postcode, Properties, Jobs, Last activity.
**Empty state** when zero matches: "No customers yet — add one to start a job".
**Locked**: when `!can(permissions, "customers.read")` → `LockedCard`.

#### `/customers/new`
Single-column form (name, address, contact, tenure). Sticky bottom action bar with Save/Cancel.

#### `/customers/$id`
Two-column shell. Header tabs: Overview / Properties / Jobs / Funding / Audit. Each tab swaps the right-hand panel.

#### `/properties`, `/properties/$id`
Same layout pattern as customers. Property detail shows EPC summary, measures installed, linked jobs.

#### `/jobs`, `/jobs/new`, `/jobs/$id`
Job detail uses tabs: Overview / Measures / IBG / Submission / Audit.

#### `/ibg/new`
Wizard. Top progress bar. Sections: Property check → Measures → Eligibility → Customer details → Review. Each step is a SectionCard with inline validation. "Save draft" autosaves to mock store.

#### `/ibg/$id`
Read-only detail with state pill, key facts grid, history (timeline), and "Request amendment" button (opens `/ibg/$id/amendment`).

#### `/ibg/$id/amendment`
Form to propose a field change. Submits an `AmendmentRequest` to admin queue.

#### `/ibg/history`, `/ibg/repository`
History = chronological list. Repository = filterable archive grouped by funder.

#### `/submissions`
List of submission packs. Columns: Ref, Customer, State, Funder, Updated. Locked unless `submissions.read`.

#### `/submissions/$id`
Multi-section page: Pack contents (file list with previews), Validation report, History timeline. Action bar: Submit / Withdraw / Request amendment depending on state.

#### `/funding`
Funder directory with pill filters. Cards show funder, scheme, available cap.

#### `/funding/match`
Match Hub. Two columns: filters left (postcode, measure, EPC band), recommended combos right. "Start funding project" creates a `FundingProject` and routes to `/funding/$id`.

#### `/funding/$id`
Funding project detail. Readiness checklist (Internal review marked incomplete when state is `returned`). Documents, milestones, payout tracker.

#### `/funding/$id/tracking`
Milestone timeline with payout amounts and status.

#### `/projects`
Read-only roll-up across customers/properties/jobs. Locked unless any of `customers.read`, `jobs.read`, `properties.read`.

#### `/admin/users`
Operator/installer roster. Row click → `/admin/users/$id`.

#### `/admin/users/$id`
Two-pane: left = user summary; right = "Granted" vs "Available" permission split. Buttons: Grant, Revoke, Reset to role defaults, Clear all.

#### `/admin/permissions`
Permission Library — DO NOT MODIFY. Catalogues every permission key + bundles them into operator presets.

#### `/admin/amendments`
Queue of pending amendment requests. Row → Review opens `AmendmentReviewSheet`.

#### `/admin/audit`, `/admin/activity`
Filterable audit log + live activity feed. `AuditTimeline` is the body.

#### `/admin/config`
System configuration. Tabs/sections: Notification templates (Edit → `TemplateEditorDialog`), funder rules, region settings.

#### `/admin/onboarding`
Admin view of onboarding flow status across users.

### Settings (`max-w-[1100px]`, sidebar-on-left layout)

Layout from `_authed.settings.tsx`: left vertical nav (`220px`), right outlet. Items (filtered by role): Profile, Security, My access (operator/readonly only), Notifications, Subscription (installer-operate only), Integrations (admin or installer-operate), Measures.

#### `/settings/profile`
Cards: identity, 2FA status (links to `/settings/security`), workspace.

#### `/settings/security`
Two cards: 2FA toggle (opens `TwoFactorDialog`) and Active sessions list (revoke single / revoke all).

#### `/settings/access`
Operator-only. Lists granted permissions, available (not granted) permissions, and pending requests.

#### `/settings/notifications`
Per-channel toggles (email, in-app) per event category.

#### `/settings/subscription`
State pill (active / payment-failed / cancelled). Plan summary, last payment, "Update payment method" → `PaymentMethodDialog`.

#### `/settings/integrations`
DO NOT MODIFY — connectors list (mock).

#### `/settings/measures`
Approved measures list maintained by the installer org.

### Responsive breakpoints

Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. The shell collapses sidebar to icons under `lg`. Below `md` the sidebar becomes an off-canvas drawer triggered from the TopBar hamburger. Settings nav stacks above content under `md`.

### Conditional visibility rules

- Sidebar `InviteCard`: admin only AND sidebar expanded.
- Profile popover Subscription link: only when `user.role === "installer-operate"`.
- Profile popover My access link: only when `user.role === "operator" || "readonly"`.
- Settings nav items: filtered as in `_authed.settings.tsx` `items.filter((i) => i.show)`.
- Read-only dashboard banner: shown when the user has none of the write permissions.
- All list routes: render `LockedCard` instead of body when `!can(...)`.

---
## Section 5 — Full Source Code

Every file below is reproduced verbatim. The auto-generated `src/routeTree.gen.ts` is intentionally excluded — the TanStack Router Vite plugin regenerates it on every build from the route files in `src/routes/`. The Supabase `src/integrations/supabase/types.ts` is also auto-generated from the database schema.

### 5.1 Configuration & root

--- `package.json` ---

```json
{
  "name": "tanstack_start_ts",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@cloudflare/vite-plugin": "^1.25.5",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@supabase/supabase-js": "^2.105.1",
    "@tailwindcss/vite": "^4.2.1",
    "@tanstack/react-query": "^5.83.0",
    "@tanstack/react-router": "^1.168.0",
    "@tanstack/react-start": "^1.167.14",
    "@tanstack/router-plugin": "^1.167.10",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.575.0",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.71.2",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.2.1",
    "tw-animate-css": "^1.3.4",
    "vaul": "^1.1.2",
    "vite-tsconfig-paths": "^6.0.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@lovable.dev/vite-tanstack-config": "^1.4.0",
    "@types/node": "^22.16.5",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.0.4",
    "eslint": "^9.32.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "prettier": "^3.7.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.56.1",
    "vite": "^7.3.1"
  }
}

```

--- `tsconfig.json` ---

```json
{
  "include": ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts", "eslint.config.js"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],

    /* Bundler mode */
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "noEmit": true,

    /* Linting */
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

```

--- `vite.config.ts` ---

```ts
// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig();

```

--- `wrangler.jsonc` ---

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tanstack-start-app",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
}

```

--- `components.json` ---

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "src/styles.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}

```

--- `eslint.config.js` ---

```js
import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  eslintPluginPrettier,
);

```

--- `.prettierrc` ---

```text
{
  "printWidth": 100,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}

```

--- `.prettierignore` ---

```text
node_modules
dist
.output
.vinxi
pnpm-lock.yaml
package-lock.json
routeTree.gen.ts

```

--- `bunfig.toml` ---

```toml
[install]
saveTextLockfile = false

```

--- `supabase/config.toml` ---

```toml
project_id = "gnxqldfvnvssvwdnexyw"
```

--- `src/styles.css` ---

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
  --font-display:
    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

:root {
  --radius: 0.625rem; /* tightened toward ElevenLabs proportions */

  /* Canvas */
  --background: oklch(1 0 0);                /* #FFFFFF */
  --surface:    oklch(0.985 0 0);            /* #FAFAFA */
  --tile:       oklch(0.965 0.003 250);      /* #F4F4F5 */
  --tile-foreground: oklch(0.18 0 0);

  --foreground: oklch(0.16 0 0);             /* near black */
  --ink:        oklch(0.13 0 0);             /* H1 ink */
  --ink-muted:  oklch(0.55 0 0);             /* #6B6B6B */

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

  --border: oklch(0.93 0.002 250);           /* #E5E5E5 */
  --input:  oklch(0.93 0.002 250);
  --ring:   oklch(0.55 0 0);

  /* Renewably brand green */
  --brand: oklch(0.62 0.16 152);
  --brand-foreground: oklch(0.99 0 0);

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
  }

  h1, h2, h3, h4 {
    font-family: var(--font-display);
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

--- `src/router.tsx` ---

```tsx
import { createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        {import.meta.env.DEV && error.message && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-muted p-3 text-left font-mono text-xs text-destructive">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};

```

--- `src/routes/__root.tsx` ---

```tsx
import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { DevRoleProvider } from "@/lib/dev-role";
import { DevSwitcher } from "@/components/app/dev-switcher";
import { MockStoreProvider } from "@/lib/mock/store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-semibold tracking-tight text-ink">404</h1>
        <h2 className="mt-4 text-xl font-medium text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="press inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Renewably UK — Net Zero operations platform" },
      {
        name: "description",
        content:
          "Operational and compliance platform for UK Net Zero installation companies. IBG, Jobs, Funding Match — built for installers.",
      },
      { name: "author", content: "Renewably UK" },
      { property: "og:title", content: "Renewably UK — Net Zero operations platform" },
      {
        property: "og:description",
        content:
          "Operational and compliance platform for UK Net Zero installation companies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Renewably UK — Net Zero operations platform" },
      { name: "description", content: "ElevenLab Design Hub is a design application that visualizes and structures digital product design elements." },
      { property: "og:description", content: "ElevenLab Design Hub is a design application that visualizes and structures digital product design elements." },
      { name: "twitter:description", content: "ElevenLab Design Hub is a design application that visualizes and structures digital product design elements." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f1cbee4e-ca11-437b-bbca-869d13fc943e/id-preview-ab92c4b0--251b1e68-a9f6-47bc-bcc6-89a0809d31dd.lovable.app-1777664739071.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f1cbee4e-ca11-437b-bbca-869d13fc943e/id-preview-ab92c4b0--251b1e68-a9f6-47bc-bcc6-89a0809d31dd.lovable.app-1777664739071.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <DevRoleProvider>
      <MockStoreProvider>
        <AuthProvider>
          <Outlet />
          <Toaster />
          <DevSwitcher />
        </AuthProvider>
      </MockStoreProvider>
    </DevRoleProvider>
  );
}

```

### 5.2 Library (domain core)

--- `src/lib/utils.ts` ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

--- `src/lib/use-hydrated.ts` ---

```ts
import { useEffect, useState } from "react";

/** Returns true after the first client render. SSR returns false. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

```

--- `src/lib/auth-context.tsx` ---

```tsx
/**
 * Auth context — backend disabled. Reads from DevRoleProvider so the rest
 * of the app keeps a single `useAuth()` surface.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useDevRole } from "@/lib/dev-role";
import { ROLE_META, type Role, type Permission } from "@/lib/rbac";

type MockUser = {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  role: Role;
  roleLabel: string;
};

type AuthContextValue = {
  user: MockUser;
  permissions: Permission[];
  isAdmin: boolean;
  isOperator: boolean;
  loading: false;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUser(role: Role): MockUser {
  const meta = ROLE_META[role];
  const seed: Record<Role, { fullName: string; email: string }> = {
    admin: { fullName: "Alex Reed", email: "alex@renewably.uk" },
    operator: { fullName: "Sam Patel", email: "sam@renewably.uk" },
    "installer-access": { fullName: "Jordan Hayes", email: "jordan@northwarmth.co.uk" },
    "installer-operate": { fullName: "Robin Clarke", email: "robin@evergreen-installs.co.uk" },
    readonly: { fullName: "Morgan Lee", email: "morgan@gbisfunding.org" },
  };
  const { fullName, email } = seed[role];
  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return { id: role, email, fullName, initials, role, roleLabel: meta.label };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { role, permissions } = useDevRole();
  const value = useMemo<AuthContextValue>(
    () => ({
      user: buildUser(role),
      permissions,
      isAdmin: role === "admin",
      isOperator: role === "operator",
      loading: false,
    }),
    [role, permissions],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

```

--- `src/lib/dev-role.tsx` ---

```tsx
/**
 * Dev role context — backend is disabled, so this drives the entire
 * preview. Persisted to localStorage so refreshes keep the same persona.
 *
 * Use `useDevRole()` in components, and `useAuth()` for the legacy auth
 * surface (which now reads from this context).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PERMISSIONS,
  type Permission,
  type Role,
} from "@/lib/rbac";

export type OnboardingStep =
  | "complete"
  | "signup"
  | "verify-email"
  | "company"
  | "measures"
  | "accreditation"
  | "payment"
  | "review";

export type DevRoleState = {
  role: Role;
  permissions: Permission[]; // effective set used by `can()`
  onboardingStep: OnboardingStep;
  pendingPermissionRequests: Permission[];
};

type Ctx = DevRoleState & {
  setRole: (role: Role) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  togglePermission: (p: Permission) => void;
  setPermissions: (perms: Permission[]) => void;
  requestPermission: (p: Permission) => void;
  approvePermissionRequest: (p: Permission) => void;
  reset: () => void;
};

const STORAGE_KEY = "renewably:dev-role:v2";

const DEFAULT_STATE: DevRoleState = {
  role: "installer-operate",
  permissions: DEFAULT_PERMISSIONS["installer-operate"],
  onboardingStep: "complete",
  pendingPermissionRequests: [],
};

const DevRoleContext = createContext<Ctx | null>(null);

function loadState(): DevRoleState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<DevRoleState>;
    return {
      role: parsed.role ?? DEFAULT_STATE.role,
      permissions:
        parsed.permissions ??
        DEFAULT_PERMISSIONS[parsed.role ?? DEFAULT_STATE.role],
      onboardingStep: parsed.onboardingStep ?? "complete",
      pendingPermissionRequests: parsed.pendingPermissionRequests ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function DevRoleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DevRoleState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const setRole = useCallback((role: Role) => {
    setState((s) => ({
      ...s,
      role,
      // Reset to default permissions for the role; user can edit afterwards.
      permissions: DEFAULT_PERMISSIONS[role],
      pendingPermissionRequests: [],
    }));
  }, []);

  const setOnboardingStep = useCallback((onboardingStep: OnboardingStep) => {
    setState((s) => ({ ...s, onboardingStep }));
  }, []);

  const togglePermission = useCallback((p: Permission) => {
    setState((s) => ({
      ...s,
      permissions: s.permissions.includes(p)
        ? s.permissions.filter((x) => x !== p)
        : [...s.permissions, p],
      pendingPermissionRequests: s.pendingPermissionRequests.filter(
        (x) => x !== p,
      ),
    }));
  }, []);

  const setPermissions = useCallback((permissions: Permission[]) => {
    setState((s) => ({ ...s, permissions }));
  }, []);

  const requestPermission = useCallback((p: Permission) => {
    setState((s) =>
      s.pendingPermissionRequests.includes(p) || s.permissions.includes(p)
        ? s
        : {
            ...s,
            pendingPermissionRequests: [...s.pendingPermissionRequests, p],
          },
    );
  }, []);

  const approvePermissionRequest = useCallback((p: Permission) => {
    setState((s) => ({
      ...s,
      permissions: s.permissions.includes(p)
        ? s.permissions
        : [...s.permissions, p],
      pendingPermissionRequests: s.pendingPermissionRequests.filter(
        (x) => x !== p,
      ),
    }));
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      setRole,
      setOnboardingStep,
      togglePermission,
      setPermissions,
      requestPermission,
      approvePermissionRequest,
      reset,
    }),
    [
      state,
      setRole,
      setOnboardingStep,
      togglePermission,
      setPermissions,
      requestPermission,
      approvePermissionRequest,
      reset,
    ],
  );

  return (
    <DevRoleContext.Provider value={value}>{children}</DevRoleContext.Provider>
  );
}

export function useDevRole() {
  const ctx = useContext(DevRoleContext);
  if (!ctx) throw new Error("useDevRole must be used inside DevRoleProvider");
  return ctx;
}

```

--- `src/lib/rbac.ts` ---

```ts
/**
 * Renewably UK — Role-Based Access Control
 *
 * Five role TYPES (multiple users can hold each role):
 *   - admin              Internal Renewably staff with full configuration access
 *   - operator           Internal Renewably ops staff. NO inherent permissions —
 *                        Admin assigns capabilities from the Permission Library.
 *   - installer-access   Free tier installation company user
 *   - installer-operate  Paid tier installation company user
 *   - readonly           External stakeholders (Funding Partners, Scheme
 *                        Providers, Architects, external Consultants)
 *
 * Operators differ from each other — two operators may have very different
 * permission sets. Admin grants permissions from the library, operator can
 * request additional permissions inline from any locked feature.
 */

export type Role =
  | "admin"
  | "operator"
  | "installer-access"
  | "installer-operate"
  | "readonly";

export const ROLE_META: Record<
  Role,
  { label: string; short: string; tone: string; description: string }
> = {
  admin: {
    label: "Admin",
    short: "Admin",
    tone: "purple",
    description:
      "Internal Renewably staff. Configures the platform, manages users and their permissions.",
  },
  operator: {
    label: "Operator",
    short: "Operator",
    tone: "green",
    description:
      "Internal Renewably ops. Permissions are explicitly granted by an Admin — no defaults.",
  },
  "installer-access": {
    label: "Installer · Access",
    short: "Access",
    tone: "amber",
    description:
      "Free tier installer. Standalone IBG generator + limited history.",
  },
  "installer-operate": {
    label: "Installer · Operate",
    short: "Operate",
    tone: "blue",
    description:
      "Subscribed installer. Full project record-chain, funding workflow, repository.",
  },
  readonly: {
    label: "Read-Only",
    short: "Read-Only",
    tone: "neutral",
    description:
      "External stakeholders — Funding Partners, Scheme Providers, Architects, Consultants. Full visibility, no edits.",
  },
};

/* ─── Permission catalogue ──────────────────────────────────────── */

export type Permission =
  // Projects · Customers
  | "customers.read"
  | "customers.create"
  | "customers.edit"
  | "customers.archive"
  // Projects · Properties
  | "properties.read"
  | "properties.create"
  | "properties.edit"
  // Projects · Jobs
  | "jobs.read"
  | "jobs.create"
  | "jobs.edit"
  | "jobs.assign"
  | "jobs.documents.upload"
  | "jobs.documents.delete"
  // IBG
  | "ibg.read"
  | "ibg.issue"
  | "ibg.history.full"
  | "ibg.repository.read"
  | "ibg.amendment.request"
  | "ibg.amendment.approve"
  | "ibg.cancel"
  // Submissions
  | "submissions.read"
  | "submissions.upload"
  // Funding
  | "funding.match.read"
  | "funding.projects.read"
  | "funding.projects.create"
  | "funding.evidence.upload"
  | "funding.submit"
  // Reports
  | "reports.read"
  | "reports.export"
  // Settings
  | "settings.measures.read"
  | "settings.measures.request"
  | "subscription.manage"
  // Admin · Users
  | "users.read"
  | "users.invite"
  | "users.edit"
  | "users.suspend"
  | "users.permissions.assign"
  // Admin · Compliance
  | "audit.read"
  | "audit.export"
  | "activity.read"
  // Admin · Onboarding & amendments
  | "onboarding.queue.read"
  | "onboarding.review"
  | "onboarding.activate"
  | "amendments.queue.read"
  | "amendments.review"
  // Admin · System
  | "config.read"
  | "config.edit"
  | "permissions.library.manage";

export type PermissionCategory =
  | "Projects"
  | "IBG"
  | "Submissions"
  | "Funding"
  | "Reports"
  | "Settings"
  | "Admin · Users"
  | "Admin · Compliance"
  | "Admin · Onboarding"
  | "Admin · System";

export type PermissionDef = {
  id: Permission;
  label: string;
  category: PermissionCategory;
  description: string;
};

export const PERMISSIONS: PermissionDef[] = [
  // Projects
  { id: "customers.read", label: "View customers", category: "Projects", description: "Browse the customer list and details." },
  { id: "customers.create", label: "Create customer", category: "Projects", description: "Add new customer records." },
  { id: "customers.edit", label: "Edit customer", category: "Projects", description: "Modify customer details and status." },
  { id: "customers.archive", label: "Archive customer", category: "Projects", description: "Move customers out of active workspace." },
  { id: "properties.read", label: "View properties", category: "Projects", description: "Browse linked properties." },
  { id: "properties.create", label: "Create property", category: "Projects", description: "Add a property to a customer." },
  { id: "properties.edit", label: "Edit property", category: "Projects", description: "Modify property details." },
  { id: "jobs.read", label: "View jobs", category: "Projects", description: "Browse job pipeline and detail." },
  { id: "jobs.create", label: "Create job", category: "Projects", description: "Open a new job against a property." },
  { id: "jobs.edit", label: "Edit job", category: "Projects", description: "Change job status, fields and notes." },
  { id: "jobs.assign", label: "Assign job owner", category: "Projects", description: "Re-assign a job to a different owner." },
  { id: "jobs.documents.upload", label: "Upload job documents", category: "Projects", description: "Add evidence files to a job." },
  { id: "jobs.documents.delete", label: "Delete job documents", category: "Projects", description: "Permanently remove evidence files." },
  // IBG
  { id: "ibg.read", label: "View IBGs", category: "IBG", description: "Open IBG records." },
  { id: "ibg.issue", label: "Issue IBG", category: "IBG", description: "Generate and issue a new certificate." },
  { id: "ibg.history.full", label: "Full IBG history", category: "IBG", description: "See unrestricted history (Operate equivalent)." },
  { id: "ibg.repository.read", label: "Use IBG repository", category: "IBG", description: "Access the searchable record store." },
  { id: "ibg.amendment.request", label: "Request amendment", category: "IBG", description: "Submit a correction request to admin." },
  { id: "ibg.amendment.approve", label: "Approve amendments", category: "IBG", description: "Review and approve / reject amendment requests." },
  { id: "ibg.cancel", label: "Cancel IBG (same month)", category: "IBG", description: "Cancel a recently issued IBG within its issue month." },
  // Submissions
  { id: "submissions.read", label: "View submissions", category: "Submissions", description: "Open scheme submission records." },
  { id: "submissions.upload", label: "Upload submission info", category: "Submissions", description: "Provide additional info on awaiting submissions." },
  // Funding
  { id: "funding.match.read", label: "Funding match hub", category: "Funding", description: "See matched government schemes." },
  { id: "funding.projects.read", label: "View funding projects", category: "Funding", description: "Browse funding project list and detail." },
  { id: "funding.projects.create", label: "Create funding project", category: "Funding", description: "Start a funding project from a job." },
  { id: "funding.evidence.upload", label: "Upload evidence", category: "Funding", description: "Add evidence files against a funding project." },
  { id: "funding.submit", label: "Submit to scheme", category: "Funding", description: "Submit a funding project to the scheme." },
  // Reports
  { id: "reports.read", label: "View reports", category: "Reports", description: "Access platform reports and dashboards." },
  { id: "reports.export", label: "Export reports", category: "Reports", description: "Download CSV / PDF exports." },
  // Settings
  { id: "settings.measures.read", label: "View approved measures", category: "Settings", description: "See the company's confirmed measure set." },
  { id: "settings.measures.request", label: "Request measure addition", category: "Settings", description: "Submit a new measure request to admin." },
  { id: "subscription.manage", label: "Manage subscription", category: "Settings", description: "View and update billing for the company." },
  // Admin · Users
  { id: "users.read", label: "View users", category: "Admin · Users", description: "Open the user directory." },
  { id: "users.invite", label: "Invite users", category: "Admin · Users", description: "Send invitations to new users." },
  { id: "users.edit", label: "Edit users", category: "Admin · Users", description: "Change user role and profile." },
  { id: "users.suspend", label: "Suspend / reactivate", category: "Admin · Users", description: "Suspend or reactivate accounts." },
  { id: "users.permissions.assign", label: "Assign permissions", category: "Admin · Users", description: "Grant or revoke permissions on a user." },
  // Admin · Compliance
  { id: "audit.read", label: "View audit log", category: "Admin · Compliance", description: "Browse the platform audit log." },
  { id: "audit.export", label: "Export audit log", category: "Admin · Compliance", description: "Download audit log as CSV." },
  { id: "activity.read", label: "Activity feed", category: "Admin · Compliance", description: "See real-time platform activity." },
  // Admin · Onboarding
  { id: "onboarding.queue.read", label: "Onboarding queue", category: "Admin · Onboarding", description: "See accounts in the onboarding pipeline." },
  { id: "onboarding.review", label: "Review onboarding", category: "Admin · Onboarding", description: "Review submitted onboarding info." },
  { id: "onboarding.activate", label: "Activate accounts", category: "Admin · Onboarding", description: "Move an account to active status." },
  { id: "amendments.queue.read", label: "Amendments queue", category: "Admin · Onboarding", description: "See pending IBG amendment requests." },
  { id: "amendments.review", label: "Review amendments", category: "Admin · Onboarding", description: "Approve or reject amendment requests." },
  // Admin · System
  { id: "config.read", label: "View system config", category: "Admin · System", description: "Read platform configuration." },
  { id: "config.edit", label: "Edit system config", category: "Admin · System", description: "Modify platform settings." },
  { id: "permissions.library.manage", label: "Manage permission library", category: "Admin · System", description: "Curate the catalogue of assignable permissions." },
];

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  "Projects",
  "IBG",
  "Submissions",
  "Funding",
  "Reports",
  "Settings",
  "Admin · Users",
  "Admin · Compliance",
  "Admin · Onboarding",
  "Admin · System",
];

/* ─── Operator presets (capability bundles) ─────────────────────── */

export type OperatorPreset = {
  id: string;
  label: string;
  description: string;
  permissions: Permission[];
};

export const OPERATOR_PRESETS: OperatorPreset[] = [
  {
    id: "junior-operator",
    label: "Junior Operator",
    description: "Read across the platform, create + edit project records, no submissions or approvals.",
    permissions: [
      "customers.read", "customers.create", "customers.edit",
      "properties.read", "properties.create", "properties.edit",
      "jobs.read", "jobs.create", "jobs.edit", "jobs.documents.upload",
      "ibg.read", "ibg.repository.read", "ibg.history.full",
      "submissions.read",
      "funding.projects.read", "funding.match.read",
      "reports.read",
    ],
  },
  {
    id: "senior-operator",
    label: "Senior Operator",
    description: "Junior + funding submission and IBG issuance. Cannot approve amendments or manage users.",
    permissions: [
      "customers.read", "customers.create", "customers.edit", "customers.archive",
      "properties.read", "properties.create", "properties.edit",
      "jobs.read", "jobs.create", "jobs.edit", "jobs.assign",
      "jobs.documents.upload", "jobs.documents.delete",
      "ibg.read", "ibg.issue", "ibg.repository.read", "ibg.history.full",
      "ibg.amendment.request", "ibg.cancel",
      "submissions.read", "submissions.upload",
      "funding.match.read", "funding.projects.read", "funding.projects.create",
      "funding.evidence.upload", "funding.submit",
      "reports.read", "reports.export",
    ],
  },
  {
    id: "compliance-reviewer",
    label: "Compliance Reviewer",
    description: "Audit, activity feed, amendment review. Read-only across operational data.",
    permissions: [
      "customers.read", "properties.read", "jobs.read",
      "ibg.read", "ibg.repository.read", "ibg.history.full",
      "submissions.read",
      "funding.projects.read",
      "reports.read", "reports.export",
      "audit.read", "audit.export", "activity.read",
      "amendments.queue.read", "amendments.review",
      "ibg.amendment.approve",
    ],
  },
];

/* ─── Default permissions per role ──────────────────────────────── */

const ALL: Permission[] = PERMISSIONS.map((p) => p.id);

const READONLY_PERMS: Permission[] = [
  "customers.read", "properties.read", "jobs.read",
  "ibg.read", "ibg.repository.read", "ibg.history.full",
  "submissions.read",
  "funding.projects.read",
  "reports.read",
  "audit.read",
];

const ACCESS_PERMS: Permission[] = [
  "ibg.read", "ibg.issue",
  "settings.measures.read",
];

const OPERATE_PERMS: Permission[] = [
  "customers.read", "customers.create", "customers.edit", "customers.archive",
  "properties.read", "properties.create", "properties.edit",
  "jobs.read", "jobs.create", "jobs.edit", "jobs.assign",
  "jobs.documents.upload", "jobs.documents.delete",
  "ibg.read", "ibg.issue", "ibg.repository.read", "ibg.history.full",
  "ibg.amendment.request", "ibg.cancel",
  "submissions.read", "submissions.upload",
  "funding.match.read", "funding.projects.read", "funding.projects.create",
  "funding.evidence.upload", "funding.submit",
  "reports.read", "reports.export",
  "settings.measures.read", "settings.measures.request",
  "subscription.manage",
];

export const DEFAULT_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL,
  // Operators start empty — Admin assigns from the library.
  operator: [],
  "installer-access": ACCESS_PERMS,
  "installer-operate": OPERATE_PERMS,
  readonly: READONLY_PERMS,
};

/* ─── Helper ────────────────────────────────────────────────────── */

export function can(perms: Permission[], required: Permission | Permission[]): boolean {
  const list = Array.isArray(required) ? required : [required];
  return list.every((p) => perms.includes(p));
}

export function canAny(perms: Permission[], required: Permission[]): boolean {
  return required.some((p) => perms.includes(p));
}

```

--- `src/lib/mock/types.ts` ---

```ts
/**
 * Types for the mock in-memory store. Mirrors the IA record chain:
 * Customer → Property → Job → IBG / Funding project → Submission.
 */

export type RecordStatus =
  | "draft"
  | "active"
  | "inactive"
  | "archived";

export type JobState =
  | "draft"
  | "created"
  | "in-progress"
  | "awaiting-information"
  | "under-validation"
  | "blocked"
  | "completed"
  | "closed"
  | "cancelled"
  | "archived";

export type IbgState =
  | "draft"
  | "initiated"
  | "awaiting-validation"
  | "incomplete"
  | "validated"
  | "processing"
  | "ready-for-issue"
  | "issued"
  | "amended"
  | "superseded"
  | "cancelled"
  | "archived";

export type FundingState =
  | "incomplete"
  | "in-progress"
  | "evidence-required"
  | "under-review"
  | "returned"
  | "validated"
  | "ready-for-submission"
  | "submitted";

export type SubmissionState =
  | "submitted"
  | "under-review"
  | "awaiting-information"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type AmendmentState = "pending" | "approved" | "rejected";

export type OnboardingApplicationState =
  | "in-progress"
  | "awaiting-verification"
  | "awaiting-review"
  | "ready-for-activation"
  | "blocked"
  | "activated";

export type Customer = {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  org?: string;
  status: RecordStatus;
  createdAt: number;
};

export type Property = {
  id: string;
  customerId: string;
  address: string;
  postcode: string;
  uprn?: string;
  epc?: string;
  duplicateFlag?: boolean;
  status: RecordStatus;
  createdAt: number;
};

export type Job = {
  id: string;
  ref: string;
  customerId: string;
  propertyId: string;
  measure: string;
  owner: string;
  state: JobState;
  startDate: string;
  createdAt: number;
};

export type IBG = {
  id: string;
  ref: string;
  customerId?: string;
  propertyId?: string;
  jobId?: string;
  customerName: string; // denormalised for Access tier standalone
  propertyAddress: string;
  measure: string;
  policyType: string;
  state: IbgState;
  issuedAt?: number;
  createdAt: number;
  issuedBy: string;
};

export type AmendmentRequest = {
  id: string;
  ibgId: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  state: AmendmentState;
  createdAt: number;
  decidedAt?: number;
  decidedBy?: string;
  rejectReason?: string;
};

export type FundingProject = {
  id: string;
  ref: string;
  jobId: string;
  scheme: string;
  measure: string;
  state: FundingState;
  createdAt: number;
  evidence: { id: string; name: string; category: string; uploadedAt: number }[];
};

export type Submission = {
  id: string;
  ref: string;
  fundingProjectId: string;
  jobId: string;
  scheme: string;
  state: SubmissionState;
  submittedAt: number;
};

export type AuditEvent = {
  id: string;
  entityType:
    | "customer"
    | "property"
    | "job"
    | "ibg"
    | "funding"
    | "submission"
    | "user"
    | "amendment";
  entityId: string;
  actor: string;
  action: string;
  detail?: string;
  at: number;
};

export type ActivityEvent = {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: number;
};

export type UserStatus =
  | "invited"
  | "pending"
  | "active"
  | "suspended"
  | "deactivated"
  | "banned";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role:
    | "admin"
    | "operator"
    | "installer-access"
    | "installer-operate"
    | "readonly";
  status: UserStatus;
  permissions: string[]; // permission ids
  invitedAt: number;
  lastActive?: number;
  banReason?: string;
};

export type PermissionRequest = {
  id: string;
  userId: string;
  permission: string;
  reason: string;
  state: "pending" | "approved" | "rejected";
  requestedAt: number;
  decidedAt?: number;
  decidedBy?: string;
};

export type IntegrationKey =
  | "zapier"
  | "hubspot"
  | "slack"
  | "salesforce"
  | "webhooks"
  | "make";

export type Integration = {
  key: IntegrationKey;
  name: string;
  category: "Automation" | "CRM" | "Comms" | "Developer";
  description: string;
  connected: boolean;
  account?: string;
  connectedAt?: number;
};

export type OnboardingApplication = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  tier: "access" | "operate";
  state: OnboardingApplicationState;
  submittedAt: number;
  companiesHouseNumber?: string;
  measures: string[];
  accreditationFiles: string[];
  blockedReason?: string;
};

export type FundingMatch = {
  scheme: string;
  description: string;
  score: number; // 0-100
  measures: string[];
  state: "active" | "opportunity" | "no-match";
  region: string;
};

```

--- `src/lib/mock/seed.ts` ---

```ts
import type {
  Customer,
  Property,
  Job,
  IBG,
  AmendmentRequest,
  FundingProject,
  Submission,
  AuditEvent,
  ActivityEvent,
  ManagedUser,
  OnboardingApplication,
  FundingMatch,
  PermissionRequest,
  Integration,
} from "./types";

const now = 1746115200000; // 2026-05-01 stable

const day = 86400000;

export function seed() {
  const customers: Customer[] = [
    {
      id: "cus_001",
      ref: "C-2451",
      name: "Jane Smith",
      email: "jane.smith@example.co.uk",
      phone: "07700 900123",
      org: "—",
      status: "active",
      createdAt: now - 30 * day,
    },
    {
      id: "cus_002",
      ref: "C-2452",
      name: "Mohammed Patel",
      email: "m.patel@example.co.uk",
      phone: "07700 900456",
      status: "active",
      createdAt: now - 24 * day,
    },
    {
      id: "cus_003",
      ref: "C-2453",
      name: "Olivia Bennett",
      email: "olivia@bennetthomes.co.uk",
      phone: "07700 900789",
      org: "Bennett Homes Ltd",
      status: "active",
      createdAt: now - 9 * day,
    },
    {
      id: "cus_004",
      ref: "C-2454",
      name: "Riley Thompson",
      email: "riley.t@example.co.uk",
      phone: "07700 900222",
      status: "draft",
      createdAt: now - 2 * day,
    },
  ];

  const properties: Property[] = [
    {
      id: "pro_001",
      customerId: "cus_001",
      address: "14 Oak Lane, Leeds",
      postcode: "LS1 4AB",
      uprn: "100012345678",
      epc: "D",
      status: "active",
      createdAt: now - 28 * day,
    },
    {
      id: "pro_002",
      customerId: "cus_002",
      address: "3 Beech Crescent, Manchester",
      postcode: "M14 7QQ",
      uprn: "100098765432",
      epc: "E",
      status: "active",
      createdAt: now - 22 * day,
    },
    {
      id: "pro_003",
      customerId: "cus_003",
      address: "27 Mill Road, Bristol",
      postcode: "BS1 6AB",
      epc: "C",
      status: "active",
      createdAt: now - 9 * day,
    },
    {
      id: "pro_004",
      customerId: "cus_003",
      address: "29 Mill Road, Bristol",
      postcode: "BS1 6AB",
      epc: "C",
      duplicateFlag: false,
      status: "active",
      createdAt: now - 8 * day,
    },
  ];

  const jobs: Job[] = [
    {
      id: "job_001",
      ref: "J-9821",
      customerId: "cus_001",
      propertyId: "pro_001",
      measure: "Air Source Heat Pump",
      owner: "Robin Clarke",
      state: "in-progress",
      startDate: "2026-04-12",
      createdAt: now - 25 * day,
    },
    {
      id: "job_002",
      ref: "J-9822",
      customerId: "cus_002",
      propertyId: "pro_002",
      measure: "Loft Insulation",
      owner: "Robin Clarke",
      state: "awaiting-information",
      startDate: "2026-04-04",
      createdAt: now - 21 * day,
    },
    {
      id: "job_003",
      ref: "J-9823",
      customerId: "cus_003",
      propertyId: "pro_003",
      measure: "Solar PV",
      owner: "Sam Patel",
      state: "completed",
      startDate: "2026-03-19",
      createdAt: now - 40 * day,
    },
    {
      id: "job_004",
      ref: "J-9824",
      customerId: "cus_003",
      propertyId: "pro_004",
      measure: "Cavity Wall Insulation",
      owner: "Robin Clarke",
      state: "blocked",
      startDate: "2026-04-23",
      createdAt: now - 7 * day,
    },
    {
      id: "job_005",
      ref: "J-9825",
      customerId: "cus_001",
      propertyId: "pro_001",
      measure: "EV Charger",
      owner: "Robin Clarke",
      state: "draft",
      startDate: "2026-05-08",
      createdAt: now - 1 * day,
    },
    {
      id: "job_006",
      ref: "J-9826",
      customerId: "cus_002",
      propertyId: "pro_002",
      measure: "Solar PV",
      owner: "Sam Patel",
      state: "under-validation",
      startDate: "2026-04-18",
      createdAt: now - 11 * day,
    },
  ];

  const ibgs: IBG[] = [
    {
      id: "ibg_001",
      ref: "IBG-2451",
      customerId: "cus_001",
      propertyId: "pro_001",
      jobId: "job_001",
      customerName: "Jane Smith",
      propertyAddress: "14 Oak Lane, Leeds, LS1 4AB",
      measure: "Air Source Heat Pump",
      policyType: "10-year IBG",
      state: "issued",
      issuedAt: now - 12 * day,
      createdAt: now - 14 * day,
      issuedBy: "Robin Clarke",
    },
    {
      id: "ibg_002",
      ref: "IBG-2452",
      customerId: "cus_003",
      propertyId: "pro_003",
      jobId: "job_003",
      customerName: "Olivia Bennett",
      propertyAddress: "27 Mill Road, Bristol, BS1 6AB",
      measure: "Solar PV",
      policyType: "10-year IBG",
      state: "issued",
      issuedAt: now - 5 * day,
      createdAt: now - 6 * day,
      issuedBy: "Sam Patel",
    },
    {
      id: "ibg_003",
      ref: "IBG-2453",
      customerId: "cus_002",
      propertyId: "pro_002",
      jobId: "job_006",
      customerName: "Mohammed Patel",
      propertyAddress: "3 Beech Crescent, Manchester, M14 7QQ",
      measure: "Solar PV",
      policyType: "10-year IBG",
      state: "ready-for-issue",
      createdAt: now - 3 * day,
      issuedBy: "Sam Patel",
    },
    {
      id: "ibg_004",
      ref: "IBG-2454",
      customerName: "Tom Walker",
      propertyAddress: "8 Aldgate Road, London, E1 1AB",
      measure: "Loft Insulation",
      policyType: "10-year IBG",
      state: "incomplete",
      createdAt: now - 2 * day,
      issuedBy: "Jordan Hayes",
    },
    {
      id: "ibg_005",
      ref: "IBG-2450",
      customerName: "Sophia Klein",
      propertyAddress: "12 Hill View, Cardiff, CF10 1AB",
      measure: "Air Source Heat Pump",
      policyType: "10-year IBG",
      state: "amended",
      issuedAt: now - 18 * day,
      createdAt: now - 20 * day,
      issuedBy: "Robin Clarke",
    },
    {
      id: "ibg_006",
      ref: "IBG-2449",
      customerName: "Marcus Adeyemi",
      propertyAddress: "44 Park Avenue, Birmingham, B1 1AA",
      measure: "Cavity Wall Insulation",
      policyType: "10-year IBG",
      state: "cancelled",
      createdAt: now - 22 * day,
      issuedBy: "Robin Clarke",
    },
  ];

  const amendments: AmendmentRequest[] = [
    {
      id: "amd_001",
      ibgId: "ibg_001",
      field: "Property address",
      oldValue: "14 Oak Lane, Leeds, LS1 4AB",
      newValue: "14 Oak Lane, Leeds, LS1 4AC",
      reason: "Postcode typo at issue time, correct postcode confirmed.",
      state: "pending",
      createdAt: now - 1 * day,
    },
    {
      id: "amd_002",
      ibgId: "ibg_005",
      field: "Customer name",
      oldValue: "Sofia Klein",
      newValue: "Sophia Klein",
      reason: "Spelling correction at customer's request.",
      state: "approved",
      createdAt: now - 19 * day,
      decidedAt: now - 18 * day,
      decidedBy: "Alex Reed",
    },
  ];

  const fundingProjects: FundingProject[] = [
    {
      id: "fnd_001",
      ref: "F-7811",
      jobId: "job_001",
      scheme: "ECO4",
      measure: "Air Source Heat Pump",
      state: "ready-for-submission",
      createdAt: now - 10 * day,
      evidence: [
        { id: "ev_1", name: "EPC certificate.pdf", category: "EPC", uploadedAt: now - 9 * day },
        { id: "ev_2", name: "Heat loss survey.pdf", category: "Survey", uploadedAt: now - 8 * day },
      ],
    },
    {
      id: "fnd_002",
      ref: "F-7812",
      jobId: "job_006",
      scheme: "GBIS",
      measure: "Solar PV",
      state: "evidence-required",
      createdAt: now - 5 * day,
      evidence: [
        { id: "ev_3", name: "MCS quote.pdf", category: "Quote", uploadedAt: now - 4 * day },
      ],
    },
    {
      id: "fnd_003",
      ref: "F-7810",
      jobId: "job_003",
      scheme: "BUS",
      measure: "Solar PV",
      state: "in-progress",
      createdAt: now - 14 * day,
      evidence: [],
    },
  ];

  const submissions: Submission[] = [
    {
      id: "sub_001",
      ref: "S-3301",
      fundingProjectId: "fnd_003",
      jobId: "job_003",
      scheme: "BUS",
      state: "accepted",
      submittedAt: now - 12 * day,
    },
    {
      id: "sub_002",
      ref: "S-3302",
      fundingProjectId: "fnd_001",
      jobId: "job_001",
      scheme: "ECO4",
      state: "awaiting-information",
      submittedAt: now - 4 * day,
    },
  ];

  const audit: AuditEvent[] = [
    { id: "a1", entityType: "ibg", entityId: "ibg_001", actor: "Robin Clarke", action: "Issued IBG", at: now - 12 * day },
    { id: "a2", entityType: "amendment", entityId: "amd_001", actor: "Robin Clarke", action: "Requested amendment", detail: "Postcode correction", at: now - 1 * day },
    { id: "a3", entityType: "job", entityId: "job_001", actor: "Robin Clarke", action: "Set state to in-progress", at: now - 20 * day },
    { id: "a4", entityType: "submission", entityId: "sub_001", actor: "Sam Patel", action: "Submitted to BUS", at: now - 12 * day },
    { id: "a5", entityType: "submission", entityId: "sub_001", actor: "BUS Scheme", action: "Marked as accepted", at: now - 7 * day },
    { id: "a6", entityType: "customer", entityId: "cus_001", actor: "Robin Clarke", action: "Created customer", at: now - 30 * day },
  ];

  const activity: ActivityEvent[] = [
    { id: "act1", actor: "Robin Clarke", action: "issued IBG", target: "IBG-2451", at: now - 12 * day },
    { id: "act2", actor: "Sam Patel", action: "submitted to ECO4", target: "F-7811", at: now - 4 * day },
    { id: "act3", actor: "Jordan Hayes", action: "started a new IBG", target: "IBG-2454", at: now - 2 * day },
    { id: "act4", actor: "Robin Clarke", action: "requested amendment", target: "IBG-2451", at: now - 1 * day },
    { id: "act5", actor: "Alex Reed", action: "approved amendment", target: "IBG-2450", at: now - 18 * day },
  ];

  const users: ManagedUser[] = [
    {
      id: "usr_001",
      name: "Alex Reed",
      email: "alex@renewably.uk",
      role: "admin",
      status: "active",
      permissions: [],
      invitedAt: now - 200 * day,
      lastActive: now - 1 * day,
    },
    {
      id: "usr_002",
      name: "Sam Patel",
      email: "sam@renewably.uk",
      role: "operator",
      status: "active",
      permissions: [
        "customers.read", "customers.create", "customers.edit",
        "properties.read", "properties.create",
        "jobs.read", "jobs.create", "jobs.edit",
        "ibg.read", "ibg.repository.read",
        "submissions.read",
        "funding.projects.read",
      ],
      invitedAt: now - 120 * day,
      lastActive: now - 2 * day,
    },
    {
      id: "usr_003",
      name: "Priya Singh",
      email: "priya@renewably.uk",
      role: "operator",
      status: "active",
      permissions: [
        "customers.read", "jobs.read",
        "ibg.read", "ibg.repository.read", "ibg.history.full",
        "submissions.read",
        "audit.read", "audit.export", "activity.read",
        "amendments.queue.read", "amendments.review", "ibg.amendment.approve",
      ],
      invitedAt: now - 60 * day,
      lastActive: now - 1 * day,
    },
    {
      id: "usr_004",
      name: "Robin Clarke",
      email: "robin@evergreen-installs.co.uk",
      role: "installer-operate",
      status: "active",
      permissions: [],
      invitedAt: now - 90 * day,
      lastActive: now,
    },
    {
      id: "usr_005",
      name: "Jordan Hayes",
      email: "jordan@northwarmth.co.uk",
      role: "installer-access",
      status: "active",
      permissions: [],
      invitedAt: now - 50 * day,
      lastActive: now - 4 * day,
    },
    {
      id: "usr_006",
      name: "Morgan Lee",
      email: "morgan@gbisfunding.org",
      role: "readonly",
      status: "active",
      permissions: [],
      invitedAt: now - 70 * day,
      lastActive: now - 5 * day,
    },
    {
      id: "usr_007",
      name: "Casey Bloom",
      email: "casey@renewably.uk",
      role: "operator",
      status: "invited",
      permissions: [],
      invitedAt: now - 1 * day,
    },
  ];

  const onboarding: OnboardingApplication[] = [
    {
      id: "onb_001",
      companyName: "Northwind Heat Ltd",
      contactName: "Daniel Owusu",
      contactEmail: "daniel@northwindheat.co.uk",
      tier: "operate",
      state: "awaiting-review",
      submittedAt: now - 2 * day,
      companiesHouseNumber: "12345678",
      measures: ["Air Source Heat Pump", "Solar PV"],
      accreditationFiles: ["TrustMark cert.pdf", "MCS card.pdf"],
    },
    {
      id: "onb_002",
      companyName: "Greenline Insulation",
      contactName: "Aisha Rahman",
      contactEmail: "aisha@greenline.co.uk",
      tier: "access",
      state: "awaiting-verification",
      submittedAt: now - 5 * day,
      companiesHouseNumber: "87654321",
      measures: ["Loft Insulation", "Cavity Wall Insulation"],
      accreditationFiles: ["TrustMark cert.pdf"],
    },
    {
      id: "onb_003",
      companyName: "Solis Energy",
      contactName: "Pavel Novak",
      contactEmail: "pavel@solis-energy.co.uk",
      tier: "operate",
      state: "blocked",
      submittedAt: now - 1 * day,
      companiesHouseNumber: "11223344",
      measures: ["Solar PV"],
      accreditationFiles: [],
      blockedReason: "Companies House verification failed — director name mismatch.",
    },
  ];

  const fundingMatches: FundingMatch[] = [
    {
      scheme: "ECO4",
      description: "Energy Company Obligation — heating + insulation for low income households.",
      score: 92,
      measures: ["Air Source Heat Pump", "Loft Insulation", "Cavity Wall Insulation"],
      state: "active",
      region: "England, Wales, Scotland",
    },
    {
      scheme: "GBIS",
      description: "Great British Insulation Scheme — single-measure insulation top-up.",
      score: 78,
      measures: ["Loft Insulation", "Cavity Wall Insulation"],
      state: "active",
      region: "GB",
    },
    {
      scheme: "BUS",
      description: "Boiler Upgrade Scheme — heat pump grants for owner-occupied homes.",
      score: 84,
      measures: ["Air Source Heat Pump", "Ground Source Heat Pump"],
      state: "active",
      region: "England, Wales",
    },
    {
      scheme: "Home Upgrade Grant",
      description: "Off-gas, low-EPC properties. Local authority delivered.",
      score: 41,
      measures: ["Solar PV", "Air Source Heat Pump"],
      state: "opportunity",
      region: "England",
    },
  ];

  const permissionRequests: PermissionRequest[] = [
    {
      id: "preq_001",
      userId: "usr_002",
      permission: "ibg.issue",
      reason: "Need to issue IBGs for the Manchester pilot batch this week.",
      state: "pending",
      requestedAt: now - 1 * day,
    },
    {
      id: "preq_002",
      userId: "usr_002",
      permission: "funding.submit",
      reason: "Picking up funding submissions while Priya is on leave.",
      state: "pending",
      requestedAt: now - 2 * day,
    },
    {
      id: "preq_003",
      userId: "usr_003",
      permission: "users.invite",
      reason: "Need to bring a new compliance reviewer onboard.",
      state: "pending",
      requestedAt: now - 4 * 3600 * 1000,
    },
    {
      id: "preq_004",
      userId: "usr_007",
      permission: "customers.read",
      reason: "First day — need access to customer directory to shadow.",
      state: "pending",
      requestedAt: now - 30 * 60 * 1000,
    },
  ];

  const integrations: Integration[] = [
    { key: "zapier", name: "Zapier", category: "Automation", description: "Trigger 6,000+ apps from IBG, job and submission events.", connected: true, account: "renewably-uk", connectedAt: now - 40 * day },
    { key: "make", name: "Make", category: "Automation", description: "Build visual scenarios from platform webhooks.", connected: false },
    { key: "hubspot", name: "HubSpot", category: "CRM", description: "Sync customers and jobs into your HubSpot pipeline.", connected: true, account: "renewably-marketing", connectedAt: now - 14 * day },
    { key: "salesforce", name: "Salesforce", category: "CRM", description: "Two-way sync of customers and opportunities.", connected: false },
    { key: "slack", name: "Slack", category: "Comms", description: "Post submissions, amendments and onboarding events to channels.", connected: true, account: "#ops-renewably", connectedAt: now - 7 * day },
    { key: "webhooks", name: "Webhooks", category: "Developer", description: "Receive HTTP callbacks for every record-chain event.", connected: false },
  ];

  return {
    customers,
    properties,
    jobs,
    ibgs,
    amendments,
    fundingProjects,
    submissions,
    audit,
    activity,
    users,
    onboarding,
    fundingMatches,
    permissionRequests,
    integrations,
  };
}

export type SeedData = ReturnType<typeof seed>;

```

--- `src/lib/mock/store.tsx` ---

```tsx
/**
 * Mock store. Backend-disabled mode.
 * Loads seed data, persists writes to localStorage so the preview survives
 * a refresh, exposes a tiny subscribe API for components that need to react
 * to mutations.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seed, type SeedData } from "./seed";

const KEY = "renewably:mock-store:v1";

type Listener = () => void;
const listeners = new Set<Listener>();

let DATA: SeedData | null = null;

function loadData(): SeedData {
  if (DATA) return DATA;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        DATA = JSON.parse(raw) as SeedData;
        return DATA;
      }
    } catch {
      /* ignore */
    }
  }
  DATA = seed();
  return DATA;
}

function persist() {
  if (typeof window === "undefined") return;
  if (!DATA) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(DATA));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function getData(): SeedData {
  return loadData();
}

export function update(mutator: (d: SeedData) => void) {
  mutator(loadData());
  persist();
}

export function resetStore() {
  DATA = seed();
  persist();
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/* ─── React surface ──────────────────────────────────────────────── */

const Ctx = createContext<{ data: SeedData; tick: number } | null>(null);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);

  const value = useMemo(() => ({ data: loadData(), tick }), [tick]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore inside MockStoreProvider");
  return ctx.data;
}

/* ─── Tiny ID factory ────────────────────────────────────────────── */

export function nid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nref(prefix: string) {
  return `${prefix}-${Math.floor(2500 + Math.random() * 7000)}`;
}

```

--- `src/lib/mock/queries.ts` ---

```ts
/**
 * Tiny query helpers over the mock store.
 * These are pure functions taking the seed data slice.
 */

import type {
  Customer, Property, Job, IBG, FundingProject, Submission, AuditEvent,
} from "./types";
import type { SeedData } from "./seed";

export const findCustomer = (d: SeedData, id: string) => d.customers.find((c) => c.id === id);
export const findProperty = (d: SeedData, id: string) => d.properties.find((p) => p.id === id);
export const findJob = (d: SeedData, id: string) => d.jobs.find((j) => j.id === id);
export const findIbg = (d: SeedData, id: string) => d.ibgs.find((i) => i.id === id);
export const findFunding = (d: SeedData, id: string) => d.fundingProjects.find((f) => f.id === id);
export const findSubmission = (d: SeedData, id: string) => d.submissions.find((s) => s.id === id);
export const findUser = (d: SeedData, id: string) => d.users.find((u) => u.id === id);
export const findOnboarding = (d: SeedData, id: string) => d.onboarding.find((o) => o.id === id);

export const propertiesOfCustomer = (d: SeedData, customerId: string): Property[] =>
  d.properties.filter((p) => p.customerId === customerId);

export const jobsOfCustomer = (d: SeedData, customerId: string): Job[] =>
  d.jobs.filter((j) => j.customerId === customerId);

export const jobsOfProperty = (d: SeedData, propertyId: string): Job[] =>
  d.jobs.filter((j) => j.propertyId === propertyId);

export const ibgsOfJob = (d: SeedData, jobId: string): IBG[] =>
  d.ibgs.filter((i) => i.jobId === jobId);

export const fundingOfJob = (d: SeedData, jobId: string): FundingProject[] =>
  d.fundingProjects.filter((f) => f.jobId === jobId);

export const submissionsOfFunding = (d: SeedData, fundingId: string): Submission[] =>
  d.submissions.filter((s) => s.fundingProjectId === fundingId);

export function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function relTime(ts: number) {
  const diff = Date.now() - ts;
  const day = 86400000;
  const d = Math.round(diff / day);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.round(d / 7)}w ago`;
  return fmtDate(ts);
}

export type AnyAuditEntity = AuditEvent["entityType"];

export function pushAudit(
  d: SeedData,
  entityType: AnyAuditEntity,
  entityId: string,
  actor: string,
  action: string,
  detail?: string,
) {
  d.audit.unshift({
    id: "a_" + Math.random().toString(36).slice(2, 8),
    entityType,
    entityId,
    actor,
    action,
    detail,
    at: Date.now(),
  });
}

```

### 5.3 Shell, shared components, dialogs, auth shell, integrations

--- `src/components/app/shell/sidebar-context.tsx` ---

```tsx
/**
 * Sidebar collapsed/open state. One source of truth used by AppSidebar
 * (desktop collapse) and TopBar (mobile drawer + toggle button).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type SidebarState = {
  /** Desktop collapsed (icon-only) vs expanded. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile off-canvas drawer open. */
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

const Ctx = createContext<SidebarState | null>(null);
const KEY = "renewably:sidebar-collapsed:v1";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setCollapsed(raw === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);

  return (
    <Ctx.Provider
      value={{ collapsed, toggleCollapsed, mobileOpen, setMobileOpen }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSidebarState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSidebarState inside SidebarProvider");
  return ctx;
}

```

--- `src/components/app/shell/app-sidebar.tsx` ---

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
  ClipboardList,
  FileWarning,
  Library,
  SlidersHorizontal,
  Lock,
  Shield,
  Plug,
  History,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { canAny, type Permission } from "@/lib/rbac";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useSidebarState } from "./sidebar-context";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  visibleIf?: Permission[];
  showLockedIfNot?: Permission[];
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
  },
  { label: "IBG History", to: "/ibg/history", icon: History },
  {
    label: "IBG Repository",
    to: "/ibg/repository",
    icon: Database,
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
];

const adminGroup: NavItem[] = [
  { label: "Users", to: "/admin/users", icon: Users, visibleIf: ["users.read"] },
  { label: "Onboarding", to: "/admin/onboarding", icon: ClipboardList, visibleIf: ["onboarding.queue.read"] },
  { label: "Amendments", to: "/admin/amendments", icon: FileWarning, visibleIf: ["amendments.queue.read"] },
  { label: "Activity", to: "/admin/activity", icon: Activity, visibleIf: ["activity.read"] },
  { label: "Audit log", to: "/admin/audit", icon: ScrollText, visibleIf: ["audit.read"] },
  { label: "Permissions", to: "/admin/permissions", icon: Library, visibleIf: ["permissions.library.manage"] },
  { label: "Integrations", to: "/settings/integrations", icon: Plug, visibleIf: ["config.read"] },
  { label: "System config", to: "/admin/config", icon: SlidersHorizontal, visibleIf: ["config.read"] },
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
  const { onboardingStep } = useDevRole();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { setMobileOpen } = useSidebarState();

  const visibleAdmin = adminGroup.filter(
    (i) => !i.visibleIf || canAny(permissions, i.visibleIf),
  );
  const onboardingActive = onboardingStep !== "complete";

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2 px-3 pt-3", collapsed && "justify-center px-2")}>
        {collapsed ? (
          <Link
            to="/dashboard"
            aria-label="Renewably home"
            className="press grid size-8 place-items-center rounded-lg bg-gradient-to-br from-cat-green to-cat-blue text-[11px] font-semibold text-white"
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
        {main.map((item) => (
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

        {visibleAdmin.length > 0 && (
          <>
            {!collapsed && <SectionLabel icon={Shield}>Admin</SectionLabel>}
            {collapsed && <Divider />}
            {visibleAdmin.map((item) => (
              <Row
                key={item.to}
                item={item}
                permissions={permissions}
                path={path}
                collapsed={collapsed}
                onClick={onItemClick}
              />
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
          ? "bg-sidebar-accent text-foreground before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-brand"
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

--- `src/components/app/shell/top-bar.tsx` ---

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
        <button
          type="button"
          aria-label="Search (⌘K)"
          onClick={() => setOpen(true)}
          className="press hidden h-8 items-center gap-2 rounded-lg border bg-surface/60 px-2.5 text-xs text-ink-muted hover:bg-surface hover:text-foreground md:inline-flex"
        >
          <Search className="size-3.5" />
          <span>Search…</span>
          <kbd className="ml-2 rounded bg-background px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
            {isMac ? "⌘" : "Ctrl"}K
          </kbd>
        </button>
        <button
          type="button"
          aria-label="Search"
          onClick={() => setOpen(true)}
          className="press grid size-8 place-items-center rounded-full text-ink-muted hover:bg-surface hover:text-foreground md:hidden"
        >
          <Search className="size-[18px]" />
        </button>
        <NotificationsPopover />
        <ProfilePopover />
      </div>
    </header>
  );
}

```

--- `src/components/app/shell/breadcrumbs.tsx` ---

```tsx
/**
 * Breadcrumbs derived from the current pathname plus a known mapping
 * of route → human label. For dynamic segments (e.g. /customers/cus_001)
 * the trail just shows the parent + a generic "Detail" — record names
 * are filled in by the page itself if it wants more context.
 */

import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

const LABELS: Record<string, string> = {
  dashboard: "Home",
  projects: "Projects",
  customers: "Customers",
  properties: "Properties",
  jobs: "Jobs",
  ibg: "IBG",
  new: "New",
  history: "History",
  repository: "Repository",
  amendment: "Amendment",
  submissions: "Submissions",
  funding: "Funding",
  match: "Match Hub",
  evidence: "Evidence",
  submit: "Submit",
  tracking: "Tracking",
  settings: "Settings",
  profile: "Profile",
  notifications: "Notifications",
  subscription: "Subscription",
  measures: "Measures",
  admin: "Admin",
  users: "Users",
  audit: "Audit log",
  activity: "Activity",
  onboarding: "Onboarding",
  amendments: "Amendments",
  permissions: "Permissions",
  config: "System config",
  invite: "Invite",
};

const BASE_TO: Record<string, string> = {
  dashboard: "/dashboard",
  projects: "/projects",
  customers: "/customers",
  properties: "/properties",
  jobs: "/jobs",
  ibg: "/ibg/repository",
  submissions: "/submissions",
  funding: "/funding",
  settings: "/settings/profile",
  admin: "/admin/users",
};

export function Breadcrumbs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs: { label: string; to?: string }[] = [];
  segments.forEach((seg, i) => {
    // skip dynamic ids
    if (seg.startsWith("cus_") || seg.startsWith("pro_") || seg.startsWith("job_") || seg.startsWith("ibg_") || seg.startsWith("fnd_") || seg.startsWith("sub_") || seg.startsWith("usr_") || seg.startsWith("onb_") || seg.startsWith("amd_")) {
      crumbs.push({ label: "Detail" });
      return;
    }
    const label = LABELS[seg] ?? cap(seg);
    const to = i === 0 ? BASE_TO[seg] ?? "/" + seg : undefined;
    crumbs.push({ label, to });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {crumbs.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight className="size-3.5 text-ink-muted" />}
          {c.to && i < crumbs.length - 1 ? (
            <Link to={c.to} className="text-ink-muted hover:text-foreground">
              {c.label}
            </Link>
          ) : (
            <span className={i === crumbs.length - 1 ? "font-medium text-foreground" : "text-ink-muted"}>
              {c.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

```

--- `src/components/app/shell/notifications-popover.tsx` ---

```tsx
/**
 * Notifications popover with unread badge.
 */

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Note = {
  id: string;
  eyebrow: string;
  heroTitle: string;
  body: string;
  when: string;
  gradient: string;
};

const NOTES: Note[] = [
  {
    id: "1",
    eyebrow: "Introducing IBG Repository",
    heroTitle: "Searchable IBG record store",
    body: "Filter by state, customer or measure. Every record, one query away.",
    when: "about 7 hours ago",
    gradient:
      "bg-[radial-gradient(120%_120%_at_20%_0%,#FFD7B5_0%,#FF8A4C_45%,#E0563B_100%)]",
  },
  {
    id: "2",
    eyebrow: "Funding Match scoring",
    heroTitle: "Schemes scored against your measures",
    body: "Match Hub now ranks ECO4, GBIS, BUS and HUG by fit and region.",
    when: "2 days ago",
    gradient:
      "bg-[radial-gradient(120%_120%_at_20%_0%,#C7E8FF_0%,#5A9BFF_50%,#2046C7_100%)]",
  },
  {
    id: "3",
    eyebrow: "Operator permission requests",
    heroTitle: "Request access from any locked feature",
    body: "Operators see a request button on locked tiles. Admins approve from the Requests tab.",
    when: "5 days ago",
    gradient:
      "bg-[radial-gradient(120%_120%_at_20%_0%,#E9D6FF_0%,#A26BFF_45%,#5B27C9_100%)]",
  },
  {
    id: "4",
    eyebrow: "Integrations",
    heroTitle: "Zapier, HubSpot, Slack and webhooks",
    body: "Pipe IBG, job and submission events straight into your existing stack.",
    when: "1 week ago",
    gradient:
      "bg-[radial-gradient(120%_120%_at_20%_0%,#C8F3D8_0%,#3FBE6E_50%,#0F6B3A_100%)]",
  },
];

const READ_KEY = "renewably:notifications:read:v1";

export function NotificationsPopover() {
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const v = window.localStorage.getItem(READ_KEY);
      if (v === "1") setHasUnread(false);
    } catch {
      /* ignore */
    }
  }, []);

  function markRead() {
    setHasUnread(false);
    try {
      window.localStorage.setItem(READ_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <Popover onOpenChange={(o) => o && hasUnread && markRead()}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="press relative grid size-8 place-items-center rounded-full text-ink-muted hover:bg-surface hover:text-foreground"
        >
          <Bell className="size-[18px]" />
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(380px,calc(100vw-1rem))] overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-semibold text-foreground">What's new</div>
          <button
            type="button"
            onClick={markRead}
            className="text-[11px] text-ink-muted hover:text-foreground"
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-[70vh] divide-y overflow-y-auto">
          {NOTES.map((n) => (
            <article key={n.id} className="px-4 py-4">
              <h3 className="text-[13px] font-semibold text-foreground">
                {n.eyebrow}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {n.body}
              </p>
              <div
                className={`relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl ${n.gradient}`}
              >
                <div className="absolute inset-0 flex items-end p-4">
                  <div className="text-[15px] font-semibold leading-tight text-white drop-shadow-sm">
                    {n.heroTitle}
                  </div>
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur">
                  Renewably
                </div>
              </div>
              <div className="mt-2 text-[11px] text-ink-muted">{n.when}</div>
            </article>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

```

--- `src/components/app/shell/profile-popover.tsx` ---

```tsx
/**
 * Profile popover — exact ElevenLabs structure:
 *   Balance → Workspace → Settings/Subscription/Theme → Sign out.
 */

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/lib/auth-context";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowLeftRight,
  CreditCard,
  Crown,
  KeyRound,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";

export function ProfilePopover() {
  const { user, isAdmin, isOperator } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Account"
          className="press grid size-8 place-items-center rounded-full bg-gradient-to-br from-cat-blue to-cat-purple text-xs font-semibold text-white"
        >
          {user.initials}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] p-2">
        <div className="rounded-xl bg-surface p-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.06em] text-ink-muted">
            <span>Balance</span>
            {!isAdmin && (
              <Link
                to="/settings/subscription"
                className="press inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background"
              >
                <Crown className="size-3" /> Upgrade
              </Link>
            )}
          </div>
          <div className="mt-2 flex items-end justify-between text-sm">
            <span className="text-ink-muted">Total IBGs this month</span>
            <span className="font-medium text-foreground">12 / 25</span>
          </div>
        </div>

        <div className="mt-2 px-1 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
          Current workspace
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">Renewably UK</div>
            <div className="text-[11px] text-ink-muted">Operate plan</div>
          </div>
          <ArrowLeftRight className="size-3.5 text-ink-muted" />
        </button>

        <div className="my-1.5 h-px bg-border" />

        <MenuLink to="/settings/profile" icon={Settings} label="Settings" />
        {!isAdmin && (
          <MenuLink to="/settings/subscription" icon={CreditCard} label="Subscription" />
        )}
        {isOperator && (
          <MenuLink to="/settings/access" icon={KeyRound} label="View my access" />
        )}
        <MenuButton
          icon={theme === "dark" ? Sun : Moon}
          label={theme === "dark" ? "Light mode" : "Dark mode"}
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />

        <div className="my-1.5 h-px bg-border" />

        <a
          href="https://docs.lovable.dev"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-ink-muted hover:bg-surface"
        >
          <span>Docs</span>
          <ArrowUpRight className="size-3.5" />
        </a>

        <div className="my-1.5 h-px bg-border" />

        <Link
          to="/sign-in"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-surface"
        >
          <LogOut className="size-3.5" />
          Sign out
        </Link>
      </PopoverContent>
    </Popover>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-surface">
      <Icon className="size-3.5 text-ink-muted" />
      {label}
    </Link>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-foreground hover:bg-surface"
    >
      <Icon className="size-3.5 text-ink-muted" />
      {label}
    </button>
  );
}

```

--- `src/components/app/shell/workspace-switcher.tsx` ---

```tsx
/**
 * Workspace switcher row at the top of the secondary sidebar — the
 * ElevenLabs "ElevenCreative" pill with avatar + name + chevrons.
 */

import { ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const WORKSPACES = [
  { id: "renewably-uk", name: "Renewably UK", plan: "Operate" },
  { id: "northwarmth", name: "Northwarmth Ltd", plan: "Access" },
];

export function WorkspaceSwitcher() {
  const current = WORKSPACES[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="press flex w-full items-center gap-2 rounded-xl border bg-background px-2 py-1.5 text-left hover:bg-surface"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-gradient-to-br from-cat-amber to-cat-rose text-[10px] font-semibold text-white">
            R
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {current.name}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-ink-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
          Workspaces
        </div>
        <div className="space-y-0.5">
          {WORKSPACES.map((w) => (
            <button
              key={w.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-tile text-[10px] font-semibold text-foreground">
                {w.name[0]}
              </span>
              <span className="min-w-0 flex-1 truncate">{w.name}</span>
              <span className="text-[10px] text-ink-muted">{w.plan}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

```

--- `src/components/app/page-header.tsx` ---

```tsx
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-6", className)}>
      <div>
        {eyebrow && (
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

```

--- `src/components/app/section-card.tsx` ---

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

--- `src/components/app/state-pill.tsx` ---

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

--- `src/components/app/data-table.tsx` ---

```tsx
/**
 * Lightweight data table — ElevenLabs-style: no heavy borders, hover row,
 * subtle column headers, optional row link.
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
    <div className="overflow-hidden rounded-2xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-surface/40">
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cn(
                  "px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
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
  const cells = columns.map((c) => (
    <td
      key={c.key}
      className={cn(
        "px-4 py-3 text-foreground",
        c.align === "right" ? "text-right" : "text-left",
      )}
    >
      {c.render(row)}
    </td>
  ));
  if (href) {
    return (
      <tr className="group cursor-pointer border-b last:border-b-0 transition-colors hover:bg-surface/60">
        {columns.map((c) => (
          <td
            key={c.key}
            className={cn(
              "p-0 text-foreground",
              c.align === "right" ? "text-right" : "text-left",
            )}
          >
            <Link to={href} className="block px-4 py-3">{c.render(row)}</Link>
          </td>
        ))}
      </tr>
    );
  }
  return (
    <tr className="border-b last:border-b-0 hover:bg-surface/60">{cells}</tr>
  );
}

```

--- `src/components/app/filter-pills.tsx` ---

```tsx
import { cn } from "@/lib/utils";

export function FilterPills<T extends string>({
  value,
  onChange,
  options,
  allowAll = true,
  className,
}: {
  value: T | "all";
  onChange: (v: T | "all") => void;
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }>; count?: number }[];
  allowAll?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {allowAll && (
        <Pill active={value === "all"} onClick={() => onChange("all")}>
          All
        </Pill>
      )}
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <Pill key={opt.value} active={value === opt.value} onClick={() => onChange(opt.value)}>
            {Icon && <Icon className="size-3.5" />}
            <span>{opt.label}</span>
            {typeof opt.count === "number" && (
              <span className="ml-0.5 text-ink-muted">{opt.count}</span>
            )}
          </Pill>
        );
      })}
    </div>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-ink-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

```

--- `src/components/app/empty-state.tsx` ---

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

--- `src/components/app/locked-card.tsx` ---

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

--- `src/components/app/coming-soon.tsx` ---

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

--- `src/components/app/audit-timeline.tsx` ---

```tsx
/**
 * AuditTimeline — right-rail vertical list of AuditEvent items, used on
 * every record detail screen (Customer, Property, Job, IBG, Funding,
 * Submission). Reads from the mock store filtered by entity.
 */

import { useStore } from "@/lib/mock/store";
import type { AuditEvent } from "@/lib/mock/types";
import { History } from "lucide-react";

export function AuditTimeline({
  entityType,
  entityId,
}: {
  entityType: AuditEvent["entityType"];
  entityId: string;
}) {
  const data = useStore();
  const events = data.audit
    .filter((e) => e.entityType === entityType && e.entityId === entityId)
    .sort((a, b) => b.at - a.at);

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-ink-muted">
        <History className="size-3.5" /> Audit timeline
      </div>
      {events.length === 0 ? (
        <div className="rounded-xl bg-surface px-3 py-4 text-xs text-ink-muted">
          No events recorded yet.
        </div>
      ) : (
        <ol className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="relative pl-4">
              <span className="absolute left-0 top-1.5 size-2 rounded-full bg-foreground" />
              <div className="text-sm text-foreground">{e.action}</div>
              {e.detail && (
                <div className="text-xs text-ink-muted">{e.detail}</div>
              )}
              <div className="text-[11px] text-ink-muted">
                {e.actor} · {fmt(e.at)}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

```

--- `src/components/app/underline-tabs.tsx` ---

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
    <div className={cn("flex items-center gap-1 border-b", className)}>
      {options.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "press relative -mb-px flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors",
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
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />}
          </button>
        );
      })}
    </div>
  );
}

```

--- `src/components/app/dev-switcher.tsx` ---

```tsx
/**
 * Dev role switcher — floating bottom-right control.
 * Lets you preview every persona, every onboarding state, and toggle
 * any individual permission (especially useful for Operators).
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ShieldHalf,
  Sparkles,
  X,
  Settings2,
  RotateCcw,
} from "lucide-react";
import { useDevRole, type OnboardingStep } from "@/lib/dev-role";
import {
  DEFAULT_PERMISSIONS,
  OPERATOR_PRESETS,
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  ROLE_META,
  type PermissionCategory,
  type Role,
} from "@/lib/rbac";
import { cn } from "@/lib/utils";

const ROLES: Role[] = [
  "admin",
  "operator",
  "installer-access",
  "installer-operate",
  "readonly",
];

const ONBOARDING_STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "complete", label: "Complete" },
  { id: "signup", label: "Sign-up" },
  { id: "verify-email", label: "Verify email" },
  { id: "company", label: "Company" },
  { id: "measures", label: "Measures" },
  { id: "accreditation", label: "Accreditation" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export function DevSwitcher() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"role" | "perms">("role");
  const {
    role,
    permissions,
    onboardingStep,
    pendingPermissionRequests,
    setRole,
    setOnboardingStep,
    togglePermission,
    setPermissions,
    approvePermissionRequest,
    reset,
  } = useDevRole();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-[0_8px_24px_-8px_oklch(0_0_0/0.2)]"
      >
        <Sparkles className="size-3.5 text-cat-purple" />
        <span>{ROLE_META[role].short}</span>
        {pendingPermissionRequests.length > 0 && (
          <span className="grid size-4 place-items-center rounded-full bg-cat-amber-bg text-[10px] font-semibold text-cat-amber">
            {pendingPermissionRequests.length}
          </span>
        )}
        <ChevronUp className="size-3.5 text-ink-muted" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-h-[80vh] w-[360px] flex-col overflow-hidden rounded-2xl border bg-background shadow-[0_24px_48px_-16px_oklch(0_0_0/0.25)]">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex items-center gap-2">
          <ShieldHalf className="size-4 text-cat-purple" />
          <div className="text-sm font-medium">Preview as</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={reset}
            className="press grid size-7 place-items-center rounded-md text-ink-muted hover:bg-surface"
            title="Reset"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="press grid size-7 place-items-center rounded-md text-ink-muted hover:bg-surface"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex border-b text-xs">
        <TabButton active={tab === "role"} onClick={() => setTab("role")}>
          Role &amp; state
        </TabButton>
        <TabButton active={tab === "perms"} onClick={() => setTab("perms")}>
          Permissions
          <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-surface px-1 text-[10px] text-ink-muted">
            {permissions.length}
          </span>
        </TabButton>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {tab === "role" ? (
          <>
            <SectionLabel>Role</SectionLabel>
            <div className="grid grid-cols-1 gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "press flex items-start gap-2 rounded-xl border bg-background px-2.5 py-2 text-left transition-colors",
                    role === r
                      ? "border-foreground bg-surface"
                      : "border-transparent hover:bg-surface",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 size-1.5 shrink-0 rounded-full",
                      r === "admin" && "bg-cat-purple",
                      r === "operator" && "bg-cat-green",
                      r === "installer-access" && "bg-cat-amber",
                      r === "installer-operate" && "bg-cat-blue",
                      r === "readonly" && "bg-ink-muted",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-foreground">
                      {ROLE_META[r].label}
                    </div>
                    <div className="text-[11px] leading-snug text-ink-muted">
                      {ROLE_META[r].description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <SectionLabel className="mt-4">Onboarding state</SectionLabel>
            <div className="flex flex-wrap gap-1">
              {ONBOARDING_STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setOnboardingStep(s.id)}
                  className={cn(
                    "press rounded-full border px-2.5 py-1 text-[11px]",
                    onboardingStep === s.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-ink-muted hover:bg-surface",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-muted">
              Drives where the installer lands and which gates appear.
            </p>
          </>
        ) : (
          <PermissionsTab
            role={role}
            permissions={permissions}
            pending={pendingPermissionRequests}
            onToggle={togglePermission}
            onSetAll={setPermissions}
            onApprove={approvePermissionRequest}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-ink-muted">
        <span>Backend disabled · preview only</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="press inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-surface"
        >
          Hide <ChevronDown className="size-3" />
        </button>
      </div>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press flex flex-1 items-center justify-center gap-1 px-3 py-2 text-xs font-medium",
        active
          ? "border-b-2 border-foreground text-foreground"
          : "border-b-2 border-transparent text-ink-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PermissionsTab({
  role,
  permissions,
  pending,
  onToggle,
  onSetAll,
  onApprove,
}: {
  role: Role;
  permissions: import("@/lib/rbac").Permission[];
  pending: import("@/lib/rbac").Permission[];
  onToggle: (p: import("@/lib/rbac").Permission) => void;
  onSetAll: (p: import("@/lib/rbac").Permission[]) => void;
  onApprove: (p: import("@/lib/rbac").Permission) => void;
}) {
  return (
    <>
      {pending.length > 0 && (
        <div className="mb-3 rounded-xl border border-cat-amber/40 bg-cat-amber-bg/40 p-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-cat-amber">
            <Settings2 className="size-3" />
            Pending requests ({pending.length})
          </div>
          <div className="space-y-1">
            {pending.map((p) => {
              const def = PERMISSIONS.find((x) => x.id === p);
              return (
                <div key={p} className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] text-foreground">
                    {def?.label ?? p}
                  </span>
                  <button
                    type="button"
                    onClick={() => onApprove(p)}
                    className="press shrink-0 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background"
                  >
                    Approve
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {role === "operator" && (
        <>
          <SectionLabel>Quick presets</SectionLabel>
          <div className="mb-3 grid grid-cols-1 gap-1.5">
            {OPERATOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSetAll(preset.permissions)}
                className="press rounded-lg border bg-background px-2.5 py-1.5 text-left hover:bg-surface"
              >
                <div className="text-[11px] font-medium text-foreground">
                  {preset.label}
                  <span className="ml-1.5 text-ink-muted">
                    ({preset.permissions.length})
                  </span>
                </div>
                <div className="text-[10px] leading-snug text-ink-muted">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mb-2 flex items-center justify-between">
        <SectionLabel className="mb-0">Library</SectionLabel>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onSetAll(DEFAULT_PERMISSIONS[role])}
            className="press rounded-full border px-2 py-0.5 text-[10px] text-ink-muted hover:bg-surface"
          >
            Defaults
          </button>
          <button
            type="button"
            onClick={() => onSetAll([])}
            className="press rounded-full border px-2 py-0.5 text-[10px] text-ink-muted hover:bg-surface"
          >
            Clear
          </button>
        </div>
      </div>

      {PERMISSION_CATEGORIES.map((cat) => {
        const items = PERMISSIONS.filter((p) => p.category === cat);
        return (
          <div key={cat} className="mb-2.5">
            <div className="mb-1 text-[10px] font-medium text-ink-muted">
              {cat as PermissionCategory}
            </div>
            <div className="space-y-0.5">
              {items.map((p) => {
                const checked = permissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(p.id)}
                      className="mt-0.5 size-3 accent-foreground"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] text-foreground">{p.label}</div>
                      <div className="truncate font-mono text-[10px] text-ink-muted">
                        {p.id}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

```

--- `src/components/app/command-palette.tsx` ---

```tsx
/**
 * Global command palette (⌘K / Ctrl+K).
 * Mounted once inside the authed shell.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Home,
  FolderKanban,
  FileBadge,
  Database,
  Send,
  Sparkles,
  Settings as SettingsIcon,
  User,
  Briefcase,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useStore } from "@/lib/mock/store";

type Ctx = { open: boolean; setOpen: (v: boolean) => void; toggle: () => void };
const CommandPaletteCtx = createContext<Ctx | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
  return (
    <CommandPaletteCtx.Provider value={value}>
      {children}
      <CommandPalette />
    </CommandPaletteCtx.Provider>
  );
}

export function useCommandPalette() {
  const c = useContext(CommandPaletteCtx);
  if (!c) throw new Error("useCommandPalette inside CommandPaletteProvider");
  return c;
}

const NAV = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "IBG Generator", to: "/ibg/new", icon: FileBadge },
  { label: "IBG Repository", to: "/ibg/repository", icon: Database },
  { label: "Submissions", to: "/submissions", icon: Send },
  { label: "Funding", to: "/funding", icon: Sparkles },
  { label: "Settings", to: "/settings/profile", icon: SettingsIcon },
] as const;

function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const data = useStore();
  const navigate = useNavigate();

  function go(path: string, params?: Record<string, string>) {
    setOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate({ to: path as any, params: params as any });
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search customers, jobs, IBGs… or jump to a page" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <CommandItem key={n.to} value={`nav ${n.label}`} onSelect={() => go(n.to)}>
                <Icon className="size-4 text-ink-muted" />
                <span>{n.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Customers">
          {data.customers.slice(0, 12).map((c) => (
            <CommandItem
              key={c.id}
              value={`customer ${c.name} ${c.ref}`}
              onSelect={() => go("/customers/$id", { id: c.id })}
            >
              <User className="size-4 text-ink-muted" />
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-[11px] text-ink-muted">{c.ref}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Jobs">
          {data.jobs.slice(0, 12).map((j) => {
            const cust = data.customers.find((c) => c.id === j.customerId);
            return (
              <CommandItem
                key={j.id}
                value={`job ${j.ref} ${j.measure} ${cust?.name ?? ""}`}
                onSelect={() => go("/jobs/$id", { id: j.id })}
              >
                <Briefcase className="size-4 text-ink-muted" />
                <span className="flex-1 truncate">
                  {j.ref} · {j.measure}
                </span>
                <span className="text-[11px] text-ink-muted">{cust?.name ?? ""}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="IBGs">
          {data.ibgs.slice(0, 12).map((i) => (
            <CommandItem
              key={i.id}
              value={`ibg ${i.ref} ${i.customerName}`}
              onSelect={() => go("/ibg/$id", { id: i.id })}
            >
              <FileBadge className="size-4 text-ink-muted" />
              <span className="flex-1 truncate">{i.ref}</span>
              <span className="text-[11px] text-ink-muted">{i.customerName}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

```

--- `src/components/app/app-sidebar.tsx` ---

```tsx
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderKanban,
  FilePlus2,
  History,
  Database,
  Send,
  Sparkles,
  Settings,
  Lock,
  ChevronsLeft,
  ChevronsRight,
  Shield,
  Users,
  ScrollText,
  Activity,
  ClipboardList,
  FileWarning,
  Library,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { canAny, type Permission } from "@/lib/rbac";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Visible to anyone holding ANY of these permissions. */
  visibleIf?: Permission[];
  /** Lock indicator when present but disabled. Item still shows. */
  showLockedIfNot?: Permission[];
};

const main: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  {
    label: "Projects",
    to: "/projects",
    icon: FolderKanban,
    showLockedIfNot: ["customers.read", "jobs.read", "properties.read"],
  },
];

const ibgGroup: NavItem[] = [
  {
    label: "IBG Generator",
    to: "/ibg/new",
    icon: FilePlus2,
    showLockedIfNot: ["ibg.issue"],
  },
  { label: "IBG History", to: "/ibg/history", icon: History },
  {
    label: "IBG Repository",
    to: "/ibg/repository",
    icon: Database,
    showLockedIfNot: ["ibg.repository.read"],
  },
];

const workGroup: NavItem[] = [
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
];

// Admin-only conditional items — only render at all if the user has the perm.
const adminGroup: NavItem[] = [
  { label: "Users", to: "/admin/users", icon: Users, visibleIf: ["users.read"] },
  { label: "Audit log", to: "/admin/audit", icon: ScrollText, visibleIf: ["audit.read"] },
  { label: "Activity", to: "/admin/activity", icon: Activity, visibleIf: ["activity.read"] },
  { label: "Onboarding queue", to: "/admin/onboarding", icon: ClipboardList, visibleIf: ["onboarding.queue.read"] },
  { label: "Amendments", to: "/admin/amendments", icon: FileWarning, visibleIf: ["amendments.queue.read"] },
  { label: "Permission library", to: "/admin/permissions", icon: Library, visibleIf: ["permissions.library.manage"] },
  { label: "System config", to: "/admin/config", icon: SlidersHorizontal, visibleIf: ["config.read"] },
];

const footerGroup: NavItem[] = [
  { label: "Settings", to: "/settings/profile", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, permissions } = useAuth();

  const visibleAdmin = adminGroup.filter(
    (item) => !item.visibleIf || canAny(permissions, item.visibleIf),
  );

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-[var(--dur-4)] ease-[cubic-bezier(0.32,0.72,0,1)]",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        <Link
          to="/dashboard"
          className="press flex items-center gap-2 rounded-lg px-2 py-1.5"
        >
          <div className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs font-semibold">R</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">
              Renewably
            </span>
          )}
        </Link>
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((v) => !v)}
          className="press grid size-7 place-items-center rounded-md text-ink-muted hover:bg-sidebar-accent hover:text-foreground"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-1">
        <Group items={main} permissions={permissions} collapsed={collapsed} />

        <SectionLabel collapsed={collapsed}>IBG</SectionLabel>
        <Group items={ibgGroup} permissions={permissions} collapsed={collapsed} />

        <SectionLabel collapsed={collapsed}>Workflows</SectionLabel>
        <Group items={workGroup} permissions={permissions} collapsed={collapsed} />

        {visibleAdmin.length > 0 && (
          <>
            <SectionLabel collapsed={collapsed} icon={Shield}>
              Admin
            </SectionLabel>
            <Group
              items={visibleAdmin}
              permissions={permissions}
              collapsed={collapsed}
            />
          </>
        )}

        <div className="my-3 h-px bg-sidebar-border" />
        <Group items={footerGroup} permissions={permissions} collapsed={collapsed} />
      </nav>

      <div className="border-t p-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl p-2",
            !collapsed && "hover:bg-sidebar-accent",
          )}
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.fullName}</div>
              <div className="truncate text-xs text-ink-muted">
                {user.roleLabel}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({
  children,
  collapsed,
  icon: Icon,
}: {
  children: React.ReactNode;
  collapsed: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  if (collapsed) return <div className="my-3 h-px bg-sidebar-border" />;
  return (
    <div className="flex items-center gap-1.5 px-3 pb-1.5 pt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
      {Icon && <Icon className="size-3" />}
      {children}
    </div>
  );
}

function Group({
  items,
  permissions,
  collapsed,
}: {
  items: NavItem[];
  permissions: Permission[];
  collapsed: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const locked =
          !!item.showLockedIfNot &&
          !canAny(permissions, item.showLockedIfNot);
        const active =
          path === item.to ||
          (item.to !== "/dashboard" && path.startsWith(item.to));

        return (
          <li key={item.to}>
            <Link
              to={item.to}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                active
                  ? "bg-sidebar-accent font-medium text-foreground"
                  : "text-ink-muted hover:bg-sidebar-accent hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && locked && (
                <Lock className="size-3.5 text-ink-muted/70" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

```

--- `src/components/app/invite-dialog.tsx` ---

```tsx
/**
 * Shared Invite Dialog — used by both /admin/users and the sidebar
 * InviteCard so the entry points are identical.
 */

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { update, nid } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import { ROLE_META, type Role } from "@/lib/rbac";

export function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user: actor } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("operator");

  function reset() {
    setName("");
    setEmail("");
    setRole("operator");
  }

  function send() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const id = nid("usr");
    update((d) => {
      d.users.push({
        id,
        name: name.trim(),
        email: email.trim(),
        role,
        status: "invited",
        permissions: [],
        invitedAt: Date.now(),
      });
      pushAudit(d, "user", id, actor.fullName, `Invited as ${ROLE_META[role].label}`);
    });
    toast.success(`Invitation sent to ${email}`);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
          <DialogDescription>
            They'll receive an email to set a password and join the workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inv-d-name">Full name</Label>
            <Input id="inv-d-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah Thompson" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-d-email">Email</Label>
            <Input id="inv-d-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@company.uk" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_META) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_META[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-ink-muted">{ROLE_META[role].description}</p>
          </div>

          <div className="rounded-xl border bg-surface/60 p-3 text-xs text-ink-muted">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <Send className="size-3.5" /> What happens next
            </div>
            They receive an email invite. Once accepted, you can grant permissions
            from the user profile or apply a preset.
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="press rounded-full border bg-background px-3.5 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={send}
            className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
          >
            <Send className="size-3.5" /> Send invite
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

--- `src/components/app/two-factor-dialog.tsx` ---

```tsx
/**
 * Two-Factor Authentication setup dialog.
 * 3-step wizard: scan QR → verify code → backup codes.
 * Persists `renewably:2fa` flag in localStorage.
 */

import { useState } from "react";
import { ShieldCheck, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BACKUP_CODES = [
  "K9Q4-7M2X", "P8L3-N5RW", "C1Y6-V2HB", "T4D8-F3JZ",
  "M7E2-W6QK", "B5R9-Y1PX", "G3N7-H4LD", "S2V8-A6CT",
];

export function TwoFactorDialog({
  open,
  onOpenChange,
  onEnabled,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEnabled: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  function reset() {
    setStep(1);
    setCode("");
    setCopied(false);
  }

  function verify() {
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from your app");
      return;
    }
    setStep(3);
  }

  function finish() {
    try {
      localStorage.setItem("renewably:2fa", "true");
    } catch { /* noop */ }
    toast.success("Two-factor authentication enabled");
    onEnabled();
    reset();
    onOpenChange(false);
  }

  function copyAll() {
    navigator.clipboard.writeText(BACKUP_CODES.join("\n")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-cat-green" />
            Set up two-factor authentication
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3 · Adds an extra layer of security to your account.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Scan this code with Google Authenticator, 1Password, Authy or any TOTP app.
            </p>
            <div className="mx-auto grid size-44 place-items-center rounded-2xl border bg-background">
              {/* mock QR pattern */}
              <div className="grid size-32 grid-cols-8 grid-rows-8 gap-0.5">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className={(i * 37 + 11) % 3 === 0 ? "bg-foreground" : "bg-tile"} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-surface/60 p-3 text-center font-mono text-xs tracking-widest text-ink-muted">
              JBSW Y3DP EHPK 3PXP
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Enter the 6-digit code shown in your authenticator app.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="totp-code">Verification code</Label>
              <Input
                id="totp-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="123456"
                className="text-center font-mono text-lg tracking-[0.5em]"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Save these one-time backup codes somewhere safe. Each can be used once if you lose access to your authenticator app.
            </p>
            <div className="rounded-xl border bg-surface/60 p-4">
              <div className="grid grid-cols-2 gap-y-1 gap-x-4 font-mono text-sm">
                {BACKUP_CODES.map((c) => <div key={c}>{c}</div>)}
              </div>
            </div>
            <button
              type="button"
              onClick={copyAll}
              className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs"
            >
              {copied ? <Check className="size-3.5 text-cat-green" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy all codes"}
            </button>
          </div>
        )}

        <DialogFooter>
          {step > 1 && step < 3 && (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="press rounded-full border bg-background px-3.5 py-2 text-sm"
            >
              Back
            </button>
          )}
          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="press rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
            >
              I've scanned it
            </button>
          )}
          {step === 2 && (
            <button
              onClick={verify}
              className="press rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
            >
              Verify
            </button>
          )}
          {step === 3 && (
            <button
              onClick={finish}
              className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
            >
              <ShieldCheck className="size-3.5" /> Done
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

--- `src/components/app/payment-method-dialog.tsx` ---

```tsx
/**
 * Payment Method dialog — opens from /settings/subscription.
 * Mock card-entry form. On save, returns the new last-4 to the parent.
 */

import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentMethodDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: (last4: string) => void;
}) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  function reset() {
    setName(""); setNumber(""); setExp(""); setCvc("");
  }

  function save() {
    const digits = number.replace(/\D/g, "");
    if (!name.trim() || digits.length < 12 || exp.length < 4 || cvc.length < 3) {
      toast.error("Please fill all card fields");
      return;
    }
    const last4 = digits.slice(-4);
    toast.success(`Payment method updated · •••• ${last4}`);
    onSaved(last4);
    reset();
    onOpenChange(false);
  }

  function fmtNumber(v: string) {
    return v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  }

  function fmtExp(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="size-4" /> Update payment method
          </DialogTitle>
          <DialogDescription>
            We use Stripe for secure card processing — your card details never touch our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pm-name">Name on card</Label>
            <Input id="pm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pm-num">Card number</Label>
            <Input
              id="pm-num"
              value={number}
              onChange={(e) => setNumber(fmtNumber(e.target.value))}
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              className="font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pm-exp">Expiry</Label>
              <Input
                id="pm-exp"
                value={exp}
                onChange={(e) => setExp(fmtExp(e.target.value))}
                placeholder="MM/YY"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm-cvc">CVC</Label>
              <Input
                id="pm-cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-surface/60 px-3 py-2 text-[11px] text-ink-muted">
            <Lock className="size-3" /> Your details are encrypted in transit and at rest.
          </div>
        </div>

        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="press rounded-full border bg-background px-3.5 py-2 text-sm">
            Cancel
          </button>
          <button onClick={save} className="press rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            Save card
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

--- `src/components/app/template-editor-dialog.tsx` ---

```tsx
/**
 * Notification Template Editor — opened from /admin/config Edit button.
 * Mock-only: edits live in component state and toast on save.
 */

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type Template = {
  name: string;
  desc: string;
  subject: string;
  body: string;
};

const DEFAULT_BODY: Record<string, { subject: string; body: string }> = {
  "IBG issued": {
    subject: "Your IBG {{ibgRef}} has been issued",
    body:
      "Hi {{installerName}},\n\nYour IBG {{ibgRef}} for {{measure}} at {{propertyAddress}} has been issued.\n\nDownload the PDF from the IBG Repository.\n\n— Renewably UK",
  },
  "Amendment approved": {
    subject: "Amendment to {{ibgRef}} approved",
    body:
      "Hi {{installerName}},\n\nYour amendment request to {{ibgRef}} has been approved by {{adminName}}.\n\nThe revised IBG is available in the Repository.\n\n— Renewably UK",
  },
  "Funding submitted": {
    subject: "Funding project {{fundingRef}} submitted to {{scheme}}",
    body:
      "Hi {{installerName}},\n\nFunding project {{fundingRef}} ({{measure}}) has been submitted to {{scheme}}.\n\nYou'll receive an update once the scheme responds.\n\n— Renewably UK",
  },
};

export function TemplateEditorDialog({
  open,
  template,
  onOpenChange,
}: {
  open: boolean;
  template: { name: string; desc: string } | null;
  onOpenChange: (v: boolean) => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (template) {
      const def = DEFAULT_BODY[template.name] ?? { subject: "", body: "" };
      setSubject(def.subject);
      setBody(def.body);
    }
  }, [template]);

  if (!template) return null;

  function save() {
    toast.success(`${template!.name} template saved`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit · {template.name}</DialogTitle>
          <DialogDescription>{template.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-subj">Subject line</Label>
            <Input id="tpl-subj" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-body">Body</Label>
            <Textarea id="tpl-body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="font-mono text-xs" />
            <p className="text-[11px] text-ink-muted">
              Variables: <code className="rounded bg-tile px-1 py-0.5">{"{{installerName}}"}</code>{" "}
              <code className="rounded bg-tile px-1 py-0.5">{"{{ibgRef}}"}</code>{" "}
              <code className="rounded bg-tile px-1 py-0.5">{"{{measure}}"}</code>
            </p>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="press rounded-full border bg-background px-3.5 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
          >
            <Save className="size-3.5" /> Save template
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

--- `src/components/app/amendment-review-sheet.tsx` ---

```tsx
/**
 * Amendment review sheet — admin-side approve/reject with required reason.
 */

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { update } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import type { AmendmentRequest, IBG } from "@/lib/mock/types";

export function AmendmentReviewSheet({
  open,
  onOpenChange,
  amendment,
  ibg,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amendment: AmendmentRequest | null;
  ibg: IBG | null;
}) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"view" | "rejecting">("view");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setMode("view");
      setReason("");
    }
  }, [open]);

  if (!amendment) return null;

  function decide(decision: "approved" | "rejected", rejectReason?: string) {
    update((d) => {
      const a = d.amendments.find((x) => x.id === amendment!.id);
      if (!a) return;
      a.state = decision;
      a.decidedAt = Date.now();
      a.decidedBy = user.fullName;
      if (rejectReason) a.rejectReason = rejectReason;
      pushAudit(d, "amendment", a.id, user.fullName, decision === "approved" ? "Approved amendment" : "Rejected amendment", rejectReason);
      if (decision === "approved") {
        const i = d.ibgs.find((x) => x.id === a.ibgId);
        if (i) i.state = "amended";
      }
    });
    toast.success(`Amendment ${decision}`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Review amendment</SheetTitle>
          <SheetDescription>
            {ibg?.ref ?? amendment.ibgId} · field <span className="font-mono">{amendment.field}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 px-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-cat-rose-bg/40 p-3">
              <div className="text-[11px] uppercase text-ink-muted">Current</div>
              <div className="mt-1 text-sm text-foreground">{amendment.oldValue || "—"}</div>
            </div>
            <div className="rounded-xl bg-cat-green-bg/40 p-3">
              <div className="text-[11px] uppercase text-ink-muted">Requested</div>
              <div className="mt-1 text-sm text-foreground">{amendment.newValue}</div>
            </div>
          </div>

          <div className="rounded-xl border bg-surface/40 p-3 text-sm">
            <div className="text-[11px] uppercase text-ink-muted">Installer's reason</div>
            <p className="mt-1 text-foreground">{amendment.reason}</p>
          </div>

          {mode === "rejecting" && (
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason">Reason for rejection (required)</Label>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why so the installer can correct it"
                rows={3}
              />
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          {mode === "view" && amendment.state === "pending" && (
            <>
              <button
                onClick={() => setMode("rejecting")}
                className="press inline-flex items-center gap-1 rounded-full border bg-background px-3.5 py-2 text-sm"
              >
                <XCircle className="size-3.5" /> Reject
              </button>
              <button
                onClick={() => decide("approved")}
                className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
              >
                <CheckCircle2 className="size-3.5" /> Approve
              </button>
            </>
          )}
          {mode === "rejecting" && (
            <>
              <button
                onClick={() => setMode("view")}
                className="press rounded-full border bg-background px-3.5 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!reason.trim()) {
                    toast.error("A reason is required to reject");
                    return;
                  }
                  decide("rejected", reason.trim());
                }}
                className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
              >
                <XCircle className="size-3.5" /> Confirm reject
              </button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

```

--- `src/components/auth/auth-layout.tsx` ---

```tsx
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link to="/" className="press inline-flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">R</span>
          </div>
          <span className="text-base font-semibold tracking-tight">
            Renewably
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
          ) : null}

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-8 text-center text-sm text-ink-muted">
              {footer}
            </div>
          ) : null}
        </div>
      </div>

      {/* Marketing side */}
      <aside
        aria-hidden
        className="relative hidden overflow-hidden lg:block"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, oklch(0.94 0.05 152) 0%, oklch(0.97 0.02 250) 45%, oklch(0.99 0 0) 100%)",
        }}
      >
        <div className="absolute inset-0 p-12">
          <div className="flex h-full flex-col justify-between">
            <div className="text-sm font-medium text-ink-muted">
              Operations for UK Net Zero installers
            </div>

            <div className="space-y-4">
              <FloatingChip
                tone="green"
                title="IBG #4421 issued"
                meta="Mrs A. Patel · 14 Elm Road"
              />
              <FloatingChip
                tone="blue"
                title="Funding Match · ECO4 + GBIS"
                meta="3 schemes unlocked"
                offset
              />
              <FloatingChip
                tone="amber"
                title="Job J-118 ready for submission"
                meta="Workflow complete"
              />
            </div>

            <div className="text-xs text-ink-muted">
              The calm operating layer beneath every install.
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function FloatingChip({
  tone,
  title,
  meta,
  offset,
}: {
  tone: "green" | "blue" | "amber";
  title: string;
  meta: string;
  offset?: boolean;
}) {
  const dot = {
    green: "bg-cat-green",
    blue: "bg-cat-blue",
    amber: "bg-cat-amber",
  }[tone];
  return (
    <div
      className={`flex max-w-md items-center gap-3 rounded-2xl border bg-background/80 p-3 shadow-sm backdrop-blur ${
        offset ? "ml-10" : ""
      }`}
    >
      <span className={`size-2.5 rounded-full ${dot}`} />
      <div className="flex-1">
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-ink-muted">{meta}</div>
      </div>
    </div>
  );
}

```

--- `src/integrations/supabase/client.ts` ---

```ts
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseClient() {
  // Use import.meta.env for client-side (Vite build-time replacement)
  // Fall back to process.env for SSR (server-side rendering)
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});


```

--- `src/integrations/supabase/client.server.ts` ---

```ts
// This file is automatically generated. Do not edit it directly.
// Server-side Supabase client with service role key - bypasses RLS.
// Use this for admin operations in server functions and server routes only.
// For user-authenticated queries (with RLS), use the auth middleware instead.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
      ...(!SUPABASE_SERVICE_ROLE_KEY ? ['SUPABASE_SERVICE_ROLE_KEY'] : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

// Server-side Supabase client with service role - bypasses RLS
// SECURITY: Only use this for trusted server-side operations, never expose to client code
// Import like: import { supabaseAdmin } from "@/integrations/supabase/client.server";
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});

```

--- `src/integrations/supabase/auth-middleware.ts` ---

```ts
// This file is automatically generated. Do not edit it directly.
import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'



export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      const missing = [
        ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
        ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
      ];
      const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
      console.error(`[Supabase] ${message}`);
      throw new Response(message, { status: 500 });
    }
    
    const request = getRequest();

    if (!request?.headers) {
      throw new Response('Unauthorized: No request headers available', { status: 401 });
    }

    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      throw new Response('Unauthorized: No authorization header provided', { status: 401 });
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Response('Unauthorized: Only Bearer tokens are supported', { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Response('Unauthorized: No token provided', { status: 401 });
    }

    const supabase = createClient<Database>(
      SUPABASE_URL!,
      SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      throw new Response('Unauthorized: Invalid token', { status: 401 });
    }

    if (!data.claims.sub) {
      throw new Response('Unauthorized: No user ID found in token', { status: 401 });
    }

    return next({
      context: {
        supabase,
        userId: data.claims.sub,
        claims: data.claims,
      },
    })
  }
)

```

--- `src/integrations/supabase/types.ts` ---

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

```

--- `src/hooks/use-mobile.tsx` ---

```tsx
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

```

### 5.4 Routes (`src/routes/*`)

--- `src/routes/__root.tsx` ---

```tsx
import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { DevRoleProvider } from "@/lib/dev-role";
import { DevSwitcher } from "@/components/app/dev-switcher";
import { MockStoreProvider } from "@/lib/mock/store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-semibold tracking-tight text-ink">404</h1>
        <h2 className="mt-4 text-xl font-medium text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="press inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Renewably UK — Net Zero operations platform" },
      {
        name: "description",
        content:
          "Operational and compliance platform for UK Net Zero installation companies. IBG, Jobs, Funding Match — built for installers.",
      },
      { name: "author", content: "Renewably UK" },
      { property: "og:title", content: "Renewably UK — Net Zero operations platform" },
      {
        property: "og:description",
        content:
          "Operational and compliance platform for UK Net Zero installation companies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Renewably UK — Net Zero operations platform" },
      { name: "description", content: "ElevenLab Design Hub is a design application that visualizes and structures digital product design elements." },
      { property: "og:description", content: "ElevenLab Design Hub is a design application that visualizes and structures digital product design elements." },
      { name: "twitter:description", content: "ElevenLab Design Hub is a design application that visualizes and structures digital product design elements." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f1cbee4e-ca11-437b-bbca-869d13fc943e/id-preview-ab92c4b0--251b1e68-a9f6-47bc-bcc6-89a0809d31dd.lovable.app-1777664739071.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f1cbee4e-ca11-437b-bbca-869d13fc943e/id-preview-ab92c4b0--251b1e68-a9f6-47bc-bcc6-89a0809d31dd.lovable.app-1777664739071.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <DevRoleProvider>
      <MockStoreProvider>
        <AuthProvider>
          <Outlet />
          <Toaster />
          <DevSwitcher />
        </AuthProvider>
      </MockStoreProvider>
    </DevRoleProvider>
  );
}

```

--- `src/routes/_authed.admin.activity.tsx` ---

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Activity as ActIcon } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { relTime } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/admin/activity")({
  head: () => ({ meta: [{ title: "Activity — Renewably UK" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const data = useStore();
  const rows = [...data.activity].sort((a, b) => b.at - a.at);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · Compliance" title="Activity" subtitle="Live platform feed." />

      <div className="mt-6 rounded-2xl border bg-card">
        {rows.map((act) => (
          <div key={act.id} className="flex items-center justify-between gap-3 border-b px-5 py-3 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-cat-green-bg text-cat-green"><ActIcon className="size-4" /></div>
              <div className="text-sm text-foreground">
                <span className="font-medium">{act.actor}</span> <span className="text-ink-muted">{act.action}</span> <span className="font-medium">{act.target}</span>
              </div>
            </div>
            <div className="text-xs text-ink-muted">{relTime(act.at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.admin.amendments.tsx` ---

```tsx
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, AMENDMENT_STATES } from "@/components/app/state-pill";
import { fmtDate } from "@/lib/mock/queries";
import { AmendmentReviewSheet } from "@/components/app/amendment-review-sheet";
import type { AmendmentRequest } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/admin/amendments")({
  head: () => ({ meta: [{ title: "Amendments — Renewably UK" }] }),
  component: AmendmentsQueue,
});

function AmendmentsQueue() {
  const data = useStore();
  const [selected, setSelected] = useState<AmendmentRequest | null>(null);
  const selectedIbg = selected ? data.ibgs.find((i) => i.id === selected.ibgId) ?? null : null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · Onboarding" title="Amendment requests" subtitle="Review IBG correction requests submitted by installers." />

      <div className="mt-6 space-y-3">
        {data.amendments.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-surface/40 p-10 text-center text-sm text-ink-muted">No amendment requests.</div>
        ) : data.amendments.map((a) => {
          const ibg = data.ibgs.find((i) => i.id === a.ibgId);
          return (
            <div key={a.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{ibg?.ref ?? a.ibgId} · {a.field}</div>
                  <div className="mt-1 text-xs text-ink-muted">Requested {fmtDate(a.createdAt)}{a.decidedBy && ` · decided by ${a.decidedBy}`}</div>
                </div>
                <StatePill meta={AMENDMENT_STATES[a.state]} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-cat-rose-bg/40 p-3">
                  <div className="text-[11px] uppercase text-ink-muted">Current</div>
                  <div className="mt-1 text-sm text-foreground">{a.oldValue || "—"}</div>
                </div>
                <div className="rounded-xl bg-cat-green-bg/40 p-3">
                  <div className="text-[11px] uppercase text-ink-muted">Requested</div>
                  <div className="mt-1 text-sm text-foreground">{a.newValue}</div>
                </div>
              </div>

              <p className="mt-3 text-sm text-ink-muted"><strong className="text-foreground">Reason:</strong> {a.reason}</p>

              {a.state === "pending" && (
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setSelected(a)}
                    className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background"
                  >
                    <Eye className="size-3.5" /> Review
                  </button>
                </div>
              )}

              {a.rejectReason && a.state === "rejected" && (
                <p className="mt-3 rounded-lg bg-cat-rose-bg/40 p-2 text-xs text-foreground">
                  <strong>Rejected:</strong> {a.rejectReason}
                </p>
              )}

              {ibg && (
                <div className="mt-3 text-xs">
                  <Link to="/ibg/$id" params={{ id: ibg.id }} className="text-ink-muted hover:text-foreground">Open {ibg.ref} →</Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AmendmentReviewSheet
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
        amendment={selected}
        ibg={selectedIbg}
      />
    </div>
  );
}

```

--- `src/routes/_authed.admin.audit.tsx` ---

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { fmtDate } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/admin/audit")({
  head: () => ({ meta: [{ title: "Audit log — Renewably UK" }] }),
  component: AuditPage,
});

function AuditPage() {
  const data = useStore();
  const [q, setQ] = useState("");
  const rows = [...data.audit].sort((a, b) => b.at - a.at).filter((a) => !q || a.actor.toLowerCase().includes(q.toLowerCase()) || a.action.toLowerCase().includes(q.toLowerCase()));

  function exportCsv() {
    const lines = ["Date,Actor,Action,Entity,EntityId,Detail"];
    rows.forEach((a) => lines.push([fmtDate(a.at), a.actor, a.action, a.entityType, a.entityId, a.detail ?? ""].map((s) => `"${String(s).replace(/"/g, '""')}"`).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url; el.download = "audit-log.csv"; el.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Compliance"
        title="Audit log"
        subtitle="Every state change, write and approval — tamper-evident."
        actions={<button onClick={exportCsv} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-2 text-sm font-medium"><Download className="size-3.5" /> Export CSV</button>}
      />

      <div className="mt-6 flex justify-end">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor or action" className="h-9 w-72 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
              <th className="px-4 py-2.5 text-left">Date</th>
              <th className="px-4 py-2.5 text-left">Actor</th>
              <th className="px-4 py-2.5 text-left">Action</th>
              <th className="px-4 py-2.5 text-left">Entity</th>
              <th className="px-4 py-2.5 text-left">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 text-ink-muted">{fmtDate(a.at)}</td>
                <td className="px-4 py-3 text-foreground">{a.actor}</td>
                <td className="px-4 py-3 text-foreground">{a.action}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-tile px-2 py-0.5 text-[11px] text-ink-muted">{a.entityType}</span></td>
                <td className="px-4 py-3 text-ink-muted">{a.detail ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.admin.config.tsx` ---

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { TemplateEditorDialog } from "@/components/app/template-editor-dialog";

export const Route = createFileRoute("/_authed/admin/config")({
  head: () => ({ meta: [{ title: "System config — Renewably UK" }] }),
  component: ConfigPage,
});

const MEASURES = ["Air Source Heat Pump", "Ground Source Heat Pump", "Solar PV", "Loft Insulation", "Cavity Wall Insulation", "EV Charger", "Heat Battery"];
const TEMPLATES = [
  { name: "IBG issued", desc: "Sent to installer when an IBG is created." },
  { name: "Amendment approved", desc: "Sent when admin approves an amendment." },
  { name: "Funding submitted", desc: "Sent when a funding project is submitted to a scheme." },
];
const SCHEMES = [
  { name: "ECO4", status: "Active" },
  { name: "GBIS", status: "Active" },
  { name: "BUS", status: "Active" },
  { name: "Home Upgrade Grant", status: "Opportunity" },
];

function ConfigPage() {
  const [tab, setTab] = useState<"measures" | "templates" | "schemes">("measures");
  const [editing, setEditing] = useState<{ name: string; desc: string } | null>(null);
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · System" title="System config" subtitle="Approved measures, notification templates and scheme integrations." />

      <div className="mt-6">
        <UnderlineTabs<"measures" | "templates" | "schemes">
          value={tab} onChange={setTab}
          options={[
            { value: "measures", label: "Approved measures" },
            { value: "templates", label: "Notification templates" },
            { value: "schemes", label: "Scheme integrations" },
          ]}
        />
      </div>

      <div className="mt-5 rounded-2xl border bg-card">
        {tab === "measures" && (
          <div className="divide-y">
            {MEASURES.map((m) => (
              <div key={m} className="flex items-center justify-between px-5 py-3">
                <div className="text-sm font-medium text-foreground">{m}</div>
                <span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-[11px] font-medium text-cat-green">Approved</span>
              </div>
            ))}
          </div>
        )}
        {tab === "templates" && (
          <div className="divide-y">
            {TEMPLATES.map((t) => (
              <div key={t.name} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-ink-muted">{t.desc}</div>
                </div>
                <button onClick={() => setEditing(t)} className="press rounded-full border px-3 py-1 text-xs">Edit</button>
              </div>
            ))}
          </div>
        )}
        {tab === "schemes" && (
          <div className="divide-y">
            {SCHEMES.map((s) => (
              <div key={s.name} className="flex items-center justify-between px-5 py-3">
                <div className="text-sm font-medium text-foreground">{s.name}</div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.status === "Active" ? "bg-cat-green-bg text-cat-green" : "bg-cat-amber-bg text-cat-amber"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <TemplateEditorDialog open={!!editing} template={editing} onOpenChange={(v) => { if (!v) setEditing(null); }} />
    </div>
  );
}

```

--- `src/routes/_authed.admin.onboarding.tsx` ---

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update } from "@/lib/mock/store";
import { StatePill, ONBOARDING_STATES } from "@/components/app/state-pill";
import { fmtDate, pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import { FilterPills } from "@/components/app/filter-pills";
import type { OnboardingApplicationState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/admin/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding queue — Renewably UK" }] }),
  component: OnboardingQueue,
});

function OnboardingQueue() {
  const data = useStore();
  const { user } = useAuth();
  const [filter, setFilter] = useState<OnboardingApplicationState | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = data.onboarding.filter((o) => filter === "all" || o.state === filter);
  const open = data.onboarding.find((o) => o.id === openId);

  function setState(id: string, next: OnboardingApplicationState) {
    update((d) => {
      const x = d.onboarding.find((y) => y.id === id);
      if (!x) return;
      x.state = next;
      pushAudit(d, "user", id, user.fullName, `Onboarding → ${next}`);
    });
    toast.success(`Application ${next}`);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Admin · Onboarding" title="Onboarding queue" subtitle="Review submitted applications. Verify, activate or reject." />

      <div className="mt-6">
        <FilterPills<OnboardingApplicationState>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "awaiting-review", label: "Awaiting review" },
            { value: "awaiting-verification", label: "Awaiting verification" },
            { value: "blocked", label: "Blocked" },
            { value: "activated", label: "Activated" },
          ].map((f) => ({ ...f, count: data.onboarding.filter((o) => o.state === f.value as OnboardingApplicationState).length })) as never}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {rows.map((o) => (
          <button key={o.id} onClick={() => setOpenId(o.id)} className="press rounded-2xl border bg-card p-5 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">{o.companyName}</div>
                <div className="text-xs text-ink-muted">{o.contactName} · {o.contactEmail}</div>
              </div>
              <StatePill meta={ONBOARDING_STATES[o.state]} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {o.measures.map((m) => <span key={m} className="rounded-full bg-tile px-2 py-0.5 text-[11px] text-ink-muted">{m}</span>)}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted">
              <span>Submitted {fmtDate(o.submittedAt)}</span>
              <span>{o.tier === "operate" ? "Operate" : "Access"}</span>
            </div>
            {o.blockedReason && (
              <div className="mt-3 rounded-xl bg-cat-rose-bg/50 px-3 py-2 text-[11px] text-cat-rose">{o.blockedReason}</div>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setOpenId(null)}>
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-xs uppercase tracking-wide text-ink-muted">Application</div>
            <h2 className="mt-1 text-xl font-semibold">{open.companyName}</h2>
            <div className="mt-1 text-sm text-ink-muted">{open.contactName} · {open.contactEmail}</div>

            <div className="mt-4 space-y-2 text-sm">
              <div><span className="text-ink-muted">Companies House</span> · {open.companiesHouseNumber}</div>
              <div><span className="text-ink-muted">Tier</span> · {open.tier}</div>
              <div><span className="text-ink-muted">Measures</span> · {open.measures.join(", ")}</div>
              <div><span className="text-ink-muted">Accreditations</span> · {open.accreditationFiles.join(", ") || "None"}</div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setState(open.id, "blocked"); setOpenId(null); }} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm">
                <XCircle className="size-3.5" /> Reject
              </button>
              <button onClick={() => { setState(open.id, "ready-for-activation"); setOpenId(null); }} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm">
                <Clock className="size-3.5" /> Mark ready
              </button>
              <button onClick={() => { setState(open.id, "activated"); setOpenId(null); }} className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background">
                <CheckCircle2 className="size-3.5" /> Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

--- `src/routes/_authed.admin.permissions.tsx` ---

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Library, UserPlus, Check, X, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import {
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  OPERATOR_PRESETS,
  ROLE_META,
  type Permission,
  type PermissionCategory,
} from "@/lib/rbac";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { useStore, update } from "@/lib/mock/store";
import { findUser, pushAudit, relTime } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/app/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authed/admin/permissions")({
  head: () => ({ meta: [{ title: "Permissions — Renewably UK" }] }),
  component: PermissionsPage,
});

type Tab = "library" | "presets" | "requests";

function PermissionsPage() {
  const data = useStore();
  const [tab, setTab] = useState<Tab>("library");
  const [cat, setCat] = useState<PermissionCategory>(PERMISSION_CATEGORIES[0]);
  const [assignPerm, setAssignPerm] = useState<Permission | null>(null);
  const [assignPreset, setAssignPreset] = useState<string | null>(null);

  const filtered = PERMISSIONS.filter((p) => p.category === cat);
  const pending = data.permissionRequests.filter((r) => r.state === "pending");

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · System"
        title="Permissions"
        subtitle="The catalogue of capabilities you can grant — by individual permission, by preset, or by request."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cat-purple-bg px-3 py-1.5 text-xs font-medium text-cat-purple">
            <Library className="size-3.5" /> {PERMISSIONS.length} permissions
          </span>
        }
      />

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "library", label: "Library" },
            { value: "presets", label: "Presets", count: OPERATOR_PRESETS.length },
            { value: "requests", label: "Requests", count: pending.length },
          ]}
        />
      </div>

      {tab === "library" && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex gap-1 overflow-x-auto lg:flex-col">
            {PERMISSION_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm lg:w-full ${
                  cat === c
                    ? "bg-foreground text-background"
                    : "text-ink-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border bg-card">
            <div className="border-b px-5 py-3 text-sm font-medium">{cat}</div>
            <div className="divide-y">
              {filtered.map((p) => {
                const grantedTo = data.users.filter((u) => u.permissions.includes(p.id));
                return (
                  <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{p.label}</div>
                      <div className="text-xs text-ink-muted">{p.description}</div>
                      <div className="mt-1 text-[11px] text-ink-muted">
                        Granted to {grantedTo.length} user{grantedTo.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <code className="hidden rounded-md bg-tile px-2 py-0.5 text-[11px] text-ink-muted md:inline">
                        {p.id}
                      </code>
                      <button
                        onClick={() => setAssignPerm(p.id)}
                        className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                      >
                        <UserPlus className="size-3" /> Assign
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "presets" && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {OPERATOR_PRESETS.map((p) => (
            <div key={p.id} className="flex flex-col rounded-2xl border bg-card p-5">
              <div className="text-sm font-semibold text-foreground">{p.label}</div>
              <div className="mt-1 text-xs text-ink-muted">{p.description}</div>
              <div className="mt-3 text-[11px] uppercase tracking-wide text-ink-muted">
                {p.permissions.length} permissions
              </div>
              <ul className="mt-2 max-h-40 flex-1 space-y-1 overflow-y-auto">
                {p.permissions.map((perm) => (
                  <li key={perm} className="text-[11px] text-ink-muted">
                    {PERMISSIONS.find((x) => x.id === perm)?.label ?? perm}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setAssignPreset(p.id)}
                className="press mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-xs font-medium text-background"
              >
                <UserPlus className="size-3.5" /> Assign preset to user
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "requests" && <RequestsTab />}

      {assignPerm && (
        <AssignDialog
          mode="permission"
          permission={assignPerm}
          onClose={() => setAssignPerm(null)}
        />
      )}
      {assignPreset && (
        <AssignDialog
          mode="preset"
          presetId={assignPreset}
          onClose={() => setAssignPreset(null)}
        />
      )}
    </div>
  );
}

function RequestsTab() {
  const data = useStore();
  const { user: actor } = useAuth();
  const pending = data.permissionRequests.filter((r) => r.state === "pending");
  const decided = data.permissionRequests.filter((r) => r.state !== "pending");

  function decide(id: string, approve: boolean) {
    update((d) => {
      const req = d.permissionRequests.find((r) => r.id === id);
      if (!req) return;
      req.state = approve ? "approved" : "rejected";
      req.decidedAt = Date.now();
      req.decidedBy = actor.fullName;
      if (approve) {
        const u = d.users.find((x) => x.id === req.userId);
        if (u && !u.permissions.includes(req.permission)) {
          u.permissions.push(req.permission);
        }
      }
      pushAudit(
        d,
        "user",
        req.userId,
        actor.fullName,
        approve ? `Approved permission ${req.permission}` : `Rejected permission ${req.permission}`,
      );
    });
    toast.success(approve ? "Permission granted" : "Request rejected");
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border bg-card">
        <div className="border-b px-5 py-3 text-sm font-medium">
          Pending {pending.length > 0 && <span className="ml-1 text-ink-muted">· {pending.length}</span>}
        </div>
        {pending.length === 0 ? (
          <div className="px-5 py-10">
            <EmptyState icon={Check} title="No pending requests" body="Operators can request access from any locked feature." />
          </div>
        ) : (
          <div className="divide-y">
            {pending.map((r) => {
              const u = findUser(data, r.userId);
              const perm = PERMISSIONS.find((p) => p.id === r.permission);
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {u?.name ?? "Unknown user"}{" "}
                      <span className="text-ink-muted">requested</span>{" "}
                      {perm?.label ?? r.permission}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">"{r.reason}"</div>
                    <div className="mt-1 text-[11px] text-ink-muted">
                      {u?.email} · {ROLE_META[u?.role ?? "operator"].short} · {relTime(r.requestedAt)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => decide(r.id, false)}
                      className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"
                    >
                      <X className="size-3" /> Reject
                    </button>
                    <button
                      onClick={() => decide(r.id, true)}
                      className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                    >
                      <Check className="size-3" /> Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-5 py-3 text-sm font-medium">Decided</div>
          <div className="divide-y">
            {decided.slice(0, 8).map((r) => {
              const u = findUser(data, r.userId);
              const perm = PERMISSIONS.find((p) => p.id === r.permission);
              return (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="text-sm text-foreground">
                    {u?.name} · {perm?.label}
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    {r.state === "approved" ? "Approved" : "Rejected"} by {r.decidedBy} · {r.decidedAt && relTime(r.decidedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AssignDialog({
  mode,
  permission,
  presetId,
  onClose,
}: {
  mode: "permission" | "preset";
  permission?: Permission;
  presetId?: string;
  onClose: () => void;
}) {
  const data = useStore();
  const { user: actor } = useAuth();
  const [q, setQ] = useState("");

  const eligible = useMemo(
    () => data.users.filter((u) => u.role !== "admin" && u.status !== "banned"),
    [data.users],
  );
  const filtered = eligible.filter(
    (u) => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()),
  );

  const preset = presetId ? OPERATOR_PRESETS.find((p) => p.id === presetId) : null;
  const permDef = permission ? PERMISSIONS.find((p) => p.id === permission) : null;

  function assign(userId: string) {
    update((d) => {
      const u = d.users.find((x) => x.id === userId);
      if (!u) return;
      if (mode === "permission" && permission) {
        if (!u.permissions.includes(permission)) u.permissions.push(permission);
        pushAudit(d, "user", userId, actor.fullName, `Granted ${permission}`);
      }
      if (mode === "preset" && preset) {
        u.permissions = Array.from(new Set([...u.permissions, ...preset.permissions]));
        pushAudit(d, "user", userId, actor.fullName, `Applied preset: ${preset.label}`);
      }
    });
    toast.success("Assigned");
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "permission" ? `Assign ${permDef?.label}` : `Assign ${preset?.label}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "permission"
              ? "Grant this permission to one or more users."
              : "Apply this preset's permissions to a user (additive — won't remove existing)."}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users"
            className="h-9 w-full rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          <div className="divide-y">
            {filtered.map((u) => {
              const has =
                mode === "permission" && permission
                  ? u.permissions.includes(permission)
                  : false;
              return (
                <div key={u.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-ink-muted">
                      {u.email} · {ROLE_META[u.role].short}
                    </div>
                  </div>
                  <button
                    disabled={has}
                    onClick={() => assign(u.id)}
                    className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
                  >
                    {has ? "Already granted" : "Assign"}
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-6 text-center text-xs text-ink-muted">No matching users.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

```

--- `src/routes/_authed.admin.users.$id.tsx` ---

```tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, UserMinus, UserCheck, Ban, ShieldAlert, Trash2, RotateCcw, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { findUser, pushAudit, fmtDate } from "@/lib/mock/queries";
import { StatePill, USER_STATES } from "@/components/app/state-pill";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { PERMISSIONS, PERMISSION_CATEGORIES, OPERATOR_PRESETS, ROLE_META, DEFAULT_PERMISSIONS, type Permission } from "@/lib/rbac";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authed/admin/users/$id")({
  head: () => ({ meta: [{ title: "User — Renewably UK" }] }),
  component: UserDetail,
});

type Tab = "overview" | "permissions" | "audit";

function UserDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const u = findUser(data, id);
  const { user: actor } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  if (!u) throw notFound();




  function grant(p: Permission) {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x || x.permissions.includes(p)) return;
      x.permissions = [...x.permissions, p];
      pushAudit(d, "user", id, actor.fullName, `Granted ${p}`);
    });
    toast.success("Permission granted");
  }

  function revoke(p: Permission) {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.permissions = x.permissions.filter((y) => y !== p);
      pushAudit(d, "user", id, actor.fullName, `Revoked ${p}`);
    });
    toast.success("Permission revoked");
  }

  function clearAll() {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.permissions = [];
      pushAudit(d, "user", id, actor.fullName, "Cleared all custom grants");
    });
    toast.success("All custom grants cleared");
  }

  function resetToRoleDefaults() {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.permissions = [...DEFAULT_PERMISSIONS[x.role]];
      pushAudit(d, "user", id, actor.fullName, "Reset to role defaults");
    });
    toast.success("Reset to role defaults");
  }

  function applyPreset(presetId: string) {
    const preset = OPERATOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.permissions = [...preset.permissions];
      pushAudit(d, "user", id, actor.fullName, `Applied preset: ${preset.label}`);
    });
    toast.success(`Applied ${preset.label}`);
  }

  function setStatus(next: "invited" | "pending" | "active" | "suspended" | "deactivated" | "banned") {
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.status = next;
      if (next !== "banned") x.banReason = undefined;
      pushAudit(d, "user", id, actor.fullName, `Status set to ${next}`);
    });
    toast.success(`User ${next}`);
  }

  function confirmBan() {
    if (!banReason.trim()) {
      toast.error("Reason is required");
      return;
    }
    update((d) => {
      const x = d.users.find((y) => y.id === id);
      if (!x) return;
      x.status = "banned";
      x.banReason = banReason.trim();
      pushAudit(d, "user", id, actor.fullName, "Banned user", banReason.trim());
    });
    toast.success("User banned");
    setBanReason("");
    setBanOpen(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <Link to="/admin/users" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Users
      </Link>

      <div className="mt-3 flex flex-col items-start justify-between gap-4 md:flex-row md:items-start md:gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">User</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{u.name}</h1>
          <div className="mt-2 text-sm text-ink-muted">{u.email} · <span className="rounded-full bg-cat-purple-bg px-2 py-0.5 text-[11px] font-medium text-cat-purple">{ROLE_META[u.role].label}</span></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatePill meta={USER_STATES[u.status]} />
          {u.status === "active" && (
            <button onClick={() => setStatus("suspended")} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"><UserMinus className="size-3" /> Suspend</button>
          )}
          {(u.status === "suspended" || u.status === "deactivated") && (
            <button onClick={() => setStatus("active")} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"><UserCheck className="size-3" /> Reactivate</button>
          )}
          {u.status === "banned" ? (
            <button onClick={() => setStatus("active")} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs"><UserCheck className="size-3" /> Unban</button>
          ) : (
            <button onClick={() => setBanOpen(true)} className="press inline-flex items-center gap-1 rounded-full border border-cat-rose/30 bg-cat-rose-bg px-3 py-1.5 text-xs text-cat-rose"><Ban className="size-3" /> Ban</button>
          )}
        </div>
      </div>

      {u.status === "banned" && u.banReason && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-cat-rose/30 bg-cat-rose-bg/50 px-4 py-3 text-sm text-cat-rose">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <div className="font-medium">User is banned</div>
            <div className="text-xs opacity-90">{u.banReason}</div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "permissions", label: "Permissions", count: u.permissions.length },
            { value: "audit", label: "Audit" },
          ]}
        />
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="rounded-2xl border bg-card p-5">
            <div className="space-y-2">
              <Row label="Role" value={ROLE_META[u.role].label} />
              <Row label="Email" value={u.email} />
              <Row label="Invited" value={fmtDate(u.invitedAt)} />
              <Row label="Permissions" value={`${u.permissions.length} granted`} />
              {u.banReason && <Row label="Ban reason" value={u.banReason} />}
            </div>
          </div>
        )}

        {tab === "permissions" && (
          <div className="space-y-4">
            {u.role === "operator" && (
              <div className="rounded-2xl border bg-card p-4">
                <div className="text-sm font-medium text-foreground">Apply preset</div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                  {OPERATOR_PRESETS.map((p) => (
                    <button key={p.id} onClick={() => applyPreset(p.id)} className="press rounded-xl border bg-background p-3 text-left">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground"><ShieldCheck className="size-3.5 text-cat-blue" /> {p.label}</div>
                      <div className="mt-1 text-xs text-ink-muted">{p.description}</div>
                      <div className="mt-2 text-[11px] text-ink-muted">{p.permissions.length} permissions</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-surface/40 p-3 text-xs text-ink-muted">
              <span>
                <strong className="text-foreground">{u.permissions.length}</strong> permission{u.permissions.length === 1 ? "" : "s"} granted
                {" · "}role default: {DEFAULT_PERMISSIONS[u.role].length}
              </span>
              <div className="flex gap-2">
                <button onClick={resetToRoleDefaults} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-xs">
                  <RotateCcw className="size-3" /> Reset to role defaults
                </button>
                <button onClick={clearAll} className="press inline-flex items-center gap-1 rounded-full border border-cat-rose/30 bg-cat-rose-bg px-3 py-1.5 text-xs text-cat-rose">
                  <Trash2 className="size-3" /> Clear all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Granted */}
              <div className="rounded-2xl border bg-card">
                <div className="flex items-center justify-between border-b px-5 py-3 text-sm">
                  <span className="font-medium text-foreground">Granted ({u.permissions.length})</span>
                  <span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-[10px] font-medium text-cat-green">Active</span>
                </div>
                {u.permissions.length === 0 ? (
                  <div className="p-6 text-center text-sm text-ink-muted">No permissions granted yet.</div>
                ) : (
                  <div className="divide-y">
                    {PERMISSIONS.filter((p) => u.permissions.includes(p.id)).map((p) => (
                      <div key={p.id} className="flex items-start justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground">{p.label}</div>
                          <div className="text-[11px] text-ink-muted">{p.category} · {p.description}</div>
                        </div>
                        <button
                          onClick={() => revoke(p.id)}
                          className="press inline-flex shrink-0 items-center gap-1 rounded-full border border-cat-rose/30 bg-cat-rose-bg px-2.5 py-1 text-[11px] text-cat-rose"
                        >
                          <X className="size-3" /> Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available */}
              <div className="rounded-2xl border bg-card">
                <div className="border-b px-5 py-3 text-sm font-medium text-foreground">
                  Available ({PERMISSIONS.length - u.permissions.length})
                </div>
                <div className="max-h-[600px] divide-y overflow-y-auto">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const perms = PERMISSIONS.filter((p) => p.category === cat && !u.permissions.includes(p.id));
                    if (perms.length === 0) return null;
                    return (
                      <div key={cat}>
                        <div className="bg-surface/60 px-5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">{cat}</div>
                        {perms.map((p) => (
                          <div key={p.id} className="flex items-start justify-between gap-3 px-5 py-3">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-foreground">{p.label}</div>
                              <div className="text-[11px] text-ink-muted">{p.description}</div>
                            </div>
                            <button
                              onClick={() => grant(p.id)}
                              className="press inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium text-background"
                            >
                              <Plus className="size-3" /> Grant
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "audit" && <AuditTimeline entityType="user" entityId={u.id} />}
      </div>

      <Dialog open={banOpen} onOpenChange={(v) => { if (!v) setBanReason(""); setBanOpen(v); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-cat-rose" /> Ban {u.name}?
            </DialogTitle>
            <DialogDescription>
              They'll lose access immediately. The reason is recorded in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="ban-reason">Reason</Label>
            <Textarea
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Repeated policy violations, fraudulent submissions, etc."
              rows={4}
            />
          </div>
          <DialogFooter>
            <button onClick={() => { setBanReason(""); setBanOpen(false); }} className="press rounded-full border bg-background px-3.5 py-2 text-sm">Cancel</button>
            <button onClick={confirmBan} className="press inline-flex items-center gap-1.5 rounded-full bg-cat-rose px-3.5 py-2 text-sm font-medium text-white">
              <Ban className="size-4" /> Ban user
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2.5 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

```

--- `src/routes/_authed.admin.users.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Users, MoreHorizontal, Ban, UserCheck, ShieldAlert, Mail, Send } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update, nid } from "@/lib/mock/store";
import { StatePill, USER_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate, relTime, pushAudit } from "@/lib/mock/queries";
import { ROLE_META, type Role } from "@/lib/rbac";
import { EmptyState } from "@/components/app/empty-state";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ManagedUser, UserStatus } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/admin/users")({
  head: () => ({ meta: [{ title: "Users — Renewably UK" }] }),
  component: UsersList,
});

function UsersList() {
  const data = useStore();
  const { user: actor } = useAuth();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Role | "all" | "banned">("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<ManagedUser | null>(null);

  const rows = data.users
    .filter((u) => {
      if (filter === "all") return true;
      if (filter === "banned") return u.status === "banned";
      return u.role === filter;
    })
    .filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase()),
    );

  function setStatus(u: ManagedUser, next: UserStatus) {
    update((d) => {
      const x = d.users.find((y) => y.id === u.id);
      if (!x) return;
      x.status = next;
      if (next !== "banned") x.banReason = undefined;
      pushAudit(d, "user", u.id, actor.fullName, `Status set to ${next}`);
    });
    toast.success(`${u.name}: ${next}`);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Admin · Users"
        title="User directory"
        subtitle="Invite, assign roles and grant permissions from the library."
        actions={
          <button
            onClick={() => setInviteOpen(true)}
            className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
          >
            <Plus className="size-4" /> Invite user
          </button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterPills<Role | "banned">
          value={filter}
          onChange={setFilter}
          options={[
            ...(Object.keys(ROLE_META) as Role[]).map((r) => ({
              value: r,
              label: ROLE_META[r].short,
              count: data.users.filter((u) => u.role === r).length,
            })),
            {
              value: "banned" as const,
              label: "Banned",
              count: data.users.filter((u) => u.status === "banned").length,
            },
          ]}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email"
            className="h-9 w-full rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring md:w-64"
          />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? (
          <EmptyState icon={Users} title="No users" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">User</th>
                  <th className="px-4 py-2.5 text-left">Role</th>
                  <th className="px-4 py-2.5 text-left">Permissions</th>
                  <th className="px-4 py-2.5 text-left">Last active</th>
                  <th className="px-4 py-2.5 text-left">Invited</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-right" />
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0 hover:bg-surface/60">
                    <td className="px-4 py-3">
                      <Link to="/admin/users/$id" params={{ id: u.id }} className="block">
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-ink-muted">{u.email}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cat-purple-bg px-2 py-0.5 text-[11px] font-medium text-cat-purple">
                        {ROLE_META[u.role].short}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{u.permissions.length || "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{u.lastActive ? relTime(u.lastActive) : "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{fmtDate(u.invitedAt)}</td>
                    <td className="px-4 py-3"><StatePill meta={USER_STATES[u.status]} /></td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="press rounded-full p-1.5 text-ink-muted hover:bg-muted hover:text-foreground"
                            aria-label="User actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/users/$id" params={{ id: u.id }}>Open profile</Link>
                          </DropdownMenuItem>
                          {u.status === "invited" && (
                            <DropdownMenuItem
                              onClick={() => {
                                update((d) => {
                                  const x = d.users.find((y) => y.id === u.id);
                                  if (!x) return;
                                  x.invitedAt = Date.now();
                                  pushAudit(d, "user", u.id, actor.fullName, "Invitation resent");
                                });
                                toast.success(`Invitation resent to ${u.email}`);
                              }}
                            >
                              <Mail className="mr-2 size-3.5" /> Resend invite
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {u.status === "active" && (
                            <DropdownMenuItem onClick={() => setStatus(u, "suspended")}>
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {(u.status === "suspended" || u.status === "deactivated") && (
                            <DropdownMenuItem onClick={() => setStatus(u, "active")}>
                              <UserCheck className="mr-2 size-3.5" /> Reactivate
                            </DropdownMenuItem>
                          )}
                          {u.status === "banned" ? (
                            <DropdownMenuItem onClick={() => setStatus(u, "active")}>
                              <UserCheck className="mr-2 size-3.5" /> Unban
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setBanTarget(u)}
                              className="text-cat-rose focus:text-cat-rose"
                            >
                              <Ban className="mr-2 size-3.5" /> Ban user
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InviteSheet open={inviteOpen} onOpenChange={setInviteOpen} actorName={actor.fullName} />
      <BanDialog
        target={banTarget}
        onClose={() => setBanTarget(null)}
        actorName={actor.fullName}
      />
    </div>
  );
}

function InviteSheet({
  open,
  onOpenChange,
  actorName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  actorName: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("operator");

  function reset() {
    setName("");
    setEmail("");
    setRole("operator");
  }

  function send() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const id = nid("usr");
    update((d) => {
      d.users.push({
        id,
        name: name.trim(),
        email: email.trim(),
        role,
        status: "invited",
        permissions: [],
        invitedAt: Date.now(),
      });
      pushAudit(d, "user", id, actorName, `Invited as ${ROLE_META[role].label}`);
    });
    toast.success(`Invitation sent to ${email}`);
    reset();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Invite a user</SheetTitle>
          <SheetDescription>
            They'll receive an email to set a password and join the workspace.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inv-name">Full name</Label>
            <Input id="inv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv-email">Email</Label>
            <Input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.uk" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_META) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_META[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-ink-muted">{ROLE_META[role].description}</p>
          </div>

          <div className="rounded-xl border bg-surface/60 p-3 text-xs text-ink-muted">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <Send className="size-3.5" /> What happens next
            </div>
            They receive an email invite. Once accepted, you can grant permissions
            from the user profile or apply a preset.
          </div>
        </div>
        <SheetFooter className="mt-6 flex flex-row justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="press rounded-full border bg-background px-3.5 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={send}
            className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
          >
            <Plus className="size-4" /> Send invite
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function BanDialog({
  target,
  onClose,
  actorName,
}: {
  target: ManagedUser | null;
  onClose: () => void;
  actorName: string;
}) {
  const [reason, setReason] = useState("");

  function confirm() {
    if (!target) return;
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }
    update((d) => {
      const x = d.users.find((y) => y.id === target.id);
      if (!x) return;
      x.status = "banned";
      x.banReason = reason.trim();
      pushAudit(d, "user", target.id, actorName, "Banned user", reason.trim());
    });
    toast.success(`${target.name} banned`);
    setReason("");
    onClose();
  }

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && (setReason(""), onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-cat-rose" /> Ban {target?.name}?
          </DialogTitle>
          <DialogDescription>
            They'll lose access immediately. The reason is recorded in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="ban-reason">Reason</Label>
          <Textarea
            id="ban-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Repeated policy violations, fraudulent submissions, etc."
            rows={4}
          />
        </div>
        <DialogFooter>
          <button
            onClick={() => {
              setReason("");
              onClose();
            }}
            className="press rounded-full border bg-background px-3.5 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="press inline-flex items-center gap-1.5 rounded-full bg-cat-rose px-3.5 py-2 text-sm font-medium text-white"
          >
            <Ban className="size-4" /> Ban user
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

--- `src/routes/_authed.customers.$id.tsx` ---

```tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, Plus, Building2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { StatePill, RECORD_STATES, JOB_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { useStore, update, nid } from "@/lib/mock/store";
import { findCustomer, propertiesOfCustomer, jobsOfCustomer, fmtDate, pushAudit } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { useAuth } from "@/lib/auth-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/_authed/customers/$id")({
  head: () => ({ meta: [{ title: "Customer — Renewably UK" }] }),
  component: CustomerDetail,
});

type Tab = "overview" | "properties" | "jobs" | "documents" | "audit";

const PROP_TYPES = ["Detached", "Semi-detached", "Terraced", "Flat", "Other"];
const EPC_GRADES = ["A", "B", "C", "D", "E", "F", "G", "Unknown"];

function normalisePostcode(s: string) {
  return s.replace(/\s+/g, "").toLowerCase();
}

function CustomerDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const customer = findCustomer(data, id);
  const [tab, setTab] = useState<Tab>("overview");
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!customer) throw notFound();

  const props = propertiesOfCustomer(data, customer.id);
  const jobs = jobsOfCustomer(data, customer.id);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/customers" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Customers
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Customer · {customer.ref}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1"><Mail className="size-3.5" /> {customer.email}</span>
            <span className="inline-flex items-center gap-1"><Phone className="size-3.5" /> {customer.phone}</span>
            {customer.org && <span className="inline-flex items-center gap-1"><Building2 className="size-3.5" /> {customer.org}</span>}
          </div>
        </div>
        <StatePill meta={RECORD_STATES[customer.status]} />
      </div>

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "properties", label: "Properties", count: props.length },
            { value: "jobs", label: "Jobs", count: jobs.length },
            { value: "documents", label: "Documents" },
            { value: "audit", label: "Audit" },
          ]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {tab === "overview" && (
            <div className="space-y-4">
              <Card title="Summary">
                <Detail label="Created" value={fmtDate(customer.createdAt)} />
                <Detail label="Status" value={<StatePill meta={RECORD_STATES[customer.status]} />} />
                <Detail label="Properties" value={`${props.length} linked`} />
                <Detail label="Jobs" value={`${jobs.length} on record`} />
              </Card>
            </div>
          )}
          {tab === "properties" && (
            <Card
              title="Properties"
              action={
                <button
                  onClick={() => setSheetOpen(true)}
                  className="press inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                >
                  <Plus className="size-3" /> Add property
                </button>
              }
            >
              {props.length === 0 ? (
                <EmptyState icon={Building2} title="No properties yet" body="Add a property to start a job." />
              ) : (
                <div className="space-y-1">
                  {props.map((p) => (
                    <Link key={p.id} to="/properties/$id" params={{ id: p.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                      <div>
                        <div className="text-sm font-medium text-foreground">{p.address}</div>
                        <div className="text-xs text-ink-muted">{p.postcode} · EPC {p.epc ?? "—"}</div>
                      </div>
                      <StatePill meta={RECORD_STATES[p.status]} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
          {tab === "jobs" && (
            <Card title="Jobs">
              {jobs.length === 0 ? <EmptyState title="No jobs yet" body="Create a property, then start a job." /> : (
                <div className="space-y-1">
                  {jobs.map((j) => (
                    <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                      <div>
                        <div className="text-sm font-medium text-foreground">{j.ref} · {j.measure}</div>
                        <div className="text-xs text-ink-muted">Owner · {j.owner} · started {j.startDate}</div>
                      </div>
                      <StatePill meta={JOB_STATES[j.state]} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
          {tab === "documents" && (
            <Card title="Documents">
              <EmptyState title="No documents yet" body="Upload contracts, surveys and EPCs against this customer." />
            </Card>
          )}
          {tab === "audit" && <AuditTimeline entityType="customer" entityId={customer.id} />}
        </div>

        <aside className="space-y-4">
          <AuditTimeline entityType="customer" entityId={customer.id} />
        </aside>
      </div>

      <AddPropertySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        customerId={customer.id}
      />
    </div>
  );
}

function AddPropertySheet({
  open,
  onOpenChange,
  customerId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customerId: string;
}) {
  const data = useStore();
  const { user } = useAuth();
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [town, setTown] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propType, setPropType] = useState(PROP_TYPES[0]);
  const [epc, setEpc] = useState("Unknown");
  const [uprn, setUprn] = useState("");
  const [duplicate, setDuplicate] = useState<{ id: string; address: string } | null>(null);

  function reset() {
    setLine1(""); setLine2(""); setTown(""); setCounty(""); setPostcode("");
    setPropType(PROP_TYPES[0]); setEpc("Unknown"); setUprn(""); setDuplicate(null);
  }

  function checkDuplicate() {
    if (!postcode) { setDuplicate(null); return; }
    const norm = normalisePostcode(postcode);
    const match = data.properties.find((p) => normalisePostcode(p.postcode) === norm);
    if (match) setDuplicate({ id: match.id, address: match.address });
    else setDuplicate(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!line1 || !town || !postcode) {
      toast.error("Address line 1, town and postcode are required");
      return;
    }
    const address = [line1, line2, town, county].filter(Boolean).join(", ");
    const newId = nid("pro");
    update((d) => {
      d.properties.unshift({
        id: newId,
        customerId,
        address,
        postcode: postcode.toUpperCase(),
        uprn: uprn || undefined,
        epc: epc === "Unknown" ? undefined : epc,
        status: "active",
        createdAt: Date.now(),
      });
      pushAudit(d, "customer", customerId, user.fullName, `Added property ${address}`);
      pushAudit(d, "property", newId, user.fullName, `Created property ${address}`);
    });
    toast.success("Property added");
    onOpenChange(false);
    reset();
  }

  const inputCls =
    "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-[480px]">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold">Add property</SheetTitle>
        </SheetHeader>

        <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <Field label="Address line 1" required>
              <input value={line1} onChange={(e) => setLine1(e.target.value)} className={inputCls} placeholder="14 Birchwood Close" />
            </Field>
            <Field label="Address line 2">
              <input value={line2} onChange={(e) => setLine2(e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Town / City" required>
                <input value={town} onChange={(e) => setTown(e.target.value)} className={inputCls} placeholder="Leeds" />
              </Field>
              <Field label="County">
                <input value={county} onChange={(e) => setCounty(e.target.value)} className={inputCls} placeholder="West Yorkshire" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Postcode" required>
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  onBlur={checkDuplicate}
                  className={inputCls}
                  placeholder="LS8 4NR"
                />
              </Field>
              <Field label="UPRN">
                <input value={uprn} onChange={(e) => setUprn(e.target.value)} className={inputCls} placeholder="Optional" />
              </Field>
            </div>

            {duplicate && (
              <div className="flex items-start gap-2 rounded-lg border border-cat-amber/40 bg-cat-amber-bg/50 px-3 py-2 text-xs text-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-cat-amber" />
                <div className="flex-1">
                  A property at this postcode may already exist —{" "}
                  <span className="font-medium">{duplicate.address}</span>.{" "}
                  <Link
                    to="/properties/$id"
                    params={{ id: duplicate.id }}
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                    onClick={() => onOpenChange(false)}
                  >
                    View →
                  </Link>
                </div>
              </div>
            )}

            <Field label="Property type">
              <select value={propType} onChange={(e) => setPropType(e.target.value)} className={inputCls}>
                {PROP_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="EPC rating">
              <select value={epc} onChange={(e) => setEpc(e.target.value)} className={inputCls}>
                {EPC_GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 border-t bg-background px-5 py-3">
            <button
              type="button"
              onClick={() => { onOpenChange(false); reset(); }}
              className="press rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-surface hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="press rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Add property
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2.5 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-ink-muted">
        {label}{required && <span className="text-destructive"> *</span>}
      </div>
      {children}
    </label>
  );
}

void PageHeader;

```

--- `src/routes/_authed.customers.new.tsx` ---

```tsx
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { update, nid, nref } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/customers/new")({
  head: () => ({ meta: [{ title: "New customer — Renewably UK" }] }),
  component: NewCustomer,
});

function NewCustomer() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", org: "" });

  function save(activate: boolean) {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const id = nid("cus");
    const ref = nref("C");
    update((d) => {
      d.customers.unshift({
        id, ref, name: form.name, email: form.email, phone: form.phone,
        org: form.org || undefined,
        status: activate ? "active" : "draft",
        createdAt: Date.now(),
      });
      pushAudit(d, "customer", id, user.fullName, activate ? "Created and activated customer" : "Saved customer draft");
    });
    toast.success(activate ? "Customer activated" : "Saved as draft");
    nav({ to: "/customers/$id", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <Link to="/customers" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to customers
      </Link>
      <div className="mt-3">
        <PageHeader eyebrow="Customers" title="New customer" subtitle="Create a customer record. You can add properties and jobs after." />
      </div>

      <div className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
        <Field label="Full name *">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Organisation (optional)">
          <input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={() => save(false)} className="press rounded-full border bg-background px-4 py-2 text-sm font-medium">Save draft</button>
          <button onClick={() => save(true)} className="press rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Save & activate</button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-ink-muted">{label}</div>
      {children}
    </label>
  );
}

```

--- `src/routes/_authed.customers.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, RECORD_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate, propertiesOfCustomer, jobsOfCustomer } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/customers")({
  head: () => ({ meta: [{ title: "Customers — Renewably UK" }] }),
  component: CustomersList,
});

function CustomersList() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "archived">("all");

  if (!can(permissions, "customers.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Customers" title="Customers" />
        <div className="mt-6"><LockedCard title="Customers" reason={{ kind: "permission", permission: "customers.read" }} /></div>
      </div>
    );
  }

  const rows = data.customers
    .filter((c) => filter === "all" || c.status === filter)
    .filter((c) => q === "" || c.name.toLowerCase().includes(q.toLowerCase()) || c.ref.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Projects"
        title="Customers"
        subtitle="People and organisations served. Customer is the root of every record."
        actions={
          <Link to="/customers/new" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Plus className="size-4" /> New customer
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          value={filter}
          onChange={setFilter}
          options={[
            { value: "active", label: "Active", count: data.customers.filter((c) => c.status === "active").length },
            { value: "draft", label: "Draft", count: data.customers.filter((c) => c.status === "draft").length },
            { value: "archived", label: "Archived", count: data.customers.filter((c) => c.status === "archived").length },
          ]}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or ref"
            className="h-9 w-64 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" body="Try removing filters or create a new customer." />
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Ref</th>
                  <th className="px-4 py-2.5 text-left">Properties</th>
                  <th className="px-4 py-2.5 text-left">Jobs</th>
                  <th className="px-4 py-2.5 text-left">Created</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const p = propertiesOfCustomer(data, c.id).length;
                  const j = jobsOfCustomer(data, c.id).length;
                  return (
                    <tr key={c.id} className="border-b last:border-b-0 hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <Link to="/customers/$id" params={{ id: c.id }} className="block">
                          <div className="font-medium text-foreground">{c.name}</div>
                          <div className="text-xs text-ink-muted">{c.email}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{c.ref}</td>
                      <td className="px-4 py-3 text-foreground">{p}</td>
                      <td className="px-4 py-3 text-foreground">{j}</td>
                      <td className="px-4 py-3 text-ink-muted">{fmtDate(c.createdAt)}</td>
                      <td className="px-4 py-3 text-right"><StatePill meta={RECORD_STATES[c.status]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.dashboard.tsx` ---

```tsx
/**
 * Dashboard — ElevenLabs-style hero with role-specific compositions.
 *
 * 5 personas:
 *   admin            → onboarding queue, amendments queue, platform health, activity
 *   operator         → permission summary, pinned shortcuts, what they can do today
 *   installer-access → New IBG hero, last 5 IBGs, Upgrade card
 *   installer-operate → ops summary: jobs by state, IBGs this month, funding readiness
 *   readonly         → record browser tiles
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileBadge, FolderKanban, Send, Sparkles, Database, ArrowRight,
  Users, ScrollText, Activity, ClipboardList, FileWarning,
  Volume2, Music2, Mic2, BookOpen, Image as ImageIcon, Video,
  Plus, TrendingUp, CheckCircle2, AlertTriangle, Clock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can, type Permission } from "@/lib/rbac";
import { useStore } from "@/lib/mock/store";
import { StatePill, JOB_STATES, IBG_STATES, ONBOARDING_STATES, AMENDMENT_STATES } from "@/components/app/state-pill";
import { fmtDate, relTime } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Home — Renewably UK" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { role } = useDevRole();
  const firstName = user.fullName.split(" ")[0];
  const greeting = greet();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
        {workspaceName(role)}
      </div>
      <h1 className="mt-2 text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl md:text-[44px] md:leading-[1.05]">
        {greeting}, {firstName}
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

  return (
    <>
      <NewBadgeBanner
        text="Permission Library v2 — assign capabilities to operators in one click."
        cta="Open library"
        to="/admin/permissions"
      />

      <SectionLabel>Quick actions</SectionLabel>
      <TileGrid tiles={[
        { label: "Users", to: "/admin/users", icon: Users, tone: "purple", desc: "Invite, assign roles, grant permissions" },
        { label: "Onboarding", to: "/admin/onboarding", icon: ClipboardList, tone: "amber", desc: `${onboardingPending.length} accounts to review` },
        { label: "Amendments", to: "/admin/amendments", icon: FileWarning, tone: "rose", desc: `${amendmentsPending.length} pending` },
        { label: "Audit log", to: "/admin/audit", icon: ScrollText, tone: "blue", desc: "Compliance trail" },
        { label: "Activity", to: "/admin/activity", icon: Activity, tone: "green", desc: "Live platform feed" },
        { label: "Permissions", to: "/admin/permissions", icon: Database, tone: "teal", desc: "Library + presets" },
      ]} />

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionPanel title="Onboarding queue" to="/admin/onboarding">
          {onboardingPending.length === 0 ? (
            <EmptyRow text="No accounts waiting." />
          ) : (
            onboardingPending.slice(0, 4).map((o) => (
              <Link key={o.id} to="/admin/onboarding" className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{o.companyName}</div>
                  <div className="text-xs text-ink-muted">{o.contactName} · {o.tier === "operate" ? "Operate" : "Access"}</div>
                </div>
                <StatePill meta={ONBOARDING_STATES[o.state]} />
              </Link>
            ))
          )}
        </SectionPanel>

        <SectionPanel title="Amendments queue" to="/admin/amendments">
          {amendmentsPending.length === 0 ? (
            <EmptyRow text="No amendments pending." />
          ) : (
            amendmentsPending.slice(0, 4).map((a) => (
              <Link key={a.id} to="/admin/amendments" className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{a.field}</div>
                  <div className="truncate text-xs text-ink-muted">{a.reason}</div>
                </div>
                <StatePill meta={AMENDMENT_STATES[a.state]} />
              </Link>
            ))
          )}
        </SectionPanel>
      </div>

      <div className="mt-4">
        <SectionPanel title="Latest activity" to="/admin/activity">
          {recent.map((act) => (
            <div key={act.id} className="flex items-center justify-between rounded-xl px-2 py-2.5">
              <div className="text-sm text-foreground">
                <span className="font-medium">{act.actor}</span>{" "}
                <span className="text-ink-muted">{act.action}</span>{" "}
                <span className="font-medium">{act.target}</span>
              </div>
              <div className="text-xs text-ink-muted">{relTime(act.at)}</div>
            </div>
          ))}
        </SectionPanel>
      </div>
    </>
  );
}

/* ─── Operator ───────────────────────────────────────── */

function OperatorDash() {
  const { permissions, pendingPermissionRequests } = useDevRole();

  const groups = [
    { label: "Customers", icon: FolderKanban, to: "/customers", perm: "customers.read" as const },
    { label: "Jobs", icon: Database, to: "/jobs", perm: "jobs.read" as const },
    { label: "IBG Repository", icon: FileBadge, to: "/ibg/repository", perm: "ibg.repository.read" as const },
    { label: "Submissions", icon: Send, to: "/submissions", perm: "submissions.read" as const },
    { label: "Funding", to: "/funding", icon: Sparkles, perm: "funding.projects.read" as const },
    { label: "Audit", to: "/admin/audit", icon: ScrollText, perm: "audit.read" as const },
  ];
  const granted = groups.filter((g) => can(permissions, g.perm));
  const locked = groups.filter((g) => !can(permissions, g.perm));

  return (
    <>
      <NewBadgeBanner
        text={`You hold ${permissions.length} permission${permissions.length === 1 ? "" : "s"}. Request more from any locked feature.`}
        cta="View my access"
        to="/settings/profile"
      />

      <SectionLabel>What you can do</SectionLabel>
      {granted.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-surface/40 px-6 py-10 text-center text-sm text-ink-muted">
          You don't have any permissions yet. Open a locked feature and tap "Request access".
        </div>
      ) : (
        <TileGrid tiles={granted.map((g) => ({ label: g.label, to: g.to, icon: g.icon, tone: "blue" as const, desc: "Granted" }))} />
      )}

      {locked.length > 0 && (
        <>
          <SectionLabel>Available — request access</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {locked.map((g) => {
              const Icon = g.icon;
              return (
                <Link key={g.label} to={g.to} className="press tile flex flex-col items-start gap-2 rounded-2xl border border-dashed bg-card/50 p-4 opacity-80">
                  <div className="grid size-10 place-items-center rounded-xl bg-tile text-ink-muted">
                    <Icon className="size-5" />
                  </div>
                  <div className="text-sm font-medium text-foreground">{g.label}</div>
                  <div className="text-[11px] text-ink-muted">Locked</div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {pendingPermissionRequests.length > 0 && (
        <div className="mt-8 rounded-2xl border bg-cat-amber-bg/30 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="size-4 text-cat-amber" /> {pendingPermissionRequests.length} permission request{pendingPermissionRequests.length === 1 ? "" : "s"} awaiting admin
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Installer Access ───────────────────────────────── */

function AccessDash() {
  const data = useStore();
  const recent = data.ibgs.filter((i) => i.state === "issued").slice(0, 5);

  return (
    <>
      <NewBadgeBanner text="Standalone IBG generator — issue a certificate without setting up a job." cta="New IBG" to="/ibg/new" />

      <SectionLabel>Quick start</SectionLabel>
      <TileGrid tiles={[
        { label: "Issue an IBG", to: "/ibg/new", icon: FileBadge, tone: "green", desc: "Generate certificate + policy" },
        { label: "My IBGs", to: "/ibg/history", icon: Database, tone: "blue", desc: "View 5 most recent" },
        { label: "Upgrade to Operate", to: "/pricing", icon: Sparkles, tone: "amber", desc: "Unlock Projects, Funding, Repository" },
      ]} />

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionPanel title="Recent IBGs" to="/ibg/history">
          {recent.length === 0 ? (
            <EmptyRow text="No IBGs yet — issue your first one." />
          ) : (
            recent.map((i) => (
              <Link key={i.id} to="/ibg/history" className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{i.ref} · {i.customerName}</div>
                  <div className="truncate text-xs text-ink-muted">{i.propertyAddress}</div>
                </div>
                <StatePill meta={IBG_STATES[i.state]} />
              </Link>
            ))
          )}
        </SectionPanel>
        <UpgradeCard />
      </div>
    </>
  );
}

/* ─── Installer Operate ──────────────────────────────── */

function OperateDash() {
  const data = useStore();
  const inProgress = data.jobs.filter((j) => j.state === "in-progress").length;
  const blocked = data.jobs.filter((j) => j.state === "blocked").length;
  const ibgsThisMonth = data.ibgs.filter((i) => i.issuedAt && i.issuedAt > Date.now() - 30 * 86400000).length;
  const fundingReady = data.fundingProjects.filter((f) => f.state === "ready-for-submission").length;

  return (
    <>
      <NewBadgeBanner
        text="Funding Match Hub — see schemes scored against your approved measures."
        cta="Open Match Hub"
        to="/funding/match"
      />

      <SectionLabel>Workspace</SectionLabel>
      <TileGrid tiles={[
        { label: "New IBG", to: "/ibg/new", icon: FileBadge, tone: "green", desc: "Issue certificate" },
        { label: "Projects", to: "/projects", icon: FolderKanban, tone: "blue", desc: "Customers · Properties · Jobs" },
        { label: "IBG Repository", to: "/ibg/repository", icon: Database, tone: "teal", desc: "All issued records" },
        { label: "Submissions", to: "/submissions", icon: Send, tone: "purple", desc: "Scheme submissions" },
        { label: "Funding", to: "/funding", icon: Sparkles, tone: "rose", desc: "Match Hub + projects" },
        { label: "Settings", to: "/settings/profile", icon: TrendingUp, tone: "amber", desc: "Profile · Subscription" },
      ]} />

      <SectionLabel>This week</SectionLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Jobs in progress" value={inProgress} icon={Clock} tone="blue" />
        <Stat label="Jobs blocked" value={blocked} icon={AlertTriangle} tone="rose" />
        <Stat label="IBGs (30d)" value={ibgsThisMonth} icon={FileBadge} tone="green" />
        <Stat label="Funding ready" value={fundingReady} icon={CheckCircle2} tone="teal" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionPanel title="Jobs needing attention" to="/jobs">
          {data.jobs
            .filter((j) => j.state === "blocked" || j.state === "awaiting-information")
            .slice(0, 5)
            .map((j) => {
              const c = data.customers.find((c) => c.id === j.customerId);
              return (
                <Link key={j.id} to="/jobs" className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{j.ref} · {j.measure}</div>
                    <div className="truncate text-xs text-ink-muted">{c?.name}</div>
                  </div>
                  <StatePill meta={JOB_STATES[j.state]} />
                </Link>
              );
            })}
        </SectionPanel>
        <SectionPanel title="Latest IBGs" to="/ibg/repository">
          {data.ibgs.slice(0, 5).map((i) => (
            <Link key={i.id} to="/ibg/repository" className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{i.ref} · {i.customerName}</div>
                <div className="truncate text-xs text-ink-muted">{i.measure} · {i.issuedAt ? fmtDate(i.issuedAt) : "—"}</div>
              </div>
              <StatePill meta={IBG_STATES[i.state]} />
            </Link>
          ))}
        </SectionPanel>
      </div>
    </>
  );
}

/* ─── Readonly ───────────────────────────────────────── */

function ReadonlyDash() {
  return (
    <>
      <div className="mt-6 rounded-2xl border border-cat-blue/20 bg-cat-blue-bg/40 p-4">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-cat-blue-bg text-cat-blue">
            <BookOpen className="size-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">You have read-only access</div>
            <p className="mt-1 text-xs text-ink-muted">
              You can browse customers, properties, jobs, IBGs, submissions and the audit trail.
              You cannot create, edit, submit or approve anything. To upgrade your access, contact your workspace admin.
            </p>
          </div>
        </div>
      </div>
      <SectionLabel>Browse</SectionLabel>
      <TileGrid tiles={[
        { label: "Customers", to: "/customers", icon: FolderKanban, tone: "blue", desc: "Read-only" },
        { label: "Jobs", to: "/jobs", icon: Database, tone: "teal", desc: "Read-only" },
        { label: "IBG Repository", to: "/ibg/repository", icon: FileBadge, tone: "green", desc: "Read-only" },
        { label: "Submissions", to: "/submissions", icon: Send, tone: "purple", desc: "Read-only" },
        { label: "Funding", to: "/funding", icon: Sparkles, tone: "rose", desc: "Read-only" },
        { label: "Audit log", to: "/admin/audit", icon: ScrollText, tone: "amber", desc: "Compliance trail" },
      ]} />
    </>
  );
}

/* ─── Pieces ─────────────────────────────────────────── */

const TONES = {
  green: { bg: "bg-cat-green-bg", ink: "text-cat-green" },
  blue: { bg: "bg-cat-blue-bg", ink: "text-cat-blue" },
  amber: { bg: "bg-cat-amber-bg", ink: "text-cat-amber" },
  purple: { bg: "bg-cat-purple-bg", ink: "text-cat-purple" },
  rose: { bg: "bg-cat-rose-bg", ink: "text-cat-rose" },
  teal: { bg: "bg-cat-teal-bg", ink: "text-cat-teal" },
} as const;
type Tone = keyof typeof TONES;

type Tile = { label: string; to: string; icon: React.ComponentType<{ className?: string }>; tone: Tone; desc: string; permission?: Permission };

function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="stagger-in mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => {
        const Icon = t.icon;
        const tone = TONES[t.tone];
        return (
          <Link key={t.label + t.to} to={t.to} className="press tile group flex h-[148px] flex-col items-start justify-between rounded-2xl border bg-card p-4">
            <div className={`grid size-10 place-items-center rounded-xl ${tone.bg} ${tone.ink}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{t.label}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-ink-muted">{t.desc}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-10 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
      {children}
    </div>
  );
}

function SectionPanel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between px-2">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <Link to={to} className="press inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-ink-muted hover:text-foreground">
          View all <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="rounded-xl bg-surface px-3 py-4 text-center text-xs text-ink-muted">{text}</div>;
}

function NewBadgeBanner({ text, cta, to }: { text: string; cta: string; to: string }) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-3 rounded-full border bg-surface/60 px-3 py-1.5 text-sm">
      <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">New</span>
      <span className="flex-1 text-foreground">{text}</span>
      <Link to={to} className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
        {cta} <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: Tone }) {
  const t = TONES[tone];
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className={`grid size-8 place-items-center rounded-lg ${t.bg} ${t.ink}`}>
        <Icon className="size-4" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-ink">{value}</div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-foreground p-5 text-background">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-background/60">Operate plan</div>
      <div className="mt-2 text-xl font-semibold leading-tight">Unlock Projects, Funding Match and the IBG Repository.</div>
      <div className="mt-1 text-sm text-background/70">Run the full record chain — Customer → Property → Job → IBG → Submission.</div>
      <Link to="/pricing" className="press mt-4 inline-flex items-center gap-1 rounded-full bg-background px-4 py-2 text-xs font-medium text-foreground">
        See plans <ArrowRight className="size-3" />
      </Link>
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
  // Computed at render time; safe because <Outlet/> is client-gated in _authed layout.
  const h = new Date().getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// silence unused import warnings (these icons may not all be used after refactor)
void Volume2; void Music2; void Mic2; void BookOpen; void ImageIcon; void Video; void Plus;

```

--- `src/routes/_authed.funding.$id.tracking.tsx` ---

```tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useStore, update, nid } from "@/lib/mock/store";
import { findFunding, fmtDate, pushAudit, relTime } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import type { FundingState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/funding/$id/tracking")({
  head: () => ({ meta: [{ title: "Tracking — Renewably UK" }] }),
  component: FundingTracking,
});

type Stage = {
  key: string;
  label: string;
  matches: (s: FundingState) => boolean;
};

const PAST_FOR: Record<FundingState, string[]> = {
  incomplete: [],
  "in-progress": [],
  "evidence-required": [],
  "under-review": ["submitted"],
  returned: ["submitted", "under-review"],
  validated: ["submitted", "under-review"],
  "ready-for-submission": [],
  submitted: [],
};

const STAGES: Stage[] = [
  { key: "submitted", label: "Submitted to scheme", matches: (s) => s === "submitted" || s === "under-review" || s === "validated" || s === "returned" },
  { key: "under-review", label: "Under review", matches: (s) => s === "under-review" },
  { key: "info-requested", label: "Information requested", matches: (s) => s === "returned" || s === "evidence-required" },
  { key: "decision", label: "Decision issued", matches: (s) => s === "validated" },
  { key: "closed", label: "Closed", matches: () => false },
];

function stageStatus(stage: Stage, state: FundingState, idx: number) {
  if (stage.matches(state)) return "active" as const;
  const past = PAST_FOR[state] ?? [];
  if (past.includes(stage.key)) return "past" as const;
  // submitted is always past once we're tracking
  if (stage.key === "submitted") return "past" as const;
  // info-requested past only if we moved beyond returned
  if (stage.key === "info-requested" && (state === "validated")) return "past" as const;
  if (stage.key === "decision" && state === "submitted") return "future" as const;
  return idx === 0 ? "past" : "future";
}

function FundingTracking() {
  const { id } = Route.useParams();
  const data = useStore();
  const f = findFunding(data, id);
  const { user } = useAuth();
  if (!f) throw notFound();

  const auditEvents = data.audit
    .filter((a) => a.entityType === "funding" && a.entityId === id)
    .slice()
    .reverse();

  function uploadResponse() {
    const name = prompt("Response filename?", "Information-response.pdf");
    if (!name) return;
    update((d) => {
      const x = d.fundingProjects.find((p) => p.id === id);
      if (!x) return;
      x.evidence.push({ id: nid("ev"), name, category: "Information response", uploadedAt: Date.now() });
      x.state = "under-review";
      pushAudit(d, "funding", id, user.fullName, `Uploaded response document ${name}`);
    });
    toast.success("Response uploaded — moved back to under review");
  }

  function withdraw() {
    if (!confirm("Withdraw this submission? It will return to draft.")) return;
    update((d) => {
      const x = d.fundingProjects.find((p) => p.id === id);
      if (!x) return;
      x.state = "in-progress";
      pushAudit(d, "funding", id, user.fullName, `Withdrew submission`);
    });
    toast.success("Submission withdrawn");
  }

  const closed: FundingState[] = ["validated"];
  const canWithdraw = !closed.includes(f.state);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link
        to="/funding/$id"
        params={{ id }}
        className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Funding project
      </Link>

      <div className="mt-3">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
          {f.scheme} · Tracking
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{f.ref}</h1>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-sm font-medium text-foreground">Submission timeline</div>
          <div className="relative mt-5 pl-7">
            <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border" />
            <ul className="space-y-5">
              {STAGES.map((stage, i) => {
                const status = stageStatus(stage, f.state, i);
                const matchEvent = auditEvents.find((e) =>
                  e.action.toLowerCase().includes(stage.key.split("-")[0]),
                );
                return (
                  <li key={stage.key} className="relative">
                    <span
                      className={
                        "absolute -left-7 top-0 grid size-5 place-items-center rounded-full border-2 " +
                        (status === "past"
                          ? "border-cat-green bg-cat-green-bg text-cat-green"
                          : status === "active"
                          ? "border-cat-amber bg-cat-amber-bg text-cat-amber"
                          : "border-border bg-surface text-ink-muted")
                      }
                    >
                      {status === "past" ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : status === "active" ? (
                        <Clock className="size-3" />
                      ) : null}
                    </span>
                    <div className="text-[13px] font-medium text-foreground">
                      {stage.label}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">
                      {matchEvent ? (
                        <>
                          {fmtDate(matchEvent.at)} · {matchEvent.actor}
                        </>
                      ) : status === "future" ? (
                        "Pending"
                      ) : status === "active" ? (
                        "In progress"
                      ) : (
                        "Completed"
                      )}
                    </div>

                    {status === "active" && stage.key === "info-requested" && (
                      <button
                        type="button"
                        onClick={uploadResponse}
                        className="press mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cat-amber/50 bg-cat-amber-bg/30 px-4 py-4 text-xs font-medium text-foreground hover:bg-cat-amber-bg/50"
                      >
                        <Upload className="size-3.5" /> Upload response document
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {auditEvents.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Recent activity
              </div>
              <ul className="mt-2 space-y-1.5">
                {auditEvents.slice(-5).reverse().map((e) => (
                  <li key={e.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{e.action}</span>
                    <span className="text-ink-muted">{relTime(e.at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-ink-muted">Scheme</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{f.scheme}</div>
            <div className="mt-0.5 text-xs text-ink-muted">{f.measure}</div>
            <div className="mt-3 border-t pt-3 text-xs text-ink-muted">
              Reference <span className="font-mono text-foreground">{f.ref}</span>
            </div>
          </div>

          {canWithdraw && (
            <button
              type="button"
              onClick={withdraw}
              className="press inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-destructive/30 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/5"
            >
              <X className="size-3.5" /> Withdraw submission
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}


```

--- `src/routes/_authed.funding.$id.tsx` ---

```tsx
import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileUp, Send, Check, AlertCircle, Circle, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import { findFunding, findJob, pushAudit, fmtDate } from "@/lib/mock/queries";
import { StatePill, FUNDING_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { useAuth } from "@/lib/auth-context";
import type { FundingState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/funding/$id")({
  head: () => ({ meta: [{ title: "Funding project — Renewably UK" }] }),
  component: FundingDetail,
});

// Review is "done" only when it has actually completed successfully.
// `returned` means review failed and step must re-open.
const REVIEW_DONE: FundingState[] = ["validated", "ready-for-submission", "submitted", "under-review"];
const POST_SUBMIT: FundingState[] = ["submitted", "under-review", "validated", "returned"];

function FundingDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const f = findFunding(data, id);
  const { user } = useAuth();
  const nav = useNavigate();
  if (!f) throw notFound();
  const job = findJob(data, f.jobId);

  const reviewDone = REVIEW_DONE.includes(f.state) && f.state !== "under-review";
  const reviewActive = f.state === "under-review";
  const reviewReturned = f.state === "returned";

  const steps = [
    { label: "Company verified", done: true, hint: "Workspace company on file" },
    { label: "Measure confirmed", done: !!f.measure, hint: f.measure || "Pick a measure" },
    { label: "Evidence uploaded", done: f.evidence.length >= 1, hint: reviewReturned ? "Re-upload required" : `${f.evidence.length} file${f.evidence.length === 1 ? "" : "s"}` },
    {
      label: "Internal review",
      done: reviewDone,
      hint: reviewReturned ? "Returned — fix issues and resubmit" : reviewActive ? "Review in progress" : reviewDone ? "Reviewed" : "Awaiting review",
    },
    { label: "Ready for submission", done: false, hint: "All previous steps complete" },
    { label: "Submitted", done: POST_SUBMIT.includes(f.state), hint: POST_SUBMIT.includes(f.state) ? "Sent to scheme" : "Not yet submitted" },
  ];
  // 5th step done when steps 1-4 are all done
  steps[4].done = steps.slice(0, 4).every((s) => s.done);

  const completed = steps.filter((s) => s.done).length;
  const ready = steps.slice(0, 5).every((s) => s.done);

  // Animate progress bar on mount
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setBarWidth((completed / steps.length) * 100), 30);
    return () => clearTimeout(t);
  }, [completed, steps.length]);

  function uploadEvidence() {
    const name = prompt("Filename?", "Evidence.pdf");
    if (!name) return;
    const cat = prompt("Category?", "Survey") ?? "Survey";
    update((d) => {
      const x = d.fundingProjects.find((p) => p.id === id);
      if (!x) return;
      x.evidence.push({ id: nid("ev"), name, category: cat, uploadedAt: Date.now() });
      pushAudit(d, "funding", id, user.fullName, `Uploaded evidence ${name}`);
    });
    toast.success("Evidence uploaded");
  }

  function submit() {
    update((d) => {
      const x = d.fundingProjects.find((p) => p.id === id);
      if (!x) return;
      x.state = "submitted";
      const subId = nid("sub");
      d.submissions.unshift({
        id: subId, ref: nref("S"),
        fundingProjectId: id, jobId: x.jobId,
        scheme: x.scheme, state: "submitted", submittedAt: Date.now(),
      });
      pushAudit(d, "funding", id, user.fullName, `Submitted to ${x.scheme}`);
      pushAudit(d, "submission", subId, user.fullName, `Created from ${x.ref}`);
    });
    toast.success("Submitted to scheme");
    nav({ to: "/funding/$id/tracking", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/funding" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Funding
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Funding project · {f.ref}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{f.scheme} · {f.measure}</h1>
          {job && <div className="mt-2 text-sm text-ink-muted">Job <Link to="/jobs/$id" params={{ id: job.id }} className="hover:text-foreground">{job.ref}</Link></div>}
        </div>
        <StatePill meta={FUNDING_STATES[f.state]} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">Readiness</div>
              <div className="text-xs text-ink-muted">{completed} of {steps.length} steps complete</div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-tile">
              <div
                className="h-full rounded-full bg-cat-green transition-[width] duration-[600ms] ease-out"
                style={{ width: `${barWidth}%` }}
              />
            </div>

            <ul className="mt-4 space-y-2">
              {steps.map((s, i) => {
                const priorDone = steps.slice(0, i).every((p) => p.done);
                const locked = !priorDone && !s.done;
                const status: "done" | "warn" | "todo" | "locked" = s.done
                  ? "done"
                  : locked
                  ? "locked"
                  : i === 2 && f.evidence.length === 0
                  ? "warn"
                  : "todo";
                const Icon =
                  status === "done" ? Check :
                  status === "warn" ? AlertCircle :
                  status === "locked" ? Lock : Circle;
                const tone =
                  status === "done" ? "text-cat-green bg-cat-green-bg" :
                  status === "warn" ? "text-cat-amber bg-cat-amber-bg" :
                  status === "locked" ? "text-ink-muted bg-tile" :
                  "text-ink-muted bg-surface";
                return (
                  <li key={s.label} className="flex items-center justify-between rounded-xl bg-surface/40 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-6 place-items-center rounded-full ${tone}`}>
                        <Icon className="size-3.5" />
                      </span>
                      <div>
                        <div className="text-sm font-medium text-foreground">{s.label}</div>
                        <div className="text-xs text-ink-muted">{s.hint}</div>
                      </div>
                    </div>
                    {!s.done && !locked && i === 2 && (
                      <button onClick={uploadEvidence} className="press text-xs font-medium text-foreground hover:underline">
                        Upload
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={uploadEvidence} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm">
                <FileUp className="size-3.5" /> Upload evidence
              </button>
              <button
                onClick={submit}
                disabled={!ready || POST_SUBMIT.includes(f.state)}
                className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-3.5" /> Submit to scheme
              </button>
              {POST_SUBMIT.includes(f.state) && (
                <Link
                  to="/funding/$id/tracking"
                  params={{ id }}
                  className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm font-medium"
                >
                  View tracking <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="border-b px-5 py-3 text-sm font-medium">Evidence</div>
            <div className="divide-y">
              {f.evidence.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-ink-muted">No evidence uploaded yet.</div>
              ) : f.evidence.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{e.name}</div>
                    <div className="text-xs text-ink-muted">{e.category}</div>
                  </div>
                  <div className="text-xs text-ink-muted">{fmtDate(e.uploadedAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <AuditTimeline entityType="funding" entityId={f.id} />
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.funding.match.tsx` ---

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, MapPin, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/funding/match")({
  head: () => ({ meta: [{ title: "Match Hub — Renewably UK" }] }),
  component: MatchHub,
});

function MatchHub() {
  const data = useStore();
  const { user } = useAuth();
  const nav = useNavigate();
  const matches = [...data.fundingMatches].sort((a, b) => b.score - a.score);

  function startProject(scheme: string, measure: string) {
    const job = data.jobs[0];
    if (!job) {
      toast.error("Add a job before creating a funding project");
      return;
    }
    const id = nid("fp");
    update((d) => {
      d.fundingProjects.unshift({
        id,
        ref: nref("F"),
        jobId: job.id,
        scheme,
        measure,
        state: "incomplete",
        createdAt: Date.now(),
        evidence: [],
      });
      pushAudit(d, "funding", id, user.fullName, `Started from Match Hub · ${scheme}`);
    });
    toast.success(`Started funding project for ${scheme}`);
    nav({ to: "/funding/$id", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Funding"
        title="Match Hub"
        subtitle="Schemes scored against your approved measures and operating geography."
      />

      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {matches.map((m) => (
          <div key={m.scheme} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-cat-rose-bg text-cat-rose">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-foreground">{m.scheme}</div>
                    <div className="inline-flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin className="size-3" /> {m.region}
                    </div>
                  </div>
                </div>
              </div>
              <ScoreRing score={m.score} />
            </div>

            <p className="mt-3 text-sm text-ink-muted">{m.description}</p>

            <div className="mt-3 flex flex-wrap gap-1">
              {m.measures.map((mz) => (
                <span key={mz} className="inline-flex items-center gap-1 rounded-full bg-tile px-2 py-0.5 text-[11px] text-ink-muted">
                  <Check className="size-3 text-cat-green" /> {mz}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.state === "active" ? "bg-cat-green-bg text-cat-green" : m.state === "opportunity" ? "bg-cat-amber-bg text-cat-amber" : "bg-tile text-ink-muted"}`}>
                {m.state === "active" ? "Active match" : m.state === "opportunity" ? "Opportunity" : "No match"}
              </span>
              <button
                type="button"
                onClick={() => startProject(m.scheme, m.measures[0] ?? "Insulation")}
                disabled={m.state === "no-match"}
                className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
              >
                Start funding project <ArrowRight className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const tone = score > 80 ? "text-cat-green" : score > 50 ? "text-cat-amber" : "text-ink-muted";
  return (
    <div className={`grid size-14 place-items-center rounded-full border-2 ${tone}`}>
      <div className={`text-sm font-semibold ${tone}`}>{score}</div>
    </div>
  );
}

```

--- `src/routes/_authed.funding.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, FUNDING_STATES } from "@/components/app/state-pill";
import { findJob, fmtDate } from "@/lib/mock/queries";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";

export const Route = createFileRoute("/_authed/funding")({
  head: () => ({ meta: [{ title: "Funding — Renewably UK" }] }),
  component: FundingHub,
});

function FundingHub() {
  const data = useStore();
  const { permissions } = useDevRole();

  if (!can(permissions, "funding.projects.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Funding" title="Funding" />
        <div className="mt-6"><LockedCard title="Funding hub" reason={{ kind: "permission", permission: "funding.projects.read" }} /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Funding"
        title="Funding hub"
        subtitle="Match Hub · Funding projects · Per-project workflow."
        actions={
          <Link to="/funding/match" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Sparkles className="size-4" /> Match Hub
          </Link>
        }
      />

      <div className="mt-8 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">Funding projects</div>
          <Link to="/funding" className="text-xs text-ink-muted hover:text-foreground">Refresh</Link>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-4 py-2.5 text-left">Ref</th>
                <th className="px-4 py-2.5 text-left">Scheme</th>
                <th className="px-4 py-2.5 text-left">Job</th>
                <th className="px-4 py-2.5 text-left">Measure</th>
                <th className="px-4 py-2.5 text-left">Created</th>
                <th className="px-4 py-2.5 text-right">State</th>
              </tr>
            </thead>
            <tbody>
              {data.fundingProjects.map((f) => {
                const j = findJob(data, f.jobId);
                return (
                  <tr key={f.id} className="border-b last:border-b-0 hover:bg-surface/60">
                    <td className="px-4 py-3"><Link to="/funding/$id" params={{ id: f.id }} className="font-medium text-foreground hover:underline">{f.ref}</Link></td>
                    <td className="px-4 py-3 text-foreground">{f.scheme}</td>
                    <td className="px-4 py-3 text-ink-muted">{j?.ref ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground">{f.measure}</td>
                    <td className="px-4 py-3 text-ink-muted">{fmtDate(f.createdAt)}</td>
                    <td className="px-4 py-3 text-right"><StatePill meta={FUNDING_STATES[f.state]} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

void Search; void Plus; void ArrowRight;

```

--- `src/routes/_authed.ibg.$id.amendment.tsx` ---

```tsx
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { useStore, update, nid } from "@/lib/mock/store";
import { findIbg, pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/ibg/$id/amendment")({
  head: () => ({ meta: [{ title: "Request amendment — Renewably UK" }] }),
  component: Amendment,
});

const FIELDS = ["Customer name", "Property address", "Measure", "Policy type", "Other"];

function Amendment() {
  const { id } = Route.useParams();
  const data = useStore();
  const ibg = findIbg(data, id);
  const { user } = useAuth();
  const nav = useNavigate();
  const [field, setField] = useState(FIELDS[0]);
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");

  if (!ibg) throw notFound();

  function submit() {
    if (!newValue.trim() || !reason.trim()) {
      toast.error("Provide the corrected value and a reason");
      return;
    }
    const amdId = nid("amd");
    update((d) => {
      d.amendments.unshift({
        id: amdId, ibgId: id, field, oldValue, newValue, reason,
        state: "pending", createdAt: Date.now(),
      });
      pushAudit(d, "amendment", amdId, user.fullName, `Requested amendment to ${field}`, reason);
    });
    toast.success("Amendment request sent for admin review");
    nav({ to: "/ibg/$id", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <Link to="/ibg/$id" params={{ id }} className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to {ibg.ref}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Request amendment</h1>
      <p className="mt-1 text-sm text-ink-muted">Submit a correction. Admin will review and approve or reject.</p>

      <div className="mt-6 space-y-4 rounded-2xl border bg-card p-6">
        <Field label="Field to amend">
          <select value={field} onChange={(e) => setField(e.target.value)} className={inputCls}>
            {FIELDS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Current value">
          <input value={oldValue} onChange={(e) => setOldValue(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Corrected value *">
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Reason for change *">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={inputCls} placeholder="Explain why this needs to change." />
        </Field>
        <div className="flex justify-end pt-2">
          <button onClick={submit} className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            <Send className="size-3.5" /> Submit request
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1 text-xs font-medium text-ink-muted">{label}</div>{children}</label>;
}

```

--- `src/routes/_authed.ibg.$id.tsx` ---

```tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Download, FileWarning, Ban } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { findIbg, fmtDate, pushAudit } from "@/lib/mock/queries";
import { StatePill, IBG_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/ibg/$id")({
  head: () => ({ meta: [{ title: "IBG — Renewably UK" }] }),
  component: IbgDetail,
});

function IbgDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const ibg = findIbg(data, id);
  const { user } = useAuth();
  const { permissions } = useDevRole();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!ibg) throw notFound();

  const sameMonth = ibg.issuedAt ? new Date(ibg.issuedAt).getMonth() === new Date().getMonth() && new Date(ibg.issuedAt).getFullYear() === new Date().getFullYear() : false;
  const canRequestAmendment = can(permissions, "ibg.amendment.request") && ibg.state === "issued";
  const canCancel = can(permissions, "ibg.cancel") && ibg.state === "issued" && sameMonth;

  function download() {
    const blob = new Blob([`Renewably UK\nIBG Certificate\nReference: ${ibg!.ref}\nIssued by: ${ibg!.issuedBy}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${ibg!.ref}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function cancelIbg() {
    update((d) => {
      const i = d.ibgs.find((x) => x.id === id);
      if (!i) return;
      i.state = "cancelled";
      pushAudit(d, "ibg", id, user.fullName, "Cancelled IBG");
    });
    toast.success("IBG cancelled");
    setConfirmCancel(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/ibg/repository" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Repository
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">IBG · {ibg.ref}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{ibg.measure}</h1>
          <div className="mt-2 text-sm text-ink-muted">{ibg.customerName} · {ibg.propertyAddress}</div>
        </div>
        <StatePill meta={IBG_STATES[ibg.state]} />
      </div>

      {/* State machine */}
      <StateRail current={ibg.state} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={download} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm">
          <Download className="size-3.5" /> Download certificate
        </button>
        {canRequestAmendment && (
          <Link to="/ibg/$id/amendment" params={{ id: ibg.id }} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm">
            <FileWarning className="size-3.5" /> Request amendment
          </Link>
        )}
        {canCancel && (
          <button onClick={() => setConfirmCancel(true)} className="press inline-flex items-center gap-1.5 rounded-full border border-cat-rose/30 bg-cat-rose-bg px-3 py-1.5 text-sm text-cat-rose">
            <Ban className="size-3.5" /> Cancel IBG
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-sm font-medium text-foreground">Cover details</div>
          <div className="mt-3 space-y-2">
            <Row label="Customer" value={ibg.customerName} />
            <Row label="Property" value={ibg.propertyAddress} />
            <Row label="Measure" value={ibg.measure} />
            <Row label="Policy" value={ibg.policyType} />
            <Row label="Issued by" value={ibg.issuedBy} />
            <Row label="Issued at" value={ibg.issuedAt ? fmtDate(ibg.issuedAt) : "—"} />
          </div>
        </div>
        <AuditTimeline entityType="ibg" entityId={ibg.id} />
      </div>

      {confirmCancel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-5">
            <div className="text-sm font-semibold">Cancel {ibg.ref}?</div>
            <div className="mt-1 text-sm text-ink-muted">This permanently cancels the IBG. The action is logged in the audit trail.</div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setConfirmCancel(false)} className="press rounded-full border px-3 py-1.5 text-sm">Keep</button>
              <button onClick={cancelIbg} className="press rounded-full bg-cat-rose px-3 py-1.5 text-sm text-white">Cancel IBG</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const STATE_ORDER = ["draft", "initiated", "awaiting-validation", "validated", "ready-for-issue", "issued"] as const;

function StateRail({ current }: { current: string }) {
  const idx = STATE_ORDER.indexOf(current as never);
  const offTrack = idx === -1;
  return (
    <div className="mt-6 rounded-2xl border bg-card p-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">Lifecycle</div>
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto">
        {STATE_ORDER.map((s, i) => {
          const reached = !offTrack && i <= idx;
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${reached ? "bg-foreground text-background" : "bg-tile text-ink-muted"}`}>
                {IBG_STATES[s].label}
              </div>
              {i < STATE_ORDER.length - 1 && <div className={`h-px w-6 ${i < idx ? "bg-foreground" : "bg-border"}`} />}
            </div>
          );
        })}
        {offTrack && (
          <span className="ml-3 text-[11px] text-ink-muted">Currently · <StatePill meta={IBG_STATES[current]} /></span>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

```

--- `src/routes/_authed.ibg.history.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileBadge, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { StatePill, IBG_STATES } from "@/components/app/state-pill";
import { fmtDate } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";

export const Route = createFileRoute("/_authed/ibg/history")({
  head: () => ({ meta: [{ title: "IBG history — Renewably UK" }] }),
  component: IbgHistory,
});

function IbgHistory() {
  const data = useStore();
  const { role, permissions } = useDevRole();
  if (!can(permissions, "ibg.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="IBG" title="IBG history" />
        <div className="mt-6"><LockedCard title="IBG history" reason={{ kind: "permission", permission: "ibg.read" }} /></div>
      </div>
    );
  }
  const isAccessTier = role === "installer-access";
  const all = [...data.ibgs].sort((a, b) => b.createdAt - a.createdAt);
  const rows = isAccessTier ? all.slice(0, 5) : all;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="IBG"
        title="IBG history"
        subtitle={isAccessTier ? "Your 5 most recent IBGs. Upgrade to Operate for full history." : "Every IBG issued from your workspace."}
        actions={
          <Link to="/ibg/new" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <FileBadge className="size-4" /> New IBG
          </Link>
        }
      />

      {rows.length === 0 ? (
        <div className="mt-6"><EmptyState icon={FileBadge} title="No IBGs yet" body="Issue your first one." /></div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-4 py-2.5 text-left">Ref</th>
                <th className="px-4 py-2.5 text-left">Customer</th>
                <th className="px-4 py-2.5 text-left">Property</th>
                <th className="px-4 py-2.5 text-left">Measure</th>
                <th className="px-4 py-2.5 text-left">Issued</th>
                <th className="px-4 py-2.5 text-right">State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className="border-b last:border-b-0 hover:bg-surface/60">
                  <td className="px-4 py-3"><Link to="/ibg/$id" params={{ id: i.id }} className="font-medium text-foreground hover:underline">{i.ref}</Link></td>
                  <td className="px-4 py-3 text-foreground">{i.customerName}</td>
                  <td className="px-4 py-3 text-ink-muted">{i.propertyAddress}</td>
                  <td className="px-4 py-3 text-foreground">{i.measure}</td>
                  <td className="px-4 py-3 text-ink-muted">{i.issuedAt ? fmtDate(i.issuedAt) : "—"}</td>
                  <td className="px-4 py-3 text-right"><StatePill meta={IBG_STATES[i.state]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAccessTier && all.length > 5 && (
        <div className="mt-5 flex items-center justify-between rounded-2xl border bg-foreground p-5 text-background">
          <div>
            <div className="text-sm font-semibold">{all.length - 5} more IBGs locked</div>
            <div className="text-xs text-background/70">Upgrade to Operate for full history, repository search, amendments and funding.</div>
          </div>
          <Link to="/pricing" className="press inline-flex items-center gap-1 rounded-full bg-background px-4 py-2 text-xs font-medium text-foreground">
            <Sparkles className="size-3" /> Upgrade <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

```

--- `src/routes/_authed.ibg.new.tsx` ---

```tsx
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileBadge } from "lucide-react";
import { toast } from "sonner";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";

export const Route = createFileRoute("/_authed/ibg/new")({
  head: () => ({ meta: [{ title: "New IBG — Renewably UK" }] }),
  component: NewIbg,
});

const MEASURES = ["Air Source Heat Pump", "Solar PV", "Loft Insulation", "Cavity Wall Insulation", "EV Charger"];
const POLICIES = ["10-year IBG", "25-year IBG"];

function NewIbg() {
  const data = useStore();
  const nav = useNavigate();
  const { user } = useAuth();
  const { role, permissions } = useDevRole();
  const isOperate = role === "installer-operate" || role === "operator" || role === "admin";

  if (!can(permissions, "ibg.issue")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <LockedCard title="Issue an IBG" body="You don't currently have permission to issue IBGs." reason={{ kind: "permission", permission: "ibg.issue" }} />
      </div>
    );
  }

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    customerId: isOperate ? data.customers[0]?.id ?? "" : "",
    customerName: "", propertyAddress: "",
    measure: MEASURES[0], policyType: POLICIES[0],
  });
  const [issuedRef, setIssuedRef] = useState<string | null>(null);
  const [issuedId, setIssuedId] = useState<string | null>(null);

  const props = data.properties.filter((p) => p.customerId === form.customerId);
  const [propertyId, setPropertyId] = useState("");

  function next() {
    if (step === 0) {
      if (isOperate) {
        if (!form.customerId || !propertyId) { toast.error("Pick a customer and property"); return; }
      } else {
        if (!form.customerName || !form.propertyAddress) { toast.error("Customer and address required"); return; }
      }
    }
    setStep((s) => s + 1);
  }

  function issue() {
    const id = nid("ibg");
    const ref = nref("IBG");
    const customer = data.customers.find((c) => c.id === form.customerId);
    const prop = data.properties.find((p) => p.id === propertyId);
    update((d) => {
      d.ibgs.unshift({
        id, ref,
        customerId: form.customerId || undefined,
        propertyId: propertyId || undefined,
        customerName: customer?.name ?? form.customerName,
        propertyAddress: prop ? `${prop.address}, ${prop.postcode}` : form.propertyAddress,
        measure: form.measure, policyType: form.policyType,
        state: "issued",
        issuedAt: Date.now(), createdAt: Date.now(),
        issuedBy: user.fullName,
      });
      pushAudit(d, "ibg", id, user.fullName, `Issued IBG ${ref}`);
    });
    setIssuedRef(ref);
    setIssuedId(id);
    toast.success(`IBG ${ref} issued`);
  }

  function download() {
    const blob = new Blob([`Renewably UK\nIBG Certificate\nReference: ${issuedRef}\nIssued by: ${user.fullName}\nMeasure: ${form.measure}\nPolicy: ${form.policyType}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${issuedRef}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  if (issuedRef) {
    return (
      <div className="mx-auto w-full max-w-xl px-8 py-16 text-center">
        <div className="relative mx-auto grid size-16 place-items-center">
          <span className="ibg-burst ibg-burst-1" />
          <span className="ibg-burst ibg-burst-2" />
          <span className="ibg-burst ibg-burst-3" />
          <span className="ibg-burst ibg-burst-4" />
          <span className="ibg-pop grid size-16 place-items-center rounded-2xl bg-cat-green-bg text-cat-green">
            <CheckCircle2 className="size-8" />
          </span>
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink">{issuedRef} issued</h1>
        <p className="mt-2 text-sm text-ink-muted">Certificate and policy generated. Download the PDF below or open the record.</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button onClick={download} className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            <Download className="size-4" /> Download certificate
          </button>
          <Link to="/ibg/$id" params={{ id: issuedId! }} className="press rounded-full border bg-background px-4 py-2 text-sm font-medium">Open IBG</Link>
        </div>
        <div className="mt-4">
          <button onClick={() => nav({ to: "/ibg/repository" })} className="text-xs text-ink-muted hover:text-foreground">Back to repository</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <Link to="/ibg/repository" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Repository
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <div className="grid size-10 place-items-center rounded-xl bg-cat-green-bg text-cat-green">
          <FileBadge className="size-5" />
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">IBG Generator</div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Issue a new IBG</h1>
        </div>
      </div>

      <Stepper step={step} total={3} labels={["Subject", "Cover", "Review"]} />

      <div className="mt-6 rounded-2xl border bg-card p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground">Subject of the guarantee</div>
            {isOperate ? (
              <>
                <Field label="Customer">
                  <select value={form.customerId} onChange={(e) => { setForm({ ...form, customerId: e.target.value }); setPropertyId(""); }} className={inputCls}>
                    {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.ref})</option>)}
                  </select>
                </Field>
                <Field label="Property">
                  <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {props.map((p) => <option key={p.id} value={p.id}>{p.address} · {p.postcode}</option>)}
                  </select>
                </Field>
              </>
            ) : (
              <>
                <Field label="Customer name"><input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className={inputCls} /></Field>
                <Field label="Property address"><input value={form.propertyAddress} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} className={inputCls} placeholder="14 Oak Lane, Leeds, LS1 4AB" /></Field>
              </>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground">Cover</div>
            <Field label="Measure">
              <select value={form.measure} onChange={(e) => setForm({ ...form, measure: e.target.value })} className={inputCls}>
                {MEASURES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Policy type">
              <select value={form.policyType} onChange={(e) => setForm({ ...form, policyType: e.target.value })} className={inputCls}>
                {POLICIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Review</div>
            <Row label="Customer" value={isOperate ? data.customers.find((c) => c.id === form.customerId)?.name : form.customerName} />
            <Row label="Property" value={isOperate ? data.properties.find((p) => p.id === propertyId)?.address : form.propertyAddress} />
            <Row label="Measure" value={form.measure} />
            <Row label="Policy" value={form.policyType} />
            <Row label="Issued by" value={user.fullName} />
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="press inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm font-medium disabled:opacity-40">
            <ArrowLeft className="size-3.5" /> Back
          </button>
          {step < 2 ? (
            <button onClick={next} className="press inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
              Next <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <button onClick={issue} className="press rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background">Issue IBG</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="mt-6 flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex flex-1 items-center gap-2">
          <div className={`grid size-6 place-items-center rounded-full text-[11px] font-semibold ${i <= step ? "bg-foreground text-background" : "bg-tile text-ink-muted"}`}>{i + 1}</div>
          <div className={`text-xs font-medium ${i === step ? "text-foreground" : "text-ink-muted"}`}>{labels[i]}</div>
          {i < total - 1 && <div className={`h-px flex-1 ${i < step ? "bg-foreground" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1 text-xs font-medium text-ink-muted">{label}</div>{children}</label>;
}
function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm font-medium text-foreground">{value || "—"}</div>
    </div>
  );
}

```

--- `src/routes/_authed.ibg.repository.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, FileBadge, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";
import { StatePill, IBG_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import type { IbgState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/ibg/repository")({
  head: () => ({ meta: [{ title: "IBG Repository — Renewably UK" }] }),
  component: Repository,
});

const FILTERS: { value: IbgState; label: string }[] = [
  { value: "issued", label: "Issued" },
  { value: "ready-for-issue", label: "Ready" },
  { value: "incomplete", label: "Incomplete" },
  { value: "amended", label: "Amended" },
  { value: "cancelled", label: "Cancelled" },
];

function Repository() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<IbgState | "all">("all");

  if (!can(permissions, "ibg.repository.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="IBG" title="IBG Repository" />
        <div className="mt-6">
          <LockedCard title="IBG Repository" body="Searchable record store of every issued IBG. Operate plan or operator permission required." reason={{ kind: "permission", permission: "ibg.repository.read" }} />
        </div>
      </div>
    );
  }

  const rows = data.ibgs
    .filter((i) => filter === "all" || i.state === filter)
    .filter((i) => !q || i.ref.toLowerCase().includes(q.toLowerCase()) || i.customerName.toLowerCase().includes(q.toLowerCase()) || i.propertyAddress.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="IBG"
        title="Repository"
        subtitle="Every issued IBG, fully searchable."
        actions={
          <Link to="/ibg/new" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Plus className="size-4" /> New IBG
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <FilterPills<IbgState>
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ ...f, count: data.ibgs.filter((i) => i.state === f.value).length }))}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ref, customer, address" className="h-9 w-72 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? <EmptyState icon={FileBadge} title="No IBGs match" body="Try clearing filters or search for a reference." /> : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Ref</th>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Property</th>
                  <th className="px-4 py-2.5 text-left">Measure</th>
                  <th className="px-4 py-2.5 text-left">Issued</th>
                  <th className="px-4 py-2.5 text-right">State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} className="border-b last:border-b-0 hover:bg-surface/60">
                    <td className="px-4 py-3"><Link to="/ibg/$id" params={{ id: i.id }} className="font-medium text-foreground hover:underline">{i.ref}</Link></td>
                    <td className="px-4 py-3 text-foreground">{i.customerName}</td>
                    <td className="px-4 py-3 text-ink-muted">{i.propertyAddress}</td>
                    <td className="px-4 py-3 text-foreground">{i.measure}</td>
                    <td className="px-4 py-3 text-ink-muted">{i.issuedAt ? fmtDate(i.issuedAt) : "—"}</td>
                    <td className="px-4 py-3 text-right"><StatePill meta={IBG_STATES[i.state]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.jobs.$id.tsx` ---

```tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileBadge, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { UnderlineTabs } from "@/components/app/underline-tabs";
import { StatePill, JOB_STATES, IBG_STATES, FUNDING_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { EmptyState } from "@/components/app/empty-state";
import { useStore, update } from "@/lib/mock/store";
import { findJob, findCustomer, findProperty, ibgsOfJob, fundingOfJob, pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { JobState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/jobs/$id")({
  head: () => ({ meta: [{ title: "Job — Renewably UK" }] }),
  component: JobDetail,
});

type Tab = "overview" | "documents" | "ibgs" | "funding" | "audit";

const TRANSITIONS: Partial<Record<JobState, JobState[]>> = {
  draft: ["in-progress", "cancelled"],
  "in-progress": ["awaiting-information", "under-validation", "blocked", "completed", "cancelled"],
  "awaiting-information": ["in-progress", "blocked", "cancelled"],
  "under-validation": ["completed", "blocked", "in-progress"],
  blocked: ["in-progress", "cancelled"],
  completed: ["closed"],
  closed: ["archived"],
};

const TRACK: { state: JobState; label: string }[] = [
  { state: "draft", label: "Draft" },
  { state: "in-progress", label: "In progress" },
  { state: "under-validation", label: "Under validation" },
  { state: "completed", label: "Completed" },
];

function trackStatus(idx: number, current: JobState) {
  const order = TRACK.map((t) => t.state);
  const currentIdx = order.indexOf(current);
  if (current === "blocked" || current === "cancelled") {
    return idx <= 1 ? "complete" : "future";
  }
  if (currentIdx === -1) return idx === 0 ? "complete" : "future";
  if (idx < currentIdx) return "complete";
  if (idx === currentIdx) return "active";
  return "future";
}

function JobDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const job = findJob(data, id);
  const [tab, setTab] = useState<Tab>("overview");
  const [statusOpen, setStatusOpen] = useState(false);
  const { user } = useAuth();

  if (!job) throw notFound();
  const customer = findCustomer(data, job.customerId);
  const property = findProperty(data, job.propertyId);
  const ibgs = ibgsOfJob(data, job.id);
  const funding = fundingOfJob(data, job.id);

  function setState(next: JobState) {
    update((d) => {
      const j = d.jobs.find((x) => x.id === id);
      if (!j) return;
      const prev = j.state;
      j.state = next;
      pushAudit(d, "job", id, user.fullName, `Set state ${prev} → ${next}`);
    });
    toast.success(`Job moved to ${JOB_STATES[next].label}`);
    setStatusOpen(false);
  }

  const allowed = TRANSITIONS[job.state] ?? [];
  const latestIbg = ibgs[0];
  const latestFunding = funding[0];
  const branchActive = job.state === "blocked" || job.state === "cancelled";

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Jobs
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Job · {job.ref}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{job.measure}</h1>
          <div className="mt-2 text-sm text-ink-muted">
            {customer && <Link to="/customers/$id" params={{ id: customer.id }} className="hover:text-foreground">{customer.name}</Link>}
            {property && <> · <Link to="/properties/$id" params={{ id: property.id }} className="hover:text-foreground">{property.address}</Link></>}
          </div>
        </div>
        <StatePill meta={JOB_STATES[job.state]} />
      </div>

      {/* Status track */}
      <div className="mt-6 rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          {TRACK.map((step, i) => {
            const status = trackStatus(i, job.state);
            const last = i === TRACK.length - 1;
            return (
              <div key={step.state} className="flex flex-1 items-start gap-2">
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={
                      "grid size-4 place-items-center rounded-full transition-colors " +
                      (status === "complete"
                        ? "bg-cat-green text-white"
                        : status === "active"
                        ? "bg-foreground text-background"
                        : "bg-tile text-ink-muted")
                    }
                  >
                    {status === "complete" ? <Check className="size-2.5" strokeWidth={3} /> : null}
                  </span>
                  <span className={
                    "text-[10px] font-medium uppercase tracking-wide " +
                    (status === "active" ? "text-foreground" : "text-ink-muted")
                  }>
                    {step.label}
                  </span>
                </div>
                {!last && (
                  <div className={
                    "mt-1.5 h-px flex-1 " +
                    (trackStatus(i + 1, job.state) === "complete" || status === "complete"
                      ? "bg-cat-green"
                      : "bg-border")
                  } />
                )}
              </div>
            );
          })}
        </div>

        {branchActive && (
          <div className="mt-3 flex items-center gap-2 border-t pt-3">
            <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Branch:</span>
            <div className="flex items-center gap-1.5 rounded-full border border-dashed border-destructive/30 bg-destructive/5 px-2.5 py-1 text-[11px] font-medium text-destructive">
              <span className="size-1.5 rounded-full bg-destructive" />
              {JOB_STATES[job.state].label}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <UnderlineTabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "overview", label: "Overview" },
            { value: "documents", label: "Documents" },
            { value: "ibgs", label: "IBGs", count: ibgs.length },
            { value: "funding", label: "Funding", count: funding.length },
            { value: "audit", label: "Audit" },
          ]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {tab === "overview" && (
            <Card title="Job details">
              <Detail label="Owner" value={job.owner} />
              <Detail label="Start date" value={job.startDate} />
              <Detail label="Measure" value={job.measure} />
              <Detail label="State" value={<StatePill meta={JOB_STATES[job.state]} />} />
            </Card>
          )}
          {tab === "documents" && <Card title="Documents"><EmptyState title="No documents uploaded" body="Drop EPCs, surveys and contracts here. Upload is mocked in design mode." /></Card>}
          {tab === "ibgs" && (
            <Card title="IBGs" action={
              <Link to="/ibg/new" className="press inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium">
                <FileBadge className="size-3" /> New IBG
              </Link>
            }>
              {ibgs.length === 0 ? <EmptyState title="No IBGs" body="Issue an IBG against this job." /> : (
                <div className="space-y-1">
                  {ibgs.map((i) => (
                    <Link key={i.id} to="/ibg/$id" params={{ id: i.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                      <div>
                        <div className="text-sm font-medium text-foreground">{i.ref}</div>
                        <div className="text-xs text-ink-muted">{i.policyType} · issued by {i.issuedBy}</div>
                      </div>
                      <StatePill meta={IBG_STATES[i.state]} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
          {tab === "funding" && (
            <Card title="Funding projects" action={
              <Link to="/funding/match" className="press inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium">
                <Sparkles className="size-3" /> Match scheme
              </Link>
            }>
              {funding.length === 0 ? <EmptyState title="No funding projects" body="Open the Match Hub to find a scheme." /> : (
                <div className="space-y-1">
                  {funding.map((f) => (
                    <Link key={f.id} to="/funding/$id" params={{ id: f.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
                      <div>
                        <div className="text-sm font-medium text-foreground">{f.ref} · {f.scheme}</div>
                        <div className="text-xs text-ink-muted">{f.measure} · {f.evidence.length} evidence files</div>
                      </div>
                      <StatePill meta={FUNDING_STATES[f.state]} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
          {tab === "audit" && <AuditTimeline entityType="job" entityId={job.id} />}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          {/* Status panel */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Status</div>
            <div className="mt-2"><StatePill meta={JOB_STATES[job.state]} /></div>
            {allowed.length > 0 && (
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <button className="press mt-3 inline-flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-surface">
                    Change status
                    <ChevronDown className="size-3 text-ink-muted" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={6} className="w-56 p-1">
                  <div className="px-2 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    Move to
                  </div>
                  {allowed.map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(s)}
                      className="press flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-surface"
                    >
                      <span>{JOB_STATES[s].label}</span>
                      <ArrowRight className="size-3 text-ink-muted" />
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* IBG panel */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">IBG</div>
            {latestIbg ? (
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-foreground">{latestIbg.ref}</span>
                  <StatePill meta={IBG_STATES[latestIbg.state]} />
                </div>
                <Link
                  to="/ibg/$id"
                  params={{ id: latestIbg.id }}
                  className="press mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
                >
                  Open <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="mt-2">
                <div className="text-xs text-ink-muted">No IBG yet</div>
                <Link
                  to="/ibg/new"
                  className="press mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                >
                  <FileBadge className="size-3" /> Create IBG
                </Link>
              </div>
            )}
          </div>

          {/* Funding panel */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Funding</div>
            {latestFunding ? (
              <div className="mt-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{latestFunding.scheme}</span>
                  <StatePill meta={FUNDING_STATES[latestFunding.state]} />
                </div>
                <Link
                  to="/funding/$id"
                  params={{ id: latestFunding.id }}
                  className="press mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
                >
                  Open <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="mt-2">
                <div className="text-xs text-ink-muted">No funding project</div>
                <Link
                  to="/funding/match"
                  className="press mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                >
                  <Sparkles className="size-3" /> Find scheme
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-2.5 last:border-b-0">
      <div className="text-xs uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

```

--- `src/routes/_authed.jobs.new.tsx` ---

```tsx
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { useStore, update, nid, nref } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/jobs/new")({
  head: () => ({ meta: [{ title: "New job — Renewably UK" }] }),
  component: NewJob,
});

const MEASURES = ["Air Source Heat Pump", "Solar PV", "Loft Insulation", "Cavity Wall Insulation", "EV Charger", "Ground Source Heat Pump"];

function NewJob() {
  const data = useStore();
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ customerId: data.customers[0]?.id ?? "", propertyId: "", measure: MEASURES[0], owner: user.fullName, startDate: new Date().toISOString().slice(0, 10) });

  const props = data.properties.filter((p) => p.customerId === form.customerId);

  function save() {
    if (!form.customerId || !form.propertyId) {
      toast.error("Customer and property required");
      return;
    }
    const id = nid("job");
    const ref = nref("J");
    update((d) => {
      d.jobs.unshift({
        id, ref, customerId: form.customerId, propertyId: form.propertyId,
        measure: form.measure, owner: form.owner, state: "draft",
        startDate: form.startDate, createdAt: Date.now(),
      });
      pushAudit(d, "job", id, user.fullName, "Created job");
    });
    toast.success("Job created");
    nav({ to: "/jobs/$id", params: { id } });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Jobs
      </Link>
      <div className="mt-3"><PageHeader eyebrow="Jobs" title="New job" /></div>

      <div className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
        <Field label="Customer">
          <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value, propertyId: "" })} className={inputCls}>
            {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.ref})</option>)}
          </select>
        </Field>
        <Field label="Property">
          <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} className={inputCls}>
            <option value="">Select…</option>
            {props.map((p) => <option key={p.id} value={p.id}>{p.address}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Measure">
            <select value={form.measure} onChange={(e) => setForm({ ...form, measure: e.target.value })} className={inputCls}>
              {MEASURES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Start date">
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="Owner">
          <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className={inputCls} />
        </Field>

        <div className="flex justify-end pt-2">
          <button onClick={save} className="press rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Create job</button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="mb-1 text-xs font-medium text-ink-muted">{label}</div>{children}</label>;
}

```

--- `src/routes/_authed.jobs.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, JOB_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { findCustomer } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import type { JobState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/jobs")({
  head: () => ({ meta: [{ title: "Jobs — Renewably UK" }] }),
  component: JobsList,
});

const FILTERS: { value: JobState; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In progress" },
  { value: "awaiting-information", label: "Awaiting info" },
  { value: "under-validation", label: "Under validation" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
];

function JobsList() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<JobState | "all">("all");

  if (!can(permissions, "jobs.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Jobs" title="Jobs" />
        <div className="mt-6"><LockedCard title="Jobs" reason={{ kind: "permission", permission: "jobs.read" }} /></div>
      </div>
    );
  }

  const rows = data.jobs
    .filter((j) => filter === "all" || j.state === filter)
    .filter((j) => {
      if (!q) return true;
      const c = findCustomer(data, j.customerId);
      return j.ref.toLowerCase().includes(q.toLowerCase()) || j.measure.toLowerCase().includes(q.toLowerCase()) || (c?.name.toLowerCase().includes(q.toLowerCase()) ?? false);
    });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Projects"
        title="Jobs"
        subtitle="Installation work — full lifecycle from draft to archived."
        actions={
          <Link to="/jobs/new" className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <Plus className="size-4" /> New job
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <FilterPills<JobState>
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ ...f, count: data.jobs.filter((j) => j.state === f.value).length }))}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs" className="h-9 w-64 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? <EmptyState icon={Briefcase} title="No jobs found" body="Try removing filters or create a new job." /> : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Ref</th>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">Measure</th>
                  <th className="px-4 py-2.5 text-left">Owner</th>
                  <th className="px-4 py-2.5 text-left">Start</th>
                  <th className="px-4 py-2.5 text-right">State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((j) => {
                  const c = findCustomer(data, j.customerId);
                  return (
                    <tr key={j.id} className="border-b last:border-b-0 hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <Link to="/jobs/$id" params={{ id: j.id }} className="font-medium text-foreground hover:underline">{j.ref}</Link>
                      </td>
                      <td className="px-4 py-3 text-foreground">{c?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-foreground">{j.measure}</td>
                      <td className="px-4 py-3 text-ink-muted">{j.owner}</td>
                      <td className="px-4 py-3 text-ink-muted">{j.startDate}</td>
                      <td className="px-4 py-3 text-right"><StatePill meta={JOB_STATES[j.state]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.onboarding.tsx` ---

```tsx
/**
 * Onboarding wizard — 6-step flow with stepper, progress persistence,
 * and Access-tier skipping the Payment step.
 *
 * Steps:
 *   1. Sign-up / account
 *   2. Verify email
 *   3. Company details
 *   4. Approved measures
 *   5. Accreditation upload
 *   6. Payment (skipped on Access tier) → Review
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, MailCheck, Building2, Wrench,
  ShieldCheck, CreditCard, ClipboardCheck, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDevRole } from "@/lib/dev-role";
import { StatePill } from "@/components/app/state-pill";

export const Route = createFileRoute("/_authed/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Renewably UK" }] }),
  component: OnboardingPage,
});

type Tier = "access" | "operate";

type WizardData = {
  tier: Tier;
  email: string;
  emailVerified: boolean;
  companyName: string;
  companyNumber: string;
  companyAddress: string;
  measures: string[];
  trustmarkId: string;
  accreditationFile: string;
  paymentMethod: "card" | "bacs" | "";
  cardLast4: string;
};

const STORAGE = "renewably:onboarding-wizard:v1";

const DEFAULT_DATA: WizardData = {
  tier: "operate",
  email: "",
  emailVerified: false,
  companyName: "",
  companyNumber: "",
  companyAddress: "",
  measures: [],
  trustmarkId: "",
  accreditationFile: "",
  paymentMethod: "",
  cardLast4: "",
};

const ALL_MEASURES = [
  "Cavity wall insulation",
  "Loft insulation",
  "Solid wall insulation (External)",
  "Solid wall insulation (Internal)",
  "Heat pump (ASHP)",
  "Heat pump (GSHP)",
  "Solar PV",
  "Solar thermal",
  "Smart heating controls",
  "Underfloor insulation",
];

function loadData(): WizardData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE);
    if (!raw) return DEFAULT_DATA;
    return { ...DEFAULT_DATA, ...(JSON.parse(raw) as Partial<WizardData>) };
  } catch {
    return DEFAULT_DATA;
  }
}

const STEPS = [
  { key: "account", label: "Account", icon: Sparkles },
  { key: "verify", label: "Verify", icon: MailCheck },
  { key: "company", label: "Company", icon: Building2 },
  { key: "measures", label: "Measures", icon: Wrench },
  { key: "accreditation", label: "Accreditation", icon: ShieldCheck },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: ClipboardCheck },
] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const { setOnboardingStep } = useDevRole();
  const [data, setData] = useState<WizardData>(DEFAULT_DATA);
  const [step, setStep] = useState(0);

  // Hydrate from localStorage after mount.
  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    if (typeof window !== "undefined") {
      const s = Number(window.localStorage.getItem(`${STORAGE}:step`) ?? 0);
      if (!Number.isNaN(s)) setStep(s);
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE, JSON.stringify(data));
    window.localStorage.setItem(`${STORAGE}:step`, String(step));
  }, [data, step]);

  const visibleSteps = useMemo(
    () => (data.tier === "access" ? STEPS.filter((s) => s.key !== "payment") : STEPS),
    [data.tier],
  );

  const current = visibleSteps[step];

  function patch(p: Partial<WizardData>) {
    setData((d) => ({ ...d, ...p }));
  }

  function next() {
    if (step < visibleSteps.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function finish() {
    setOnboardingStep("complete");
    toast.success("Welcome to Renewably UK");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE);
      window.localStorage.removeItem(`${STORAGE}:step`);
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-4 py-6 md:px-8 md:py-10">
      {/* Stepper */}
      <Stepper steps={visibleSteps} current={step} />

      {/* Card */}
      <div className="mt-10 rounded-3xl border border-border bg-surface p-10 shadow-sm">
        <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
          Step {step + 1} of {visibleSteps.length}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            {titleFor(current.key)}
          </h1>
          <StatePill meta={statusFor(current.key, data)} />
        </div>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          {subtitleFor(current.key)}
        </p>

        <div className="mt-8">
          {current.key === "account" && <StepAccount data={data} patch={patch} />}
          {current.key === "verify" && <StepVerify data={data} patch={patch} />}
          {current.key === "company" && <StepCompany data={data} patch={patch} />}
          {current.key === "measures" && <StepMeasures data={data} patch={patch} />}
          {current.key === "accreditation" && <StepAccreditation data={data} patch={patch} />}
          {current.key === "payment" && <StepPayment data={data} patch={patch} />}
          {current.key === "review" && <StepReview data={data} />}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="press inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Back
          </button>

          {current.key === "review" ? (
            <button
              type="button"
              onClick={finish}
              className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Finish setup <Check className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance(current.key, data)}
              className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Stepper ──────────────────────────────────────────── */

function Stepper({
  steps,
  current,
}: {
  steps: ReadonlyArray<{ key: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
  current: number;
}) {
  return (
    <ol className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = s.icon;
        return (
          <li key={s.key} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full border text-xs font-medium",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-primary/10 text-primary",
                !done && !active && "border-border bg-surface text-ink-muted",
              )}
            >
              {done ? <Check className="size-4" /> : <Icon className="size-4" />}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                active ? "text-ink" : "text-ink-muted",
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="ml-1 h-px w-8 bg-border" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ─── Steps ──────────────────────────────────────────── */

function StepAccount({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-6">
      <Field label="Work email">
        <input
          type="email"
          value={data.email}
          onChange={(e) => patch({ email: e.target.value })}
          placeholder="you@company.co.uk"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>

      <Field label="Account tier">
        <div className="grid grid-cols-2 gap-3">
          <TierCard
            selected={data.tier === "access"}
            onClick={() => patch({ tier: "access" })}
            title="Access"
            desc="Issue and view IBGs. No payment required."
          />
          <TierCard
            selected={data.tier === "operate"}
            onClick={() => patch({ tier: "operate" })}
            title="Operate"
            desc="Full ops: jobs, funding, submissions, billing."
          />
        </div>
      </Field>
    </div>
  );
}

function TierCard({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-5 text-left transition press",
        selected ? "border-primary bg-primary/5" : "border-border bg-surface hover:bg-muted/40",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-ink">{title}</span>
        {selected && <Check className="size-4 text-primary" />}
      </div>
      <p className="mt-1 text-xs text-ink-muted">{desc}</p>
    </button>
  );
}

function StepVerify({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">
            We sent a verification link to{" "}
            <span className="font-semibold">{data.email || "your inbox"}</span>.
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Open the link to confirm. (Demo mode — click the button below to mark as verified.)
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                patch({ emailVerified: true });
                toast.success("Email verified");
              }}
              disabled={data.emailVerified}
              className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {data.emailVerified ? "Verified" : "Mark as verified"}
            </button>
            <button
              type="button"
              onClick={() => toast.info("Verification link resent")}
              className="press inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-ink"
            >
              Resend link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCompany({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Company name">
        <input
          value={data.companyName}
          onChange={(e) => patch({ companyName: e.target.value })}
          placeholder="Evergreen Installs Ltd"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>
      <Field label="Companies House number">
        <input
          value={data.companyNumber}
          onChange={(e) => patch({ companyNumber: e.target.value })}
          placeholder="12345678"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>
      <Field label="Registered address">
        <textarea
          value={data.companyAddress}
          onChange={(e) => patch({ companyAddress: e.target.value })}
          placeholder="Street, city, postcode"
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>
    </div>
  );
}

function StepMeasures({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  function toggle(m: string) {
    patch({
      measures: data.measures.includes(m)
        ? data.measures.filter((x) => x !== m)
        : [...data.measures, m],
    });
  }
  return (
    <div>
      <p className="mb-4 text-xs text-ink-muted">
        Select the measures your team installs. Admin will review and approve.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {ALL_MEASURES.map((m) => {
          const on = data.measures.includes(m);
          return (
            <button
              key={m}
              type="button"
              onClick={() => toggle(m)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition press",
                on
                  ? "border-primary bg-primary/5 text-ink"
                  : "border-border bg-surface text-ink hover:bg-muted/40",
              )}
            >
              <span>{m}</span>
              {on && <Check className="size-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepAccreditation({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="TrustMark Licence ID">
        <input
          value={data.trustmarkId}
          onChange={(e) => patch({ trustmarkId: e.target.value })}
          placeholder="TM-000-000-00"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
      </Field>
      <Field label="Accreditation document">
        <button
          type="button"
          onClick={() => {
            patch({ accreditationFile: "trustmark-cert.pdf" });
            toast.success("Document uploaded");
          }}
          className="press flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-sm text-ink-muted hover:bg-muted/40"
        >
          {data.accreditationFile ? (
            <span className="flex items-center gap-2 text-ink">
              <Check className="size-4 text-primary" /> {data.accreditationFile}
            </span>
          ) : (
            "Click to upload PDF (demo)"
          )}
        </button>
      </Field>
    </div>
  );
}

function StepPayment({
  data,
  patch,
}: {
  data: WizardData;
  patch: (p: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Payment method">
        <div className="grid grid-cols-2 gap-3">
          <TierCard
            selected={data.paymentMethod === "card"}
            onClick={() => patch({ paymentMethod: "card", cardLast4: "4242" })}
            title="Card"
            desc="Stripe-secured. Charged monthly in arrears."
          />
          <TierCard
            selected={data.paymentMethod === "bacs"}
            onClick={() => patch({ paymentMethod: "bacs", cardLast4: "" })}
            title="BACS direct debit"
            desc="UK bank transfer. 2-day setup."
          />
        </div>
      </Field>
      {data.paymentMethod === "card" && (
        <div className="rounded-xl border border-border bg-background p-4 text-xs text-ink-muted">
          Card ending in <span className="font-medium text-ink">{data.cardLast4}</span>{" "}
          (demo — no real charge).
        </div>
      )}
    </div>
  );
}

function StepReview({ data }: { data: WizardData }) {
  return (
    <div className="space-y-3">
      <ReviewRow label="Tier" value={data.tier === "access" ? "Access" : "Operate"} />
      <ReviewRow label="Email" value={data.email || "—"} />
      <ReviewRow label="Email verified" value={data.emailVerified ? "Yes" : "No"} />
      <ReviewRow label="Company" value={data.companyName || "—"} />
      <ReviewRow label="Companies House" value={data.companyNumber || "—"} />
      <ReviewRow label="Measures" value={data.measures.length ? `${data.measures.length} selected` : "None"} />
      <ReviewRow label="TrustMark" value={data.trustmarkId || "—"} />
      <ReviewRow label="Accreditation" value={data.accreditationFile || "—"} />
      {data.tier === "operate" && (
        <ReviewRow
          label="Payment"
          value={
            data.paymentMethod === "card"
              ? `Card •••• ${data.cardLast4}`
              : data.paymentMethod === "bacs"
              ? "BACS direct debit"
              : "—"
          }
        />
      )}
      <p className="pt-3 text-xs text-ink-muted">
        Submitting will queue your account for admin review. You can sign in immediately
        and start in read-only mode while we verify.
      </p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

/* ─── Field primitive ──────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

/* ─── Helpers ──────────────────────────────────────────── */

function titleFor(key: string) {
  switch (key) {
    case "account": return "Create your account";
    case "verify": return "Verify your email";
    case "company": return "Company details";
    case "measures": return "Approved measures";
    case "accreditation": return "Upload accreditation";
    case "payment": return "Payment setup";
    case "review": return "Review & submit";
    default: return "";
  }
}

function subtitleFor(key: string) {
  switch (key) {
    case "account": return "Pick a tier — you can upgrade later from Settings.";
    case "verify": return "We sent you a confirmation link to keep your account secure.";
    case "company": return "We use this for compliance, billing, and TrustMark verification.";
    case "measures": return "Tell us what your team installs. Admin will approve before they appear in IBG flows.";
    case "accreditation": return "Upload your TrustMark certificate. PAS 2030 / 2035 docs may follow.";
    case "payment": return "Required for Operate tier — you won't be charged today.";
    case "review": return "Final check — confirm everything looks right before we submit.";
    default: return "";
  }
}

function statusFor(key: string, data: WizardData) {
  if (key === "verify") {
    return data.emailVerified
      ? { label: "Verified", tone: "active" as const }
      : { label: "Awaiting verification", tone: "warning" as const };
  }
  return { label: "In progress", tone: "info" as const };
}

function canAdvance(key: string, data: WizardData): boolean {
  switch (key) {
    case "account": return /\S+@\S+\.\S+/.test(data.email);
    case "verify": return data.emailVerified;
    case "company": return data.companyName.length > 1 && data.companyNumber.length > 1;
    case "measures": return data.measures.length > 0;
    case "accreditation": return data.trustmarkId.length > 1 && data.accreditationFile.length > 0;
    case "payment": return data.paymentMethod !== "";
    default: return true;
  }
}

```

--- `src/routes/_authed.projects.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Home, Briefcase, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, JOB_STATES, RECORD_STATES } from "@/components/app/state-pill";
import { fmtDate } from "@/lib/mock/queries";
import { useDevRole } from "@/lib/dev-role";
import { canAny } from "@/lib/rbac";
import { LockedCard } from "@/components/app/locked-card";

export const Route = createFileRoute("/_authed/projects")({
  head: () => ({ meta: [{ title: "Projects — Renewably UK" }] }),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  const data = useStore();
  const { permissions } = useDevRole();

  if (!canAny(permissions, ["customers.read", "jobs.read", "properties.read"])) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Projects" title="Projects" />
        <div className="mt-6"><LockedCard title="Projects hub" body="Ask an admin for read access to customers, properties or jobs." reason={{ kind: "permission", permission: "customers.read" }} /></div>
      </div>
    );
  }

  const tiles = [
    { label: "Customers", to: "/customers", icon: Users, count: data.customers.length, desc: "People + organisations you serve", tone: "blue" },
    { label: "Properties", to: "/properties", icon: Home, count: data.properties.length, desc: "Sites linked to a customer", tone: "teal" },
    { label: "Jobs", to: "/jobs", icon: Briefcase, count: data.jobs.length, desc: "Installation work — full lifecycle", tone: "green" },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Projects" title="The record chain" subtitle="Customer → Property → Job. Every IBG, funding project and submission is anchored here." />

      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to} className="press tile group flex flex-col gap-3 rounded-2xl border bg-card p-5">
              <div className={`grid size-12 place-items-center rounded-xl bg-cat-${t.tone}-bg text-cat-${t.tone}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-base font-medium text-foreground">{t.label}</div>
                  <span className="rounded-full bg-tile px-2 py-0.5 text-[11px] font-medium text-ink-muted">{t.count}</span>
                </div>
                <div className="mt-1 text-sm text-ink-muted">{t.desc}</div>
              </div>
              <div className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-foreground">Open <ArrowRight className="size-3" /></div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Recent customers" to="/customers">
          {data.customers.slice(0, 5).map((c) => (
            <Link key={c.id} to="/customers/$id" params={{ id: c.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{c.name}</div>
                <div className="text-xs text-ink-muted">{c.ref} · created {fmtDate(c.createdAt)}</div>
              </div>
              <StatePill meta={RECORD_STATES[c.status]} />
            </Link>
          ))}
        </Panel>
        <Panel title="Active jobs" to="/jobs">
          {data.jobs.filter((j) => j.state === "in-progress" || j.state === "under-validation").slice(0, 5).map((j) => (
            <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="press flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-surface">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{j.ref} · {j.measure}</div>
                <div className="text-xs text-ink-muted">Owner · {j.owner}</div>
              </div>
              <StatePill meta={JOB_STATES[j.state]} />
            </Link>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between px-2">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <Link to={to} className="text-xs text-ink-muted hover:text-foreground">View all</Link>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

```

--- `src/routes/_authed.properties.$id.tsx` ---

```tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { StatePill, RECORD_STATES, JOB_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { useStore } from "@/lib/mock/store";
import { findProperty, findCustomer, jobsOfProperty } from "@/lib/mock/queries";

export const Route = createFileRoute("/_authed/properties/$id")({
  head: () => ({ meta: [{ title: "Property — Renewably UK" }] }),
  component: PropertyDetail,
});

function PropertyDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const property = findProperty(data, id);
  if (!property) throw notFound();
  const customer = findCustomer(data, property.customerId);
  const jobs = jobsOfProperty(data, property.id);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/properties" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Properties
      </Link>

      <div className="mt-3 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Property</div>
          <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight text-ink">
            <MapPin className="size-6 text-cat-teal" /> {property.address}
          </h1>
          <div className="mt-2 text-sm text-ink-muted">
            {property.postcode} · EPC {property.epc ?? "—"} · UPRN {property.uprn ?? "—"}
            {customer && <> · linked to <Link to="/customers/$id" params={{ id: customer.id }} className="text-foreground hover:underline">{customer.name}</Link></>}
          </div>
        </div>
        <StatePill meta={RECORD_STATES[property.status]} />
      </div>

      {property.duplicateFlag && (
        <div className="mt-5 rounded-2xl border border-cat-amber/30 bg-cat-amber-bg/40 p-4 text-sm text-cat-amber">
          <strong className="font-semibold">Duplicate flag.</strong> This address looks similar to another property on file. Verify before issuing an IBG.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-5 py-3 text-sm font-medium">Job history</div>
          <div className="divide-y">
            {jobs.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-ink-muted">No jobs at this property yet.</div>
            ) : jobs.map((j) => (
              <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="flex items-center justify-between px-5 py-3 hover:bg-surface">
                <div>
                  <div className="text-sm font-medium text-foreground">{j.ref} · {j.measure}</div>
                  <div className="text-xs text-ink-muted">Owner · {j.owner} · {j.startDate}</div>
                </div>
                <StatePill meta={JOB_STATES[j.state]} />
              </Link>
            ))}
          </div>
        </div>

        <AuditTimeline entityType="property" entityId={property.id} />
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.properties.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Home as HomeIcon } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, RECORD_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { findCustomer, jobsOfProperty } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/properties")({
  head: () => ({ meta: [{ title: "Properties — Renewably UK" }] }),
  component: PropertiesList,
});

function PropertiesList() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");

  if (!can(permissions, "properties.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Properties" title="Properties" />
        <div className="mt-6"><LockedCard title="Properties" reason={{ kind: "permission", permission: "properties.read" }} /></div>
      </div>
    );
  }

  const rows = data.properties
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => q === "" || p.address.toLowerCase().includes(q.toLowerCase()) || p.postcode.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Projects" title="Properties" subtitle="Sites linked to a customer. Each property hosts jobs." />

      <div className="mt-6 flex items-center justify-between gap-3">
        <FilterPills
          value={filter}
          onChange={setFilter}
          options={[
            { value: "active", label: "Active", count: data.properties.filter((p) => p.status === "active").length },
            { value: "draft", label: "Draft", count: data.properties.filter((p) => p.status === "draft").length },
          ]}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search address" className="h-9 w-64 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? <EmptyState icon={HomeIcon} title="No properties" body="Properties are added from a customer detail page." /> : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Address</th>
                  <th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-left">EPC</th>
                  <th className="px-4 py-2.5 text-left">UPRN</th>
                  <th className="px-4 py-2.5 text-left">Jobs</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const c = findCustomer(data, p.customerId);
                  const j = jobsOfProperty(data, p.id).length;
                  return (
                    <tr key={p.id} className="border-b last:border-b-0 hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <Link to="/properties/$id" params={{ id: p.id }} className="block">
                          <div className="font-medium text-foreground">{p.address}</div>
                          <div className="text-xs text-ink-muted">{p.postcode}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {c ? <Link to="/customers/$id" params={{ id: c.id }} className="text-foreground hover:underline">{c.name}</Link> : "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">{p.epc ?? "—"}</td>
                      <td className="px-4 py-3 text-ink-muted">{p.uprn ?? "—"}</td>
                      <td className="px-4 py-3 text-foreground">{j}</td>
                      <td className="px-4 py-3 text-right"><StatePill meta={RECORD_STATES[p.status]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.settings.access.tsx` ---

```tsx
/**
 * /settings/access — operator's read-only view of their own role,
 * granted permissions, and pending requests.
 */

import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Lock, Clock } from "lucide-react";
import { useDevRole } from "@/lib/dev-role";
import { PERMISSIONS, PERMISSION_CATEGORIES, ROLE_META } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/settings/access")({
  head: () => ({ meta: [{ title: "My access — Renewably UK" }] }),
  component: MyAccess,
});

function MyAccess() {
  const { role, permissions, pendingPermissionRequests } = useDevRole();
  const meta = ROLE_META[role];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-cat-purple-bg text-cat-purple">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{meta.label}</div>
            <div className="text-xs text-ink-muted">{meta.description}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat label="Granted" value={permissions.length} />
          <Stat label="Pending" value={pendingPermissionRequests.length} />
          <Stat label="Available" value={PERMISSIONS.length} />
        </div>
      </div>

      {pendingPermissionRequests.length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="size-4 text-cat-amber" /> Pending requests
          </div>
          <div className="mt-3 space-y-1.5">
            {pendingPermissionRequests.map((p) => {
              const def = PERMISSIONS.find((x) => x.id === p);
              return (
                <div key={p} className="flex items-center justify-between rounded-xl border bg-surface/40 px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium text-foreground">{def?.label ?? p}</div>
                    <div className="text-xs text-ink-muted">{def?.description}</div>
                  </div>
                  <span className="rounded-full bg-cat-amber-bg px-2 py-0.5 text-[11px] font-medium text-cat-amber">Awaiting admin</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card">
        <div className="border-b px-5 py-3 text-sm font-medium text-foreground">Permissions by area</div>
        <div className="divide-y">
          {PERMISSION_CATEGORIES.map((cat) => {
            const perms = PERMISSIONS.filter((p) => p.category === cat);
            const granted = perms.filter((p) => permissions.includes(p.id));
            return (
              <div key={cat} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">{cat}</div>
                  <span className="text-[11px] text-ink-muted">{granted.length} of {perms.length}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {perms.map((p) => {
                    const has = permissions.includes(p.id);
                    return (
                      <span
                        key={p.id}
                        className={
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] " +
                          (has
                            ? "bg-cat-green-bg text-cat-green"
                            : "border bg-background text-ink-muted")
                        }
                      >
                        {!has && <Lock className="size-2.5" />}
                        {p.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Need more access? Click the lock icon on any feature to request it from your admin.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface/60 px-3 py-3">
      <div className="text-xl font-semibold text-foreground">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</div>
    </div>
  );
}

```

--- `src/routes/_authed.settings.integrations.tsx` ---

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plug, Check, ExternalLink, Zap, Building2, MessageSquare, Webhook, Workflow } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { fmtDate } from "@/lib/mock/queries";
import type { Integration, IntegrationKey } from "@/lib/mock/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/settings/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Renewably UK" }] }),
  component: IntegrationsPage,
});

const ICONS: Record<IntegrationKey, React.ComponentType<{ className?: string }>> = {
  zapier: Zap,
  make: Workflow,
  hubspot: Building2,
  salesforce: Building2,
  slack: MessageSquare,
  webhooks: Webhook,
};

function IntegrationsPage() {
  const data = useStore();
  const [target, setTarget] = useState<Integration | null>(null);
  const [account, setAccount] = useState("");

  const categories = Array.from(new Set(data.integrations.map((i) => i.category)));

  function disconnect(key: IntegrationKey) {
    update((d) => {
      const x = d.integrations.find((i) => i.key === key);
      if (!x) return;
      x.connected = false;
      x.account = undefined;
      x.connectedAt = undefined;
    });
    toast.success("Disconnected");
  }

  function openConnect(i: Integration) {
    setTarget(i);
    setAccount("");
  }

  function confirmConnect() {
    if (!target) return;
    if (!account.trim()) {
      toast.error("Account or workspace is required");
      return;
    }
    update((d) => {
      const x = d.integrations.find((i) => i.key === target.key);
      if (!x) return;
      x.connected = true;
      x.account = account.trim();
      x.connectedAt = Date.now();
    });
    toast.success(`${target.name} connected`);
    setTarget(null);
    setAccount("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Integrations</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Connect external tools to push events from the IBG, job and submission record-chain.
        </p>
      </div>

      {categories.map((cat) => {
        const items = data.integrations.filter((i) => i.category === cat);
        return (
          <section key={cat} className="space-y-3">
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">{cat}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((i) => {
                const Icon = ICONS[i.key];
                return (
                  <div
                    key={i.key}
                    className={cn(
                      "rounded-2xl border bg-card p-4 transition",
                      i.connected ? "border-cat-green/30" : "hover:border-foreground/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl",
                          i.connected ? "bg-cat-green-bg text-cat-green" : "bg-muted text-ink-muted",
                        )}>
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className="text-sm font-semibold text-foreground">{i.name}</div>
                            {i.connected && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-cat-green-bg px-1.5 py-0.5 text-[10px] font-medium text-cat-green">
                                <Check className="size-2.5" /> Connected
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-ink-muted">{i.description}</div>
                          {i.connected && i.account && (
                            <div className="mt-2 text-[11px] text-ink-muted">
                              {i.account} · since {fmtDate(i.connectedAt!)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      {i.connected ? (
                        <button
                          onClick={() => disconnect(i.key)}
                          className="press rounded-full border bg-background px-3 py-1.5 text-xs"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => openConnect(i)}
                          className="press inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                        >
                          <Plug className="size-3" /> Connect
                          <ExternalLink className="size-3 opacity-60" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <Dialog open={!!target} onOpenChange={(v) => !v && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {target?.name}</DialogTitle>
            <DialogDescription>{target?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="account">
              {target?.key === "slack" ? "Channel" : target?.key === "webhooks" ? "Endpoint URL" : "Account / workspace"}
            </Label>
            <Input
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder={
                target?.key === "slack"
                  ? "#ops-renewably"
                  : target?.key === "webhooks"
                  ? "https://hooks.example.com/renewably"
                  : "renewably-uk"
              }
            />
            <p className="text-xs text-ink-muted">
              You'll be redirected to {target?.name} to complete OAuth in production.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setTarget(null)}
              className="press rounded-full border bg-background px-3.5 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={confirmConnect}
              className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
            >
              <Plug className="size-4" /> Connect
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

```

--- `src/routes/_authed.settings.measures.tsx` ---

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { StatePill } from "@/components/app/state-pill";

export const Route = createFileRoute("/_authed/settings/measures")({
  head: () => ({ meta: [{ title: "Measures — Renewably UK" }] }),
  component: MeasuresSettings,
});

const APPROVED = [
  "Cavity wall insulation",
  "Loft insulation",
  "Solar PV",
  "Smart heating controls",
];

const CATALOG = [
  "Solid wall insulation (External)",
  "Solid wall insulation (Internal)",
  "Heat pump (ASHP)",
  "Heat pump (GSHP)",
  "Solar thermal",
  "Underfloor insulation",
  "Window glazing upgrade",
  "Mechanical ventilation",
];

function MeasuresSettings() {
  const [requested, setRequested] = useState<string[]>([]);

  function request(m: string) {
    if (requested.includes(m)) return;
    setRequested([...requested, m]);
    toast.success("Request sent to admin");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-base font-semibold text-ink">Approved measures</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Measures your team is currently authorised to install. Used to match funding schemes.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {APPROVED.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1.5 rounded-full bg-cat-green-bg px-3 py-1 text-xs font-medium text-cat-green"
            >
              <Check className="size-3.5" />
              {m}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface">
        <div className="border-b border-border p-6">
          <h2 className="text-base font-semibold text-ink">Request a new measure</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Select from the catalog. Admin will review accreditation before adding it to your approved list.
          </p>
        </div>
        <ul>
          {CATALOG.map((m) => {
            const isRequested = requested.includes(m);
            return (
              <li
                key={m}
                className="flex items-center justify-between border-b border-border px-6 py-4 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ink">{m}</span>
                  {isRequested && <StatePill meta={{ label: "Pending review", tone: "warning" }} />}
                </div>
                <button
                  type="button"
                  disabled={isRequested}
                  onClick={() => request(m)}
                  className={cn(
                    "press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                    isRequested
                      ? "border border-border text-ink-muted"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {isRequested ? (
                    <>
                      <Clock className="size-3.5" /> Requested
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" /> Request
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

```

--- `src/routes/_authed.settings.notifications.tsx` ---

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/settings/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Renewably UK" }] }),
  component: NotificationsSettings,
});

const CATEGORIES = [
  { key: "ibg-issued", label: "IBG issued", desc: "When a new IBG is finalised on a job you own." },
  { key: "ibg-amendment", label: "IBG amendments", desc: "Amendment requests, approvals and rejections." },
  { key: "funding-submission", label: "Funding submissions", desc: "State changes on submissions you created." },
  { key: "funding-readiness", label: "Funding readiness", desc: "When a project becomes fully evidenced." },
  { key: "user-invite", label: "User invites accepted", desc: "Admin only — when invited users join." },
  { key: "billing", label: "Billing & invoices", desc: "Payment receipts, failures and renewals." },
];

type Channels = { email: boolean; inapp: boolean };

function NotificationsSettings() {
  const [prefs, setPrefs] = useState<Record<string, Channels>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, { email: true, inapp: true }])),
  );

  function toggle(key: string, ch: keyof Channels) {
    setPrefs((p) => ({ ...p, [key]: { ...p[key], [ch]: !p[key][ch] } }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface">
        <div className="border-b border-border p-6">
          <h2 className="text-base font-semibold text-ink">Notification preferences</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Choose how you want to hear about activity in your workspace.
          </p>
        </div>
        <div>
          <div className="grid grid-cols-[1fr_80px_80px] items-center gap-4 border-b border-border px-6 py-3 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            <span>Category</span>
            <span className="text-center">Email</span>
            <span className="text-center">In-app</span>
          </div>
          {CATEGORIES.map((c) => (
            <div
              key={c.key}
              className="grid grid-cols-[1fr_80px_80px] items-center gap-4 border-b border-border px-6 py-4 last:border-0"
            >
              <div>
                <div className="text-sm font-medium text-ink">{c.label}</div>
                <div className="text-xs text-ink-muted">{c.desc}</div>
              </div>
              <Toggle on={prefs[c.key].email} onChange={() => toggle(c.key, "email")} />
              <Toggle on={prefs[c.key].inapp} onChange={() => toggle(c.key, "inapp")} />
            </div>
          ))}
        </div>
        <div className="flex justify-end p-6">
          <button
            type="button"
            onClick={() => toast.success("Preferences saved")}
            className="press rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Save preferences
          </button>
        </div>
      </section>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "mx-auto flex h-5 w-9 items-center rounded-full p-0.5 transition",
        on ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "size-4 rounded-full bg-white transition",
          on ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

```

--- `src/routes/_authed.settings.profile.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/settings/profile")({
  head: () => ({ meta: [{ title: "Profile — Renewably UK" }] }),
  component: ProfileSettings,
});

function ProfileSettings() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [twoFa, setTwoFa] = useState(false);

  useEffect(() => {
    try { setTwoFa(localStorage.getItem("renewably:2fa") === "true"); } catch { /* */ }
  }, []);

  return (
    <div className="space-y-6">
      <Card title="Personal details">
        <Field label="Full name">
          <Input value={fullName} onChange={(v) => setFullName(v)} />
        </Field>
        <Field label="Work email">
          <Input value={email} onChange={(v) => setEmail(v)} type="email" />
        </Field>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => toast.success("Profile updated")}
            className="press rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Save changes
          </button>
        </div>
      </Card>

      <Card title="Password">
        <Field label="Current password">
          <Input value="" onChange={() => {}} type="password" placeholder="••••••••" />
        </Field>
        <Field label="New password">
          <Input value="" onChange={() => {}} type="password" placeholder="••••••••" />
        </Field>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => toast.success("Password changed")}
            className="press rounded-full border border-border px-4 py-2 text-sm font-medium text-ink"
          >
            Update password
          </button>
        </div>
      </Card>

      <Card title="Two-factor authentication" tone={twoFa ? undefined : "warning"}>
        <p className="text-sm text-ink-muted">
          {twoFa
            ? "2FA is enabled on your account. Manage your authenticator app and backup codes from Security."
            : "Add an extra layer of security with an authenticator app. Recommended for all admins and operators handling funding submissions."}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Link
            to="/settings/security"
            className="press rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {twoFa ? "Manage 2FA" : "Enable 2FA"}
          </Link>
          {twoFa && (
            <span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-[11px] font-medium text-cat-green">
              Enabled
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "warning";
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {tone === "warning" && (
          <span className="rounded-full bg-cat-amber-bg px-2 py-0.5 text-[11px] font-medium text-cat-amber">
            Recommended
          </span>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
    />
  );
}

```

--- `src/routes/_authed.settings.security.tsx` ---

```tsx
/**
 * /settings/security — 2FA setup + active sessions (mock).
 */

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff, Monitor, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { TwoFactorDialog } from "@/components/app/two-factor-dialog";

export const Route = createFileRoute("/_authed/settings/security")({
  head: () => ({ meta: [{ title: "Security — Renewably UK" }] }),
  component: SecurityPage,
});

type Session = {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  current: boolean;
  lastActive: string;
};

const SESSIONS: Session[] = [
  { id: "s1", device: "MacBook Pro", browser: "Chrome 142", ip: "82.34.117.4", location: "London, UK", current: true, lastActive: "Active now" },
  { id: "s2", device: "iPhone 15", browser: "Safari", ip: "82.34.117.4", location: "London, UK", current: false, lastActive: "2 hours ago" },
  { id: "s3", device: "Windows PC", browser: "Edge 138", ip: "31.94.62.18", location: "Manchester, UK", current: false, lastActive: "Yesterday" },
];

function SecurityPage() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState(SESSIONS);

  useEffect(() => {
    try { setEnabled(localStorage.getItem("renewably:2fa") === "true"); } catch { /* */ }
  }, []);

  function disable() {
    try { localStorage.removeItem("renewably:2fa"); } catch { /* */ }
    setEnabled(false);
    toast.success("Two-factor authentication disabled");
  }

  function revoke(id: string) {
    setSessions((s) => s.filter((x) => x.id !== id));
    toast.success("Session signed out");
  }

  function revokeAll() {
    setSessions((s) => s.filter((x) => x.current));
    toast.success("All other sessions signed out");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={"grid size-10 place-items-center rounded-xl " + (enabled ? "bg-cat-green-bg text-cat-green" : "bg-tile text-ink-muted")}>
              {enabled ? <ShieldCheck className="size-5" /> : <ShieldOff className="size-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-foreground">Two-factor authentication</div>
                {enabled && <span className="rounded-full bg-cat-green-bg px-2 py-0.5 text-[10px] font-medium text-cat-green">Enabled</span>}
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {enabled
                  ? "Your account is protected with an authenticator app. You'll be prompted for a 6-digit code on sign in."
                  : "Add an authenticator app for an extra layer of security on every sign in."}
              </p>
            </div>
          </div>
          {enabled ? (
            <button
              onClick={disable}
              className="press shrink-0 rounded-full border border-cat-rose/30 bg-cat-rose-bg px-3 py-1.5 text-xs text-cat-rose"
            >
              Disable
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="press shrink-0 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
            >
              Enable 2FA
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-medium text-foreground">Active sessions</div>
          {sessions.length > 1 && (
            <button onClick={revokeAll} className="press text-xs text-cat-rose hover:underline">
              Sign out everywhere else
            </button>
          )}
        </div>
        <div className="divide-y">
          {sessions.map((s) => {
            const Icon = s.device.includes("iPhone") || s.device.includes("Android") ? Smartphone : Monitor;
            return (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <Icon className="size-5 text-ink-muted" />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {s.device} · {s.browser}
                      {s.current && <span className="rounded-full bg-cat-green-bg px-1.5 py-0.5 text-[10px] font-medium text-cat-green">This device</span>}
                    </div>
                    <div className="text-[11px] text-ink-muted">{s.location} · {s.ip} · {s.lastActive}</div>
                  </div>
                </div>
                {!s.current && (
                  <button
                    onClick={() => revoke(s.id)}
                    aria-label="Sign out session"
                    className="press grid size-7 place-items-center rounded-full text-ink-muted hover:bg-tile hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <TwoFactorDialog open={open} onOpenChange={setOpen} onEnabled={() => setEnabled(true)} />
    </div>
  );
}

```

--- `src/routes/_authed.settings.subscription.tsx` ---

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { StatePill } from "@/components/app/state-pill";
import { PaymentMethodDialog } from "@/components/app/payment-method-dialog";

export const Route = createFileRoute("/_authed/settings/subscription")({
  head: () => ({ meta: [{ title: "Subscription — Renewably UK" }] }),
  component: SubscriptionSettings,
});

type State = "active" | "payment-failed" | "cancelled";

function SubscriptionSettings() {
  const [last4, setLast4] = useState("4242");
  const [payOpen, setPayOpen] = useState(false);
  const [state, setState] = useState<State>("active");

  const meta =
    state === "active"
      ? { label: "Active", tone: "active" as const }
      : state === "payment-failed"
      ? { label: "Payment failed", tone: "error" as const }
      : { label: "Cancelled", tone: "neutral" as const };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Operate plan</h2>
            <p className="mt-1 text-xs text-ink-muted">£249 per month — billed in arrears.</p>
          </div>
          <StatePill meta={meta} />
        </div>

        {state === "payment-failed" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-cat-rose/30 bg-cat-rose-bg p-4 text-sm text-cat-rose">
            <AlertTriangle className="mt-0.5 size-4" />
            <div>
              Last charge failed on the card ending •••• 4242. Update your payment method to keep
              full access — you have 7 days before features are restricted.
            </div>
          </div>
        )}

        {state === "cancelled" && (
          <div className="mt-4 rounded-xl border border-border bg-background p-4 text-sm text-ink-muted">
            Your subscription is cancelled. You can keep using Operate features until the end of
            the current billing period.
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Stat label="Current period" value="1 May → 31 May 2026" />
          <Stat label="Next invoice" value="£249.00 on 1 Jun" />
          <Stat label="Payment method" value={`Card •••• ${last4}`} />
          <Stat label="Submissions this month" value="14" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPayOpen(true)}
            className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <CreditCard className="size-4" /> Update payment method
          </button>
          <button
            type="button"
            onClick={() => toast.info("Invoice downloaded (demo)")}
            className="press rounded-full border border-border px-4 py-2 text-sm font-medium text-ink"
          >
            Download invoices
          </button>
          {state !== "cancelled" ? (
            <button
              type="button"
              onClick={() => {
                setState("cancelled");
                toast("Subscription cancelled");
              }}
              className="press ml-auto rounded-full border border-border px-4 py-2 text-sm font-medium text-cat-rose"
            >
              Cancel subscription
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setState("active");
                toast.success("Subscription reactivated");
              }}
              className="press ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <CheckCircle2 className="size-4" /> Reactivate
            </button>
          )}
        </div>
      </section>

      {/* Demo state switcher (no backend) */}
      <section className="rounded-2xl border border-dashed border-border bg-background p-4 text-xs text-ink-muted">
        <span className="font-medium text-ink">Demo:</span> simulate billing state
        <div className="mt-2 flex gap-2">
          {(["active", "payment-failed", "cancelled"] as State[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setState(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                state === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-ink-muted hover:bg-muted/40",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <PaymentMethodDialog open={payOpen} onOpenChange={setPayOpen} onSaved={setLast4} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

```

--- `src/routes/_authed.settings.tsx` ---

```tsx
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { User, Bell, CreditCard, Wrench, Plug, ShieldCheck, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "Settings — Renewably UK" }] }),
  component: SettingsLayout,
});

function SettingsLayout() {
  const loc = useLocation();
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  // Subscription is only relevant for paid installer tier — admins and read-only never pay.
  const showSubscription = user.role === "installer-operate";

  const items = [
    { to: "/settings/profile", label: "Profile", icon: User, show: true },
    { to: "/settings/security", label: "Security", icon: ShieldCheck, show: true },
    { to: "/settings/access", label: "My access", icon: KeyRound, show: user.role === "operator" || user.role === "readonly" },
    { to: "/settings/notifications", label: "Notifications", icon: Bell, show: true },
    { to: "/settings/subscription", label: "Subscription", icon: CreditCard, show: showSubscription },
    { to: "/settings/integrations", label: "Integrations", icon: Plug, show: isAdmin || user.role === "installer-operate" },
    { to: "/settings/measures", label: "Measures", icon: Wrench, show: true },
  ].filter((i) => i.show);

  // /settings root → redirect to profile via showing the profile content.
  const onRoot = loc.pathname === "/settings";

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-10">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
        Workspace
      </div>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Settings</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const active = loc.pathname === it.to || (onRoot && it.to === "/settings/profile");
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-muted text-ink"
                    : "text-ink-muted hover:bg-muted/40 hover:text-ink",
                )}
              >
                <Icon className="size-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">
          {onRoot ? <SettingsHome /> : <Outlet />}
        </div>
      </div>
    </div>
  );
}

function SettingsHome() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink">Welcome</h2>
      <p className="mt-2 text-sm text-ink-muted">
        Pick a section on the left to manage your account, notifications, billing and approved measures.
      </p>
    </div>
  );
}

```

--- `src/routes/_authed.submissions.$id.tsx` ---

```tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useStore, update } from "@/lib/mock/store";
import { findSubmission, findFunding, findJob, fmtDate, pushAudit } from "@/lib/mock/queries";
import { StatePill, SUBMISSION_STATES } from "@/components/app/state-pill";
import { AuditTimeline } from "@/components/app/audit-timeline";
import { LockedCard } from "@/components/app/locked-card";
import { PageHeader } from "@/components/app/page-header";
import { useAuth } from "@/lib/auth-context";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/_authed/submissions/$id")({
  head: () => ({ meta: [{ title: "Submission — Renewably UK" }] }),
  component: SubmissionDetail,
});

function SubmissionDetail() {
  const { id } = Route.useParams();
  const data = useStore();
  const { user } = useAuth();
  const { permissions } = useDevRole();
  if (!can(permissions, "submissions.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Submission" title="Submission" />
        <div className="mt-6"><LockedCard title="Submission" reason={{ kind: "permission", permission: "submissions.read" }} /></div>
      </div>
    );
  }
  const submission = findSubmission(data, id);
  if (!submission) throw notFound();
  const sub = submission;
  const funding = findFunding(data, sub.fundingProjectId);
  const job = findJob(data, sub.jobId);

  const canUpload = sub.state === "awaiting-information";

  function downloadSnapshot() {
    const blob = new Blob([JSON.stringify({ sub, funding, job }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sub.ref}-snapshot.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Snapshot downloaded");
  }

  function uploadInfo() {
    const name = prompt("Filename for additional info?", "Additional-info.pdf");
    if (!name) return;
    update((d) => {
      const s = d.submissions.find((x) => x.id === id);
      if (!s) return;
      s.state = "under-review";
      pushAudit(d, "submission", id, user.fullName, `Uploaded additional info: ${name}`);
    });
    toast.success("Information uploaded — submission moved to under review");
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <Link to="/submissions" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Submissions
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">Submission</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{sub.ref}</h1>
          <div className="mt-2 text-sm text-ink-muted">
            {sub.scheme} · Submitted {fmtDate(sub.submittedAt)}
          </div>
        </div>
        <StatePill meta={SUBMISSION_STATES[sub.state]} />
      </div>

      {sub.state === "awaiting-information" && (
        <div className="mt-5 rounded-2xl border border-cat-amber/30 bg-cat-amber-bg/40 p-4 text-sm text-cat-amber">
          <strong className="font-semibold">Action required.</strong> The scheme has requested additional information. Upload supporting evidence to resume review.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-sm font-medium text-foreground">Linked records</div>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-muted">Funding project</dt>
                <dd>{funding ? <Link to="/funding/$id" params={{ id: funding.id }} className="text-foreground hover:underline">{funding.ref}</Link> : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Job</dt>
                <dd>{job ? <Link to="/jobs/$id" params={{ id: job.id }} className="text-foreground hover:underline">{job.ref}</Link> : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Scheme</dt>
                <dd className="text-foreground">{sub.scheme}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">State</dt>
                <dd><StatePill meta={SUBMISSION_STATES[sub.state]} /></dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="text-sm font-medium text-foreground">Actions</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={downloadSnapshot} className="press inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-2 text-sm font-medium text-foreground">
                <Download className="size-3.5" /> Download snapshot
              </button>
              <button
                onClick={uploadInfo}
                disabled={!canUpload}
                className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-40"
                title={canUpload ? "" : "Only enabled when scheme is awaiting information"}
              >
                <Upload className="size-3.5" /> Upload additional info
              </button>
            </div>
            {!canUpload && (
              <p className="mt-2 text-xs text-ink-muted">Uploads are only enabled when the scheme has requested additional information.</p>
            )}
          </div>
        </div>

        <AuditTimeline entityType="submission" entityId={sub.id} />
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.submissions.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Search } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { useStore } from "@/lib/mock/store";
import { StatePill, SUBMISSION_STATES } from "@/components/app/state-pill";
import { FilterPills } from "@/components/app/filter-pills";
import { fmtDate } from "@/lib/mock/queries";
import { EmptyState } from "@/components/app/empty-state";
import { LockedCard } from "@/components/app/locked-card";
import { useDevRole } from "@/lib/dev-role";
import { can } from "@/lib/rbac";
import type { SubmissionState } from "@/lib/mock/types";

export const Route = createFileRoute("/_authed/submissions")({
  head: () => ({ meta: [{ title: "Submissions — Renewably UK" }] }),
  component: SubmissionsList,
});

const FILTERS: { value: SubmissionState; label: string }[] = [
  { value: "submitted", label: "Submitted" },
  { value: "under-review", label: "Under review" },
  { value: "awaiting-information", label: "Awaiting info" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

function SubmissionsList() {
  const data = useStore();
  const { permissions } = useDevRole();
  const [filter, setFilter] = useState<SubmissionState | "all">("all");
  const [q, setQ] = useState("");

  if (!can(permissions, "submissions.read")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
        <PageHeader eyebrow="Submissions" title="Submissions" />
        <div className="mt-6"><LockedCard title="Submissions" reason={{ kind: "permission", permission: "submissions.read" }} /></div>
      </div>
    );
  }

  const rows = data.submissions
    .filter((s) => filter === "all" || s.state === filter)
    .filter((s) => !q || s.ref.toLowerCase().includes(q.toLowerCase()) || s.scheme.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <PageHeader eyebrow="Submissions" title="Scheme submissions" subtitle="Created automatically when a funding project is submitted." />

      <div className="mt-6 flex items-center justify-between gap-3">
        <FilterPills<SubmissionState>
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ ...f, count: data.submissions.filter((s) => s.state === f.value).length }))}
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-9 w-64 rounded-full border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="mt-5">
        {rows.length === 0 ? <EmptyState icon={Send} title="No submissions" body="Submit a funding project to create a submission record." /> : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface/40 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  <th className="px-4 py-2.5 text-left">Ref</th>
                  <th className="px-4 py-2.5 text-left">Scheme</th>
                  <th className="px-4 py-2.5 text-left">Funding project</th>
                  <th className="px-4 py-2.5 text-left">Submitted</th>
                  <th className="px-4 py-2.5 text-right">State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const fp = data.fundingProjects.find((f) => f.id === s.fundingProjectId);
                  return (
                    <tr key={s.id} className="cursor-pointer border-b last:border-b-0 hover:bg-surface/60">
                      <td className="px-4 py-3 font-medium text-foreground"><Link to="/submissions/$id" params={{ id: s.id }} className="hover:underline">{s.ref}</Link></td>
                      <td className="px-4 py-3 text-foreground">{s.scheme}</td>
                      <td className="px-4 py-3">
                        {fp ? <Link to="/funding/$id" params={{ id: fp.id }} className="text-foreground hover:underline">{fp.ref}</Link> : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{fmtDate(s.submittedAt)}</td>
                      <td className="px-4 py-3 text-right"><StatePill meta={SUBMISSION_STATES[s.state]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

```

--- `src/routes/_authed.tsx` ---

```tsx
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app/shell/app-sidebar";
import { TopBar } from "@/components/app/shell/top-bar";
import { SidebarProvider } from "@/components/app/shell/sidebar-context";
import { CommandPaletteProvider } from "@/components/app/command-palette";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const hydrated = useHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <SidebarProvider>
      <CommandPaletteProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <div className="flex-1">
              {hydrated ? (
                <div
                  key={pathname}
                  className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200"
                >
                  <Outlet />
                </div>
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          </main>
        </div>
      </CommandPaletteProvider>
    </SidebarProvider>
  );
}

```

--- `src/routes/forgot-password.tsx` ---

```tsx
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Renewably UK" },
      { name: "description", content: "Request a password reset link." },
    ],
  }),
  component: ForgotPasswordPage,
});

type Status = "idle" | "loading" | "success";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => setStatus("success"), 800);
  }

  function resend() {
    setStatus("loading");
    setTimeout(() => setStatus("success"), 600);
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link
          to="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </Link>
      }
    >
      {status === "success" ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-cat-green-bg text-cat-green">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-ink">
              Check your email
            </div>
            <p className="mt-1.5 text-sm text-ink-muted">
              We've sent a reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>. It
              may take a minute.
            </p>
          </div>
          <button
            type="button"
            onClick={resend}
            className="text-xs font-medium text-ink-muted hover:text-foreground"
          >
            Resend link
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.co.uk"
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="press inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

```

--- `src/routes/index.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Workflow, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Renewably UK — operations for Net Zero installers" },
      {
        name: "description",
        content:
          "The compliance and operations platform UK Net Zero installers run their work on. IBG, Jobs, Funding Match — in one place.",
      },
      {
        property: "og:title",
        content: "Renewably UK — operations for Net Zero installers",
      },
      {
        property: "og:description",
        content:
          "IBG, Jobs, Funding Match — the operations platform UK Net Zero installers run on.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div
            aria-hidden
            className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"
          >
            <span className="text-sm font-semibold">R</span>
          </div>
          <span className="text-base font-semibold tracking-tight">
            Renewably
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/pricing"
            className="press rounded-full px-4 py-2 text-sm text-ink-muted hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            to="/sign-in"
            className="press rounded-full px-4 py-2 text-sm text-ink-muted hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
              <Sparkles className="size-3.5" />
              Built for UK Net Zero installers
            </span>
            <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
              The operations platform for Net Zero installation companies.
            </h1>
            <p className="mt-6 text-balance text-lg text-ink-muted">
              Issue IBGs, manage jobs, match funding, and keep an audit trail —
              all in one calm, fast workspace.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                to="/sign-up"
                className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
              >
                Start free with Access
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/pricing"
                className="press inline-flex items-center rounded-full border bg-background px-5 py-3 text-sm font-medium text-foreground"
              >
                Compare plans
              </Link>
            </div>
          </div>

          <div className="stagger-in mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard
              tone="green"
              icon={<ShieldCheck className="size-6" />}
              title="IBG, in seconds"
              body="Generate Insurance Backed Guarantees and policy PDFs without leaving the platform."
            />
            <FeatureCard
              tone="blue"
              icon={<Workflow className="size-6" />}
              title="Jobs that link up"
              body="Customers, properties, jobs, submissions and audit — one connected record chain."
            />
            <FeatureCard
              tone="amber"
              icon={<Sparkles className="size-6" />}
              title="Funding Match"
              body="Schemes you actually qualify for, scored against your approved measures."
            />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-ink-muted">
          <span>© {new Date().getFullYear()} Renewably UK</span>
          <Link to="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  tone,
  icon,
  title,
  body,
}: {
  tone: "green" | "blue" | "amber";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const bgClass = {
    green: "bg-cat-green-bg text-cat-green",
    blue: "bg-cat-blue-bg text-cat-blue",
    amber: "bg-cat-amber-bg text-cat-amber",
  }[tone];

  return (
    <div className="rounded-3xl border bg-card p-6">
      <div
        className={`grid size-12 place-items-center rounded-2xl ${bgClass}`}
      >
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
    </div>
  );
}

```

--- `src/routes/pricing.tsx` ---

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Renewably UK" },
      {
        name: "description",
        content:
          "Two plans for Net Zero installers. Access is free. Operate unlocks Jobs, Funding Match, and the IBG repository.",
      },
      { property: "og:title", content: "Pricing — Renewably UK" },
      {
        property: "og:description",
        content:
          "Access is free. Operate unlocks Jobs, Funding Match, and the IBG repository.",
      },
    ],
  }),
  component: PricingPage,
});

const access = [
  "Issue IBG certificates",
  "Recent IBG history (30 days)",
  "Companies House verification",
  "Profile & company settings",
];

const operate = [
  "Everything in Access",
  "Full IBG repository (cancel & amend)",
  "Customers, Properties, Jobs",
  "Submissions tracker",
  "Funding Match (rule-driven)",
  "Reports & audit log",
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="press flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">R</span>
          </div>
          <span className="text-base font-semibold tracking-tight">
            Renewably
          </span>
        </Link>
        <Link
          to="/sign-up"
          className="press rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Get started
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <div className="text-center">
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-ink">
            Simple plans for serious installers.
          </h1>
          <p className="mt-4 text-lg text-ink-muted">
            Start free. Upgrade when you need the full operations stack.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          <PlanCard
            name="Access"
            price="£0"
            cadence="forever"
            blurb="Issue IBGs and keep your basics tidy."
            features={access}
            cta="Start with Access"
          />
          <PlanCard
            name="Operate"
            price="Subscription"
            cadence="billed monthly"
            blurb="Run your whole installation business in one place."
            features={operate}
            cta="Choose Operate"
            featured
          />
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  blurb,
  features,
  cta,
  featured,
}: {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-7 ${
        featured ? "bg-ink text-background" : "bg-card"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
        {featured ? (
          <span className="rounded-full bg-background/10 px-2.5 py-1 text-xs font-medium">
            Recommended
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight">{price}</span>
        <span
          className={`text-sm ${featured ? "text-background/70" : "text-ink-muted"}`}
        >
          {cadence}
        </span>
      </div>
      <p
        className={`mt-2 text-sm ${
          featured ? "text-background/80" : "text-ink-muted"
        }`}
      >
        {blurb}
      </p>

      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check
              className={`mt-0.5 size-4 shrink-0 ${
                featured ? "text-cat-green" : "text-cat-green"
              }`}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/sign-up"
        className={`press mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium ${
          featured
            ? "bg-background text-ink"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

```

--- `src/routes/reset-password.tsx` ---

```tsx
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset password — Renewably UK" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");

  const onRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Backend disabled — pretend a reset link was sent to " + (email || "you") + ".");
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a link to reset it."
      footer={
        <Link
          to="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onRequest} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="press inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          Send reset link
        </button>
      </form>
    </AuthLayout>
  );
}

```

--- `src/routes/sign-in.tsx` ---

```tsx
import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — Renewably UK" },
      {
        name: "description",
        content: "Sign in to your Renewably UK workspace.",
      },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Backend disabled — auth is bypassed for design preview.
  useEffect(() => {
    // no-op
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 200);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Renewably workspace."
      footer={
        <>
          New to Renewably?{" "}
          <Link to="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.co.uk"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-ink-muted hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="press inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Continue to dashboard
        </button>

        <p className="text-center text-xs text-ink-muted">
          Backend is disabled — any details will take you straight in.
        </p>
      </form>
    </AuthLayout>
  );
}

```

--- `src/routes/sign-up.tsx` ---

```tsx
import { useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Create your account — Renewably UK" },
      {
        name: "description",
        content:
          "Create a Renewably UK account and start issuing IBGs in minutes.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Backend disabled — go straight to onboarding.
    setTimeout(() => navigate({ to: "/onboarding" }), 200);
  };

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Start free. Upgrade to Operate when you need it."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Sarah Patel"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.co.uk"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-ink-muted">At least 8 characters.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="press inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Continue
        </button>

        <p className="text-center text-xs text-ink-muted">
          Backend is disabled — no account will be created.
        </p>
      </form>
    </AuthLayout>
  );
}

```

### 5.5 shadcn/ui primitives (`src/components/ui/*`)

These are the standard shadcn-new-york preset (configured in `components.json`). They are inlined in full for completeness — when rebuilding from scratch you may instead run `npx shadcn@latest add <name>` for each.

--- `src/components/ui/accordion.tsx` ---

```tsx
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

```

--- `src/components/ui/alert-dialog.tsx` ---

```tsx
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

```

--- `src/components/ui/alert.tsx` ---

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

```

--- `src/components/ui/aspect-ratio.tsx` ---

```tsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };

```

--- `src/components/ui/avatar.tsx` ---

```tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

```

--- `src/components/ui/badge.tsx` ---

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

--- `src/components/ui/breadcrumb.tsx` ---

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className,
      )}
      {...props}
    />
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

```

--- `src/components/ui/button.tsx` ---

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

```

--- `src/components/ui/calendar.tsx` ---

```tsx
"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number,
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day,
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
          }

          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
          }

          return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };

```

--- `src/components/ui/card.tsx` ---

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

--- `src/components/ui/carousel.tsx` ---

```tsx
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }

    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn(
          "min-w-0 shrink-0 grow-0 basis-full",
          orientation === "horizontal" ? "pl-4" : "pt-4",
          className,
        )}
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute  h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

```

--- `src/components/ui/chart.tsx` ---

```tsx
import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== "none")
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`;
              const itemConfig = getPayloadConfigFromPayload(config, item, key);
              const indicatorColor = color || item.payload.fill || item.color;

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                    indicator === "dot" && "items-center",
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                              {
                                "h-2.5 w-2.5": indicator === "dot",
                                "w-1": indicator === "line",
                                "w-0 border-[1.5px] border-dashed bg-transparent":
                                  indicator === "dashed",
                                "my-0.5": nestLabel && indicator === "dashed",
                              },
                            )}
                            style={
                              {
                                "--color-bg": indicatorColor,
                                "--color-border": indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none",
                          nestLabel ? "items-end" : "items-center",
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {item.value && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

```

--- `src/components/ui/checkbox.tsx` ---

```tsx
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("grid place-content-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

```

--- `src/components/ui/collapsible.tsx` ---

```tsx
"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

```

--- `src/components/ui/command.tsx` ---

```tsx
"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

```

--- `src/components/ui/context-menu.tsx` ---

```tsx
import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin)",
      className,
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

```

--- `src/components/ui/dialog.tsx` ---

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

--- `src/components/ui/drawer.tsx` ---

```tsx
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

```

--- `src/components/ui/dropdown-menu.tsx` ---

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

--- `src/components/ui/form.tsx` ---

```tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};

```

--- `src/components/ui/hover-card.tsx` ---

```tsx
import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-hover-card-content-transform-origin)",
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };

```

--- `src/components/ui/input-otp.tsx` ---

```tsx
import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";

import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

```

--- `src/components/ui/input.tsx` ---

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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

--- `src/components/ui/label.tsx` ---

```tsx
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

```

--- `src/components/ui/menubar.tsx` ---

```tsx
import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

function MenubarMenu({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />;
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group {...props} />;
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal {...props} />;
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup {...props} />;
}

function MenubarSub({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm",
      className,
    )}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-menubar-content-transform-origin)",
      className,
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-menubar-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
));
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
};
MenubarShortcut.displayname = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};

```

--- `src/components/ui/navigation-menu.tsx` ---

```tsx
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent",
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};

```

--- `src/components/ui/pagination.tsx` ---

```tsx
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />,
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

```

--- `src/components/ui/popover.tsx` ---

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

--- `src/components/ui/progress.tsx` ---

```tsx
"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

```

--- `src/components/ui/radio-group.tsx` ---

```tsx
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

```

--- `src/components/ui/resizable.tsx` ---

```tsx
import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof Group>) => (
  <Group
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

```

--- `src/components/ui/scroll-area.tsx` ---

```tsx
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };

```

--- `src/components/ui/select.tsx` ---

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

--- `src/components/ui/separator.tsx` ---

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

--- `src/components/ui/sheet.tsx` ---

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

--- `src/components/ui/sidebar.tsx` ---

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open],
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<SidebarContextProps>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className,
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      );
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <div
        ref={ref}
        className="group peer hidden text-sidebar-foreground md:block"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          )}
        />
        <div
          className={cn(
            "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className,
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarRail.displayName = "SidebarRail";

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(
  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "relative flex w-full flex-1 flex-col bg-background",
          "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarInset.displayName = "SidebarInset";

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className,
      )}
      {...props}
    />
  );
});
SidebarInput.displayName = "SidebarInput";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="header"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
      />
    );
  },
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="footer"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
      />
    );
  },
);
SidebarFooter.displayName = "SidebarFooter";

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="content"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="group"
        className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
        {...props}
      />
    );
  },
);
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  ),
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  ),
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  ),
);
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    );

    if (!tooltip) {
      return button;
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      };
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    );
  },
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean;
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ ...props }, ref) => <li ref={ref} {...props} />,
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

```

--- `src/components/ui/skeleton.tsx` ---

```tsx
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;
}

export { Skeleton };

```

--- `src/components/ui/slider.tsx` ---

```tsx
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

```

--- `src/components/ui/sonner.tsx` ---

```tsx
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

```

--- `src/components/ui/switch.tsx` ---

```tsx
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

```

--- `src/components/ui/table.tsx` ---

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

--- `src/components/ui/tabs.tsx` ---

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
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
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
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
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
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

```

--- `src/components/ui/textarea.tsx` ---

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

```

--- `src/components/ui/toggle-group.tsx` ---

```tsx
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };

```

--- `src/components/ui/toggle.tsx` ---

```tsx
import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };

```

--- `src/components/ui/tooltip.tsx` ---

```tsx
"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

```

---
## Section 6 — No-Code Builder Replication Guide

Use Framer (preferred) or Webflow. Build the workspace shell first, then iterate routes. The instructions below assume Framer terminology; Webflow equivalents in parens.

### 1. Project setup

1. Create a new Framer project (Webflow: empty site).
2. Add a Style Sheet / Tokens collection. Enter every token from Section 2 verbatim. Name them exactly as listed (`background`, `surface`, `tile`, `ink`, `ink-muted`, `border`, `cat-green`, `cat-green-bg`, etc.).
3. Add Inter from Google Fonts. Set Headings → Inter 600, Body → Inter 400. Set base font-size 14px, line-height 1.5.
4. Set global radius scale (6, 8, 10, 14, 18, 22 px).

### 2. Workspace shell (Master layout)

Hierarchy:

```
Frame "Shell" (flex row, min-height 100vh, bg=background)
├─ Frame "Sidebar" (width 240, border-right 1 solid border, bg=background)
│  ├─ Frame "Workspace switcher" (padding 16, border-bottom 1)
│  ├─ Stack "Nav" (vertical, gap 4, padding 8)
│  │  └─ Repeat: Nav row (height 36, radius 8, padding 12, hover bg=tile)
│  └─ Frame "Profile" (padding 12, border-top 1)
└─ Frame "Main" (flex column, flex-grow 1)
   ├─ Frame "TopBar" (height 56, sticky top, bg rgba(255,255,255,0.8), backdrop-blur 12, border-bottom 1)
   │  ├─ Breadcrumbs (left)
   │  └─ Action cluster (right): Search/⌘K pill, Bell, Avatar
   └─ Frame "Content" (padding 32 horizontal, 32 vertical)
```

Sidebar collapsed variant: width 60, hide labels, centre icons.

### 3. Page templates

Build three master detail templates and reuse:
- **List** — PageHeader → FilterPills → DataTable.
- **Detail** — Header with state pill → 2-column grid (main + 320px side rail) → tabs.
- **Settings** — 220px left nav + content card.

### 4. Component construction order

1. **PageHeader**: Stack vertical gap 4. Eyebrow (12px uppercase letter-spacing 0.08em ink-muted) → H1 (30px / 600 ink) → subtitle (14px ink-muted). Right-side action slot.
2. **SectionCard**: Frame radius 18, border 1 solid border, bg card, padding 20. Optional title row above content.
3. **StatePill**: Capsule 999 radius, padding 4 12, font 10px / 500 uppercase letter-spacing 0.06em. Variants by colour pair (e.g. submitted = cat-blue + cat-blue-bg).
4. **DataTable**: simple table; header row 12px ink-muted uppercase; rows 14px foreground; row hover bg=tile/40; 1px bottom border per row.
5. **FilterPills**: row of capsules; active = bg ink, text background; inactive = bg surface, border 1, text foreground.
6. **EmptyState**: icon tile (48×48 radius 14 bg=tile centred icon size 20 ink-muted) + title (14px medium foreground) + body (12px ink-muted) + optional CTA pill.
7. **LockedCard**: same as EmptyState but locked-icon and grey-out treatment.
8. **Dialogs (Sheet/Dialog)**: 480-560px wide, radius 18, padding 24, header H2 + close button, footer right-aligned button row.

### 5. Hover & transition states

- Every interactive surface: scale 0.97 on press, transition transform 120ms cubic-bezier(0.22,1,0.36,1).
- Buttons (primary/black): hover opacity 0.9, no colour change. Active scale 0.97.
- Nav rows: hover bg=tile/40, active bg=tile + foreground colour.
- Inputs: focus ring 2px ring colour=ink offset 2px.
- Sheet/Dialog: enter from translate-y 8 + opacity 0 → 0/1 over 200ms ease-out. Exit reverse 150ms.

### 6. Iconography

Embed Lucide icons (Framer has a Lucide kit). Default size 16px, stroke 1.5, colour currentColor. Use 20px for tiles and 14px for inline pills.

### 7. Asset references

- Logo: any plain Inter-set wordmark "Renewably" in ink colour.
- Illustrations: none. Category tiles use coloured backgrounds + a single Lucide icon.
- Photography: none in product surfaces; marketing landing may use a single neutral product mockup.

### 8. Plain-language interaction notes

- Sidebar collapse remembers state across sessions.
- ⌘K (or Ctrl-K) anywhere opens a global search palette listing all routes and recent entities.
- Mutations (saving a form, approving an amendment) trigger a toast in the top-right corner that fades after 4 seconds.
- Restricted areas show a card explaining *which* permission is missing, never a 404 or redirect.
- Dev role switcher (bottom-left) lets reviewers swap between admin / installer-operate / operator / readonly without signing out — only visible in dev builds.

---
## Section 7 — AI Builder Prompt Pack

Each prompt is standalone. Copy any single block into v0 / Bolt / Lovable to regenerate that surface. Tokens reference Section 2 — paste the colour table alongside if the target tool can't infer.

### Prompt — Workspace Shell
```
Build a light-mode SaaS workspace shell.
Layout: left collapsible sidebar (240px expanded, 60px collapsed) with 1px right border #EAEAEA, then a flex column main area with a sticky top bar (height 56px, translucent white bg-rgba(255,255,255,0.8), backdrop-blur 12px, 1px bottom border) and a content outlet.
Sidebar contents top-to-bottom: workspace switcher, vertical nav grouped by module, optional invite card (admin), profile button at bottom.
Top bar: breadcrumbs left, ⌘K search pill centre-right, notification bell, user avatar.
Typography: Inter, body 14px / 400 / line-height 1.5, headings 600. Eyebrows 12px uppercase letter-spacing 0.08em colour #878787.
Colours: bg #FFFFFF, text #1A1A1A, muted text #878787, border #EAEAEA, primary action background #1A1A1A with white text.
Radii: cards 18px, pills 999px, controls 10px.
Press feedback: scale 0.97 transform 120ms cubic-bezier(0.22,1,0.36,1).
DO NOT use purple gradients, drop shadows, glassmorphism, or dark mode. Avoid Material/Apple system aesthetics. Reference: ElevenLabs dashboard.
```

### Prompt — Sign-in
```
Build a split-pane sign-in page. Left pane (50% width, hidden below md): #FAFAFA background, brand wordmark top-left, big quote centred, subtle photo or illustration omitted. Right pane: centred card max-width 420px, padding 32px, contains: H1 "Sign in" 30px/600, body "Welcome back to Renewably." 14px #878787, then email + password inputs, a primary black pill "Sign in", a divider "or", and a Google OAuth secondary button. Bottom link "Forgot password?" and footer "New here? Create an account".
Inputs: 1px border #EAEAEA, 10px radius, padding 10px 12px, focus ring 2px #1A1A1A offset 2px.
Buttons: primary = bg #1A1A1A text #FCFCFC rounded-full padding 10px 18px font 14px/500. Secondary = bg #FFFFFF border 1px #EAEAEA same shape.
DO NOT use coloured gradients, dark mode, or icon-heavy decoration.
```

### Prompt — Dashboard
```
Build a workspace dashboard. Container max-width 1280px, padding 32px 32px.
Top: greeting H1 "Welcome back, {name}" 30px/600 + subtitle 14px #878787 + role pill (capsule 10px uppercase letter-spacing 0.06em, e.g. admin = bg #DCFCE7 text #16A34A).
Optional banner at top if user is read-only: 1px border, bg #FAFAFA, 18px radius, padding 16px, list browseable areas as inline pills.
Then a 4-column KPI grid (collapses to 2 on md, 1 on sm). Each KPI card: 18px radius, 1px border, bg #FFFFFF, padding 20px, with eyebrow + big number 30px/600 + delta chip.
Then a 2-column grid: left = "Pick up where you left off" recent items list (rows with title, meta, state pill, chevron). Right = activity timeline.
Use Lucide icons (16px stroke 1.5).
DO NOT include charts unless data exists. No gradients, no drop shadows.
```

### Prompt — Funding project detail
```
Build a funding project detail page.
Header: eyebrow "Funding · {ref}", H1 project name, state pill ("Active", "Returned", "Paid"), action buttons right ("Request amendment", "Update payment method").
Body: 2-column grid md:grid-cols-[1fr_320px].
Main column: Readiness checklist (list of steps each with check or pending icon — "Internal review" must show pending when state == "returned"), Documents card (file list with download icon), Milestones card (vertical timeline).
Side rail: Funder summary card, Customer summary card, Audit timeline.
Cards use 18px radius, 1px border #EAEAEA, padding 20px, white bg.
Inline icons 16px Lucide; check = #16A34A; pending = #878787; warning = #D97706.
DO NOT use coloured backgrounds for cards. Keep separators to 1px hairlines.
```

### Prompt — IBG wizard
```
Build a multi-step form wizard.
Top: progress bar (horizontal, 5 steps with labels). Active step has a 2px solid #1A1A1A line under its number; completed steps show a #16A34A check.
Each step body is a SectionCard (18px radius, 1px border, 20px padding).
Form fields: label 12px/500 #878787 above input, 1px border #EAEAEA, 10px radius. Inline error in #E11D48 12px below the input.
Bottom action bar (sticky bottom inside container): Save draft (link style), Cancel (secondary pill), Continue (primary black pill).
Autosave indicator: tiny text "Saved {time}" right-aligned inside header row.
DO NOT use stepper dots only — labels are required for accessibility.
```

### Prompt — Admin permissions library
```
Build a permission catalogue. Container max-width 1280px.
Header: eyebrow "Admin · Access", H1 "Permissions library".
Body: search input top, then sections grouped by domain (Customers, Jobs, IBG, Submissions, Funding, Admin). Each section is a SectionCard listing permission rows. Each row: code (font-mono 11px), name 14px/500, description 12px #878787, scope tag right-aligned.
Below sections: "Operator presets" — preset cards (e.g. "Submission reviewer") each listing the bundled permission keys.
DO NOT show edit controls — this is a read-only library.
```

### Prompt — Settings shell
```
Build a settings page shell.
Container max-width 1100px, padding 24px 32px.
Eyebrow "Workspace", H1 "Settings" 30px/600.
Below: 2-column grid 220px + 1fr.
Left nav: vertical stack of links each row "icon label" padding 8px 12px radius 8px; active row bg #F4F4F5 colour foreground; hover bg #F4F4F5 at 40% opacity.
Right column: outlet renders the active settings page.
Filter nav items by user role (admin / installer-operate / operator / readonly).
DO NOT use tabs across the top — sidebar nav is required.
```

### Prompt — Command palette
```
Build a ⌘K command palette.
Centred Dialog 560px wide, 14px radius, padding 0, top-positioned 15vh from top.
Top: large search input (no border, 18px font, 14px padding) with kbd hint right-aligned ("ESC").
Body: scrollable list grouped by category ("Pages", "Customers", "Jobs", "IBGs"). Each row: icon left, title, optional secondary right-aligned 12px #878787. Hover/keyboard-active row bg #F4F4F5.
Footer: small kbd legend "↑↓ navigate · ↵ open · esc close".
Open with Cmd-K or Ctrl-K from anywhere.
DO NOT add a separate search button — the ⌘K hint in the top bar is the only entry point.
```

### Prompt — Amendment review sheet
```
Build a right-side slide-over Sheet (sm:max-w-lg) for reviewing a record-correction request.
Header: title "Review amendment", description showing entity ref + field name (font-mono).
Body: 2-column grid showing "Current" (bg rose-tinted #FFE4E6 at 40% opacity, 14px radius, 12px padding) vs "Requested" (bg green-tinted #DCFCE7 at 40% opacity), each with a 12px uppercase #878787 label and 14px value.
Below: card with installer's reason text.
Footer: two buttons. Default mode = Reject (outline pill) + Approve (primary black pill). On Reject click, swap to a textarea + "Cancel" + "Confirm reject" buttons; require non-empty reason or show a toast error.
On approve/reject, fire a toast and close the sheet.
DO NOT use a centred modal — use a right-side Sheet.
```

---

*End of specification.*

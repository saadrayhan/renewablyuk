# Polish + Admin Coverage Pass

Three independent tracks. Brand blue (#0F47A8) stays the only primary CTA color. Public marketing pages keep their gradient atmosphere. The client zip is treated as a feature checklist only — no design borrowed.

---

## 1. Remove gradients from in-app surfaces

Strip every `GradientOrb` and decorative `bg-gradient-*` from authed routes. Keep them ONLY on public pages: `index.tsx` (landing), `pricing.tsx`, `verify.tsx`, `auth-layout.tsx`.

Files to clean:
- `src/routes/_authed.ibg.repository.tsx` — remove orb in hero band
- `src/routes/_authed.ibg.history.tsx` — remove orb in hero band
- `src/components/app/shell/profile-popover.tsx` — flatten avatar gradient ring
- `src/components/app/hero-card.tsx` — keep component but make orbs opt-in via `decorative` prop (default off); only the public landing passes `decorative`

`gradient-orb.tsx` itself stays — it's used by landing.

---

## 2. Switch off-state visibility

Current `data-[state=unchecked]:bg-input` is nearly invisible on the off-white canvas. Update `src/components/ui/switch.tsx`:

- Off track: `bg-tile` with a 1px `border-border` ring so the outline is visible against `bg-canvas` and `bg-card`.
- On track: keep `bg-foreground` (ink) — matches the second image the user shared.
- Thumb: keep white with a soft shadow.
- Add a subtle `hover:bg-surface` for off-state to telegraph affordance.

No size change.

---

## 3. Missing admin functionality (inspired by client repo, our design)

The client zip contains 8 admin areas we don't have. Add them to our existing admin shell, using our `PageHeader`, `data-table`, `section-card`, `LockedCard`, and the brand-blue CTA convention (one brand button per page).

### 3.1 External APIs — split out from Integrations Hub
New route: `/admin/external-apis` (`src/routes/_authed.admin.external-apis.tsx`)
- Per-API quota + rate-limit cards (Companies House, HubSpot, Stripe, Lovable AI)
- Usage log table: timestamp, source, endpoint, request type, status (Success / Failed / Rate Limited), response time
- Row click → drawer with request payload, response, status code
- Throttling controls (Switches): Enable throttling, Queue requests, Priority mode
- Integrations Hub gets a "View detailed API logs →" link to this page; the hub remains the at-a-glance overview

### 3.2 Cron Job Management
New route: `/admin/cron` (`src/routes/_authed.admin.cron.tsx`)
- Table of jobs: Risk Checks (daily 03:00 UTC), Stripe Sync (hourly), Email Retry (4h), API Health Check (15m)
- Columns: name, schedule, last run, next run, status, last duration
- Actions per row: Run now (brand blue, requires confirm), Pause / Resume (Switch), View execution log (drawer)
- Page-level secondary action: Refresh statuses

### 3.3 Measure Policy & Pricing
New route: `/admin/measure-policy` (`src/routes/_authed.admin.measure-policy.tsx`)
- Table per measure type: IBG duration, coverage start rule, base price, Access tier price, Operate tier price, current version, effective from
- Row click → sheet to edit + create new version (prior versions preserved; existing IBGs unaffected)
- Pricing history tab inside the sheet

### 3.4 Evidence Requirements
New route: `/admin/evidence-requirements` (`src/routes/_authed.admin.evidence-requirements.tsx`)
- Table: scope (Company / Project / Installation), evidence name, installation type, funding scheme, standard ref, required toggle, effective from, status
- Filter pills by scope and status
- Brand-blue "New rule" → dialog; Edit + Archive in row menu

### 3.5 Installation & System Types
New route: `/admin/installation-types` (`src/routes/_authed.admin.installation-types.tsx`)
- Two-column: installation types (Solar PV, ASHP, etc.) on left, child system types on right
- Add / rename / delete with inline confirm; deletion blocked if referenced by IBGs (shows count)

### 3.6 Funding Schemes (admin governance, distinct from user-facing /funding)
New route: `/admin/funding-schemes` (`src/routes/_authed.admin.funding-schemes.tsx`)
- CRUD over schemes: name (ECO4, GBIS, …), funder, eligible measures, evidence-rule links, effective window, status
- Read-only consumers list (which orgs/users currently use it)

### 3.7 Measure Access Control
New route: `/admin/measure-access` (`src/routes/_authed.admin.measure-access.tsx`)
- Org-level defaults table (per org × measure type → allowed Y/N)
- Per-user override sub-table
- Brand-blue "Apply override" opens existing pattern (similar to risk overrides)

### 3.8 Risk Overrides (lift out of Risk Monitoring)
New route: `/admin/risk-overrides` (`src/routes/_authed.admin.risk-overrides.tsx`)
- Active overrides table with expiry countdown
- Filter pills: All / Expiring ≤7d / Permanent / Expired
- Reuses existing `high-risk-override-sheet.tsx` and `critical-risk-override-sheet.tsx`

### Sidebar grouping update (`src/components/app/shell/app-sidebar.tsx`)
Restructure the Admin section into clearer groups:
- People: Companies, Users, Membership & Billing
- Workflows: Onboarding, Amendments, Activity
- Risk: Risk Monitoring, Risk Overrides, Audit Logs
- Configuration: System Settings, Feature Flags, Access Control, Measure Access, Measure Policy & Pricing, Evidence Requirements, Installation & System Types, Funding Schemes
- Integrations: Integrations Hub, External APIs, Stripe Events, CRM / HubSpot, Cron Jobs

All gated by existing `config.read` / `risk.read` / `users.read` permissions — keeps the 5-role model intact (we are NOT collapsing to the client's 3 roles).

---

## Out of scope
- No new database tables or edge functions in this pass — pages render against the existing mock store, with TODO hooks where Supabase wiring will land next.
- No design tokens changed beyond the Switch.
- Public landing/marketing visuals untouched.

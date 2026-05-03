# Renewably UK — Risk, IBG v2, UX Fixes & Future Scaffolds

This plan implements Sections A (architecture), B (UX fixes), and C (locked future scaffolds) exactly as specified. No design tokens, colour system, or animation style change.

## Section A — Architecture

### A1. Mock types (`src/lib/mock/types.ts`)
Add: `AccountRiskState`, `InstallationType`, `SystemType`, `RiskAssessment`, `RiskOverride`. Add optional `accountRiskState` to `User`.

### A2. Seed data (`src/lib/mock/seed.ts` + `store.tsx`)
- Add `installationTypes` (5 entries) and `systemTypes` (12 entries) per spec mapping.
- Add `riskAssessments` (4) and `riskOverrides` (1 active HIGH).
- Mark 2 users as `flagged`, 1 as `paused`.
- Extend `MockData` type and store actions: `addRiskOverride`, `setUserRiskState`, `addInstallationType`, `archiveInstallationType`, `addSystemType`, `archiveSystemType`, `addEvidence`, `removeEvidence`, `linkJobToFunding`.

### A3. RBAC (`src/lib/rbac.ts`)
Add 8 new permissions under new category `Admin · Risk` (risk.read/flag/override.high/override.critical) and `Admin · Configuration` reuse for installation/system types. Admin gets all. Compliance Reviewer: +risk.read, risk.flag. Senior Operator: +risk.read.

### A4. State pill (`src/components/app/state-pill.tsx`)
Add `RISK_STATES` map per spec.

### A5. Sidebar
Add `Risk & Compliance` (`ShieldAlert`) → `/admin/risk`, gated by `risk.read`, after Onboarding.

### A6. `/admin/risk` route
PageHeader, two summary tiles (at-risk accounts, active overrides), CH Monitoring strip (C5), filter pills (All/Flagged/Paused/Suspended with counts), table (Org, Type, Risk, Last Check, Signal, Review →). LockedCard if no `risk.read`.

### A7. `/admin/risk/$id` route
Header w/ org name + risk pill + back link. Tabs: Risk History (AuditTimeline), CH Checks (5 mock entries, only for Limited Co.), Overrides (list or EmptyState). Sticky right rail with current state, Apply HIGH (opens sheet), Apply CRITICAL (link), Escalate, Downgrade.

### A8. `HighRiskOverrideSheet` component
Sheet from right (480px). Amber warning banner. Reason textarea (min 20 chars), duration select, acknowledge checkbox. Submit creates `RiskOverride`, audit entry, toast, close. Apply button disabled until valid.

### A9. IBG generator redesign (`/ibg/new`)
4-step wizard: **Readiness → Subject → Cover → Review**.
- Step 0 checklist: account status, job link, evidence presence, Installation Type select, System Type dependent select. Continue disabled until all green. Show override badge if active override on org.
- Step 2 Cover: replace MEASURES & POLICIES with installation/system type dropdowns + Policy Duration (10/25-year).
- Step 3 Review: include all five fields.

### A10. System config tabs
Add `Installation types` and `System types` tabs to `/admin/config`. Inline add/edit/archive rows; system types grouped by parent installation type with selector dropdown.

## Section B — UX Fixes

- **B1 Funding evidence**: Replace `prompt()` in `/funding/$id` with EvidenceUploadDialog (filename + category select). Render dashed upload card or list w/ remove. Add Linked Job panel + Change Job dialog.
- **B2 Permission revoke**: `/admin/users/$id` permissions tab — split into Granted (with red ghost Revoke) and Available (with Grant). "Clear all custom grants" header button. `/admin/permissions` library — expandable user list per permission with per-user Revoke.
- **B3 List CTAs**: Add `New job/customer/property` dark pill CTAs to respective list page headers. Create `/customers/new`-style `/properties/new` route. Submissions: subtitle clarifying creation source.
- **B4 Read-only audit**: Remove `audit.read` from `READONLY_PERMS`; add `activity.read.limited`. Update LockedCard copy on `/admin/audit`. Add doc comment above `READONLY_PERMS`.
- **B5 Amendment confirmation**: After submit on `/ibg/$id/amendment`, render success panel inline (check icon, AMD-id ref, two action buttons) instead of immediate navigation.

## Section C — Future scaffolds (with `ComingSoon` overlay)

- **C1 `/reports`**: New route + sidebar entry (BarChart2, gated `reports.read` — add permission, admin only). 2x2 cards (IBG, Pipeline, Funding, Submissions) with skeleton chart placeholders. Recent exports table empty state. Disabled Export CSV. Overlay banner.
- **C2 Job evidence tab**: In `/jobs/$id`, add Evidence tab with 5-row checklist + completion progress bar. ComingSoon overlay.
- **C3 `/settings/team`**: Members table + Invite (reuse InviteDialog) + Roles comparison table. ComingSoon overlay. Add Team to settings nav.
- **C4 `/verify` (public)**: Public route under root (not `_authed`), minimal layout, ref input → mock match → green/amber result. ComingSoon overlay.
- **C5 CH Monitoring strip**: Built into A6 page (no overlay).

## Final checks
Walk DevSwitcher across roles, verify sidebar visibility, IBG readiness gate behaviour with active vs flagged account, permissions split UI, read-only blocked from `/admin/audit`. Report results.

## Notes / scope
- All scaffolds use existing tokens, `ComingSoon`, `EmptyState`, `LockedCard`, `StatePill`, `UnderlineTabs`, `Sheet`, `Dialog` patterns. No token edits.
- `reports.read` is added to RBAC (admin + senior operator) so the sidebar item gates correctly.
- `/verify` placed at `src/routes/verify.tsx` (public, sibling of `index.tsx`).
- Mock store actions added with reducers; types kept in sync.
- No new third-party deps.

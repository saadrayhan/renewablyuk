# Renewably UK — focused update pass

Scope from the uploaded prompt. Functionality only — the existing visual language stays as-is, color is the only design change.

## 1. Branding — brand blue #0F47A8 (~10% usage)

Edit `src/styles.css` only. Do not touch other tokens.

- Add a new token `--brand-blue: #0F47A8` and `--brand-blue-tint: #E8F0FC` (light + dark variants).
- Apply to:
  - active workspace tab indicator on the Access / Operate / Admin switcher (top bar)
  - primary CTA buttons: "Issue IBG", "Save", "Continue" (white text)
  - background of informational notice panels (`#E8F0FC` light tint)
- Do NOT touch: card backgrounds, sidebar fill, section headers, decorative chips, status pills, category palette, dark/light mode logic, existing greens/ambers/reds.

## 2. BUG FIX 1 — IBG creation blocked  (`src/routes/_authed.ibg.new.tsx`)

- Remove `disabled={step === 0 && !readinessOk}` from the step-0 Continue button.
- Remove the toast block in `next()` that fires when `step === 0 && !readinessOk`.
- Step-0 readiness list becomes purely informational (preview).
- Move the readiness gate to step 3: the final "Issue IBG" button stays disabled when `!readinessOk`, with a clear inline error.
- Post-issue success screen: if `!isOperate`, change "Back to repository" → "Back to IBG History" linking to `/ibg/history`. Operate/Admin keeps `/ibg/repository`.

## 3. BUG FIX 2 — hide IBG Generator from Admin sidebar

- In `src/components/app/shell/app-sidebar.tsx` (and the legacy `components/app/app-sidebar.tsx` if still wired), add a role exclusion to the `IBG Generator` item so it is hidden when the active role is `admin`. Direct URL access remains.

## 4. UPDATE 1 — Admin sidebar restructure

Reorganise the admin section into labelled groups (no routes removed):

```text
COMPANIES & USERS    Companies (new), Users, Membership & Billing (new)
OPERATIONS           Onboarding, Amendments, Activity
CONFIGURATION        Installation & System Types, Measures & Warranty,
                     Evidence Rules, Funding Schemes
RISK & COMPLIANCE    Risk Monitoring, Overrides (tab on risk), Audit Logs
INTEGRATIONS         External APIs (renamed), Stripe Events (new),
                     CRM / HubSpot (Coming Soon)
SYSTEM               Access Control (renamed from Permissions),
                     Feature Flags (Coming Soon), System Settings
```

Each group rendered as a small uppercase label above its items, matching the existing sidebar style.

## 5. UPDATE 2 — Admin dashboard expansion (`_authed.dashboard.tsx`)

Only when `role === "admin"`. Existing Access / Operate dashboards untouched. Six sections, each with a row header + link, using existing card/tile components and counts from `mock/store`:

1. **User Management** — Total / Pending / Active / Suspended
2. **Risk & Compliance** — High Risk / Critical / Active Overrides / Expiring (≤48h)
3. **IBG Activity** — IBGs Today / This Month / Failed Emails (3) / Amendment Requests
4. **Membership & Billing** — Access / Operate members / Failed Payments (4) / Past Due (7)
5. **System Health** — 3 wide API status cards (Companies House, Stripe, HubSpot) + Failed API Calls (12)
6. **Quick Actions** — 4 clickable cards routing to onboarding / risk / amendments / membership

Card accent colours per spec (neutral / amber / green / red / blue) using existing palette tokens.

## 6. UPDATE 3 — New page: `/admin/companies`

`src/routes/_authed.admin.companies.tsx`, admin-only (`can("users.read")`). Page header + DataTable with columns: Company Name (with type dot), Company Number, Business Type, Account Status, Membership Level, Risk Level, Billing Status, IBG Access, Actions (View/Edit/Billing/Flag/Suspend). Source rows from `mock.users` filtered to installer roles. Bottom info panel "Business Type Verification" (light blue).

## 7. UPDATE 4 — New page: `/admin/membership`

`src/routes/_authed.admin.membership.tsx`. Sections: Current Status card, 4 metric cards (Active 24, Past Due 3, Failed 2, Suspended 1), light-blue info panel, Subscriptions table (3 mock rows), Stripe Events Log (3 mock rows, monospace event types).

## 8. UPDATE 5 — New page: `/admin/stripe-events`

`src/routes/_authed.admin.stripe-events.tsx`. Reuses Stripe Events Log table. Filter pills: All / Payment Succeeded / Payment Failed / Subscription Events / Refunds.

Also add stub Coming Soon route `/admin/crm` for HubSpot.

## 9. UPDATE 6 — Enhance `/settings/integrations`

Append (do not delete existing):

- API Usage Overview — 3 progress cards (CH 847/1000, HubSpot 1245/2000, Stripe 423/1000) with "Resets at 00:00 UTC".
- Blue info panel: threshold alerting copy.
- Rate Limit Status table.
- Throttling Controls — 3 toggles (Enable Throttling ON, Queue OFF, Priority OFF).
- Usage Log table (4 mock rows, monospace endpoint).

## 10. UPDATE 7 — Enhance `/admin/risk`

- Add 5 Risk Tier cards above the table (LOW / MEDIUM / HIGH / CRITICAL / NOT ASSESSED) using a left-border colour accent only.
- Add missing table columns: Business Type, Company Status, Status Detail, Insolvency History, Override Status, Last Checked.
- Add a 2-column info section between header and table: "Risk Evaluation Logic" + "Admin Risk Control".

## 11. UPDATE 8 — Evidence Requirements

Inside `_authed.admin.config.tsx`, add an `evidence` tab if missing. Rename label everywhere → "Evidence Requirements". Page contents:

- 3 stacked info banners (blue / amber / red).
- Search bar above table; keep "Create Rule" button.
- Ensure first data column is `Evidence Scope` (Installation = green, Project = blue, Company = purple badge), then Evidence Name, etc.

Also add `flags` and `system` tab placeholders if not present (system already exists; flags may be Coming Soon).

## 12. UPDATE 9 — Access dashboard (`installer-access`)

Verify and fill missing pieces: blue "Access" pill, 5 cards (IBGs, Account Status, Compliance, Funding Match LOCKED, Operate Features LOCKED), "Access Workspace" info panel with restricted features list.

## 13. UPDATE 10 — Operate dashboard (`installer-operate`)

Verify presence of green "Operate" pill, 4 alert banners, 7 dashboard cards (Active Projects, Ready for IBG, Evidence Incomplete, IBGs, Funding Match, Company Compliance, Account Status). Add only what is missing.

## What I will NOT touch

- 5-role RBAC model
- Shell, sidebar structure pattern, or design language (color only)
- Mock store schema (read + add static values where noted)
- Projects, Customers, Properties, Jobs, Submissions, Funding, Reports
- IBG history or repository pages (only fix `/ibg/new`)
- Dev role switcher
- Existing admin pages (Onboarding, Amendments, Activity, Audit, Permissions) beyond the rename of Permissions → Access Control label

## Technical notes

- New routes are added as files under `src/routes/`; the TanStack router plugin auto-registers them.
- Brand-blue tokens added in `src/styles.css` only; component CSS picks them up via `var(--brand-blue)`.
- All mock counts derive from `useMock().data` (users, ibgs, riskOverrides, amendments). Static numbers used only where the prompt specifies a hardcoded value.
- Permission gating uses existing `can()` + `useDevRole()` helpers.

## Order of execution

1. Branding tokens + apply to 3 surfaces
2. Bug Fix 1 (IBG new) + Bug Fix 2 (sidebar role gate)
3. Sidebar restructure with new groups + new route stubs
4. New routes: companies, membership, stripe-events, crm
5. Admin dashboard expansion
6. Risk page enhancements
7. Integrations page enhancements
8. Evidence Requirements tab
9. Access + Operate dashboard checks/fills

Awaiting approval.
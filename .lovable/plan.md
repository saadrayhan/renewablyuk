
# Renewably UK — Information Architecture & Completion Plan

This is the single source of truth for the platform: every route, every state, every interaction. After approval, we build to it so no click ever lands on a stub.

---

## 1. Global rules (apply to everything below)

**Buttons (already centralized in `button.tsx`)**
- `primary` becomes **brand-blue** by default — `primary` and `brand` collapse to the same `#0F47A8` pill. (You asked: only primary buttons in brand color.)
- One primary per page header. Everything else: `secondary` (border), `ghost` (inline), `icon` (cluster, tooltip required).
- Tables: row actions are always `icon` cluster. "View →" is `ghost` with arrow. No bare `<a>` text-as-action.

**Color**
- Brand blue stays ≤10%: primary CTA, sidebar logo, workspace switcher dot, `UnderlineTabs` underline, `bg-brand-blue-tint` info notices. Nothing else.

**Navigation contract**
- Every list row → detail page. Every detail page → back link + at least one next action.
- Empty states always include: icon, one-line explanation, **primary action** that creates the first record, secondary "Learn more" ghost link.
- Locked states use existing `LockedCard` with `request access` action.
- Loading: skeleton rows in tables, skeleton card grid elsewhere — no spinners on full pages.
- Error: route `errorComponent` with retry; 404: `notFoundComponent` with back to parent list.

**Modals vs drawers vs pages**
- Quick edits / confirmations → `Dialog`.
- Multi-field review with side context (Amendment review, Risk override) → `Sheet` (right-side drawer).
- Anything that needs its own URL / share link → full page route.

---

## 2. Top-level IA

```text
/                                  Marketing landing
/pricing                           Public pricing
/sign-in /sign-up /verify
/forgot-password /reset-password

/dashboard                         Home (role-aware)

PROJECTS
/projects                          Project pipeline (kanban + table toggle)
/customers   /customers/new   /customers/:id
/properties  /properties/new  /properties/:id
/jobs        /jobs/new        /jobs/:id

IBG
/ibg/new                           Wizard
/ibg/:id                           Detail (preview, audit, amendments tab)
/ibg/:id/amendment                 Amendment composer
/ibg/repository                    Document storage
/ibg/history                       Activity log

SUBMISSIONS
/submissions   /submissions/:id

FUNDING
/funding       /funding/match   /funding/:id   /funding/:id/tracking

REPORTS
/reports                           Saved reports + ad-hoc builder

ONBOARDING (per-user wizard)
/onboarding

SETTINGS (workspace, role-aware)
/settings                          → redirect to /settings/profile
/settings/profile
/settings/team       /settings/team/invite (modal route via ?invite=1)
/settings/access     (operator capability requests)
/settings/measures
/settings/notifications
/settings/integrations            workspace-level connectors
/settings/security                MFA, sessions, API keys
/settings/subscription            plan, invoices, payment method

ADMIN (internal Renewably)
/admin/companies                  /admin/companies/:id
/admin/users                      /admin/users/:id
/admin/membership                 platform-wide subs & invoices
/admin/onboarding                 /admin/onboarding/:id
/admin/amendments                 /admin/amendments/:id
/admin/activity                   live feed
/admin/config                     Installation types, evidence, templates, branding
/admin/risk                       /admin/risk/:id
/admin/audit                      /admin/audit/:id
/admin/integrations               /admin/integrations/:id
/admin/stripe-events              /admin/stripe-events/:id
/admin/crm                        HubSpot hub  (NEW build, see §5)
/admin/permissions                permission library, role presets
/admin/feature-flags
/admin/system-settings            (NEW build, see §4)
```

---

## 3. State coverage matrix (per page)

Every route below ships with these states wired:

| State | Implementation |
|---|---|
| Empty | `EmptyState` + primary CTA |
| Loading | Skeletons matching final layout |
| Loaded | Real data (mock store) |
| Error | Route `errorComponent` w/ retry |
| 404 / not found | Route `notFoundComponent` w/ back |
| Locked (RBAC) | `LockedCard` w/ "Request access" |
| Read-only (role) | Disabled inputs + tooltip explaining role |

We'll audit every existing route file and add the missing branches.

---

## 4. System Settings (`/admin/system-settings`) — full build

Tabs (UnderlineTabs):

1. **General** — Platform name, support email, default timezone, default locale, business hours.
2. **Branding** — Logo upload, accent toggle (off by default; brand-blue = product blue), favicon, login page hero.
3. **Retention & Data** — Audit log retention (30/90/365/forever), IBG PDF retention, soft-delete window, export-all (zip job).
4. **Email** — Sender name, reply-to, footer, transactional template links (opens template editor dialog).
5. **Security** — Password policy (length, complexity), session timeout, allowed MFA methods, IP allowlist (textarea), force MFA for admins toggle.
6. **Environment** — Active environment badge (Test/Live), maintenance-mode toggle (with confirm dialog), banner message, scheduled window.
7. **Danger zone** — Reset demo data, rotate platform API key (confirm + show-once), purge soft-deleted (confirm).

Each tab card gets `Save changes` (primary brand-blue) + `Discard` (ghost). Unsaved-changes guard via `usePrompt` pattern (route `beforeLoad` + dialog).

---

## 5. CRM / HubSpot (`/admin/crm`) — full build

Two-state page driven by HubSpot connection status.

**State A — Not connected**
- Hero card: "Connect HubSpot to sync customers, jobs, and IBG events."
- Primary brand-blue button: "Connect HubSpot" → triggers `standard_connectors--connect` (`hubspot`).
- Bulleted scope list, link to docs.

**State B — Connected** — tabs:

1. **Overview** — connection status pill, account email, last sync timestamp, "Sync now" (primary), "Disconnect" (secondary destructive-ghost). KPIs: Contacts synced, Companies synced, Deals mirrored, Errors (last 24h).
2. **Object mapping** — three rows (Contact ↔ Customer, Company ↔ Company, Deal ↔ Project). Each opens a drawer to map fields, set sync direction (one-way / two-way), conflict policy (HubSpot wins / Renewably wins / newest wins).
3. **Event triggers** — toggles: "On IBG issued → create HubSpot note", "On amendment requested → create task", "On funding approved → move deal stage". Stage picker pulls live HubSpot pipelines via gateway.
4. **Sync history** — table: timestamp, direction, object, count, status, view-payload icon → opens drawer with JSON.
5. **Webhook** — auto-generated inbound URL (copy button), signing secret (show-once, rotate), recent inbound events table → row click → existing detail pattern.

Server functions:
- `connectHubspot` (uses `standard_connectors--connect` via flow tool — surfaced through the `Connect HubSpot` button which calls a server function that returns the connection-needed signal; UI then prompts).
- `hubspotSyncNow`, `hubspotListPipelines`, `hubspotMapField`, `hubspotDisconnect`.
- All call HubSpot via the connector gateway (`https://connector-gateway.lovable.dev/hubspot/...`) using `LOVABLE_API_KEY` + `HUBSPOT_API_KEY`.

(Until the user actually links HubSpot, page renders State A so it's never a dead end.)

---

## 6. Stripe webhook retry — real flow

Endpoint: `src/routes/api/admin/stripe/retry-webhook.ts` (server route, POST).
- Authenticated via `requireSupabaseAuth`-equivalent inside server function (we use server function instead — `retryStripeWebhook` in `src/server/stripe.functions.ts`).
- Input: `{ eventId: string }` validated with Zod.
- Behavior:
  1. Looks up the original event in our mock store / future Stripe events table.
  2. POSTs to the configured local webhook receiver (`/api/public/stripe/webhook`) with the original payload + a freshly computed `Stripe-Signature` header using `STRIPE_WEBHOOK_SECRET`.
  3. Records a retry attempt (timestamp, status, response body) appended to the event's `attempts[]`.
  4. Returns `{ ok, status, attemptId }`.
- UI on `/admin/stripe-events/:id`:
  - "Retry webhook" becomes primary brand-blue, shows spinner while pending, toast on success/fail.
  - New **Attempts** card lists every retry (timestamp, status, latency, response excerpt, "View payload" → drawer).
  - Disabled with tooltip if event is older than 30 days or already `succeeded` on latest attempt (configurable).

Secret needed: `STRIPE_WEBHOOK_SECRET`. If missing, the button stays enabled but the handler returns a structured error and the UI shows an inline notice with a "Set Stripe webhook secret" button → opens secrets prompt. (We will request the secret only when the user first clicks Retry, not preemptively.)

---

## 7. Closing every other "empty" click

Audit pass — for each existing route, ensure:

- **Dashboard** quick actions all link to real pages (already done) + add "What's new" feed card linking to `/admin/activity`.
- **Projects** kanban cards → `/jobs/:id` (exists). Add "+ New project" CTA → `/jobs/new`.
- **Customers/Properties/Jobs** lists → confirm row click + new button wired; add bulk-select toolbar (Archive, Export CSV via server function).
- **IBG**: ensure Repository row → `/ibg/:id`, History row → same detail with `?tab=audit`. Both already separated; we'll wire row navigation.
- **Submissions**: detail page exists — add status timeline + resubmit action.
- **Funding**: `/funding/match` "Apply" → creates funding record then routes to `/funding/:id`. Tracking tab → `/funding/:id/tracking`.
- **Reports**: empty preset list gets "Create report" CTA → opens builder dialog (filters + group-by + save).
- **Settings/Team**: "Invite" opens `InviteDialog`; member row → `/admin/users/:id` for admin, otherwise inline drawer.
- **Settings/Access**: capability list with "Request access" rows; on submit creates a notification for admin.
- **Settings/Integrations**: each tile (Stripe, HubSpot, Email, Webhooks) → `/admin/integrations/:id`-style detail or its workspace settings page; never a dead tile.
- **Admin/Permissions**: role preset cards → drawer to edit included permissions + "Apply to N users".
- **Admin/Audit**: every row → `/admin/audit/:id` (exists); add filter pills (Severity, Actor, Object).
- **Admin/Risk**: row → `/admin/risk/:id`; add "Override" CTA opening `HighRiskOverrideSheet` / `CriticalRiskOverrideSheet`.
- **Admin/Amendments & Onboarding**: row → detail (exist). Add bulk approve/reject in detail toolbar.
- **Admin/Companies**: tabs already exist — wire Users tab rows to `/admin/users/:id`, Billing tab "Open invoice" → `/admin/membership?invoice=…`.
- **Admin/Stripe Events**: row → detail (exists); add Retry from list (icon).
- **Admin/Feature Flags**: persists to mock store; add "Audit" link per flag → `/admin/audit?subject=flag:<key>`.
- **Command palette**: index every route + common actions ("Issue IBG", "Invite teammate", "Connect HubSpot", "Retry last webhook").

Anything currently rendering `<ComingSoon>` gets a real page (only `crm` and `system-settings` were left — both built in §4–§5).

---

## 8. Technical scaffolding

New files:
- `src/server/stripe.server.ts` — signing helper (`computeStripeSignature`), retry executor.
- `src/server/stripe.functions.ts` — `retryStripeWebhook`, `listStripeEventAttempts`.
- `src/routes/api/public/stripe/webhook.ts` — receiver (verifies signature, appends to mock store).
- `src/server/hubspot.server.ts` + `src/server/hubspot.functions.ts` — gateway calls.
- `src/components/app/unsaved-changes-guard.tsx` — reusable dialog + route guard.
- `src/components/app/page-states.tsx` — `EmptyBlock`, `ErrorBlock`, `Skeletons.*` to standardize states.
- `src/lib/mock/stripe-events.ts` — extends store with `attempts[]`.

Edits:
- `src/components/ui/button.tsx` — alias `primary` → brand-blue styles (keep `brand` as synonym; legacy `default` follows suit).
- `src/routes/_authed.admin.system-settings.tsx` — full implementation.
- `src/routes/_authed.admin.crm.tsx` — full implementation w/ connection-aware UI.
- `src/routes/_authed.admin.stripe-events.$id.tsx` — wire Retry, Attempts card.
- Sweep every other route file listed in §7 for missing empty/loading/error branches and dead clicks.

---

## 9. Out of scope (call-outs)

- We will NOT ask for `STRIPE_WEBHOOK_SECRET` until the user first clicks Retry — keeps the flow honest.
- HubSpot connection requires the connector picker; the page handles the not-connected state cleanly so it's never a dead end.
- No real Stripe live calls — the retry replays into our own `/api/public/stripe/webhook` receiver, exactly mirroring how Stripe redelivers in production.

After approval I'll execute §4 → §5 → §6 → §7 in that order, and finish with the IA sweep so every click in the app lands somewhere meaningful.

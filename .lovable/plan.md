
# Renewably UK — A→Z plan

Two goals, in order:
1. **Reconstruct the shell** to match ElevenLabs as closely as possible.
2. **Make every IA flow actually work** — every screen in the IA HTML gets a real, navigable, role-aware page. No more "coming soon" dead-ends.

All in design-only mode (no backend). Mock data lives in `src/lib/mock/*` and a tiny in-memory store with `localStorage` persistence so created records survive a refresh.

---

## Part 1 — ElevenLabs shell (foundation)

What ElevenLabs actually does (from your screenshots):

- **Mini icon rail** (~56px) on the far left: workspace avatar at top, then iconified shortcuts, "Lovable" trigger at the bottom.
- **Secondary sidebar** (~240px) opens next to it: workspace switcher row, primary nav (Home, Voices, Studio, Flows, Files), a **Pinned** group of user shortcuts, "Invite team members" card pinned to bottom, "Developers" footer.
- Both rails can collapse independently — the secondary one slides away, the mini rail stays.
- **Top bar**: breadcrumb on the left (`Voices › Explore`), pill cluster on the right — `Feedback`, `Docs`, `Ask` (with little icon), file tray, notifications bell with blue dot, circular avatar.
- **Profile popover** = card-style menu: Balance block (with Upgrade), current workspace row with a swap icon, Settings / Workspace settings / Subscription / Theme / etc., Terms sub-popover, Sign out at bottom.
- **Notifications popover** = right-side panel: "Introducing X" cards with image + body + relative timestamp.
- **Hero block** on Home: tiny "Workspace name" eyebrow → giant "Good morning, Makibul" → New badge banner → row of 6 large illustration tiles (Instant speech, Audiobook, Image & Video, ElevenAgents, Music, Dubbed video).
- **List section** below: "Latest from the library" on the left, "Create or clone a voice" on the right.
- **Tabs** = simple underline ("Explore" | "My Voices"), filter pills below them with icons, Filters / Sort dropdowns on the right.
- **Modals**: rounded-2xl, screenshot/illustration top, headline, 3 bullet rows with mono icons, full-width black CTA.

### Build (Part 1)

```text
src/
  components/app/
    shell/
      mini-rail.tsx          ← left icon rail (56px)
      side-panel.tsx         ← secondary nav (240px), pinned group, invite card
      top-bar.tsx            ← breadcrumb + Feedback/Docs/Ask/Files/Bell/Avatar
      profile-popover.tsx    ← balance card · workspace · settings · sign out
      notifications-popover.tsx
      workspace-switcher.tsx
      breadcrumbs.tsx        ← derived from current route + record context
    ui-kit/
      page-header.tsx        ← "eyebrow / H1 / subtitle / actions" pattern
      tile-grid.tsx          ← big illustration tiles (Home + section indexes)
      tabs-underline.tsx     ← ElevenLabs underline tabs
      filter-pills.tsx       ← icon + label rounded chips
      empty-state.tsx
      record-list.tsx        ← reusable list row with avatar/icon/meta/right
      info-modal.tsx         ← rounded modal w/ illustration + bullets + CTA
```

- `_authed.tsx` becomes: `<MiniRail /> <SidePanel /> <main>{TopBar + Outlet}</main>`.
- Side panel includes a **Pinned** group (per-role: e.g. New IBG, IBG Repository, Funding match for Operate) and the **"Invite team members"** card at the bottom (admin-only action).
- Dev switcher gets restyled into the same popover language so it stops feeling like a dev hack.
- Replace the current `LockedCard` with an inline ElevenLabs-style banner (small lock icon, single line, "Request access" pill on the right).

---

## Part 2 — Wire every IA flow

Every node in the IA HTML maps to a real route below. Each route has: list/detail/edit screens, role-aware visibility, real state pills, real action buttons, and a right-rail or inline audit timeline where the IA calls for it. Nav between them works (e.g. Customer → Property → Job → IBG, or Job → Funding project → Submission).

### A. Authentication & onboarding flows
- `sign-in`, `forgot-password`, `reset-password` — restyle to match ElevenLabs auth (centered card, illustration, social buttons placeholder).
- **Onboarding wizard** at `/onboarding` with 6 steps as separate sub-routes (`/onboarding/signup`, `/verify`, `/company`, `/measures`, `/accreditation`, `/payment`, `/review`). Stepper at top, persists progress to `localStorage`, each step shows correct state pill (in progress, awaiting verification, blocked, etc.), Access tier skips Payment.

### B. Dashboard — five role-specific compositions
Replaces today's single-shape dashboard. Switching role in DevSwitcher swaps composition:
- Admin → pending approvals (onboarding queue, amendments queue), platform reports tile.
- Operator → permission summary + pinned shortcuts assigned by Admin.
- Installer · Access → minimal: "Issue an IBG" + "View my IBGs" + Upgrade card.
- Installer · Operate → full ops summary: jobs by state, IBGs this month, funding readiness.
- Read-Only → record browser tiles (no action buttons).

### C. Projects (record chain)
- `/projects` — landing index with three tiles (Customers / Properties / Jobs) + recent records.
- `/customers` — list with search + filter pills (status), "Create" pill.
- `/customers/new` — drawer or page form: name/email/phone/org, Save draft / Save & activate.
- `/customers/[id]` — detail with tabs (Overview · Properties · Jobs · Documents · Audit), right-rail audit timeline, status pill swap, action menu.
- `/customers/[id]/properties/new`, `/properties/[id]` — duplicate-flag warning state, EPC/UPRN fields, Job History tab.
- `/jobs`, `/jobs/new`, `/jobs/[id]` (Job hub) with the full state machine pill (`draft → in progress → awaiting info → under validation → blocked → completed → closed → cancelled → archived`), tabbed sub-pages: Overview · Documents · IBGs · Funding · Audit.
- `/jobs/[id]/documents` — upload (mock), category, link to workflow stage, delete (admin/operator only).

### D. IBG (state-machine module)
- `/ibg/new` — wizard: customer picker (Operate auto-fills from Job), measure type, policy type, validate → issued, success screen with "Download certificate" (mock blob).
- `/ibg/history` — limited view for Access tier (5 most recent + Upgrade banner), full view otherwise.
- `/ibg/repository` — searchable repository, state filter chips, row → detail.
- `/ibg/[id]` — full state pill (`draft → initiated → awaiting validation → incomplete → validated → processing → ready for issue → issued → amended → superseded → cancelled → archived`), actions gated by state + role: Download, Request amendment (Operate only, only when issued), Cancel (Operate only, same calendar month).
- `/ibg/[id]/amendment` — form: corrected value, reason, submit → shows "Pending admin approval" with appropriate state pill.

### E. Submissions
- `/submissions` — list with state filter (submitted/under review/awaiting info/accepted/rejected/withdrawn).
- `/submissions/[id]` — linked job + funding project links, snapshot download, "Upload additional info" enabled only when state is `awaiting information`.

### F. Funding (Operate / Operator / Admin)
- `/funding/match` — Match Hub: scored scheme cards (ECO4, GBIS, BUS, etc.) matched against the company's approved measures + geography (mock). "Start funding project" CTA.
- `/funding` — funding project list with state pills.
- `/jobs/[id]/funding/new` — start a project from a job (auto-links).
- `/funding/[id]` — project hub with readiness checklist, state pill, blocking issues panel.
- `/funding/[id]/evidence` — upload, categorise, link to scheme requirement (mock).
- `/funding/[id]/submit` — submission summary + confirm (creates a Submissions record).
- `/funding/[id]/tracking` — post-submission tracking view with the full state pill set.

### G. Settings
- `/settings` — index landing.
- `/settings/profile`, `/settings/notifications`, `/settings/subscription` (Operate only, with payment-failed and cancelled states), `/settings/measures` (request addition flow → admin queue).

### H. Admin (visible only when role = admin)
- `/admin/users` — directory with role + status filter, invite pill.
- `/admin/users/invite` — form (name, email, role) → pending acceptance state.
- `/admin/users/[id]` — user detail with tabs: Overview · **Permissions** (matrix + presets, exactly the model we agreed: assign from library, apply preset, see what's currently granted) · Audit · Records owned. State actions: suspend / reactivate / deactivate.
- `/admin/audit` — filter (actor, event, date, target), CSV export (mock download).
- `/admin/activity` — real-time activity stream (simulated ticking entries).
- `/admin/onboarding` — queue with state pills, → `/admin/onboarding/[id]` review screen (override / verify / activate / reject).
- `/admin/ibg/amendments` — queue, → `/admin/ibg/amendments/[id]` review screen showing original vs requested with Approve / Reject + reason.
- `/admin/permissions` — Permission Library: full matrix + the three presets (Junior / Senior / Compliance Reviewer). Editable here so the Admin actually feels in control.
- `/admin/config` — system config tabs (Approved measures, Notification templates, Scheme integrations).

### I. Cross-cutting
- **Breadcrumbs** in the top bar reflect the actual record chain (`Projects › Customers › Jane Smith › 14 Oak Ln › IBG-2451`).
- **Right-rail audit timeline** component used on every record detail (Customer, Property, Job, IBG, Funding project, Submission).
- **State pill component** with the full state vocabulary from the IA, color-coded green/blue/amber/rose/grey.
- **Empty states** everywhere — no "Coming soon" stubs left.

---

## Mock data + persistence

Single in-memory store in `src/lib/mock/store.ts` seeded with realistic UK data (3 customers, 5 properties, 6 jobs across all states, 8 IBGs across the state machine, 3 funding projects, 2 submissions). Reads/writes go through the store; it mirrors to `localStorage` so the preview feels real.

---

## Build order (so each phase looks finished)

1. **Shell** (mini rail, side panel, top bar, popovers, page header, tile grid, tabs, filter pills, modal).
2. **Mock store + state-pill + audit-timeline** primitives.
3. **Dashboard** — five role-aware compositions.
4. **Projects** chain (Customers → Properties → Jobs).
5. **IBG** module (Generator → History → Repository → Detail/State machine → Amendment).
6. **Submissions + Funding** (Match Hub → Projects → Evidence → Submit → Tracking).
7. **Settings**.
8. **Admin** (Users + Permission detail, Audit, Activity, Onboarding queue, Amendments queue, Permission library, Config).
9. **Onboarding wizard** (6 steps).
10. **Auth screens** restyle.

---

## Out of scope (this plan)

- Real backend / database.
- Real Stripe, Companies House, TrustMark integrations.
- Real document PDF rendering (mocked as blob downloads).
- Email sending.

Approve and I'll execute A→Z. Step 1 (shell) lands first and is visually unmistakable — that's the "feels like ElevenLabs" win — then I march through the IA without leaving any dead ends.

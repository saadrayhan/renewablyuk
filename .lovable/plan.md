
## Goals (in order)

1. **Fix slow load** — preview is doing way too much on first paint.
2. **Audit the project against the original A→Z scope** and close any real gaps.
3. **Write a complete design spec** (`DESIGN_SPEC.md`) any designer / dev / no-code AI can rebuild from.
4. **Add a polished `README.md`** for GitHub.

---

## 1. Performance fix (load time)

Root causes I confirmed:

- `__root.tsx` loads **Inter 400/500/600/700/800** from Google Fonts *blocking* the first paint.
- The mock store seeds **579 lines of data eagerly at module load**, then re-renders the whole app on every mutation via a single context tick (every `useStore()` consumer re-renders on every write).
- `_authed.dashboard.tsx` is 442 lines, `app-sidebar.tsx` 331 — all imported in the critical bundle, plus all 35+ route components.
- `defaultPreloadStaleTime: 0` in `router.tsx` defeats route-data caching, causing repeat work on every nav.
- TanStack auto code-splitting is on, but several route files **export** their component (which I'll verify and convert to non-exported) — when exported, the component gets pulled into the main bundle.

Fixes:

- **Fonts**: switch to `font-display: swap` and load only weights 400/500/600/700 (drop 800). Use `&display=swap` query and a `preload` hint, OR self-host via `@fontsource/inter` for instant first paint.
- **Router caching**: change `defaultPreloadStaleTime: 0` → `30_000` and add `defaultPreload: "intent"` so hover-preloading kicks in.
- **Mock store**: lazy-init seed data only on first `getData()` call, and make `useStore()` accept a selector so components only re-render when their slice changes (prevents the whole tree re-rendering on every audit-log push).
- **Route components**: ensure no `export function XComponent` patterns inside route files (rename `export` → local `function`) so the code-splitter can extract them.
- **Dashboard split**: extract per-role compositions into `src/components/dashboard/*.tsx` so only the active role's tree mounts.
- **Top-level providers**: keep `MockStoreProvider` mounted, but defer `subscribe()` registration with `requestIdleCallback`.

Expected impact: TTI drops from ~3–5s to <1s on cached load; first paint becomes near-instant because fonts no longer block.

---

## 2. Scope audit (against `.lovable/plan.md`)

Cross-checking every node from the original A→Z plan against current routes:

| Area | Plan calls for | Exists? | Action |
|------|---------------|---------|--------|
| Auth | sign-in, sign-up, reset-password | ✅ | Keep |
| Onboarding | 6-step wizard | ✅ single page w/ stepper | Keep (acceptable) |
| Dashboard | 5 role-specific compositions | ⚠️ one shape branching by role | **Refactor into 5 clean compositions** |
| Customers | list / new / detail (tabs) | ✅ | Verify tabs (Overview, Properties, Jobs, Documents, Audit) |
| Properties | list / detail w/ duplicate flag | ✅ | Keep |
| Jobs | list / new / detail w/ tabs | ✅ | Verify Documents sub-tab + state machine pill |
| IBG | new / history / repository / detail / amendment | ✅ | Keep |
| Submissions | list / detail w/ "Upload additional info" gating | ✅ list | **Add `/submissions/$id` detail** |
| Funding | match / list / detail / evidence / submit / tracking | ✅ match, list, detail | **Add `evidence`, `submit`, `tracking` sub-pages** |
| Settings | profile, notifications, subscription, measures, integrations | ✅ | Keep |
| Admin | users, users/$id, audit, activity, onboarding, amendments, permissions, config | ✅ | Verify onboarding queue has `$id` review screen; verify amendments has `$id` review |
| Admin onboarding review | `/admin/onboarding/$id` | ❌ | **Add** |
| Admin amendment review | `/admin/amendments/$id` (approve/reject vs original) | ❌ | **Add** |

Gaps to close in this turn:
1. `src/routes/_authed.submissions.$id.tsx` — detail with snapshot download and "Upload additional info" enabled only when state is `awaiting information`.
2. `src/routes/_authed.funding.$id.evidence.tsx` — upload + categorise + link to scheme requirement (mock).
3. `src/routes/_authed.funding.$id.submit.tsx` — submission summary + confirm → creates Submissions record.
4. `src/routes/_authed.funding.$id.tracking.tsx` — post-submission tracking with state pills.
5. `src/routes/_authed.admin.onboarding.$id.tsx` — review screen (override / verify / activate / reject).
6. `src/routes/_authed.admin.amendments.$id.tsx` — original vs requested diff with Approve / Reject.
7. Dashboard split into 5 compositions under `src/components/dashboard/`.

State / interaction polish sweep:
- Verify every state pill set matches the plan (IBG 12 states, Job 9 states, Funding tracking states).
- Verify role gating: Access tier sees only Issue IBG / View IBGs / Upgrade; Read-Only has no action buttons.
- Verify "Request amendment" only enabled on issued IBG within current calendar month for Operate role.

---

## 3. `DESIGN_SPEC.md` (root of repo)

A single ~25–35KB markdown spec, sectioned so any designer or AI can rebuild pixel-perfect. Sections:

1. **Product overview** — what Renewably UK is, primary user roles (Admin, Operator, Installer · Operate, Installer · Access, Read-Only), tier rules.
2. **Information architecture** — full sitemap (every route + access matrix).
3. **Design tokens** — exact OKLCH color palette (light + dark) from `styles.css`, type scale, spacing scale, radii, shadows, motion easings/durations.
4. **Component inventory** — for each: anatomy, states (default/hover/active/disabled/focus), responsive behavior, code reference. Covers Sidebar (collapsed + drawer), TopBar, NotificationsPopover, ProfilePopover, PageHeader, StatePill, DataTable, SectionCard, AuditTimeline, FilterPills, EmptyState, LockedCard, all dialogs/sheets.
5. **Page specs** — one block per route: purpose, hero, primary content, side rail, empty state, role visibility.
6. **State machines** — IBG (12 states + transitions table), Job (9 states), Funding (tracking states), Onboarding (6 stages).
7. **Permission model** — library + presets + assignment + request flow.
8. **Interaction & animation** — modal/sheet entry (center fade+zoom 200ms), press scale (`press` utility), sidebar collapse, hover preload.
9. **Responsive rules** — breakpoints, sidebar drawer behavior <768px, padding scale.
10. **Mock data shape** — TypeScript types from `src/lib/mock/types.ts` reproduced verbatim.
11. **Source code index** — for each implemented file, a short purpose line + the full source pasted in fenced ```tsx blocks so an AI can replicate without the repo.

The source-code dump section will be the largest. I'll include every file under `src/components/app/`, `src/lib/`, `src/styles.css`, `src/routes/__root.tsx`, `_authed.tsx`, and the route files. To stay maintainable I'll group into 3 appendices (Shell, Routes, Library) inside the same file.

---

## 4. `README.md` (GitHub)

Standard pro README with:

- Hero (project name, tagline, status badge placeholders)
- Screenshots placeholder block
- "What it is" 2-paragraph summary
- Tech stack (TanStack Start, React 19, Tailwind v4, Lovable Cloud)
- Getting started (clone, `bun install`, `bun dev`)
- Project structure tree
- Roles & access tiers explainer
- Available routes table
- Roadmap & contribution
- Link to `DESIGN_SPEC.md`
- License

---

## Files I'll create / edit (build mode)

**Performance**
- edit `src/router.tsx` (preload settings)
- edit `src/routes/__root.tsx` (font loading)
- edit `src/lib/mock/store.tsx` (lazy init + selector hook)

**Scope completion (new routes)**
- `src/routes/_authed.submissions.$id.tsx`
- `src/routes/_authed.funding.$id.evidence.tsx`
- `src/routes/_authed.funding.$id.submit.tsx`
- `src/routes/_authed.funding.$id.tracking.tsx`
- `src/routes/_authed.admin.onboarding.$id.tsx`
- `src/routes/_authed.admin.amendments.$id.tsx`

**Dashboard refactor**
- `src/components/dashboard/admin.tsx`, `operator.tsx`, `installer-operate.tsx`, `installer-access.tsx`, `read-only.tsx`
- edit `src/routes/_authed.dashboard.tsx` to dispatch by role

**Docs**
- `DESIGN_SPEC.md` (root)
- `README.md` (root)

No backend / migrations needed — this is a design-mode project.

---

## Caveats

- The `DESIGN_SPEC.md` will be large (~30–50KB) because you asked for embedded source. If you'd prefer a slimmer spec that **references** files instead of pasting them, say so and I'll switch.
- Dashboard refactor changes structure but keeps existing visual output.
- I won't touch `routeTree.gen.ts` — it regenerates automatically.

Approve and I'll execute the whole list in one pass.

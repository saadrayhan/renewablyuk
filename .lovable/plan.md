
## Plan — Renewably UK polish pass

Twelve scoped changes in three rounds. Nothing in the "Do not change" list will be touched.

---

### Round 1 — Critical missing screens

**1. `/forgot-password` route** — new file `src/routes/forgot-password.tsx` using `AuthLayout`. Three local states (`idle | loading | success`). On submit: 800ms fake delay, then swap form for success card with green check chip, email echo, Resend ghost link, and back link. Update `sign-in.tsx` line 71 — `to="/reset-password"` → `to="/forgot-password"`.

**2. `/funding/$id/tracking` route** — new file `src/routes/_authed.funding.$id.tracking.tsx`.
- Vertical timeline built from a fixed step ladder (Submitted → Under review → Information requested → Decision → Closed) cross-referenced with the funding project's `state` and `auditLog` filtered by `entityType="funding" && entityId===id`.
- Past nodes: `bg-cat-green-bg border-cat-green` + Check icon. Active: `bg-cat-amber-bg border-cat-amber` + Clock. Future: `bg-surface border-border`.
- If `state === "awaiting-information"`: dashed upload zone slots in beneath the active node; click → mock file via prompt → `update()` adds an evidence row + audit "Uploaded response document".
- Right sticky 320px column: scheme card + ghost-red "Withdraw submission" (only when state ∉ {accepted, rejected, closed}; sets state back to draft + audits).
- On `_authed.funding.$id.tsx`, after successful `submit()`, render a `View tracking →` Link below the action row.

**3. Add-property slide-over** — convert the static `Add property` button on `_authed.customers.$id.tsx` (line 76) into a `Sheet` from `@/components/ui/sheet` (right side, `sm:max-w-[480px]`). Local form state. On blur of postcode, run `data.properties.find(p => p.postcode.replace(/\s/g,"").toLowerCase() === pc...)` → render amber inline banner with a `View →` deep link, non-blocking. On submit: validate required (Address 1, Town, Postcode), `update()` adds a Property with `nid("pro")`, links to `customer.id`, pushes audit "Added property {address}", toasts success, closes sheet, resets form. Sticky footer with Cancel + primary Add property.

---

### Round 2 — Fix existing thin screens

**4. Job Hub right panel** — in `_authed.jobs.$id.tsx`:
- Remove the duplicate right-side `<AuditTimeline />` (audit tab already covers it).
- Insert horizontal status track between header block and `UnderlineTabs`. Steps: Draft · In Progress · Under Validation · Completed. Blocked & Cancelled drawn as dashed off-branches from In Progress. Active = `bg-foreground text-background`, completed = `bg-cat-green text-white` w/ check, future = `bg-tile text-ink-muted`.
- Replace right `<aside>` with three stacked panels (`sticky top-6 space-y-3`):
  - Panel A — Status: current pill + "Change status" ghost button → `Popover` with allowed `TRANSITIONS[job.state]` rows; click calls `setState()`.
  - Panel B — IBG: most recent IBG (ref + pill + Open link) or empty + "Create IBG" → `/ibg/new`.
  - Panel C — Funding: latest funding project (scheme + pill + Open) or empty + "Find scheme →" `/funding/match`.
- Move existing TRANSITIONS pill row onto the popover (kept inline as fallback).

**5. Funding hub checklist** — in `_authed.funding.$id.tsx`:
- Replace 3-item checklist with a 6-step sequential list using the rules listed in the brief. A step is `actionable` only if all earlier steps complete; otherwise it shows the lock icon.
- Progress bar above (text `X of 6 steps complete` + 6px rounded bar). Bar uses inline width style + a `transition-[width] duration-[600ms] ease-out` and starts at 0% on mount via `useEffect`.
- Submit button disabled until all 6 complete. On submit, after existing `update()`, `useNavigate()` to `/funding/$id/tracking`.

---

### Round 3 — Design & interaction polish

**6. Radius reduction** — in `styles.css` change `--radius: 0.875rem;` → `--radius: 0.625rem;` (single token line). All other tokens untouched.

**7. Sidebar active left-bar** — in `app-sidebar.tsx` `Row`:
- Add `relative overflow-hidden` to base classes.
- Active variant becomes `bg-sidebar-accent text-foreground before:absolute before:left-0 before:inset-y-1 before:w-0.5 before:rounded-full before:bg-brand`.

**8. Bell unread dot** — extend `SeedData` with `meta: { hasUnreadNotifications: boolean }` (default true); add helper `markNotificationsRead()`. In `notifications-popover.tsx` (or `top-bar.tsx` wrapper), wrap the bell trigger in a relative span and conditionally render the destructive dot. Opening the popover calls the helper.

**9. Command palette** — new `src/components/app/command-palette.tsx` using existing shadcn `Command` + `Dialog`. Global `keydown` listener for ⌘K / Ctrl+K. Mounted once inside `_authed.tsx`. Add a `Search` icon button in `top-bar.tsx` between breadcrumb and right cluster that opens the same dialog via a small context (`CommandPaletteProvider`). Groups: Navigate (static list), Customers (filter by name/ref), Jobs (ref/measure), IBGs (ref/customerName). Each row uses `useNavigate()` to push the route + closes dialog.

**10. Page transition** — wrap `<Outlet />` in `_authed.tsx` with a keyed div: `key={pathname}` from `useRouterState`, classes `animate-in fade-in-0 slide-in-from-bottom-1 duration-200`. Pure CSS via `tw-animate-css` (already imported), no framer-motion install.

**11. IBG issued celebration** — in `_authed.ibg.new.tsx` success block: replace the static `CheckCircle2` with a wrapper `<span className="ibg-pop">` plus four absolutely-positioned `ibg-burst` dots in NE/SE/SW/NW. Add the keyframes (`issued-pop`, `issued-burst`) and `.ibg-pop` / `.ibg-burst-{1..4}` selectors to `styles.css` *outside* the motion-token block so existing easing/motion tokens stay intact.

**12. EmptyState** — in `empty-state.tsx`: wrap content in `relative overflow-hidden`, inject the 3-circle SVG positioned absolute (`opacity-[0.04] text-foreground`), bump icon container to `size-14` + `Icon` to `size-6`, add `animate-in fade-in-0 duration-300 delay-150` on the inner stack.

---

### Content sweep

Update `src/lib/mock/seed.ts` only where it improves realism — swap a handful of names, addresses, refs, measures, and scheme labels to the brief's UK list (Sarah Thompson, Northline Renewables Ltd, J-2041, IBG-2026-00847, GBIS, etc.). Keep IDs, structure, and counts identical so all existing relations still resolve. British English copy on all newly written strings (colour/organisation/authorise/programme/licence).

---

### Files touched

New:
- `src/routes/forgot-password.tsx`
- `src/routes/_authed.funding.$id.tracking.tsx`
- `src/components/app/command-palette.tsx`

Modified:
- `src/routes/sign-in.tsx` (forgot link)
- `src/routes/_authed.customers.$id.tsx` (Add-property Sheet)
- `src/routes/_authed.jobs.$id.tsx` (right panels + status track)
- `src/routes/_authed.funding.$id.tsx` (6-step checklist + nav-on-submit)
- `src/routes/_authed.tsx` (transition wrapper + palette mount)
- `src/components/app/shell/app-sidebar.tsx` (active-bar pseudo)
- `src/components/app/shell/top-bar.tsx` (search button)
- `src/components/app/shell/notifications-popover.tsx` (unread dot)
- `src/components/app/empty-state.tsx` (SVG bg + sizing)
- `src/routes/_authed.ibg.new.tsx` (celebration markup)
- `src/styles.css` (radius + new keyframes only)
- `src/lib/mock/seed.ts` (string-level content polish)
- `src/lib/mock/types.ts` (add `meta` field) + `src/lib/mock/store.tsx` (helper)

Untouched (per directive): `rbac.ts`, `_authed.admin.permissions.tsx`, `_authed.settings.integrations.tsx`, motion tokens / easing in `styles.css`, mock store structure, dev role switcher, LockedCard, operator preset bundles.

Approve and I'll execute the lot in one pass.

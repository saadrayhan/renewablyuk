# Final Polish + Full DESIGN_SPEC.md

You asked: verify everything is wired, polish anything loose, and ship a complete spec doc inside the repo so any AI can rebuild it. Here is the plan.

## Part A — Polish sweep (verify + tighten)

### 1. Verify every new dialog opens from the right place

Walk each entry point and confirm a real trigger exists. Where missing, wire it up.

| Dialog | Expected trigger | Status / action |
|---|---|---|
| `InviteDialog` | Sidebar "Invite team members" card | Verify it now opens the modal (was a link). Fix if still a `<Link>`. |
| `TwoFactorDialog` | `/settings/security` "Enable 2FA" button + `/settings/profile` 2FA row | Verify both. Profile row should deep-link to `/settings/security`. |
| `PaymentMethodDialog` | `/settings/subscription` "Update payment method" | Verify it returns last 4 and updates UI. |
| `TemplateEditorDialog` | `/admin/config` notification template rows | Verify Edit opens dialog with variables. |
| `AmendmentReviewSheet` | `/admin/amendments` row click / Review button | Verify it opens, reject path requires reason. |

### 2. Verify permission gates render `LockedCard` for restricted roles

Switch to `readonly` via the dev role switcher and confirm each route renders the locked state, not raw content:

- `/projects`, `/submissions`, `/customers`, `/jobs`, `/properties`, `/ibg/history`

For `operator` role, confirm permitted areas show content and ungranted ones show locked.

### 3. Visual tightness pass

Targeted, surgical fixes only — no token changes:

- **Empty states**: every list route (`projects`, `submissions`, `customers`, `jobs`, `properties`, `ibg/history`, `admin/amendments`, `admin/audit`, `admin/activity`) gets a real `EmptyState` when filtered results are zero (not just when the dataset is empty).
- **Padding consistency**: all `_authed.*` route roots use the same outer `mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8` shell. Audit and align.
- **Micro-copy**: replace generic "No data" with action-led copy (e.g. "No submissions yet — start one from a job"). Add a primary CTA in each empty state where it makes sense.
- **Sidebar**: ensure the Invite trigger looks identical to the previous link (no layout shift) and the 2FA "Enabled" pill in profile updates immediately after enabling.
- **Settings nav**: confirm "Security" and "My access" use the same icon/active treatment as the rest.

### 4. Add the small sub-pages still missing

Audit nav for any "coming soon" or dead targets and either build minimal real pages or remove from nav. Specifically check:

- `/admin/onboarding` — confirm it renders something useful, not a stub.
- `/settings/measures` and `/settings/notifications` — confirm they are real, not placeholders.
- Any sidebar item whose target route file does not exist → remove from sidebar.

If a stub is found, build a minimal real page using existing patterns (`PageHeader`, `SectionCard`, mock store data) — no new tokens, no design changes.

## Part B — DESIGN_SPEC.md (replace existing)

Overwrite `DESIGN_SPEC.md` at the repo root with one self-contained markdown document containing all seven sections in the order you specified. Sections 1–4, 6, 7 are written from scratch against the current codebase. Section 5 inlines every source file verbatim.

### Section 5 file order (inlined complete, no truncation)

1. **Config & root**
   - `package.json`, `tsconfig.json`, `vite.config.ts`, `wrangler.jsonc`, `components.json`, `eslint.config.js`, `.prettierrc`
   - `src/styles.css`
   - `src/router.tsx`, `src/routes/__root.tsx`
2. **Lib (domain core)**
   - `src/lib/utils.ts`, `src/lib/use-hydrated.ts`, `src/lib/auth-context.tsx`, `src/lib/dev-role.tsx`, `src/lib/rbac.ts`
   - `src/lib/mock/types.ts`, `src/lib/mock/seed.ts`, `src/lib/mock/store.tsx`, `src/lib/mock/queries.ts`
3. **Shell & shared app components** (`src/components/app/**`)
   - shell: `app-sidebar.tsx`, `top-bar.tsx`, `breadcrumbs.tsx`, `notifications-popover.tsx`, `profile-popover.tsx`, `workspace-switcher.tsx`, `sidebar-context.tsx`
   - shared: `page-header.tsx`, `section-card.tsx`, `state-pill.tsx`, `data-table.tsx`, `filter-pills.tsx`, `empty-state.tsx`, `locked-card.tsx`, `coming-soon.tsx`, `audit-timeline.tsx`, `underline-tabs.tsx`, `dev-switcher.tsx`, `command-palette.tsx`
   - dialogs: `invite-dialog.tsx`, `two-factor-dialog.tsx`, `payment-method-dialog.tsx`, `template-editor-dialog.tsx`, `amendment-review-sheet.tsx`
4. **Auth shell** — `src/components/auth/auth-layout.tsx`
5. **All `src/routes/*.tsx`** (alphabetical, including `_authed.*`, public auth routes, `index.tsx`, `pricing.tsx`)
6. **`src/components/ui/*`** (shadcn primitives) — listed by filename. To keep the spec usable I will inline the *project-customised* primitives in full and note the rest as "stock shadcn/ui — install via `npx shadcn add <name>`" with the import list. This avoids 4k+ lines of unmodified shadcn that any builder can regenerate. **Confirm if you'd rather have every shadcn file inlined too — say so when approving and I'll dump them all.**
7. **Supabase glue** — `src/integrations/supabase/client.ts`, `client.server.ts`, `auth-middleware.ts`, `types.ts`
8. **Auto-generated** — `src/routeTree.gen.ts` noted as auto-generated by the TanStack Router Vite plugin (not inlined; it is regenerated on build).

### Sections 1, 2, 3, 4, 6, 7 source of truth

- **Section 2** pulls every token from `src/styles.css` verbatim (HSL values, fonts, easings, motion durations).
- **Section 3** documents every component in `src/components/app/**` with props, variants, classes, and Sonner / Sheet / Dialog wiring.
- **Section 4** walks every route file, listing layout shell, sub-tabs, role gating, and conditional visibility.
- **Section 6** is a no-code rebuild walkthrough referencing the exact tokens and component order.
- **Section 7** delivers one prompt per major surface (Sign-in, Dashboard, Funding detail, IBG wizard, Admin Permissions, Settings, Command palette, Notifications, etc.).

## Deliverables

- Updated source files from Part A (only where polish is needed).
- `DESIGN_SPEC.md` overwritten with the full document.
- Final reply summarises what was changed in the polish pass and confirms the spec is in `DESIGN_SPEC.md` at the repo root.

## One open call

Section 5 length: do you want **every** `src/components/ui/*` shadcn primitive inlined in full (adds ~3–5k lines of mostly-stock code), or is "stock shadcn, install via `npx shadcn add`" acceptable for the unmodified ones? Default if you don't say: inline the customised ones, list-only for stock.

Approve and I'll execute.
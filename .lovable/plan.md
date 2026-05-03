# Renewably UK — Fix pass + ElevenLabs repolish

## A. Why three pages currently crash (root cause)

`src/lib/mock/store.tsx` persists seed under `renewably:mock-store:v1`. The latest push added four new top-level arrays — `installationTypes`, `systemTypes`, `riskAssessments`, `riskOverrides` — but never bumped the storage key. Anyone whose browser already has the old payload loads `undefined` for those arrays, and the first `.filter(...)` throws.

That single bug is what you're seeing as:
- `/ibg/new` → "Something went wrong" (uses `data.installationTypes`, `data.systemTypes`)
- `/admin/config` → same crash (Installation/System tabs)
- `/admin/risk` → same crash (`data.riskAssessments`, `data.riskOverrides`)

**Fix**: bump the key to `:v2` AND add a defensive merge in `loadData()` that fills any missing top-level array with the seed's version. This way future schema additions never blow up existing previews.

## B. Sidebar / IA questions

1. **Reports lock**. Today `Reports` uses `visibleIf: ["reports.read"]`, which hides it for roles without it. Your screenshot shows it visible-but-no-lock because Operator DOES technically see it (the row was kept visible) but lands on a `LockedCard`. Switch Reports to the `showLockedIfNot` pattern (same as Submissions/Funding) so the row always renders with a lock icon when the role can't read it. Consistent with the rest of the sidebar.

2. **IBG History vs IBG Repository**. They overlap. Plan: **delete `IBG History`** as a top-level item and route. Repository becomes the single source of truth for issued IBGs, with a built-in `History` tab inside `/ibg/repository` (filters: All · Issued · Amended · Superseded · Cancelled). Remove the `History` icon from sidebar. Redirect `/ibg/history` → `/ibg/repository?view=history` to avoid breaking links.

3. **Risk "Review" button does nothing visible**. It navigates to `/admin/risk/$id` which renders, but on a small viewport users scroll past the change. Two improvements: (a) add a row hover affordance + cursor; (b) on click, scroll-to-top + flash a 600ms highlight on the detail header so the transition reads. Also add a back chip ("← Risk & Compliance") at the top of the detail page.

## C. ElevenLabs visual repolish (Reports + Risk)

Current pages drifted from the spec — too much amber, oversize stat tiles, inconsistent card chrome. Re-aligning to the Eleven spirit already used in `/dashboard` and `/admin/users`:

**Shared rules to re-apply**
- Cards: `rounded-2xl border bg-card`, internal padding `p-5`, never colored fills for top-level cards.
- Stat tiles: thin border, mono number `text-3xl font-semibold tracking-tight`, eyebrow `text-[10px] uppercase tracking-[0.08em] text-ink-muted`, tiny tinted icon chip top-right.
- Tables: `text-[11px] uppercase` header on `bg-surface/40`, row hover `bg-surface/60`, no zebra.
- Section headers: small icon chip + label like `<Icon /> Funding progress` — NOT colored full-width banner bars.
- Use `UnderlineTabs` for view switches (already in repo), never pill tabs.

**Reports `/reports`** — rebuild
- Header: eyebrow `INSIGHT`, title `Reports`, subtitle, single right-aligned `Export current view` ghost button.
- 4-column KPI strip (IBGs issued · Active jobs · Funding submitted · Acceptance rate), small sparkline chip in each card.
- `UnderlineTabs`: IBGs · Pipeline · Funding · Submissions.
- Per tab: one large chart card (existing `LineSpark`/`BarRow`/`Funnel`/`Pie` already built — restyle to grayscale + single brand accent, drop the orange stripe), then a "Top breakdown" table card.
- Recent exports: compact list rows, not the giant download glyph in your screenshot.

**Risk & Compliance `/admin/risk`** — restyle
- Drop the blue left-border card; replace with a calmer "CH Monitoring" tile row (3 mini-stats inline, tiny status dot, single muted helper line beneath).
- Stat tiles: 2-up KPI (Accounts at risk · Active overrides) using shared neutral card style (no amber/blue bg).
- Filter: `UnderlineTabs` (All · Flagged · Paused · Suspended) instead of `FilterPills`, matches Reports.
- Table: tighten to 5 columns (Org · Type · State · Last check · Action), drop the "Signal" col into a hover popover or move to detail page.
- Row click on entire row navigates to detail (button stays as visual anchor).

**Risk detail `/admin/risk/$id`** — small lift
- Add back chip + 600ms highlight-on-mount.
- 3 tabs in `UnderlineTabs`: History · Companies House · Overrides.
- Override sheet trigger as ghost button in header, not inside a tab.

## D. PDF reference

You're right that Reports + Risk drifted. I do still have the ElevenLabs PDF references from earlier in this thread in spec form, but if you want a tighter visual match it would help to **re-attach the PDF** (or a few key screens like the Conversational AI dashboard + their analytics page). I'll match component-for-component if you do.

## E. "Are all features done? What's expandable next?"

Status check against your original brief:

Done:
- Risk types + seed + `/admin/risk` list + detail
- HighRiskOverrideSheet + EvidenceUploadDialog dialogs
- IBG 4-step wizard with Readiness gate
- Funding linked-job change + evidence dialog swap
- Amendment success state with reference
- Audit RBAC LockedCard
- `/properties/new`, system config Installation/System tabs
- Reports, Team settings, Job evidence tab, Permissions library inline grants, public `/verify`

Skipped or scaffolded only — proposing to finish in this pass:
- Reports CSV export currently stubs a row; wire it to actually download a real CSV blob.
- Team capabilities matrix exists but lacks invite/remove flow → connect to `InviteDialog`.
- Job evidence checklist progress doesn't yet gate the IBG wizard's `evidence` readiness check (it should — current check just counts funding evidence).
- Risk override expiry isn't surfaced anywhere outside the sheet — add a banner on `/dashboard` for the acting org when an override is active.
- `verify` page: add a "Not found" state and a "Report misuse" link.

## F. Implementation order (single pass)

1. Bump store key → `:v2`, add defensive merge.
2. Sidebar: Reports → `showLockedIfNot`; remove History row; redirect `/ibg/history`.
3. Repository: add internal History tab.
4. Reports: full restyle per section C.
5. Risk list + detail: restyle + Review feedback.
6. Wire the 5 finishing items in section E.
7. Update `DESIGN_SPEC.md` Section 8 with the changes.

After this I'll click through every changed page in the preview and confirm clean.

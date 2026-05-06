
# Renewably × ElevenLabs editorial pass

The goal isn't to copy ElevenLabs — it's to inherit its **calm, magazine-like restraint** and apply it to Renewably, with **#0F47A8 brand blue staying as the only CTA color** (replacing ElevenLabs' ink pill). Brand blue is non-negotiable; everything else is up for refinement.

## What changes (and what doesn't)

| Area | Today | After |
|---|---|---|
| Canvas | pure white `#FFFFFF` | warm off-white `#F5F5F5` with `#FAFAFA` alt band, cards stay pure white |
| Primary CTA | brand-blue pill (correct) | **unchanged** — brand blue stays, but applied with ElevenLabs restraint (one per view) |
| Display type | Inter, all weights | **Instrument Serif** at **weight 400** for h1/h2 (it only ships 400 + italic), with negative tracking (-0.02 → -0.03em) |
| Body type | Inter 400 | Inter 400/500 with **+0.16px letter-spacing** (editorial dialect) |
| Hero atmosphere | flat | **pastel gradient orbs** — mint/peach/lavender/sky/rose — drift behind hero copy and on landing/dashboard hero cards. Pure decoration, never on CTAs |
| Section rhythm | mixed | unified **96px** between bands |
| Card radius | mixed (lg) | `rounded-2xl` (16px) for feature cards, `rounded-3xl` (24px) for atmospheric/orb cards |
| Elevation | several shadow tiers | **hairline + single soft drop** (`0 4px 16px rgba(0,0,0,0.04)` on hover only) |
| Badges/pills | mixed | uppercase 12/600 +0.96px tracking on `surface-strong` |
| Inputs | mixed | 44px height, `rounded-md` (8px), 1px hairline, focus → 2px ink |

### A note on Instrument Serif

Instrument Serif is a single-weight (400 + italic) display serif — slightly more romantic and condensed than EB Garamond, with a wider counter and elegant italic. It sits closer to Waldenburg Light's editorial voice than Garamond does. We'll use the **italic cut sparingly** for accent words inside hero headlines (e.g. "Built for *trust*") — that's the one place it earns its keep.

## Brand-blue rule (re-stated)

- `primary` variant = **brand-blue pill** for the page's signature action (Issue IBG, Save changes, Connect HubSpot, Retry webhook, Invite member…).
- One brand-blue button per view header. Inline secondary actions stay `secondary` (bordered) or `ghost` (text). Table row actions stay `icon`.
- Brand-blue tint `#E8F0FC` continues to back informational notices and active workspace switcher.

## Design tokens (`src/styles.css`)

```text
--background:  #F5F5F5   (canvas, was #FFFFFF)
--surface:     #FAFAFA   (alt band)
--card:        #FFFFFF   (pure white card stays)
--ink:         #0C0A09   (warm near-black, replaces neutral)
--ink-muted:   #777169   (warm muted)
--border:      #E7E5E4   (warm hairline)
--border-strong:#D6D3D1
--brand-blue:  #0F47A8   (UNCHANGED)
--brand-blue-tint:#E8F0FC (UNCHANGED)

/* New atmospheric tokens */
--orb-mint:    #A7E5D3
--orb-peach:   #F4C5A8
--orb-lavender:#C8B8E0
--orb-sky:     #A8C8E8
--orb-rose:    #E8B8C4

/* Type */
--font-display: "Instrument Serif", "Times New Roman", serif;
--font-sans:    "Inter", system-ui, sans-serif;
```

Dark mode keeps brand blue, swaps canvas for warm `#0C0A09`.

## New / refined components

1. **`<GradientOrb variant="mint|peach|lavender|sky|rose" />`** — absolute-positioned soft radial blur, used behind page headers on Dashboard, IBG repository hero, marketing pages.
2. **`<HeroCard>`** — large `rounded-3xl` card with optional gradient orb behind centered display copy.
3. **`<PageHeader>`** — display copy in Instrument Serif 400 at 36–48px, eyebrow stays uppercase Inter 12/600 with +0.96px tracking.
4. **`<Section>`** — wrapper enforcing 96px vertical rhythm.
5. **`<Badge>`** uppercase variant — caption-uppercase token.
6. **`<Button>`** — no variant changes; only padding bump to match 40px target height (`size="md"` → `h-10 px-5`). Pill geometry stays.
7. **`Input`** — height bumped to 44px, focus ring ink 2px instead of brand color halo (lets brand-blue stay scarce).

## Where the editorial pass actually lands

Pass order:

1. **Tokens + Button + Input + PageHeader + Section** (foundation, ripples through every page automatically).
2. **Auth screens** (`sign-in`, `sign-up`, `forgot-password`) — full ElevenLabs hero treatment with one orb.
3. **Marketing** (`/`, `/pricing`) — hero band with mega Instrument Serif display + orb, italic accent word, 96px rhythm, pricing tier cards inverted on dark band for the featured tier.
4. **Dashboard** — display headline ("Good afternoon, Aamir"), single orb behind greeting, KPI tiles redrawn as `rounded-2xl` hairline cards.
5. **IBG Repository / History headers** — orb behind title, badges switched to uppercase pills.
6. **Settings & Admin index pages** — display titles, eyebrow labels, but interior tables stay dense and functional (no orbs in data tables).

Detail pages (Stripe event, Audit, Amendment, Company) inherit the new PageHeader for free.

## Out of scope (deliberately)

- No animation work beyond what exists (orbs are static blurs).
- No change to admin tables, drawers, or sheets — they already read as expert tools.
- Brand green stays only inside the IBG-issued celebration burst.
- No logo / wordmark redesign.

## Files touched

- `src/styles.css` — token swap (canvas, ink, hairline, Instrument Serif, orb palette).
- `index.html` — add Instrument Serif `<link>` from Google Fonts (400 + italic).
- `src/components/ui/button.tsx` — height/padding tweak only.
- `src/components/ui/input.tsx` — height + focus ring tweak.
- `src/components/app/page-header.tsx` — display font, eyebrow tracking.
- **New** `src/components/app/gradient-orb.tsx`, `src/components/app/section.tsx`, `src/components/app/hero-card.tsx`.
- Pages: `index.tsx`, `pricing.tsx`, `sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx`, `_authed.dashboard.tsx`, `_authed.ibg.repository.tsx`, `_authed.ibg.history.tsx` — apply new header / orb / section.

Approve and I'll execute it as one cohesive pass.

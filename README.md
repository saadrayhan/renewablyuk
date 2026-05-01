# Renewably UK

> Operational and compliance platform for UK Net Zero installation companies.
> IBG generation, job lifecycle, funding match, scheme submissions — built for installers.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff4d8d)](https://lovable.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-ef4444)](https://tanstack.com/start)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## What it is

Renewably UK is a single workspace for the entire post-sale lifecycle of a domestic
energy-efficiency installation: from customer record → property → job → IBG (Installer
Backed Guarantee) → funding scheme match → submission. It replaces a stack of spreadsheets,
PDFs, and email threads with a permission-aware, audit-logged record system that mirrors
how UK Net Zero schemes (ECO4, GBIS, BUS) actually want evidence packaged.

The product targets four operating tiers — **Installer · Access** (free standalone IBG
generator), **Installer · Operate** (full ops + funding), **Operator** (granular
delegated permissions), and **Read-Only** — under one **Admin** role that controls
onboarding, permissions, amendments, and audit.

The current build is a **design-mode prototype**: every screen, state, and interaction
in the IA is wired against an in-memory mock store that persists to `localStorage`, so
flows survive a refresh and feel real without a backend.

## Screenshots

> _Add screenshots from `/dashboard`, `/ibg/repository`, `/funding/match`, and
> `/admin/permissions` here._

```
┌────────────────────────────────────────────────────────────┐
│  ▣  Renewably UK              Good morning, Makibul        │
│ ─── ─────────────────────────────────────────────────────  │
│ Home                                                       │
│ Projects     [ Tile ] [ Tile ] [ Tile ] [ Tile ] [ Tile ]  │
│ IBG          ─────────────────────────────────────────     │
│ Funding      Latest activity                               │
│ Submissions  • Issued IBG-4231 …                           │
│ Settings                                                   │
└────────────────────────────────────────────────────────────┘
```

## Tech stack

| Layer       | Choice                                       |
|-------------|----------------------------------------------|
| Framework   | TanStack Start v1 (React 19, SSR-capable)    |
| Bundler     | Vite 7                                       |
| Routing     | TanStack Router (file-based, code-split)     |
| Styling     | Tailwind CSS v4 (CSS variables, OKLCH)       |
| UI kit      | shadcn/ui primitives + bespoke `app/*`       |
| Icons       | lucide-react                                 |
| Toasts      | sonner                                       |
| Backend     | Lovable Cloud (Supabase) — wired, not used   |
| Mock data   | In-memory store + `localStorage` persistence |

## Getting started

```bash
# 1. Clone
git clone <your-repo-url>
cd renewably-uk

# 2. Install
bun install            # or pnpm/npm/yarn

# 3. Develop
bun dev                # http://localhost:5173

# 4. Build
bun run build
```

> Requires Node 20+ (or Bun 1.1+).

## Project structure

```
src/
├── routes/                       # File-based routing
│   ├── __root.tsx                # Shell: <html>, <head>, providers
│   ├── _authed.tsx               # Authenticated layout (sidebar + topbar)
│   ├── _authed.dashboard.tsx     # Role-aware home
│   ├── _authed.ibg.*             # IBG generator + repository + amendments
│   ├── _authed.funding.*         # Match Hub + projects + evidence
│   ├── _authed.admin.*           # Users, audit, permissions, onboarding
│   ├── sign-in.tsx, sign-up.tsx  # Auth screens
│   └── pricing.tsx               # Public pricing
├── components/
│   ├── app/                      # App-specific composites
│   │   ├── shell/                # Sidebar, topbar, popovers
│   │   ├── data-table.tsx        # Generic record list
│   │   ├── state-pill.tsx        # 50+ semantic state chips
│   │   └── audit-timeline.tsx    # Right-rail history
│   └── ui/                       # shadcn primitives
├── lib/
│   ├── auth-context.tsx          # Mock auth (resumable)
│   ├── dev-role.tsx              # Role + permission switcher
│   ├── rbac.ts                   # Permission catalogue + can()
│   └── mock/                     # types · seed · queries · store
├── styles.css                    # Design tokens (light + dark, OKLCH)
└── router.tsx                    # Router instance + error boundary
```

## Roles & access tiers

| Role                | Capabilities                                                    |
|---------------------|-----------------------------------------------------------------|
| Admin               | Everything: users, permissions, onboarding queue, audit, config |
| Operator            | Granular permissions assigned by an Admin from the library      |
| Installer · Operate | Full ops: jobs, IBG, funding, submissions, settings             |
| Installer · Access  | Standalone IBG generator + last 5 IBGs + Upgrade card           |
| Read-Only           | Browse-only across records, no actions                          |

Switch roles in dev with the floating **DevSwitcher** (bottom-right).

## Available routes

| Path                              | Purpose                                  |
|-----------------------------------|------------------------------------------|
| `/`                               | Marketing landing                        |
| `/sign-in`, `/sign-up`            | Auth                                     |
| `/onboarding`                     | 6-step company application wizard        |
| `/dashboard`                      | Role-specific home                       |
| `/customers`, `/customers/$id`    | CRM record                               |
| `/properties`, `/properties/$id`  | Property record                          |
| `/jobs`, `/jobs/$id`              | Job hub (9-state machine)                |
| `/ibg/new`                        | IBG issue wizard                         |
| `/ibg/repository`                 | Searchable IBG store                     |
| `/ibg/$id`, `/ibg/$id/amendment`  | IBG detail + amendment request           |
| `/funding/match`                  | Scheme Match Hub (scored)                |
| `/funding`, `/funding/$id`        | Funding projects                         |
| `/submissions`, `/submissions/$id`| Scheme submissions                       |
| `/settings/*`                     | Profile, notifications, integrations…    |
| `/admin/*`                        | Admin-only modules                       |

## Roadmap

- [ ] Wire mock store to Lovable Cloud (Supabase) tables
- [ ] Real auth: email + Google OAuth
- [ ] Document storage on Cloud Storage buckets
- [ ] Per-scheme PDF certificate generation
- [ ] Public-facing scheme verification endpoint

## Contributing

PRs welcome. For substantial changes, open an issue first.

1. Fork the repo
2. Branch: `git checkout -b feat/your-feature`
3. Commit, push, open a PR

## Design spec

The full pixel-level spec — tokens, components, page anatomies, state machines, and
embedded source — lives in **[`DESIGN_SPEC.md`](./DESIGN_SPEC.md)**. Designers, devs,
and AI no-code builders should treat it as the single source of truth for visual and
behavioural fidelity.

## License

MIT © Renewably UK

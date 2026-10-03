# LetsHyre — Frontend

The web frontend for the LetsHyre AI hiring platform. One app serves three audiences:
**candidates** (job seekers), **employers** (hiring teams), and public marketing/legal
pages — the last of which are localized into 19 languages.

---

## Tech Stack

| Area | Choice |
|---|---|
| Framework | React 19 |
| Routing / meta-framework | React Router 8, **framework mode**, file-based routing (`app/routes/`) |
| Rendering | `ssr: false` — client-rendered, with public marketing/legal pages prerendered to static HTML per locale at build time |
| Build tool | Vite 7 |
| Server state | TanStack React Query |
| Client state | Zustand (`app/features/<feature>/store/`) |
| Forms + validation | React Hook Form + Zod (`app/features/<feature>/schemas/`) |
| HTTP | Axios (`app/services/`) |
| Styling | Tailwind CSS v4 (`@theme` token system) — utility classes written inline in JSX, no CSS modules or route stylesheets |
| UI primitives | shadcn/ui (`app/components/ui/`), Radix underneath |
| i18n | i18next / react-i18next, 19 locales, namespaced + lazily-loaded catalogs |
| Animation | Framer Motion |
| Tour/onboarding | react-joyride (employer dashboard product tour) |
| Payments | Razorpay (employer credit purchases) |
| Hosting | nginx on AWS EC2 serving static `build/client` (`deploy/nginx.conf`) |

Language: JavaScript (JSX). No TypeScript — `jsconfig.json` provides path-alias
intellisense only, and `@react-router/dev` generates route types at build time
(`npm run typegen`).

Package manager: **pnpm** (pinned via `packageManager` in `package.json`).

---

## Prerequisites

- **Node.js 20+**
- **pnpm** (`corepack enable` will pick up the pinned version automatically)
- A `.env` file (see [Environment variables](#environment-variables))

---

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Create your .env
cp .env.example .env
# fill in VITE_API_BASE_URL

# 3. Start the dev server (http://localhost:5173)
pnpm dev
```

---

## Environment variables

Defined in `.env` (git-ignored). Vite only exposes variables prefixed with `VITE_`
to client code.

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL for the backend API |
| `VITE_ENV` | Required: `production`, `staging` or `development`. Only `production` gets the indexable `robots.txt` and the Meta Pixel |
| `VITE_SITE_URL` | Canonical domain for page meta and the sitemap. Required in production |
| `VITE_META_PIXEL_ID` | Meta Pixel ID. Required in production |

`pnpm build` checks these first (`scripts/check-production-env.mjs`) and stops if
`VITE_ENV` is missing or a production build lacks the site URL or pixel ID. The
post-build scripts read the same `.env` files as Vite (`scripts/lib/env.mjs`).

---

## Available scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Start the dev server with HMR |
| `pnpm build` | Production build (prerender + client bundle), then generate the sitemap and verify SEO output |
| `pnpm build:ci` | CI build: i18n key-parity check → build (with retry) → i18n bundle-size budget check → sitemap → SEO verify |
| `pnpm start` | Serve a production build via `react-router-serve` |
| `pnpm preview` | `vite preview` over the built output |
| `pnpm typegen` | Generate React Router's route types |
| `pnpm lint` | ESLint over the whole project |
| `pnpm test` | Vitest unit + component suite (single run) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:coverage` | Single run with the coverage thresholds enforced (what CI runs) |
| `pnpm sitemap` | Regenerate `sitemap.xml` standalone |
| `pnpm verify:seo` | Standalone SEO-output verification |
| `pnpm verify:i18n-parity` | Standalone i18n key-parity check (all locales vs. English) |
| `pnpm optimize:images` | Re-encode `app/assets/*.png|jpg` to capped, quality-80 WebP; originals move to `app/assets/_source/`. Dry-run by default — pass `--apply` to write |

---

## Project structure

```
app/
├── routes/           File-based route modules (React Router framework mode — see below)
├── features/         One folder per feature, owning its whole vertical slice:
│                     screens, components, hooks, services, schemas, store, lib
│   ├── employee/          Candidate app
│   ├── employer/          Employer app (payments included)
│   ├── about|contact|home|legal|…  Public marketing and policy pages
│   ├── candidate-profile/ Candidate presentation both roles render
│   ├── scorecard/         Scorecard view both roles render
│   └── common/            Cross-role screens (the chatbot)
├── components/       Only what two or more features share
│   ├── ui/            shadcn/ui primitives — compose from these before writing anything custom
│   ├── layout/        Chrome shared across roles (RootLayout, PublicLayout, Navbar, Footer, LogoutModal)
│   ├── auth/          Shared auth-flow chrome (AuthShell, wizard steps, …)
│   ├── common/        Small shared widgets (AppLanguageSwitcher, Pagination, FormSelect, Panel)
│   └── icons/         Shared icon set
├── i18n/              Locale config, catalog loading, and the message catalogs (see below)
├── loaders/           Route-loader building blocks (requireAuth, catalogLoader, prefetch)
├── services/          The axios client and the few endpoints more than one feature calls
├── hooks/             The few hooks more than one feature uses
├── lib/               Shared non-UI helpers: cn(), query client + keys, SEO/route meta, auth storage, backend-error resolvers, toast
├── styles/            tailwind.css (@theme token system) + global.css + fonts.css
├── test/              Vitest setup + shared test helpers (tStub, query wrapper)
├── constants.js       Roles, role→route map, route-guard allow-lists
├── routes.ts          `export default flatRoutes()` — the only thing wiring app/routes/ into the router
└── root.jsx           App shell: providers, <Outlet/>, global error boundary
```

Path alias (`jsconfig.json` + Vite): `@/*` → `app/*`. It is the only one — keep
imports on it so editor resolution and the Vite build never disagree.

**Where a file goes.** Default to the feature that uses it. A module only earns
a place in `components/`, `hooks/`, `lib/` or `services/` once a second feature
needs it, and moving it there is a deliberate call, not a reflex — the shared
layer is the part of the app nobody can change safely, so it should stay small.
Those four folders are flat by design: they are already "the shared stuff", so
a `common/` bucket inside them would name nothing.

Features may not reach into each other. `scripts/check-feature-boundaries.mjs`
fails the build on a cross-feature import, with a short list of features
(`common`, `candidate-profile`, `scorecard`) any feature may import because both
roles render them. `scripts/check-naming.mjs` enforces the filename grammar:
`<domain>.service.js`, `<domain>.schema.js`, `use<Name>.js`, PascalCase
components, kebab-case directories.

---

## Routing architecture

Routes are defined by the **filesystem**, not a central route-config file —
`app/routes.ts` is just `export default flatRoutes()`. File names encode nesting
via dots, and a **leading underscore marks a pathless layout segment** (a route
that wraps its children but contributes no URL segment itself).

Three independent route trees live side by side:

- **`_publicLang.$lang.*`** — public marketing/legal pages under a `/:lang` prefix
  (home, about, terms, policy, refund-policy, download, how-it-works-interview).
  `_publicLang.$lang.jsx` is the shared layout: it validates the locale, wraps
  children in the correct `I18nextProvider`, and renders `PublicLayout` (Navbar +
  `<Outlet/>` + Footer) **once**. It deliberately does *not* share the `_public`
  filename prefix with the next tree — `flatRoutes()` auto-nests any
  `_public.*`-prefixed file under a parent named `_public`, and an earlier bug in
  this app came from two such layouts nesting and rendering `PublicLayout` twice.
- **`_public.*`** — public pages *without* a `/:lang` segment. Only
  `/shared-scorecard/:shareId` lives here. Not prerendered, since there's no
  locale in the URL to prerender against; it renders under the app's
  ambient/detected locale.
- **`employee.*` / `employer.*`** — the authenticated dashboards. Each has one
  parent route file (`employee.jsx` / `employer.jsx`) whose `clientMiddleware`
  runs `requireAuth({ allowedRoles: ... })` before every child loader, so child
  routes don't re-check auth individually.

Route-level auth guards live in `app/loaders/requireAuth.js`: `requireAuth` reads
the persisted user record (`app/lib/getUser.js`, backed by `localStorage`),
redirects unauthenticated or wrong-role visitors, and additionally forces
incomplete employer profiles onto `/employer/onboarding` (and completed ones off
of it). `requireGuest` is the inverse, used on sign-in/register routes to bounce
an already-authenticated visitor to their dashboard.

---

## i18n architecture

**19 locales** (`app/i18n/config.js`): `en hi fr ja ar te ta es nl ru kn ml ur bn de
pt it ko id`. `ar` and `ur` are RTL. `LOCALES` is the single source of truth;
`PRERENDER_LOCALES` and `LEGAL_READY_LOCALES` derive from it via (currently empty)
exclusion sets, so a locale can be staged into the router before its marketing
pages are prerendered or its legal pages are translation-reviewed, without three
separately-hand-maintained lists.

**Catalogs** live in `app/i18n/messages/<locale>/<namespace>.json` — one JSON file
per namespace (`common`, `home`, `about`, `auth`, `employer`, `employee`,
`dashboard`, `scorecard`, `legal`, `onboarding`, …), so a route only downloads the
translation JSON it actually needs. Each file builds to its own chunk
(`i18n-<locale>-<namespace>`), and each locale has a small file map
(`messages/<locale>/index.js`) so the browser never downloads the list of every
locale's files.

**Loading a route's catalogs** goes through one factory,
`app/loaders/catalogLoader.js`: every route declares `export const handle =
{ i18n: [...] }` with the namespaces it renders and `export const clientLoader =
catalogLoader(handle.i18n)`. Layouts list their own copy, pages add theirs. The
factory resolves the locale — `params.lang` when valid, otherwise the visitor's
stored locale. Client loaders don't run during hydration, so `entry.client.jsx`
reads the same handles from the matched route modules to load a prerendered
page's copy first, and `preload-catalogs.mjs` adds preload hints for them.
`scripts/check-i18n-routes.mjs` follows each route's imports and fails the build
when a namespace it renders isn't in its handles.

**Plurals** use i18next's native `_one`/`_other`/etc. suffix convention (resolved
via `Intl.PluralRules`), never a hand-rolled two-key JS ternary — a ternary can
only ever express English's two plural forms, and several of this app's locales
need a different count: Japanese/Korean/Indonesian have exactly one form,
Russian has four (`one`/`few`/`many`/`other`), Arabic has six
(`zero`/`one`/`two`/`few`/`many`/`other`).

**CI enforcement:** `scripts/check-i18n-parity.mjs` flattens every locale's
catalogs against English and fails the build (`pnpm build:ci`) if any locale is
missing a key — comparing plural-suffixed keys by their base name, since locales
legitimately carry different plural forms than English.
`scripts/check-i18n-budget.mjs` separately fails the build if any per-locale
catalog chunk exceeds its size budget, catching an accidental eager import that
would undo the lazy-loading split.

---

## Auth & roles

Auth state is a single `localStorage` record (`getUser()` /
`app/lib/getUser.js`) with the shape `{ role, ...userFields }`. Roles
(`app/constants.js`) are the exact, case-sensitive strings the API returns —
`"Candidate"` and `"Employer"` — never hand-written string literals elsewhere in
the app. `ROLE_HOME` maps each role to its dashboard root, and route guards
consult the `EMPLOYER_ONLY` / `EMPLOYEE_ONLY` allow-lists.

---

## Design system

All colors, typography, spacing, breakpoints, radii, and shadows live in the
`@theme` block of `app/styles/tailwind.css`. Styling is Tailwind utility classes
written inline on JSX elements — no CSS modules, no per-component stylesheets.
A class string is only hoisted into a named constant when it's genuinely reused
across multiple elements in the same file; a single-use class list stays inline.

**Read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) before writing new styles** — it
covers the full token catalogue, the responsive breakpoint system, fluid
typography, and the rules for adding new tokens.

**UI components:** compose from `app/components/ui/` (shadcn/ui primitives) before
reaching for a custom-styled `<div>`. If no primitive covers what's needed,
that's a deliberate decision to raise, not something to route around silently.

---

## Testing

Vitest + Testing Library, run by `pnpm test` and gated in CI via `pnpm test:coverage`.
Specs sit beside the code they cover as `*.test.js` / `*.test.jsx`; shared setup and
helpers live in `app/test/`. `vitest.config.js` is deliberately standalone because the
React Router plugin wants a route manifest these unit tests don't have.

HTTP is faked by swapping the axios adapter (`api.defaults.adapter`) rather than
stubbing each service, so the real interceptor chain — queueing, retry, token
rotation — is what runs under test. Schema factories take `tStub` from
`app/test/helpers`, which returns the key itself, so a test asserts *which* message
the schema picked rather than just that it rejected.

Coverage is ranked by risk, not by percentage: the Zod schemas, the backend-error
resolvers behind every auth toast, the credit-purchase cache invalidation, and the
unlock modal that spends an employer's credits. The thresholds in `vitest.config.js`
are a ratchet pinned to what the suite covers today — raise them as coverage grows,
never lower them to make a red run go green.

Wide areas remain untested. A route × locale smoke test is still the biggest gap, and
would have caught both the duplicate navbar/footer bug and the untranslated
legal-page bug this codebase has already shipped once.

---

## Deployment

`ssr: false` in `react-router.config.js` — the app is client-rendered, with
public marketing/legal pages **prerendered** to static HTML per locale
(`prerenderPaths()` in `app/i18n/config.js` enumerates every `/:lang/<page>`
combination). `pnpm build` produces `build/client/`, served as static hosting.

Production runs on AWS EC2 behind an ALB, which terminates TLS. nginx serves a
copy of `build/client` from `/var/www/letshyre`. `deploy/nginx.conf` is the
server block and `deploy/letshyre-headers.conf` goes in `/etc/nginx/snippets/`.
It 301s `/` to `/en` and strips trailing slashes, serves prerendered pages per
locale (falling back to `/en/<page>` for pages not translated yet, like
pricing), gives client-only routes the SPA shell, and returns a real 404 for
anything else, including missing `/assets/*`. The ALB health check uses
`/health`. A new top-level client route has to be added to the client-route
`location` in `deploy/nginx.conf`.

One-time setup on the server: create `.env.production` in the repo root
(git-ignored, loaded by Vite for every build):

```bash
VITE_ENV=production
VITE_SITE_URL=https://letshyre.ai
VITE_API_BASE_URL=<production API URL>
VITE_META_PIXEL_ID=<pixel id>
```

To deploy:

```bash
git pull && pnpm install --frozen-lockfile && pnpm build
sudo rsync -a build/client/assets/ /var/www/letshyre/assets/
sudo rsync -a --delete --exclude /assets/ build/client/ /var/www/letshyre/
```

Assets are copied first and never deleted, so open tabs can still load the old
chunks. There's nothing to restart. Don't put a Node server (`pnpm start`, `vite preview`) behind nginx: it
redirects every page to a trailing-slash URL, which breaks the canonical and
hreflang tags.

Then check the live site the way Google sees it:

```bash
pnpm verify:live
```

It fails if any sitemap URL redirects, the `/` and trailing-slash redirects or
the 404s are missing, a client route doesn't get the shell, `robots.txt` blocks crawling, or the pixel isn't in the page.

---

## Branching

Coordinate with the team before merging into the production branch — check the
repo's current branch-protection settings and deployment target before assuming
which branch that is, since this has changed across the project's history.

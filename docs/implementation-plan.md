# Implementation Plan: Monorepo Foundation + Marketing App (Phases 0–4)

> Companion to [migration-plan.md](./migration-plan.md), which holds the _what and why_.
> This document is the _how_: ordered, commit-sized steps with files, commands and exit checks.
> Scope: everything up to and including the **marketing app live on letshyre.ai**.
> The app (Phases 5–8) has its own plan: [app-implementation-plan.md](./app-implementation-plan.md).

---

## Working agreement

| Item                | Agreement                                                                                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch              | `migration/monorepo` (created from `main`; `main` = legacy baseline + plan, tag `legacy-baseline`)                                                                                                                                                            |
| Unit of work        | One step = one commit, Conventional Commits (`feat(marketing): …`, `chore(repo): …`). Once a GitHub remote exists, one step = one PR into `migration/monorepo`.                                                                                               |
| CI / CD             | **CI runs locally for now** (git hooks + `pnpm check` / `pnpm test:e2e`). The GitHub Actions workflow is committed but only runs once a remote exists. **CD is deferred** until hosting is decided (no EC2 yet): deploy scripts are written but not wired up. |
| Green rule          | Every commit leaves `pnpm check` (lint + typecheck + test) and `pnpm build` passing. The legacy app keeps building at every step.                                                                                                                             |
| Review gates        | 🔵 = I stop and you review before continuing (3 gates in total).                                                                                                                                                                                              |
| Local env           | Node 24.19 ✅ · pnpm 10.20 ✅ (pinned, upgrade later in its own PR) · Docker ✗ (nginx config tests are skipped locally until Docker Desktop is installed or CI runs on GitHub)                                                                                |
| Code snippets below | Show the **shape** to implement. Final code is verified against the installed versions at implementation time.                                                                                                                                                |

### Step overview

| Step     | Title                                                        | Est.              | Gate                      |
| -------- | ------------------------------------------------------------ | ----------------- | ------------------------- |
| 0.1      | Git baseline + branch                                        | done ✅           |                           |
| 0.2      | SEO + Lighthouse baseline capture                            | 0.5 d             |                           |
| 0.3      | Content inventory                                            | 0.5 d             |                           |
| 0.4      | URL & handoff contract                                       | 0.25 d            | 🔵 1                      |
| 1.1      | Move legacy into `apps/legacy`                               | 0.5 d             |                           |
| 1.2      | Root workspace tooling                                       | 0.5 d             |                           |
| 1.3      | `@workspace/typescript-config`                               | 0.25 d            |                           |
| 1.4      | `@workspace/eslint-config`                                   | 0.75 d            |                           |
| 1.5      | `@workspace/ui` via shadcn CLI                               | 0.5 d             |                           |
| 1.6      | `apps/marketing` skeleton                                    | 0.5 d             |                           |
| 1.7      | shadcn component set                                         | 0.25 d            |                           |
| 1.8      | Test harness (Vitest, Playwright, knip)                      | 0.5 d             |                           |
| 1.9      | Local CI (`pnpm verify`) + dormant GitHub workflow           | 0.5 d             |                           |
| 2.1      | `@workspace/i18n`                                            | 1.5 d             |                           |
| 2.2      | `@workspace/api`                                             | 1 d               |                           |
| 2.3      | `@workspace/analytics`                                       | 0.5 d             |                           |
| 2.4      | `@workspace/blocks`                                          | 1 d               |                           |
| 3.1      | Marketing app shell (i18n data flow, SEO lib, page manifest) | 1.5 d             |                           |
| 3.2      | Header, footer, home hero + 1 section                        | 2 d               | 🔵 2 (design direction)   |
| 3.3–3.11 | Pages                                                        | 7–9 d             |                           |
| 3.12     | 404 + error pages                                            | 0.5 d             |                           |
| 3.13     | Assistant widget (lazy)                                      | 1 d               |                           |
| 3.14     | Translation reuse (key map + migration)                      | 1 d               | 🔵 3 (all pages, English) |
| 4.1      | Post-build pipeline (sitemap, robots, SEO verify)            | 1 d               |                           |
| 4.2      | Playwright suites (smoke, a11y, SEO parity, visual)          | 1.5 d             |                           |
| 4.3      | Lighthouse CI + budgets                                      | 0.5 d             |                           |
| 4.4      | Security headers + CSP                                       | 1 d               |                           |
| 4.5      | Legacy patch: `/employer/billing`                            | 0.5 d             |                           |
| 4.6      | nginx interim config + CI test                               | 1 d               |                           |
| 4.7      | Deploy + rollback scripts (**CD deferred**)                  | 1 d               |                           |
| 4.8      | Staging → UAT → production → monitor                         | 2 d + 7 d monitor |                           |

**Total ≈ 5–6 weeks of engineering**, plus review turnaround and the translation batch.

---

## Phase 0: Preparation

### 0.1 Git baseline ✅ (done)

`git init -b main` → `663120e` legacy snapshot (tag `legacy-baseline`) → `758f28f` migration plan → branch `migration/monorepo`. `.gitattributes` pins LF (Git for Windows has `core.autocrlf=true` system-wide).

**Later (you):** when you create the GitHub repo, add it as a remote (`git remote add origin <url>`, then `git push -u origin main migration/monorepo --follow-tags`). The committed workflow (step 1.9) starts running then. Until that point, everything runs locally.

### 0.2 SEO + Lighthouse baseline

- `tooling/baseline/capture-seo.ts` (run with `node`; Node 24 strips TS types natively):
  fetch `https://letshyre.ai/sitemap.xml`, then for every URL record status, final URL, `<title>`, description, robots, canonical, hreflang map, `og:*`, `twitter:*`, JSON-LD `@type`s and `FAQPage` question count.
  Also probe the redirect contract: `/` → `/en` (301), trailing slash → no slash (301), `/xx/unknown` → 404, `/hi/pricing` → `/en/pricing` (302), client routes → shell + `X-Robots-Tag`.
- Output: `docs/baseline/seo-baseline.json` (committed; step 4.2's parity test diffs against it).
- Lighthouse: `pnpm dlx @lhci/cli collect` on the 11 URLs in the legacy `lighthouserc.json` against production. Scores are summarized in `docs/baseline/lighthouse.md`.
- **Exit:** both files committed. `seo-baseline.json` covers about 170 URLs.

### 0.3 Content inventory

- `tooling/baseline/content-inventory.ts` → `docs/baseline/content-inventory.md`: per page, its namespaces, every English key/value, and a **Decision** column (`keep` / `rewrite` / `drop`).
- I pre-fill decisions: e.g. drop unverifiable claims ("100% AI-Screened", stats tiles), keep legal and policy text verbatim, keep FAQ answers. You confirm.
- **Exit:** inventory committed with proposed decisions.

### 0.4 URL & handoff contract

`docs/baseline/url-contract.md`:

| Link                       | Interim (Phase 4 → 7)                         | Final (after Phase 7)                             |
| -------------------------- | --------------------------------------------- | ------------------------------------------------- |
| Marketing pages            | `letshyre.ai/:lang/<page>` (unchanged)        | same                                              |
| Log in                     | `letshyre.ai/get-started`                     | `app.letshyre.ai/sign-in`                         |
| Get started / Start hiring | `letshyre.ai/employer/register`               | `app.letshyre.ai/register?role=employer`          |
| Apply / candidates         | `letshyre.ai/employee/register`               | `app.letshyre.ai/register?role=candidate`         |
| Buy plan / top-up          | `letshyre.ai/employer/billing?checkout=<key>` | `app.letshyre.ai/employer/billing?checkout=<key>` |
| Dashboard → pricing        | `/en/pricing` (marketing)                     | `https://letshyre.ai/<lang>/pricing`              |

All marketing → app links come from one module (`apps/marketing/app/lib/app-links.ts`) built from `VITE_APP_URL`, so the Phase 7 switch is a one-variable change.

🔵 **Gate 1:** you approve the content decisions (0.3) and the URL contract (0.4).

---

## Phase 1: Monorepo foundation

### 1.1 Move legacy into `apps/legacy`

`git mv` keeps history. Target layout:

```
apps/legacy/  ← app/ public/ scripts/ package.json eslint.config.js jsconfig.json
                react-router.config.js vite.config.js vitest.config.js components.json
                lighthouserc.json .pa11yci.json DESIGN_SYSTEM.md README.md
                .env.example .env.pseudo  docs/adding-a-feature.md
infra/nginx/  ← deploy/nginx.conf, deploy/letshyre-headers.conf   (legacy configs, replaced in 4.6)
docs/         ← migration-plan.md, implementation-plan.md, security/token-storage.md (stay)
root          ← .gitignore .gitattributes .nvmrc (new workspace files in 1.2)
```

- `apps/legacy/package.json`: `"name": "legacy"`. Scripts unchanged. Remove `packageManager` (root owns it).
- Move your untracked `.env` to `apps/legacy/.env` by hand (git ignores it).
- Delete root `node_modules/`, `build/`, `.react-router/`, `pnpm-lock.yaml`, then `pnpm install` after 1.2.
- Why this works unchanged: legacy scripts resolve paths from their own folder (`path.resolve(__dirname, "..")`), Vite's alias uses the package cwd, and `git log -- <path>` in the sitemap script resolves relative to cwd.
- **Exit:** `pnpm --filter legacy test` green. `VITE_ENV=development pnpm --filter legacy build` green. `pnpm --filter legacy dev` serves `/en`.

### 1.2 Root workspace tooling

| File                              | Content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                    | `private`, `packageManager: pnpm@10.20.0`, `engines.node: ">=24"`, scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `format`, `check` (= `turbo run lint typecheck test`), `ui:drift`                                                                                                                                                                                                                                                                                          |
| `pnpm-workspace.yaml`             | `packages: [apps/*, packages/*, tooling/*]`. **`catalog:`** for shared versions (react, react-dom, react-router, @react-router/*, vite, tailwindcss, @tailwindcss/vite, typescript, zod, @tanstack/react-query, i18next, react-i18next, vitest, @playwright/test, eslint, prettier). `peerDependencyRules.allowedVersions` for `eslint-plugin-react` + `eslint-plugin-jsx-a11y` on ESLint 10. `onlyBuiltDependencies: [esbuild, sharp]`. `minimumReleaseAge: 1440` (24 h supply-chain cool-off) |
| `turbo.json`                      | tasks `build` (`dependsOn: ["^build"]`, outputs `build/**`, `env: ["VITE_*"]`), `typecheck` (`dependsOn: ["^typecheck"]`), `lint`, `test` (outputs `coverage/**`), `test:e2e` (`dependsOn: ["build"]`), `dev` (`persistent`, no cache)                                                                                                                                                                                                                                                          |
| `.nvmrc`                          | `24`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `.editorconfig`                   | utf-8, lf, 2 spaces, final newline                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `.prettierrc` / `.prettierignore` | shadcn template config: no semicolons, double quotes, `trailingComma: es5`, `prettier-plugin-tailwindcss` with `tailwindStylesheet: packages/ui/src/styles/globals.css`, `tailwindFunctions: [cn, cva]`. Ignore `apps/legacy/**` (left as-is)                                                                                                                                                                                                                                                   |
| `lefthook.yml`                    | pre-commit: prettier + eslint on staged files. commit-msg: commitlint. pre-push: `turbo run typecheck --affected`                                                                                                                                                                                                                                                                                                                                                                               |
| `commitlint.config.ts`            | `@commitlint/config-conventional`. Scopes: `repo, ui, blocks, i18n, api, analytics, marketing, app, legacy, infra, docs`                                                                                                                                                                                                                                                                                                                                                                        |

**Exit:** `pnpm install` clean (no peer warnings beyond the allow-listed ones). `pnpm turbo run build --filter legacy` passes.

### 1.3 `packages/typescript-config`

`base.json` (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `moduleResolution: bundler`, `target ES2022`, `erasableSyntaxOnly`), `react-router-app.json` (DOM libs, `jsx: react-jsx`, `types: [vite/client, node]`, `rootDirs` for `.react-router/types`), `library.json`.

### 1.4 `packages/eslint-config`

Flat-config presets exported as `base`, `react`, `reactRouterApp`:

| Plugin                           | Rules (key ones)                                                                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| typescript-eslint                | `strictTypeChecked` + `stylisticTypeChecked`. `consistent-type-imports`                                                                                                                                          |
| react-hooks / react-refresh      | recommended. `only-export-components` (allow route exports `meta`, `loader`, `handle`, `links`, `ErrorBoundary`)                                                                                                 |
| jsx-a11y                         | `strict`                                                                                                                                                                                                         |
| eslint-plugin-boundaries         | element types `route`, `layout`, `feature`, `app-shared` (`components`, `hooks`, `lib`), `package`. Rules from migration-plan §5.2 (routes → feature `index.ts` only, no feature → feature, shared ↛ feature)    |
| eslint-plugin-better-tailwindcss | `entryPoint: packages/ui/src/styles/globals.css`. `no-unregistered-classes`, `no-conflicting-classes`, `no-duplicate-classes`, `no-unnecessary-whitespace`, **`no-restricted-classes`** with: raw palette (`^(bg | text | border | ring | fill | stroke | from | to  | via | outline | decoration | shadow)-(slate | gray | zinc | neutral | stone | red | orange | amber | yellow | lime | green | emerald | teal | cyan | sky | blue | indigo | violet | purple | fuchsia | pink | rose)-\d+`), arbitrary colors (`-\[#`, `-\[rgb`, `-\[oklch`), physical direction (`^-?(ml | mr  | pl  | pr  | left | right)-`, `^text-(left | right)$`, `^rounded-(l | r   | tl  | tr  | bl  | br)-`, `^border-(l | r)-`) |
| eslint-plugin-i18next            | `no-literal-string` (mode `jsx-only`, ignore `className`, `data-*`, `aria-hidden`, `href`, `to`, `type`)                                                                                                         |
| import hygiene                   | `no-restricted-imports`: `axios`, `framer-motion`, `@radix-ui/*` (use `@workspace/ui`), deep `@workspace/*/src/*` imports                                                                                        |

Custom rule (small, in-package): **`no-class-constants`** flags top-level `const X = "…"` string literals that look like Tailwind class lists (≥ 3 tokens matching Tailwind syntax). This enforces D5 ("no variables for Tailwind classes").

**Exit:** the presets have unit tests (RuleTester fixtures: a failing and a passing sample per custom rule and per restricted pattern).

### 1.5 `@workspace/ui` via the shadcn CLI

```bash
# in the scratchpad (outside the repo)
pnpm dlx shadcn@4.21.1 init --template react-router --base base --monorepo --rtl --name lh-scaffold
```

- Copy `lh-scaffold/packages/ui/` → `packages/ui/` **byte-for-byte**, then edit only package metadata (`workspace:*` deps, `catalog:` versions, `typecheck` script, extend `@workspace/typescript-config/library.json`). `src/**` stays untouched.
- `packages/ui/README.md` records the preset (`pnpm dlx shadcn preset resolve` output: style nova, base `base`, neutral, lucide, font Outfit, radius default, rtl true) and the rule: **only the CLI writes to `src/`**.
- `ui:drift` script: for every installed component, `shadcn add <name> --diff`. Non-empty diff → exit 1.
- `CODEOWNERS`: `packages/ui/src/** @<owner>`.
- **Exit:** `pnpm --filter @workspace/ui typecheck` green, `pnpm ui:drift` green.

### 1.6 `apps/marketing` skeleton

Start from the scaffold's `apps/web` and rename:

```
apps/marketing/
  package.json            # name "marketing"; dev on :5173; scripts dev/build/typecheck/lint/test/test:e2e/preview
  components.json         # from scaffold (aliases @/components, ui → @workspace/ui/components)
  react-router.config.ts
  vite.config.ts          # tailwindcss(), reactRouter(); resolve.tsconfigPaths
  tsconfig.json           # extends @workspace/typescript-config/react-router-app.json
  app/root.tsx  app/routes.ts  app/routes/home.tsx  app/styles/app.css  app/lib/env.ts
```

```ts
// react-router.config.ts (skeleton; prerender becomes readiness-driven in 3.1)
import type { Config } from "@react-router/dev/config"
export default {
  ssr: false,
  prerender: { paths: ["/en"], concurrency: 4 },
  routeDiscovery: { mode: "initial" }, // static hosting: no /__manifest endpoint
} satisfies Config
```

```css
/* app/styles/app.css: the only CSS in the app */
@import "@workspace/ui/globals.css";
@source "../../../../packages/blocks/src";
```

`app/lib/env.ts` parses `import.meta.env` with Zod (`VITE_ENV`, `VITE_SITE_URL`, `VITE_APP_URL`, `VITE_API_BASE_URL`, `VITE_META_PIXEL_ID`), so an invalid env fails the build. `.env.example` committed.

**Exit:** `pnpm --filter marketing build` emits `build/client/en/index.html`, and `dev` renders a shadcn `Button` with the default theme.

### 1.7 shadcn component set (run from `apps/marketing`)

```bash
pnpm dlx shadcn@4.21.1 add button badge card separator navigation-menu sheet dropdown-menu \
  accordion tabs table tooltip dialog input textarea label field select sonner skeleton \
  empty spinner breadcrumb avatar scroll-area kbd item
```

**Exit:** components land in `packages/ui/src/components`. `ui:drift` green. Typecheck green.

### 1.8 Test harness

- Vitest per package (`vitest.config.ts`, jsdom for React packages, `@testing-library/jest-dom` setup). Coverage thresholds start at the package's real numbers (ratchet).
- Playwright in `apps/marketing/e2e/`: `playwright.config.ts` builds, then serves `build/client` with a tiny static server that mimics nginx (`e2e/serve.ts`: trailing-slash redirect, `/:lang/<page>/index.html` resolution, 404.html). Projects: chromium, webkit, mobile-chrome. First spec: `/en` renders, has `lang="en"`, `h1`, and passes axe.
- `knip.json` at the root (workspaces aware, ignore `apps/legacy`).

### 1.9 Local CI + dormant GitHub workflow

**Now (local):**

- Root script `pnpm verify` = `turbo run lint typecheck build` → `turbo run test --concurrency=1` → `pnpm ui:drift` → `pnpm knip` → `turbo run test:e2e`. Tests run on their own, one package at a time: under full parallel load the legacy suite times out. This is the same gate CI runs.
- lefthook (step 1.2) enforces format + lint on commit and typecheck on push, so the rules hold even without CI.

**Committed but dormant until a GitHub remote exists:** `.github/workflows/ci.yml`

- Trigger on PR and push to `main` / `migration/**`.
- Jobs: `verify` (pnpm store cache + Turbo cache → `turbo run lint typecheck test build --affected` → `pnpm ui:drift` → `pnpm knip`) → `e2e` (Playwright browsers cached, `turbo run test:e2e --filter marketing`, upload report artifact). The `nginx` job is added in 4.6.
- Concurrency group per ref. Node from `.nvmrc`.

**Exit:** `pnpm verify` green locally. The workflow file passes `actionlint`.

---

## Phase 2: Shared packages

Each package has its own README, a `src/index.ts` (plus subpath `exports`), and ≥ 90% coverage on logic.

### 2.1 `@workspace/i18n`

```
src/
  config.ts          # LOCALES, DEFAULT_LOCALE, RTL_LOCALES, LOCALE_NAMES, LOCALE_ENGLISH_NAMES, OG_LOCALE,
                     # isLocale (type guard), dirFor, localePath: TS port of legacy app/i18n/config.js
  create-i18n.ts     # getI18n(lang): cached per-locale i18next instance (initAsync:false, fallbackLng en,
                     # missing-key reporter), addMessages(lang, messages) idempotent + synchronous
  react.tsx          # <I18nProvider lang messages>, useLocale()
  format.ts          # formatNumber, formatCurrency (INR), formatDate, formatRelative, formatList (Intl, cached)
  locale-cookie.ts   # read/write lh_locale (Domain from config, SameSite=Lax, 1 year)
  pseudo.ts          # pseudo-locale post-processor (dev only)
  node/readiness.ts  # computeReadiness({ localesDir, pages }) → Map<pageId, Locale[]>
  node/checks.ts     # parity, placeholder/ICU consistency, plural categories via Intl.PluralRules, unused keys
  cli.ts             # `lh-i18n check|readiness|report` (bin)
```

- **Typed keys:** each app declares `CustomTypeOptions.resources` from its `en` catalogs, so a wrong key is a type error.
- **Readiness rule:** page P is ready in locale L when every key in P's namespaces exists in L **and** passes placeholder and plural checks. English is ready by definition.
- **Exit:** tests cover the RTL helpers, readiness with fixture catalogs, plural rules for `ar` (6 forms), `ru` (4) and `ja` (1).

### 2.2 `@workspace/api`

```
src/
  http.ts            # createHttpClient({ baseUrl, timeoutMs=15000, retry: GET×2 w/ backoff, getAuthHeader?, onUnauthorized? })
  errors.ts          # ApiError → NetworkError | TimeoutError | HttpError(status, code, backendMessage) | ResponseShapeError
  envelope.ts        # unwrap(schema): parses { success, data, message } → data or throws HttpError
  public/
    contact.ts       # sendContactMessage(input)          POST /commonapp/v1/contact/
    newsletter.ts    # subscribe(email)                   POST /commonapp/v1/stay_updated/
    pricing.ts       # getPublicPlans(), getCreditPrice() GET  /finances/v1/credit_plans/public/, /payment/v1/public/calculate-token-cost/
    desktop-app.ts   # getLatestRelease(os)               GET  /commonapp/v1/desktop_app/:os/latest/
    assistant.ts     # sendAssistantMessage({ message, sessionId })  POST /commonapp/v1/chatbot/chat/
```

- Zod schemas are ported from legacy (`pricing.schema.js`, etc.) and **tightened**: a malformed item is dropped and logged, never rendered.
- Tests use MSW 2 handlers per endpoint (success, `success:false`, 4xx, 5xx, timeout, bad shape).
- **Exit:** no axios anywhere in `packages/` or `apps/marketing` (enforced by lint).

### 2.3 `@workspace/analytics`

- `consent.ts`: `lh_consent` cookie `{ v: 1, analytics: boolean, ts }`, `useConsent()`, `setConsent()`.
- `track.ts`: `pageView(path)` and `track(event, params)`. No-op unless `VITE_ENV=production` **and** consent is granted (if O2 = "no consent needed", the gate is a single config flag).
- `adapters/meta-pixel.ts`: injects `fbevents.js` only after the gate passes, with `autoConfig` off, `disablePushState`, and standard events only, without PII (ported from legacy `metaPixel.js`).
- **Exit:** tests prove nothing loads without consent or outside production.

### 2.4 `@workspace/blocks`

Composites built **only** from `@workspace/ui` + inline Tailwind (semantic tokens):

| Block                           | Notes                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Logo`                          | SVG preferred. **Need from you: logo SVG source**; fallback is the current `logo2.webp`                                         |
| `LanguageSwitcher`              | `DropdownMenu` of native names, `lang` + `dir` per item, marks the current locale, takes `availableLocales` + `hrefFor(locale)` |
| `SkipLink`                      | first focusable element, targets `#main`                                                                                        |
| `NavigationProgress`            | delayed (≥ 300 ms) top progress bar using `useNavigation()`, `role=status`                                                      |
| `ErrorScreen`, `NotFoundScreen` | used by `ErrorBoundary`s in every app                                                                                           |
| `ConsentBanner`                 | non-modal, keyboard reachable, "Reject" and "Accept" equally prominent                                                          |
| `ThemeProvider`                 | forced `light` today; the `.dark` class mechanism is ready for a later toggle                                                   |

**Exit:** each block has a component test (role queries + axe) and renders correctly with `dir="rtl"`.

---

## Phase 3: Marketing app

### 3.1 App shell: data flow, SEO, page manifest

**Page manifest** is the single source of truth for routes, namespaces, prerender, sitemap and OG images:

```ts
// app/lib/pages.ts (pure data, importable from react-router.config.ts and scripts)
export const PAGES = {
  home: { path: "", namespaces: ["home"], og: "home" },
  pricing: { path: "/pricing", namespaces: ["pricing"], og: "pricing" },
  interview: {
    path: "/how-it-works-interview",
    namespaces: ["interview"],
    og: "how-it-works-interview",
  },
  download: { path: "/download", namespaces: ["download"], og: "download" },
  contact: { path: "/contact", namespaces: ["contact"], og: "contact" },
  about: { path: "/about", namespaces: ["about"], og: "about" },
  terms: { path: "/terms", namespaces: ["legalTerms"], og: "terms" },
  privacy: { path: "/policy", namespaces: ["legalPolicy"], og: "policy" },
  refund: {
    path: "/refund-policy",
    namespaces: ["legalRefund"],
    og: "refund-policy",
  },
} as const satisfies Record<string, PageDef>
export const LAYOUT_NAMESPACES = ["common", "seo"] as const
```

**Routes** (explicit, typed):

```ts
// app/routes.ts
export default [
  route("404", "routes/not-found.tsx"),
  layout("layouts/site-layout.tsx", [
    ...prefix(":lang", [
      index("routes/home.tsx"),
      route("pricing", "routes/pricing.tsx"),
      route("how-it-works-interview", "routes/interview.tsx"),
      route("download", "routes/download.tsx"),
      route("contact", "routes/contact.tsx"),
      route("about", "routes/about.tsx"),
      route("terms", "routes/terms.tsx"),
      route("policy", "routes/privacy.tsx"),
      route("refund-policy", "routes/refund.tsx"),
    ]),
  ]),
] satisfies RouteConfig
```

**Copy is route data.** This is a deliberate change from legacy, and it removes the hydration gate in `entry.client`, the `preload-catalogs` script and the i18n chunk-splitting config:

- `app/lib/messages.server.ts`: `loadMessages(lang, namespaces)` reads `app/locales/<lang>/<ns>.json` via `import.meta.glob`. The `.server` suffix guarantees it never reaches the client bundle.
- The `site-layout` `loader` returns `{ lang, messages: common + seo }`. Each page's `loader` returns its own namespaces. With `ssr: false`, **loaders run only at build time**: the copy is embedded in the prerendered HTML, and client-side navigation fetches the matching `.data` file (nginx already serves `*.data`).
- `site-layout` collects `messages` from `useMatches()` and calls `addMessages()` synchronously before rendering children, then provides `I18nProvider`. `shouldRevalidate` only re-runs the layout loader when `params.lang` changes.
- `meta()` reads translations from `matches` (helper `metaT(matches, ns)`), so titles always match the copy on the page.

**Prerender = readiness.** In `react-router.config.ts`: `paths: readyPaths(PAGES, computeReadiness(...))`, plus `"/404"`.

**SEO lib** `app/lib/seo/`: TS port of legacy `seo.js` (`buildMeta`, `organizationSchema`, `websiteSchema`, `webPageSchema`, `breadcrumbSchema`, `faqSchema`, `softwareApplicationSchema`). hreflang comes from readiness, not a hard-coded list.

**Root** (`root.tsx`): `<html lang dir>` from the matched `:lang` (fallback `en`), Outfit woff2 `preload` (Latin subset, via `?url` import), favicons and manifest, `SkipLink`, `NavigationProgress`, `QueryClientProvider`, `Toaster`, `ConsentBanner`, analytics page views, `ErrorBoundary` → `ErrorScreen`.

**Exit:** `/en` and `/ar` build with the correct `lang`/`dir`, title and description from the catalog, canonical and hreflang. The copy is visible in raw HTML (`curl` test) and switching language client-side works.

### 3.2 Header, footer, home hero + one section → 🔵 Gate 2

| Piece                     | Spec                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layouts/site-header.tsx` | Logo · nav (Product sections, AI interview, Pricing, About, Contact) · `LanguageSwitcher` · "Log in" (ghost) · "Get started" (primary). Collapses to a `Sheet` by **measured width** (`ResizeObserver`, ported logic) so long translations never overflow. Sticky, `bg-background/95` with border on scroll.                                                                 |
| `layouts/site-footer.tsx` | 4 link columns (Product, Candidates, Company, Legal), language switcher, social links, © line. `<footer>` landmark.                                                                                                                                                                                                                                                          |
| `features/home` (partial) | Hero: left-aligned headline (`text-4xl sm:text-5xl lg:text-6xl`, `text-balance`), one-sentence value prop, primary CTA (employer) + secondary link (candidates). On the right, a **live scorecard preview built from `Card`, `Badge`, `Progress`-style bars and `Table`** (not an image), with representative demo data. Section 2: "How it works" as a numbered 3-step row. |

I run the dev server and send you screenshots at 360, 768, 1280 and 1920 px (en + ar).

🔵 **Gate 2: you approve the visual direction** (or we iterate here, before any other page is built).

### 3.3–3.11 Pages

Each page follows the same recipe:

1. `features/<page>/`: `components/`, `<page>-page.tsx`, `<page>.meta.ts`, `index.ts`, plus `services`/`queries`/`mutations`/`schemas`/`lib`/`hooks` only when the page has that concern.
2. `app/routes/<page>.tsx`: `loader` (messages), `meta`, `handle`, default export from the feature `index.ts`.
3. `app/locales/en/<ns>.json`: new copy (from the approved inventory).
4. Tests: unit for `lib`/`schemas`, component tests for interactive pieces, e2e smoke + axe.

| Step     | Page                     | Feature folder highlights                                                                                                                                                                                    | Data                                                                               | JSON-LD                                                 |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 3.3      | Home (rest)              | `scorecard-preview`, `how-it-works`, `for-candidates`, `pricing-teaser`, `home-faq`, `final-cta`                                                                                                             | static                                                                             | Org, WebSite, SoftwareApplication, FAQPage, WebPage     |
| 3.4      | Pricing                  | `plan-card`, `plan-grid`, `plan-comparison-table` (`<table>` with `<caption>`, `scope`), `top-up-packs`, `pricing-faq` · `queries/pricing.queries.ts` (`publicPlans`, `creditPrice`) · `lib/checkout-url.ts` | client fetch via `@workspace/api`; skeleton matches layout; error state with retry | FAQPage, Breadcrumb, WebPage                            |
| 3.5      | How it works (interview) | `interview-steps` (ordered list, 8 steps, tips as `Item`), `system-requirements`, anchor TOC                                                                                                                 | static                                                                             | WebPage, Breadcrumb, HowTo-style steps as plain content |
| 3.6      | Download                 | `release-card` (OS detect via `navigator.userAgentData` → fallback UA), `install-steps` · `queries/releases.queries.ts`                                                                                      | client fetch; "Coming soon" for absent OS                                          | SoftwareApplication (Windows), Breadcrumb               |
| 3.7      | Contact                  | `contact-form` (RHF + Zod + shadcn `Field`), `contact-channels` · `mutations/use-send-contact-message.ts` · `schemas/contact.schema.ts`                                                                      | POST; inline success + toast; server errors mapped to fields                       | ContactPage, Breadcrumb                                 |
| 3.8      | About                    | `about-intro`, `mission-vision`, `audiences`, `profile-duration`, `disclaimer`                                                                                                                               | static                                                                             | AboutPage, Breadcrumb                                   |
| 3.9–3.11 | Terms · Privacy · Refund | **One shared** `features/legal` with `legal-document` (sticky TOC on `lg+` with scroll-spy, "Last updated", anchored `h2`/`h3`, print styles) fed by each namespace                                          | static                                                                             | WebPage (`dateModified`), Breadcrumb                    |

Footer **newsletter** form lives in `features/newsletter` (mutation + schema), rendered by `site-footer` through the feature's `index.ts`.

### 3.12 404 + error pages

- `routes/not-found.tsx` is prerendered to `/404/index.html` (English, links to every locale home). nginx `error_page 404` points to it.
- Every route `ErrorBoundary` → `ErrorScreen` (retry, home link, error id in dev).

### 3.13 Assistant widget

`features/assistant`: launcher button in the home page corner. **Code and copy load on first click** (`React.lazy` + namespace fetch). `Sheet` on mobile, `Popover` panel on desktop, `aria-live` message list, markdown via `react-markdown` (lazy), session in `sessionStorage`. Uses `@workspace/api` `assistant`.

### 3.14 Translation reuse → 🔵 Gate 3

- `tooling/i18n/key-map.json`: `{ "home:faq.items": "home:faq.items", "legalTerms:*": "legalTerms:*", … }` (old key → new key, with namespace globs for legal).
- `tooling/i18n/migrate.ts`: copies values for mapped keys from `apps/legacy/app/i18n/messages/<lng>/` into `apps/marketing/app/locales/<lng>/` for all 18 locales, without overwriting existing values. Prints a per-locale/page readiness report.
- Expected outcome: **legal pages ready in all 19 locales**. Other pages are ready where their copy was kept verbatim. Everything else is English-only until the translation batch (4.8).

🔵 **Gate 3: full English site review** (all pages, desktop + mobile), plus the readiness report.

---

## Phase 4: Hardening & launch

### 4.1 Post-build pipeline

`apps/marketing/scripts/postbuild.ts` (run by `node`, chained in `build`):

1. `sitemap.xml`: ready pages only, `xhtml:link` alternates + `x-default`, `lastmod` from `git log` of the page's feature folder and catalogs (ported logic).
2. `robots.txt`: indexable only when `VITE_ENV=production`. Disallows nothing on marketing (app routes are on another host after Phase 7. In the interim nginx adds `X-Robots-Tag: noindex` to legacy routes, as today).
3. `verify-seo`: every prerendered page has title, description, canonical = self, hreflang matching readiness, OG image that exists on disk, and valid JSON-LD (port of `verify-seo.mjs`, including the CJK title-width check).
4. HTML budget: each page's HTML (with embedded copy) ≤ 60 kB gzip.

### 4.2 Playwright suites (`apps/marketing/e2e/`)

| Spec               | Covers                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `smoke.spec.ts`    | every prerendered URL: 200, `lang`/`dir`, one `h1`, no console errors, no failed requests                                                                |
| `a11y.spec.ts`     | axe (WCAG 2.2 AA tags) on every prerendered URL, plus open states (mobile menu, language menu, FAQ expanded, contact errors)                             |
| `seo.spec.ts`      | diff vs `docs/baseline/seo-baseline.json`. Allowed diffs (titles/descriptions intentionally rewritten) live in `e2e/seo-allowlist.ts` with a reason each |
| `keyboard.spec.ts` | tab order through header → main → footer, menu/sheet focus trap and return, skip link                                                                    |
| `handoff.spec.ts`  | every app link matches the URL contract for the current `VITE_APP_URL`                                                                                   |
| `visual.spec.ts`   | screenshots at 360/768/1280/1920 for `en`, `ar`, `de` on home, pricing, contact, terms (committed baselines)                                             |
| `i18n.spec.ts`     | language switch keeps the page when ready, otherwise falls back per rule. No raw keys in DOM                                                             |

### 4.3 Lighthouse CI + budgets

`apps/marketing/lighthouserc.cjs`: home, pricing, interview, contact, terms (`en` + `ar`), mobile preset. Assertions: Performance ≥ 0.90, Accessibility ≥ 0.95, SEO = 1, Best Practices ≥ 0.95, LCP ≤ 2000 ms, CLS ≤ 0.05, TBT ≤ 200 ms. `size-limit`: initial JS ≤ 130 kB gzip per page.

### 4.4 Security headers + CSP

- `infra/nginx/snippets/security-headers.conf`: HSTS (no `includeSubDomains` until Phase 7), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation off), `Content-Security-Policy: frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'`.
- Script CSP per page: the post-build step hashes each page's inline scripts (React Router hydration context) and injects `<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'sha256-…' https://connect.facebook.net; …">`. Shipped **Report-Only first** (header variant), switched to enforce after a clean week.
- `subResourceIntegrity: true` in `react-router.config.ts`.

### 4.5 Legacy patch: `/employer/billing`

In `apps/legacy` only (minimal, tested):

- `app/routes/employer.billing.jsx`: renders the existing `PlanGrid` + `TopUpPacks` + `CheckoutDialog` from `features/pricing` inside the employer dashboard layout. `?checkout=<key>` opens the dialog, as today.
- Repoint `CreditUsageCard` and `Invoice` "Buy credits" to `/employer/billing`. Update `Invoice.test.jsx`.
- **Exit:** legacy tests green, plus a manual Razorpay test-mode purchase on staging.

### 4.6 nginx interim config + CI test

`infra/nginx/sites/letshyre.ai.conf` (replaces `deploy/nginx.conf`):

- `/` → 301 `/en`. Trailing slash → 301 no slash. `/health`.
- `/(19 locales)(/|$)` → `marketing/current` (`$uri/index.html`). Not found → `@missing_translation`: `/xx/<page>` → 302 `/en/<page>` (generic regex, no page list).
- `*.data` → marketing, `no-cache`.
- `/assets/` → marketing first, then `@legacy_assets` (hash-named, no collisions), `immutable`.
- `/(employer|employee|get-started|forgot-password|shared-scorecard)(/|$)` → `legacy/current/index.html` + `X-Robots-Tag: noindex, nofollow`.
- `error_page 404 /404/index.html`.
- **nginx test:** `infra/nginx/test/run.sh` starts an `nginx:stable` container with both builds mounted, and a curl-based script asserts every rule above (ported from `verify-live.mjs` checks). It runs in the GitHub workflow, or locally once Docker Desktop is installed. Until then, the Playwright static server (step 1.8) covers the same redirect and fallback rules.

### 4.7 Deploy + rollback (CD deferred)

> **Deferred:** there is no EC2 (or other host) yet. The scripts below get written and reviewed, but stay unwired until hosting is decided (O5). The marketing build is plain static files, so if you pick S3 + CloudFront, Cloudflare Pages or Netlify instead, only this step changes.

`tooling/deploy/`:

- `deploy.sh <app> <artifact.tgz> <sha>`: upload to `/var/www/letshyre/<app>/releases/<sha>/`, rsync `assets/` into the shared `/var/www/letshyre/<app>/assets/` (no delete), atomically swap `current` (`ln -sfn` + `mv -T`), `nginx -t && nginx -s reload`, keep the last 5 releases, prune shared assets older than 30 days.
- `rollback.sh <app> [sha]`: re-point `current` to the previous (or given) release and reload.
- `.github/workflows/deploy.yml`: on tag or manual dispatch, build once, attach the artifact, deploy to `staging` automatically, deploy to `production` behind a GitHub Environment approval, run `verify-live` after each.
- **Need from you:** server SSH access for CI (deploy key) and the staging hostnames. Until then, the scripts run manually.

### 4.8 Launch

1. Translation batch (O4) for the changed keys, prioritized by locale traffic (from 0.2). Re-run readiness and rebuild.
2. Staging deploy → **UAT checklist**: every page × `en`/`ar`/one Indic locale on Chrome, Safari iOS, Firefox, Android Chrome. Keyboard + NVDA + VoiceOver pass. Contact/newsletter submit. Pricing → billing handoff (signed in and signed out). Legacy dashboards unaffected. Pixel only after consent.
3. Production deploy in a low-traffic window → `verify-live` → resubmit the sitemap in Search Console.
4. Monitor for 7 days: nginx 404/302 rates, Search Console coverage and hreflang errors, CWV field data, sign-up conversion. Rollback trigger: indexed-page drop > 10% or error spike. Rollback = `rollback.sh marketing` (legacy marketing build kept for 30 days).

**Phase 4 exit = marketing migration complete.**

---

## What I need from you (and when)

| Need                                                                             | By step       |
| -------------------------------------------------------------------------------- | ------------- |
| GitHub remote for this repo (optional; until then CI runs locally)               | anytime       |
| Approve content decisions + URL contract                                         | 0.4 (Gate 1)  |
| Logo as SVG                                                                      | 2.4           |
| Approve visual direction                                                         | 3.2 (Gate 2)  |
| Approve full English site                                                        | 3.14 (Gate 3) |
| O2: consent banner yes/no                                                        | 4.4           |
| O4: who translates, and how                                                      | 4.8           |
| Hosting decision (EC2 or static host) + staging hostnames, needed to un-defer CD | before 4.8    |

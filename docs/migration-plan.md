# LetsHyre Frontend: Monorepo Migration & Redesign Plan

> Status: **Draft for approval**. Written 2026-10-03.
> Scope: move the single React Router app into a pnpm + Turborepo monorepo with two apps
> (marketing SSG, plus auth and dashboards) that share a shadcn/ui package on the **unmodified
> shadcn default theme**, redesign both apps, and ship the **marketing app first**.

---

## 0. Summary

|              | Today                                                                        | Target                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Repo         | One app (`app/`), JavaScript                                                 | pnpm + Turborepo monorepo, TypeScript (strict)                                                                                    |
| Apps         | One app serves marketing, auth and both dashboards                           | `apps/marketing` → **letshyre.ai** (SSG) · `apps/app` → **app.letshyre.ai** (SPA) · later `apps/admin` → **admin.letshyre.ai**    |
| UI           | shadcn new-york/slate, hand-customized tokens, Merriweather, custom `@theme` | `packages/ui`: shadcn CLI **default preset** (Base UI, nova style, neutral). CLI-owned and never hand-edited. Shared by every app |
| Theme        | Custom brand colors and fonts                                                | shadcn default tokens only. Light only for now; every component is dark-ready                                                     |
| Architecture | Feature folders, partly consistent                                           | Strict feature-based architecture with lint-enforced boundaries                                                                   |
| Delivery     | Build on the EC2 box                                                         | CI-built artifacts, atomic release folders on nginx, one-command rollback                                                         |

**Order of work:** Phase 0 (prep) → 1 (monorepo foundation) → 2 (shared packages) → 3 (marketing build) → 4 (marketing launch). **Marketing is complete and live at this point.** → 5–7 (app) → 8 (decommission legacy, admin-ready).

---

## 1. Decisions

### 1.1 Confirmed with you

| #   | Decision                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | **React Router 8** (framework mode) for both apps. Marketing uses `ssr: false` + `prerender` (pure static HTML). App uses SPA mode.                                                                                                                          |
| D2  | **Subdomains**: `letshyre.ai` (marketing), `app.letshyre.ai` (auth + employer + employee), `admin.letshyre.ai` (future).                                                                                                                                     |
| D3  | **Keep 19 locales + RTL.** Reuse existing translations wherever the new design fits. New copy ships **English-first**. A locale's version of a page is only published (prerendered, in the sitemap, in hreflang) once that page's translations are complete. |
| D4  | **Light theme only** in the UI. shadcn's default dark tokens stay in the shared theme CSS, and every component is written dark-ready, so a toggle can be added later with no refactor.                                                                       |
| D5  | Use the **shadcn default theme**. Do not modify shadcn components. Do not reuse the current colors, fonts or typography. Tailwind classes are written **inline on elements**, never stored in variables.                                                     |

### 1.2 Defaults I chose (industry standard, tell me if you disagree)

| #   | Decision                                                                                                                                                                        | Why                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | **TypeScript 6.0, `strict`** everywhere                                                                                                                                         | 2026 baseline. TS 7 (native compiler) is out, but `typescript-eslint` only supports `<6.1`, and the shadcn monorepo template pins `^6.0.2`. Move to TS 7 when lint tooling supports it.   |
| A2  | **pnpm workspaces + Turborepo** (+ pnpm `catalog:` for single-version deps)                                                                                                     | This is shadcn's own monorepo template. Gives task caching and `--affected` CI.                                                                                                           |
| A3  | **Node 24 LTS** (`.nvmrc` + `engines`)                                                                                                                                          | Current active LTS. The shadcn template requires ≥ 22.22.                                                                                                                                 |
| A4  | shadcn CLI default component base = **Base UI** (`@base-ui/react`)                                                                                                              | The current CLI default preset is `base-nova`. The old setup was Radix. Components are re-added fresh, not ported.                                                                        |
| A5  | HTTP via a small typed **`fetch` wrapper (`ky`)** with **Zod-validated responses** replaces axios                                                                               | Smaller bundle, native streaming and abort. Responses are validated at the edge.                                                                                                          |
| A6  | **TanStack Query v5** (`queryOptions` factories), **React Hook Form + Zod 4**, **Zustand** only for real client state                                                           | Same libraries the team uses today, applied consistently.                                                                                                                                 |
| A7  | **kebab-case file names** (`plan-card.tsx`, `use-billing-period.ts`), PascalCase component exports                                                                              | Matches shadcn and modern React convention. Avoids case-only renames on Windows and macOS.                                                                                                |
| A8  | **Explicit `routes.ts`** (`route`/`layout`/`prefix`/`index`) instead of `flatRoutes()` file naming                                                                              | Routes are typed and reviewable in one place. This removes the double-layout bug class the README documents. Superseded for marketing by [ADR 0013](./adr/0013-marketing-file-routes.md). |
| A9  | **ESLint 10 flat config + Prettier** (with `prettier-plugin-tailwindcss`, as in the shadcn template)                                                                            | Lint plugins enforce a11y, feature boundaries, token-only colors and no hard-coded strings (see §6).                                                                                      |
| A10 | **Vitest 5** (unit/component) + **Playwright** (E2E, axe a11y, visual) + **Lighthouse CI**                                                                                      | This replaces the jsdom-based a11y script with checks in a real browser.                                                                                                                  |
| A11 | Internal package scope **`@workspace/*`**                                                                                                                                       | This is the shadcn CLI default. No alias friction when running `shadcn add`.                                                                                                              |
| A12 | Font = whatever the shadcn CLI emits for the React Router template (currently **Outfit**, a variable font via Fontsource). Non-Latin scripts use the browser's system fallback. | Satisfies "default shadcn theme". No custom font work. (The Next.js template emits Geist instead, so this is template-dependent.)                                                         |

### 1.3 Still open: needed before the phase shown

| #   | Question                                                                                                                                                                                                                                                                        | Needed by   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| O1  | ✅ Resolved: work happens in this folder (OneDrive sync is off for it). Git initialized: `main` holds the legacy snapshot (tag `legacy-baseline`) plus this plan. Work continues on `migration/monorepo`. Still to do: add a GitHub remote before CI (implementation step 1.9). | Phase 0     |
| O2  | **Cookie consent** for Meta Pixel. 6+ of the 19 locales target EU visitors, and India's DPDP Act also applies. Recommendation: a consent banner, with the pixel loading only after opt-in.                                                                                      | Phase 4     |
| O3  | **Backend:** CORS for `app.letshyre.ai`. Meta **Conversions API** (server-side) for `Purchase` / `CompleteRegistration` so the app needs no third-party pixel. Is an **OpenAPI schema** available (drf-spectacular)? httpOnly refresh-cookie roadmap.                           | Phase 5     |
| O4  | Who **approves new marketing copy**? Which **translation workflow** (TMS such as Tolgee/Crowdin/Lokalise, or vendor files)?                                                                                                                                                     | Phase 3 / 4 |
| O5  | **Hosting:** stay on EC2 + nginx (assumed in this plan), or move static hosting to S3 + CloudFront?                                                                                                                                                                             | Phase 4     |
| O6  | A **staging account with realistic demo data**, for real product screenshots and UI mockups.                                                                                                                                                                                    | Phase 3     |

---

## 2. What we are migrating (inventory)

- **Marketing (prerendered, 19 locales):** `/:lang` home, `about`, `contact`, `download`, `how-it-works-interview`, `pricing` (English only today), `terms`, `policy`, `refund-policy`. That is about 170 static pages, with canonical/hreflang/OG/JSON-LD, sitemap and robots generation, and SEO verification scripts.
- **Interactive pieces on marketing:** language switcher, mobile nav, contact form, newsletter form, pricing (plans fetched client-side, plus the **Razorpay checkout dialog that needs a signed-in employer**), download page (fetches desktop releases), home-page **chatbot widget**, Meta Pixel.
- **Auth:** get-started, employer/employee sign-in and register (email/mobile OTP), forgot-password.
- **Employer app (16 screens):** dashboard plus product tour, onboarding/KYC, post job, view/edit jobs, applicants, candidate pool plus unlock (spends credits), unlocked candidates, candidate profile and scorecard, shared links, team, profile, invoices, chatbot.
- **Employee app:** onboarding wizard (identity, photo, resume, preferences, documents), profile, find jobs, my applications, score cards, scorecard detail, interview guide, chatbot.
- **Public, not indexed:** `/shared-scorecard/:shareId`.
- **Platform:** axios client with a token-refresh queue, tokens in `localStorage` (see `docs/security/token-storage.md`), role guards with `clientMiddleware`, about 20 CI scripts (i18n parity/quality/usage/routes/budget, a11y, SEO, bundle budget, naming, boundaries, RTL classes).

---

## 3. Target architecture

### 3.1 Domains & URL map

| URL                                                                                                     | Served by        | Rendering        | Indexed                       |
| ------------------------------------------------------------------------------------------------------- | ---------------- | ---------------- | ----------------------------- |
| `letshyre.ai/`                                                                                          | nginx            | 301 → `/en`      | –                             |
| `letshyre.ai/:lang/{,about,contact,download,how-it-works-interview,pricing,terms,policy,refund-policy}` | `apps/marketing` | Prerendered HTML | Yes (ready locales only)      |
| `app.letshyre.ai/{sign-in,register,forgot-password,get-started}`                                        | `apps/app`       | SPA              | No                            |
| `app.letshyre.ai/employer/**`, `/employee/**`                                                           | `apps/app`       | SPA              | No                            |
| `app.letshyre.ai/shared-scorecard/:id`                                                                  | `apps/app`       | SPA              | No (`noindex`, `no-referrer`) |
| `admin.letshyre.ai/**` (future)                                                                         | `apps/admin`     | SPA              | No                            |

**Marketing URLs do not change**, which protects SEO. App URLs move to the subdomain in Phase 7. Old paths on `letshyre.ai` get permanent 301s to the same path on `app.letshyre.ai` (shared-scorecard links already sent to people keep working).

**Handoffs between apps** are plain links built from `VITE_APP_URL`:

- "Log in" → `${APP_URL}/sign-in` · "Get started" → `${APP_URL}/get-started`
- Pricing "Buy <plan>" → `${APP_URL}/employer/billing?checkout=<planKey>`. The app handles auth (sign in, then return) and runs the Razorpay checkout.
- The marketing language choice is stored in the `lh_locale` cookie (`Domain=.letshyre.ai`, not sensitive) so the app opens in the same language.

**Interim state (between Phase 4 and Phase 7):** marketing is new, dashboards are still the legacy build. nginx on `letshyre.ai` serves the new marketing build for `/:lang/*` and the **legacy build** for `/employer|/employee|/get-started|/forgot-password|/shared-scorecard`, exactly as today. Same origin means no re-login and no CORS change. The legacy app gets one small patch: an `/employer/billing` route hosting its existing checkout dialog, so the new pricing CTA has a target. The new app later keeps the same path contract.

### 3.2 Repository layout

```
letshyre/
├─ apps/
│  ├─ marketing/                 # letshyre.ai: React Router 8, ssr:false + prerender (SSG)
│  ├─ app/                       # app.letshyre.ai: React Router 8 SPA (auth, employer, employee)
│  ├─ legacy/                    # current app, frozen (critical fixes only). Deleted in Phase 8
│  └─ admin/                     # (future) admin.letshyre.ai, same template as apps/app
├─ packages/
│  ├─ ui/                        # @workspace/ui: shadcn components + theme CSS. CLI-owned, never hand-edited
│  ├─ blocks/                    # @workspace/blocks: our cross-app composites built only from @workspace/ui
│  ├─ i18n/                      # @workspace/i18n: locale model, i18next factory, Intl formatters, RTL, checks
│  ├─ api/                       # @workspace/api: fetch client, error model, envelope + Zod parsing, public endpoints
│  ├─ auth/                      # @workspace/auth: session, token refresh, role guards (Phase 5, used by app + admin)
│  ├─ analytics/                 # @workspace/analytics: consent-aware event API (pixel adapter, no-op outside prod)
│  ├─ eslint-config/             # @workspace/eslint-config: base, react, boundaries, tailwind, a11y, i18n presets
│  └─ typescript-config/         # @workspace/typescript-config: base, react-app, library
├─ tooling/
│  └─ scripts/                   # repo-level scripts (release, nginx config tests, translation sync)
├─ infra/
│  └─ nginx/                     # server blocks per domain + shared header snippets (+ CI docker test)
├─ docs/                         # architecture, ADRs (docs/adr/NNNN-*.md), runbooks, this plan
├─ .github/workflows/            # CI: verify, e2e, deploy
├─ turbo.json · pnpm-workspace.yaml · package.json · .nvmrc · .editorconfig · .gitattributes
```

### 3.3 Packages: responsibilities and rules

| Package                | Owns                                                                                                                                                                                    | May import    | Consumers                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------- |
| `@workspace/ui`        | shadcn components (`src/components`), `globals.css` (theme tokens), `cn`, shadcn hooks                                                                                                  | npm deps only | blocks, all apps                          |
| `@workspace/blocks`    | `Logo`, `LanguageSwitcher`, `ErrorScreen`, `NotFoundScreen`, `ConsentBanner`, `PageHeader`, … (composition only, no new primitives)                                                     | `ui`, `i18n`  | all apps                                  |
| `@workspace/i18n`      | `LOCALES`, `RTL_LOCALES`, `dirFor`, `localePath`, `OG_LOCALE`, i18next instance factory, typed `t`, formatters, pseudo-locale, parity/budget check CLIs                                 | npm deps only | all apps                                  |
| `@workspace/api`       | `createHttpClient()`, `ApiError` hierarchy, `{success,data,message}` envelope unwrapping, `parseWith(schema)`, public endpoint services (contact, newsletter, plans, releases, chatbot) | npm deps only | all apps                                  |
| `@workspace/auth`      | token store, refresh queue, `requireAuth`/`requireGuest` middleware, `ROLES`, role → home                                                                                               | `api`         | app, admin                                |
| `@workspace/analytics` | `track(event)`, consent state, Meta Pixel adapter                                                                                                                                       | npm deps only | marketing (app only via server-side CAPI) |

**Rules:** packages never import from apps. `ui` imports nothing internal. Every package exports through an explicit `exports` map (no deep imports). Enforced with `eslint-plugin-boundaries` and `turbo boundaries`. A module moves into a package only when **two apps** need it. Until then it lives in the app.

### 3.4 Stack (versions verified on npm 2026-10-03)

| Concern      | Choice                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime / PM | Node 24 LTS · pnpm (latest major, pinned via `packageManager`) · Turborepo 2.11                                                                                     |
| Framework    | React 19.2 · React Router 8.4 (framework mode) · Vite 8                                                                                                             |
| Styling      | Tailwind CSS 4.3 · shadcn CLI 4.21 (`base-nova`, neutral, lucide, `rtl: true`) · tw-animate-css                                                                     |
| Data         | TanStack Query 5 · ky 2 · Zod 4                                                                                                                                     |
| Forms        | React Hook Form 7 + `@hookform/resolvers` + shadcn `Field` components                                                                                               |
| i18n         | i18next 26 · react-i18next 17 · `Intl.*` for numbers/dates/plurals                                                                                                  |
| Client state | Zustand 5 (only where server state does not fit)                                                                                                                    |
| Motion       | CSS transitions + tw-animate-css by default. `motion` (successor to framer-motion) only where it pays for itself, lazy-loaded                                       |
| Toasts       | sonner via the shadcn `sonner` component                                                                                                                            |
| Quality      | TypeScript 6.0 · ESLint 10 · typescript-eslint · jsx-a11y · eslint-plugin-boundaries · eslint-plugin-better-tailwindcss · eslint-plugin-i18next · Prettier 3 · knip |
| Tests        | Vitest 5 · Testing Library · Playwright 1.63 · @axe-core/playwright · Lighthouse CI · size-limit                                                                    |
| Git hooks    | lefthook (format + lint staged files, typecheck pre-push) · Conventional Commits                                                                                    |

---

## 4. Design system & UI rules

### 4.1 shadcn setup

1. Scaffold with the CLI's own monorepo mode, then adopt its output (verified working with CLI 4.21.1):
   `pnpm dlx shadcn@latest init --template react-router --base base --monorepo --rtl`
   This produces `packages/ui` (components, `globals.css`, `cn`) and the app's `components.json` pointing at `@workspace/ui`.
2. Add components **from the app directory** (`pnpm dlx shadcn@latest add navigation-menu sheet accordion …`). The CLI routes primitives into `packages/ui` and blocks into the app.
3. **`packages/ui/src/**` is CLI-owned.** No hand edits, ever. Changes arrive only through `shadcn add --overwrite` / `shadcn apply`. CI runs `shadcn add <each installed> --diff` and fails on drift. CODEOWNERS protects the folder.
4. Customization happens **by composition**: wrap a shadcn component in an app or `@workspace/blocks` component and pass `className`. Never fork the component.
5. **Theme tokens are the CLI output, unchanged.** No brand color and no custom font. Brand identity comes from the **logo, layout, typography hierarchy and real product imagery**. If a brand accent is ever wanted, it goes through `shadcn apply <preset>`, not a hand-edited token.

### 4.2 Styling rules

- **Inline Tailwind classes on the element.** No `const BUTTON_CLASSES = "…"`, no `@apply` in app CSS, no CSS modules. A repeated pattern becomes a **component**, not a string. `cn()` is only for conditional or merged classes. `cva` lives only inside shadcn components.
- **Semantic tokens only:** `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-destructive`, `ring-ring`, `bg-sidebar`, `chart-1…5`. **Raw palette classes (`bg-blue-600`, `text-slate-500`) and arbitrary hex values are lint errors** (eslint-plugin-better-tailwindcss `no-restricted-classes`). This is what makes the UI dark-ready for free.
- **Dark-ready (D4):** the `.dark` class is never applied today. Where a non-token color is genuinely unavoidable (e.g. an image overlay), it must ship with its `dark:` pair. A `ThemeProvider` stub (forced `light`) exists in `@workspace/blocks`, so the future toggle only needs a provider prop and a `<ThemeToggle>`.
- **RTL via logical properties only:** `ms-*`/`me-*`/`ps-*`/`pe-*`/`start-*`/`end-*`/`text-start`/`rounded-s-*`. `ml-`/`mr-`/`left-`/`right-`/`text-left` are lint errors (this replaces `check-rtl-classes.mjs`). Directional icons get `rtl:rotate-180`.
- **Tailwind defaults only:** default spacing, type scale, breakpoints and radius (driven by `--radius`). No custom `@theme` extensions in apps. App CSS is only `@import "@workspace/ui/globals.css"` plus `@source` lines.

### 4.3 Redesign direction: professional, not "AI-generated"

The current site leans on patterns that read as template or AI output: badges like "100% AI-Screened" and "AI Powered Platform", unbacked stats ("Accuracy", "Uptime"), highlight-word gradients, floating decorative cards. The new design is **typography-led, monochrome, content-first**. Reference quality bar: Linear, Stripe docs, Vercel, Resend, Mercury.

**Do**

- One clear message per section. One primary CTA per viewport.
- Left-aligned, editorial layouts on a 12-column grid, with deliberate asymmetry. Generous but consistent spacing rhythm (Tailwind 4/8 scale).
- A restrained type scale: 3–4 sizes per page, `text-balance` on headings, `text-pretty` and `max-w-prose` on body copy.
- Structure from hairline borders (`border-border`) and background steps (`bg-muted/50`), not heavy shadows.
- **Real product UI as imagery**: scorecard, candidate row and dashboard tiles rendered **with the actual shadcn components**. That makes them crisp, localizable, theme-correct and honest. Real screenshots where components don't fit.
- Concrete, verifiable copy ("Credits never expire", "90-day active profiles", "8 steps before your first question").
- Real `<table>` for plan comparison. Real FAQ (`Accordion`) mirrored in JSON-LD.

**Don't**

- Gradient blobs, mesh or noise backgrounds, glassmorphism, glow borders, animated gradients, sparkle or emoji icons.
- Repeated three-icon-card grids in every section. Bento grids used as filler.
- Fake logos, fake testimonials, invented metrics, stock 3D illustrations, AI-generated people.
- Scroll-jacking or "reveal on scroll" on every block. Motion is limited to state changes, 150–250 ms, and is disabled under `prefers-reduced-motion`.

**Checkpoint:** before building every page, I build **header, footer and the home hero plus one section**, and you approve the direction (Phase 3a).

### 4.4 Responsive

- Mobile-first. Tailwind default breakpoints (`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536). Container queries (`@container`) for components that live in variable-width slots.
- Must work from **320 px to ultrawide** with no horizontal scroll, and reflow at **400% zoom** (WCAG 1.4.10).
- Navigation collapses into a `Sheet` driven by measured width, not a fixed breakpoint, because translated labels vary in length (keeps today's behavior).
- Images: responsive `srcset`/`sizes`, AVIF/WebP, explicit `width`/`height` (no CLS). The LCP image gets `fetchpriority="high"`. Everything else is `loading="lazy"`.
- Playwright visual snapshots at 360, 768, 1280 and 1920 widths, for `en` + `ar` (RTL) + one long-label locale (`de` or `ml`).

### 4.5 Accessibility: WCAG 2.2 AA (release-blocking)

- Landmarks, skip link, one `h1` per page, logical heading order, `lang` + `dir` on `<html>` per locale.
- Every interactive element is keyboard reachable with a visible focus ring (shadcn `ring` tokens). Base UI handles roving focus and ARIA for menus, dialogs and tabs.
- Target size ≥ 24×24 CSS px (2.5.8). Text contrast ≥ 4.5:1 (the neutral default palette passes; checked in CI).
- Forms: visible labels, `aria-invalid`, errors linked with `aria-describedby`, an error summary on submit, no placeholder-only labels.
- Live regions for async results (toasts are announced; loading uses `aria-busy`).
- Video has captions and a transcript. Animations respect `prefers-reduced-motion`.
- **Gates:** `jsx-a11y` lint, axe on **every prerendered page × every locale** (Playwright), Lighthouse a11y ≥ 0.95, plus a manual keyboard and screen-reader pass (NVDA + Windows, VoiceOver + iOS) before each launch.

---

## 5. Application architecture (feature-based)

### 5.1 App layout (same shape for `marketing`, `app`, future `admin`)

```
apps/<app>/
├─ app/
│  ├─ root.tsx                   # document, providers, global ErrorBoundary
│  ├─ routes.ts                  # explicit route config (single source of truth)
│  ├─ routes/                    # thin route modules: meta, handle, clientLoader, default export → feature page
│  ├─ features/                  # one folder per business capability (see 5.2)
│  ├─ layouts/                   # route layouts: site-layout (marketing), dashboard-layout (app)
│  ├─ components/                # app-shared UI used by ≥2 features (shadcn CLI alias @/components)
│  ├─ hooks/                     # app-shared hooks used by ≥2 features
│  ├─ lib/                       # app infra: env.ts, query-client.ts, i18n.ts, seo/ (marketing), constants
│  ├─ locales/<lng>/<ns>.json    # catalogs; namespace = feature name (+ common, seo)
│  ├─ styles/app.css             # @import "@workspace/ui/globals.css"; @source …
│  └─ types/                     # ambient/global types (i18next resources, env)
├─ e2e/                          # Playwright specs (smoke, a11y, visual, SEO)
├─ public/                       # favicons, og/, robots (generated), static media
├─ scripts/                      # build-time: sitemap, robots, seo-verify, og-images (marketing)
├─ components.json · react-router.config.ts · vite.config.ts · tsconfig.json · playwright.config.ts
```

Catalogs stay in one `locales/` folder per app (rather than per feature) because translation tools and vendors expect one predictable tree.

### 5.2 Feature anatomy

```
features/pricing/
├─ components/                   # feature-private UI
│  ├─ plan-card.tsx
│  ├─ plan-comparison-table.tsx
│  └─ top-up-packs.tsx
├─ services/
│  └─ pricing.service.ts         # HTTP calls only; returns Zod-parsed domain objects
├─ queries/
│  └─ pricing.queries.ts         # queryOptions factories + query keys (pricingKeys.plans(), …)
├─ mutations/                    # useMutation hooks with cache invalidation (e.g. contact form)
├─ hooks/
│  └─ use-billing-period.ts      # non-query feature hooks
├─ schemas/
│  └─ plan.schema.ts             # Zod: API response + form schemas; types via z.infer
├─ types/
│  └─ pricing.types.ts           # feature types not derived from a schema (optional)
├─ lib/
│  ├─ format-price.ts            # pure, unit-tested helpers
│  └─ checkout-url.ts
├─ stores/                       # Zustand (only if needed)
├─ constants.ts
├─ pricing.meta.ts               # (marketing) title, description, canonical, hreflang, JSON-LD for the route
├─ pricing-page.tsx              # the page UI: composes components, owns layout of the page
├─ pricing-page.test.tsx         # tests colocated as *.test.ts(x)
└─ index.ts                      # PUBLIC API: export { PricingPage, pricingMeta, pricingQueries }
```

**Layer rules (lint-enforced):**

- `routes/*` → feature **`index.ts` only** + `layouts` + `lib`.
- `features/X/**` → its own files, `@/components`, `@/hooks`, `@/lib`, `@workspace/*`. **Never another feature.** Shared code moves down a layer.
- `components|hooks|lib` (app-shared) → `@workspace/*` only. Never `features`.
- Data flow: `services` (fetch + parse) → `queries`/`mutations` (cache) → `hooks`/`components`. **Components never call `services` directly.**

### 5.3 Naming

| Thing                        | Convention                                                           | Example                            |
| ---------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| Files & folders              | kebab-case                                                           | `plan-card.tsx`, `candidate-pool/` |
| Components                   | PascalCase named export (no default exports except route modules)    | `export function PlanCard()`       |
| Hooks                        | `use-*.ts` → `useX`                                                  | `use-billing-period.ts`            |
| Services / queries / schemas | `<domain>.service.ts` · `<domain>.queries.ts` · `<domain>.schema.ts` | `jobs.service.ts`                  |
| Page                         | `<feature>-page.tsx` → `XPage`                                       | `pricing-page.tsx`                 |
| Tests                        | `*.test.ts(x)` colocated · Playwright `*.spec.ts` in `e2e/`          |                                    |
| i18n keys                    | `namespace:section.element`                                          | `pricing:plans.buy`                |

### 5.4 Routing

- `routes.ts` is explicit, e.g. marketing:
  `layout("layouts/site-layout.tsx", [...prefix(":lang", [index("routes/home.tsx"), route("pricing", "routes/pricing.tsx"), …])])`.
- Route modules are under 30 lines: `meta`, `handle.i18n`, `clientLoader` (catalog load + `ensureQueryData` prefetch), `ErrorBoundary`, default export of the feature page.
- **Marketing:** `ssr: false`, `prerender: () => readyPaths()`. The prerender list is **derived from translation readiness** (§5.8), not hand-maintained.
- **App:** SPA. Auth via `clientMiddleware` on the role layout (`requireAuth({ roles: ["Employer"] })`). Child routes never re-check.

### 5.5 Data layer

- `@workspace/api` `createHttpClient({ baseUrl, getToken?, onUnauthorized? })` on `ky`: timeouts, retry with backoff for idempotent requests, `AbortSignal` passthrough, typed `ApiError` (`NetworkError`, `HttpError(status, code, backendMessage)`, `ValidationError` from Zod).
- Envelope `{ success, data, message }` is unwrapped once, centrally. `success: false` becomes `HttpError`.
- **Every response is parsed with a Zod schema** in the service. UI code only ever sees typed domain objects. If the backend exposes OpenAPI (O3), types are generated (`openapi-typescript`) and the Zod schemas are checked against them.
- Query keys come from per-feature factories. `staleTime` is set per query. Mutations invalidate by key prefix.
- Marketing uses only the **public** client (no auth headers, no refresh). The auth/refresh logic lives in `@workspace/auth` and is never loaded on marketing.

### 5.6 Forms

shadcn `Field`, `FieldLabel`, `FieldDescription`, `FieldError` + RHF `Controller` + `zodResolver`. Schemas are factories that take `t`, so messages are translated. Server errors map onto fields. Submit is disabled only while submitting. The success state is announced.

### 5.7 State

Server state goes in TanStack Query. URL state (filters, pagination, `?checkout=`) goes in search params. Form state goes in RHF. **Zustand only** for cross-route client state (e.g. employee onboarding draft, chat session). No global "user" store: the session is read from `@workspace/auth`.

### 5.8 i18n

- `@workspace/i18n` holds the locale model (TS port of `app/i18n/config.js`), an i18next factory, lazy catalog loading via `import.meta.glob` (one chunk per `locale × namespace`, as today), **typed keys** (i18next `CustomTypeOptions` from `en` catalogs), `Intl` formatters, and the pseudo-locale.
- **Marketing** keeps `/:lang` URLs. The **app** has no URL prefix: the locale comes from the user's choice, then the `lh_locale` cookie, then `navigator.languages`, then `en`.
- **English-first readiness (D3):** a page is _ready_ in a locale when every key its namespaces use exists in that locale. That is computed at build time by the parity check. **Prerender list, sitemap, hreflang and the language switcher all derive from it.** A not-ready locale/page 302s to `/en/<page>` (generic nginx fallback, as today's `@missing_translation`). The result: no mixed-language pages and no 404s.
- **Translation reuse:** a `key-map.json` (old key → new key) plus a migration script copies existing translations into new keys for all 18 locales wherever the meaning is unchanged. Legal pages reuse their copy fully, so they launch in all 19 locales on day one.
- Lint: `eslint-plugin-i18next` (`no-literal-string` in JSX). CI: parity, unused keys, ICU/plural validity per locale, catalog chunk budget.

### 5.9 SEO (marketing): parity with today is release-blocking

Per page and locale: `<title>`, description, self canonical, `hreflang` for every ready locale + `x-default` → `/en`, OG/Twitter tags with per-page OG image, JSON-LD (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage` built from the rendered FAQ, `BreadcrumbList`, `ContactPage`, pricing offers). `sitemap.xml` with `xhtml:link` alternates. `robots.txt` indexable **only** when `VITE_ENV=production`. A Phase 0 baseline crawl is diffed against the new build in CI (`e2e/seo.spec.ts`).

### 5.10 Errors, loading, empty

Every route has an `ErrorBoundary` (`@workspace/blocks/error-screen`). Skeletons match the final layout (no CLS). Empty states use shadcn `Empty`. Navigation shows a delayed progress bar (no flash on fast navigations). A 404 for unknown `/:lang/*` comes from the prerendered `404.html`.

### 5.11 Environment & config

`app/lib/env.ts` parses `import.meta.env` with Zod at startup, and the **build fails** on missing or invalid values. Variables: `VITE_ENV`, `VITE_SITE_URL`, `VITE_APP_URL`, `VITE_API_BASE_URL`, `VITE_META_PIXEL_ID`. `.env.example` is committed per app. Secrets never go in `VITE_*`.

---

## 6. Quality gates (CI, all blocking)

| Gate           | Tool                                                                                                                                                                                                                    | Replaces today's                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Format         | Prettier + tailwind plugin                                                                                                                                                                                              | –                                                                                     |
| Lint           | ESLint: typescript-eslint (strict-type-checked), react-hooks, jsx-a11y, **boundaries** (layer rules §5.2), **better-tailwindcss** (raw colors, physical `ml/mr`, conflicting classes), **i18next** (no literal strings) | `check-naming`, `check-feature-boundaries`, `check-shared-layer`, `check-rtl-classes` |
| Types          | `tsc --noEmit` per package (+ `react-router typegen`)                                                                                                                                                                   | –                                                                                     |
| Dead code      | knip                                                                                                                                                                                                                    | –                                                                                     |
| Unit/component | Vitest + Testing Library, coverage ratchet on schemas, services, lib                                                                                                                                                    | same intent                                                                           |
| i18n           | `@workspace/i18n` CLIs: parity, quality, unused, budget                                                                                                                                                                 | 6 `check-i18n-*` scripts                                                              |
| E2E            | Playwright: every route × locale renders; nav, forms, language switch, pricing → app handoff                                                                                                                            | – (README lists this as the biggest gap)                                              |
| A11y           | @axe-core/playwright on every prerendered page                                                                                                                                                                          | `check-a11y.mjs`, pa11y                                                               |
| SEO            | Playwright SEO spec against baseline; sitemap/robots verify                                                                                                                                                             | `verify-seo.mjs`                                                                      |
| Perf           | Lighthouse CI on representative pages (`en` + `ar`) · size-limit per route                                                                                                                                              | `check-bundle-budget.mjs`                                                             |
| UI drift       | `shadcn add --diff` on installed components                                                                                                                                                                             | –                                                                                     |
| nginx          | `nginx -t` + redirect/fallback tests against the real config in Docker                                                                                                                                                  | `verify-live.mjs` (still run post-deploy)                                             |

**Budgets (marketing):** LCP ≤ 2.0 s (Moto G-class, 4G) · CLS ≤ 0.05 · INP ≤ 200 ms · initial JS ≤ 130 kB gzip on content pages · Lighthouse Perf ≥ 90, A11y ≥ 95, SEO = 100, Best Practices ≥ 95.

---

## 7. Security

- **Origin isolation:** marketing (third-party pixel) and app (tokens) on separate origins. The app loads **no third-party scripts**. Conversion events go through the server-side Conversions API (O3).
- Tokens stay in `localStorage` on `app.letshyre.ai` until the backend supports an httpOnly refresh cookie. Then: refresh token in cookie, access token in memory (plan already in `docs/security/token-storage.md`). Remove the `user.refresh_token` fallback.
- **CSP** per app. Marketing: hashes for React Router's inline hydration scripts, pixel domains allowlisted after consent. App: `script-src 'self'`. Rolled out as `Report-Only`, then enforced.
- Headers: HSTS (`includeSubDomains` once every subdomain is HTTPS), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.
- Dependencies: Renovate (grouped, weekly), `pnpm audit` in CI, lockfile-only installs, `minimumReleaseAge` in pnpm to avoid freshly published malicious versions.

---

## 8. Environments & deployment

| Env              | Marketing                     | App                       | Notes                                |
| ---------------- | ----------------------------- | ------------------------- | ------------------------------------ |
| Local            | `pnpm dev --filter marketing` | `pnpm dev --filter app`   | `VITE_APP_URL=http://localhost:5174` |
| Preview (per PR) | static build artifact         | static build artifact     | optional: S3 bucket per PR           |
| Staging          | `staging.letshyre.ai`         | `app.staging.letshyre.ai` | `noindex`, basic-auth                |
| Production       | `letshyre.ai`                 | `app.letshyre.ai`         |                                      |

**Pipeline:** PR → `turbo run lint typecheck test build --affected` → Playwright (e2e, a11y, seo, visual) against the built output behind the real nginx config in Docker → merge → CI builds once → artifact uploaded → deploy rsyncs to `/var/www/<app>/releases/<sha>/`, merges hashed `assets/` into a shared folder (never deleted immediately, so open tabs keep working), then switches `current` with an atomic symlink → `nginx -s reload` → `verify-live`. **Rollback = re-point the symlink** (seconds). The box no longer runs `git pull && pnpm build`.

---

## 9. Migration phases

Estimates assume one experienced engineer. Each phase ends with an exit review.

### Phase 0: Preparation (1–2 days)

- [x] Git initialized in place. `main` = legacy snapshot (tag `legacy-baseline`) + plan. Branch `migration/monorepo` created.
- [ ] **Baseline capture:** crawl every sitemap URL in production. Store status, title, description, canonical, hreflang set, OG tags and JSON-LD per URL as `baseline/seo.json`. Lighthouse baseline for 11 URLs. Export GA/Search Console top pages by locale (to prioritise translations).
- [ ] **Content inventory:** a per-page list of current copy keys, flagging _keep_, _rewrite_ or _drop_ (e.g. drop unverifiable stats).
- [ ] **URL & redirect map:** marketing (unchanged), app paths (→ subdomain in Phase 7), pricing `?checkout=` → `app/employer/billing?checkout=`.
- [ ] File backend tickets for O3 (CORS, CAPI, OpenAPI, cookie auth).
- **Exit:** baseline files committed, redirect map approved, open decisions O1–O2 answered.

### Phase 1: Monorepo foundation (3–4 days)

- [ ] Move the current app into `apps/legacy` unchanged (own `package.json`, still builds and tests green). The root becomes the workspace.
- [ ] Root: `pnpm-workspace.yaml` (+ `catalog:` versions, `peerDependencyRules` for jsx-a11y and react on ESLint 10), `turbo.json` (`build`, `dev`, `lint`, `typecheck`, `test`, `test:e2e` with correct `inputs`/`outputs`/`env`), `.nvmrc` 24, `.editorconfig`, `.gitattributes` (`* text=auto eol=lf`), Prettier, lefthook, commitlint.
- [ ] `packages/typescript-config`, `packages/eslint-config` (all rules from §6, warnings as errors in CI).
- [ ] `packages/ui` via the shadcn CLI (§4.1) + `apps/marketing` skeleton (React Router 8, `ssr:false`, Tailwind 4 Vite plugin, `app.css` importing the theme).
- [ ] Add the marketing component set: `button badge card separator navigation-menu sheet dropdown-menu accordion tabs table tooltip dialog input textarea label field select sonner skeleton empty spinner breadcrumb avatar scroll-area`.
- [ ] CI workflow (`verify.yml`) with pnpm store and Turbo cache. CODEOWNERS for `packages/ui`.
- **Exit:** `pnpm build` builds legacy + empty marketing. CI green. A `shadcn add --diff` check is in place.

### Phase 2: Shared packages (3–4 days)

- [ ] `@workspace/i18n`: locale model, i18next factory, `import.meta.glob` catalog loader, typed keys, formatters, pseudo-locale, readiness computation, parity/quality/budget CLIs (ported from `scripts/check-i18n-*.mjs` to TS, with tests).
- [ ] `@workspace/api`: http client, error model, envelope + Zod parsing, public services (contact, newsletter, plans, credit price, desktop releases, chatbot). Unit tests with an MSW or `fetch` mock.
- [ ] `@workspace/analytics`: consent state, `track()`, Meta Pixel adapter (lazy, consent-gated, production only).
- [ ] `@workspace/blocks`: `Logo`, `LanguageSwitcher` (writes `lh_locale`), `ErrorScreen`, `NotFoundScreen`, `ConsentBanner`, `ThemeProvider` (forced light).
- **Exit:** packages at ≥ 90% coverage on logic, documented `README.md` each, consumed by the marketing skeleton.

### Phase 3: Marketing app build & redesign (2–3 weeks)

**3a. Foundation + design checkpoint (3–4 days)**

- [ ] `root.tsx` (lang/dir, providers, skip link, consent, pixel), `site-layout` (header with measured-width nav and `Sheet` on small screens, footer with sitemap, legal links, language switcher), `lib/seo/*` (TS port of `seo.js`/`routeMeta.js`), `lib/env.ts`, `routes.ts`, readiness-driven `prerender`.
- [ ] Build **home hero + one section** using real component-based product visuals.
- [ ] **You review and approve the visual direction** before continuing.

**3b. Pages (each = feature folder + route + meta/JSON-LD + English copy + tests)**

| #   | Page                            | Key content (proposed IA)                                                                                                                                                                                                                                                                                                                                   | Interactive parts                                                          |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | **Home** `/:lang`               | Hero (value prop for employers; secondary path for candidates) · product visual (live-component scorecard) · How it works for employers (3 steps: post role → candidates interview with AI → unlock with credits) · Inside a scorecard · For candidates (desktop interview, 90-day active profile) · Pricing teaser · FAQ (+ `FAQPage` JSON-LD) · Final CTA | FAQ accordion, chatbot launcher (lazy-loaded on click)                     |
| 2   | **Pricing**                     | Hero ("Pay only for the candidates you unlock") · plan cards · comparison `<table>` · top-up packs · GST note · FAQ · CTA                                                                                                                                                                                                                                   | Plans fetched client-side with skeleton + error state; "Buy" → app handoff |
| 3   | **How it works (AI interview)** | 8-step candidate guide as an ordered list with tips · system requirements · CTA to download                                                                                                                                                                                                                                                                 | Anchor TOC                                                                 |
| 4   | **Download**                    | OS-detected primary download, other platforms, version/date, 3-step install, link to the guide                                                                                                                                                                                                                                                              | Releases fetched client-side, "Coming soon" state                          |
| 5   | **Contact**                     | Form + direct channels + response time                                                                                                                                                                                                                                                                                                                      | RHF + Zod form, toast + inline success                                     |
| 6   | **About**                       | Problem → approach · mission/vision · for employers / for candidates · profile duration policy · AI disclaimer                                                                                                                                                                                                                                              | –                                                                          |
| 7–9 | **Terms · Privacy · Refund**    | Readable document layout: sticky TOC on `lg+`, "Last updated", anchor headings, print styles                                                                                                                                                                                                                                                                | TOC scroll-spy                                                             |
| 10  | **404**                         | Helpful links, search-free                                                                                                                                                                                                                                                                                                                                  | –                                                                          |

- [ ] Newsletter form (footer). Chatbot widget (`features/assistant`, lazy, guest mode).
- [ ] Copy written to `locales/en/*`. `key-map.json` + migration script carries over existing translations.
- **Exit:** all pages done in English, unit + e2e green, design QA at 4 widths, approved by you.

### Phase 4: Marketing hardening & launch (1 week)

- [ ] Translation batch for changed keys (O4), prioritised by locale traffic from Phase 0. Readiness report per locale/page.
- [ ] SEO parity spec green against baseline (allowed diffs reviewed). OG images regenerated for the new design.
- [ ] A11y: axe on all pages × locales. Manual keyboard + NVDA + VoiceOver pass. RTL review (`ar`, `ur`).
- [ ] Perf budgets met. Lighthouse CI green.
- [ ] Security headers + CSP (Report-Only → enforce). Consent banner (O2).
- [ ] **Legacy patch:** add `/employer/billing?checkout=` route (reuses its existing checkout dialog) and repoint its two "Buy credits" links there.
- [ ] `infra/nginx`: interim routing (§3.1), generic missing-translation fallback, `/assets/` resolved from marketing first, then legacy. Docker-tested in CI.
- [ ] Staging deploy → UAT sign-off → production deploy (low-traffic window) → `verify-live` → Search Console sitemap resubmit.
- [ ] Monitor 7 days: 404s, Core Web Vitals, crawl stats, conversion to sign-up.
- **Exit: marketing app migration complete.** Legacy marketing code is no longer served. Rollback is a symlink flip.

### Phase 5: App foundation (1–2 weeks)

`apps/app` skeleton, `@workspace/auth` (token store, refresh queue, middleware guards, role homes, employer onboarding gate), authenticated API client, `dashboard-layout` (shadcn `Sidebar`, topbar, user menu, command palette), locale from cookie, error and not-found screens, Playwright auth fixtures. Backend CORS for `app.letshyre.ai` (O3).

### Phase 6: App features (4–6 weeks)

Migrate and redesign, feature by feature, in this order (each slice shipped behind the same quality gates):

1. **auth**: sign-in (proposal: one sign-in for both roles, since the API returns the role), register with email/mobile OTP, forgot/reset, get-started.
2. **employer-onboarding**: KYC.
3. **employer-dashboard**: product tour (re-evaluate `react-joyride` versus a lighter shadcn-based tour).
4. **jobs**: post (JD upload), list, detail, edit, applicants.
5. **candidate-pool** + **unlock** (credit spend, tests ported) + **unlocked-candidates**.
6. **candidate-profile** and **scorecard** (shared views for both roles).
7. **billing**: Razorpay checkout at `/employer/billing`, invoices.
8. **team**, **shared-links**, **employer-profile**.
9. **employee-onboarding**: wizard with persisted draft.
10. **employee**: profile, find jobs, applications, score cards, interview guide.
11. **assistant** (chatbot), **shared-scorecard** (public).

### Phase 7: App launch (1 week)

Staging UAT → production at `app.letshyre.ai` → nginx 301s from `letshyre.ai/{employer,employee,get-started,forgot-password,shared-scorecard}/*` to `app.letshyre.ai` (same path + query) → marketing `VITE_APP_URL` switched → in-app and email notice of a **one-time re-login** (new origin) → monitor error rate and auth success. Rollback: remove the redirects and the legacy build serves again.

### Phase 8: Decommission & admin-readiness (2–3 days)

Delete `apps/legacy` and the interim nginx routes. Archive old scripts. Write ADRs. Create `docs/new-app.md` (how `apps/admin` is created from the `apps/app` template: shares `ui`, `blocks`, `i18n`, `api`, `auth`, and has its own role guard). Hardening backlog: httpOnly cookie auth, CSP enforce on app, Sentry (errors + RUM web-vitals), TS 7 evaluation.

---

## 10. Risks & mitigations

| #   | Risk                                                             | Mitigation                                                                                                                                                                                                                  |
| --- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Non-English SEO drops while redesigned copy awaits translation   | Translation reuse via key map. Legal pages ready in all locales on day one. Top-traffic locales translated before launch. Un-ready pages 302 (not 404) to `/en`. Sitemap only lists ready pages.                            |
| R2  | The shadcn default (Base UI) differs from the old Radix behavior | Components are re-added, not ported. E2E covers keyboard and focus behavior. No custom primitives.                                                                                                                          |
| R3  | The redesign stalls on subjective review                         | Design checkpoint in Phase 3a. Explicit do/don't list (§4.3). Approve one page pattern, then replicate.                                                                                                                     |
| R4  | Session loss when the app moves to a subdomain                   | Planned one-time re-login with notice. Interim phase keeps the same origin, so marketing launch causes no logouts.                                                                                                          |
| R5  | Pricing → checkout handoff breaks during the interim             | Legacy `/employer/billing` patch ships in the same release as the new marketing. E2E covers the handoff.                                                                                                                    |
| R6  | Meta Pixel compliance (EU/DPDP)                                  | Consent gate (O2). App uses server-side CAPI.                                                                                                                                                                               |
| R7  | Repo lives under the OneDrive folder                             | Sync is off for this folder (confirmed). If sync is ever re-enabled, pause it during installs/builds or move the repo, since pnpm hard links and `node_modules` churn cause file locks.                                     |
| R8  | Fonts: Outfit (CLI default) covers Latin only                    | Browser fallback renders Devanagari, Tamil, Telugu, Kannada, Malayalam, Bengali, Arabic, Urdu, CJK and Cyrillic with system fonts. Visual QA per script in Phase 4. Any change goes through `shadcn apply`, not hand edits. |
| R9  | Scope creep in Phase 6 (16+ screens)                             | One feature per PR with fixed exit criteria. Legacy remains the fallback until Phase 7.                                                                                                                                     |

---

## 11. Definition of Done (every page or feature)

- [ ] Lives in its feature folder. Route module is thin. Public API only through `index.ts`.
- [ ] Only `@workspace/ui` / `@workspace/blocks` primitives. Inline Tailwind. Semantic tokens only. Logical (RTL-safe) properties.
- [ ] Responsive at 320 / 768 / 1280 / 1920, and at 400% zoom.
- [ ] Keyboard and screen-reader pass. axe clean. Contrast OK. Reduced motion respected.
- [ ] No literal strings. English keys added. Readiness computed. Translations requested.
- [ ] Loading, empty, error and success states designed.
- [ ] Unit tests for schemas, services and lib. E2E for the main flow.
- [ ] (Marketing) meta + canonical + hreflang + JSON-LD + OG verified.
- [ ] Perf and bundle budgets pass. No new runtime dependency without an ADR.

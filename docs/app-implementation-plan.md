# Implementation Plan: App (Auth, Employer, Employee): Phases 5–8

> Companion to [migration-plan.md](./migration-plan.md) (the _what and why_) and
> [implementation-plan.md](./implementation-plan.md) (Phases 0–4, marketing, done).
> This document is the _how_ for the client-rendered part of the product: sign-in and registration,
> the employer dashboard and the employee (candidate) dashboard. It builds a new `apps/app` and
> retires `apps/legacy`.
> Written 2026-10-04, after Phase 4. Status: **draft for approval**.

---

## 0. What we are migrating

Measured from `apps/legacy/app` (source lines without tests).

| Area                 | Legacy code                                                                                   | Size                     | Screens |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| Auth                 | `components/auth/**`, `features/{get-started,forgot}`, `hooks/useAuth`, `services/auth`       | ~2,000 lines             | 6       |
| Employer             | `features/employer/**` (+ `pricing` checkout, `scorecard-sharing`)                            | ~15,300 lines, 116 files | 17      |
| Employee             | `features/employee/**`                                                                        | ~6,300 lines, 59 files   | 8       |
| Shared views         | `features/{scorecard,candidate-profile}`                                                      | ~1,600 lines             | –       |
| Public (not indexed) | `/shared-scorecard/:shareId`                                                                  | in `scorecard-sharing`   | 1       |
| Platform             | axios client + refresh queue, `requireAuth`, `catalogLoader`, `queryKeys`, error-message maps | ~1,000 lines             | –       |
| i18n                 | 13 app namespaces (`auth`, `dashboard`, `employer`, `employerJobs`, `employerCandidates`, …)  | ~1,400 keys × 19 locales | –       |
| Tests                | 36 test files, almost all in `employer` and `pricing`                                         | –                        | –       |

**Backend surface:** 50 endpoints (`/user/v1/*`, `/payment/v1/*`, `/commonapp/v1/*`, `/finances/v1/*`).
49 GET, 26 POST, 6 PATCH, 3 DELETE calls. Multipart uploads in 6 places (resume, JD, photo, KYC,
profile logo, onboarding review). One blob download (desktop installer). The camera is used for
the candidate's profile photo (`getUserMedia`). The AI interview itself runs in the desktop app, not
in the browser.

**Third-party in the app:** Razorpay Checkout (script + iframe), `react-joyride` (product tour),
`react-markdown` (assistant), `framer-motion`. No analytics scripts load in the app (Meta conversions
move server-side, see B3).

---

## 1. Decisions

### 1.1 Recommended: incremental rollout on the current origin (needs your yes at 🔵 4)

The [migration plan](./migration-plan.md) ships the whole app at once in Phase 7 on
`app.letshyre.ai`. I recommend shipping it **one feature at a time on `letshyre.ai` instead**,
then moving the finished app to the subdomain in one step at the end.

|                  | Big-bang (current plan)                                      | Incremental (recommended)                                                                                                                     |
| ---------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| First user value | After all 12 slices (~6–8 weeks)                             | After the first slice (~1–2 weeks)                                                                                                            |
| Risk per release | Every screen at once, plus a domain move and forced re-login | One feature. Rollback = flip one nginx route back to legacy                                                                                   |
| Session          | Re-login when the app moves                                  | Same origin, same `localStorage` keys: users move between old and new screens without noticing. One re-login at the subdomain move, as before |
| Cost             | –                                                            | A route manifest shared by nginx and the new app (step 5.8), and hard navigations between old and new screens                                 |

The interim nginx config already does this for marketing versus legacy, so the mechanism is proven.

### 1.2 Carried over from Phases 0–4

React Router 8 (SPA mode for the app) · shadcn default theme, components never edited · inline
Tailwind · feature folders with lint-enforced boundaries · `@workspace/*` packages · TanStack Query +
Zod-parsed responses · RHF + Zod forms · i18next with typed keys · Playwright + axe · CSP with hashes.

Lessons from Phases 3–4 that become rules here:

- **Measure first paint with JS on.** Hydration ran before first paint on marketing; the app hydrates
  after paint too (`entry.client.tsx`), and its Lighthouse budget is set from a measurement, not a guess.
- **Don't lazy-load anything a user can click right after load.** A lazy form fell back to a native
  GET submit (the newsletter bug). Lazy-load only below-the-fold, non-form code.
- **Per-locale test sweeps run in Chromium only.** Every other browser checks English. The full
  marketing sweep went from 30 to 13 minutes this way.
- **`z.config({ jitless: true })`** wherever zod runs in the browser, or the CSP reports `eval`.
- **Check the font actually renders.** The theme named a font family that didn't exist (fixed in 4.x).

### 1.3 Decisions needed

| #   | Question                                                                                                                                                         | Needed by |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| D6  | Incremental rollout on `letshyre.ai` (§1.1)?                                                                                                                     | 🔵 4      |
| D7  | **One sign-in page for both roles** (`/sign-in`; the API returns the role)? Today there are two (`/employer/sign-in`, `/employee/sign-in`); both would redirect. | 6.2       |
| D8  | Product tour: keep `react-joyride` (heavy, its own styling) or build a small tour from shadcn `Popover`?                                                         | 6.3       |
| D9  | Data tables: add `@tanstack/react-table` (shadcn's `data-table` pattern) for jobs, applicants, candidate pool, invoices, team?                                   | 5.6       |

### 1.4 What the backend needs to provide

| #   | Item                                                                                                                                                 | Needed by | Blocks                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------- |
| B1  | **Staging API** with Razorpay **test keys**, plus test accounts: employer (onboarded), employer (not onboarded), employee (complete), employee (new) | 5.7       | E2E fixtures, every UAT, the billing slice         |
| B2  | **OpenAPI schema** (drf-spectacular), if available. Otherwise we write Zod schemas by hand from captured responses                                   | 5.2       | Speed and accuracy of every slice                  |
| B3  | Meta **Conversions API** for `CompleteRegistration` and `Purchase`, so the app loads no pixel                                                        | 6.2, 6.8  | Conversion tracking after cut-over                 |
| B4  | **CORS** for `app.letshyre.ai` (credentials allowed, explicit origin)                                                                                | Phase 7   | Subdomain move                                     |
| B5  | Optional, recommended: **httpOnly refresh-token cookie** with `Domain=.letshyre.ai` ([token-storage.md](./security/token-storage.md))                | Phase 7   | Removes the forced re-login and the XSS token risk |

---

## Step overview

| Step | Title                                                            | Est.  | Gate                                |
| ---- | ---------------------------------------------------------------- | ----- | ----------------------------------- |
| 5.1  | `apps/app` skeleton (SPA, providers, env, CSP, budgets)          | 1 d   |                                     |
| 5.2  | `@workspace/api`: all methods, uploads, downloads, error copy    | 1 d   |                                     |
| 5.3  | `@workspace/auth`: session, refresh, guards                      | 1.5 d |                                     |
| 5.4  | App i18n: locale resolution, whole-app readiness, key map        | 1 d   |                                     |
| 5.5  | Dashboard shell: sidebar, topbar, user menu, credits             | 2 d   | 🔵 4 (shell design + rollout model) |
| 5.6  | App building blocks: data table, filters, upload, wizard, states | 2 d   |                                     |
| 5.7  | Test harness: API fixtures, auth fixtures, MSW for unit tests    | 1 d   |                                     |
| 5.8  | Rollout infra: route manifest, nginx map, cross-app links        | 1 d   |                                     |
| 6.1  | Pilot: public shared scorecard                                   | 1.5 d |                                     |
| 6.2  | Auth: get-started, sign-in, register (OTP), forgot password      | 3 d   | 🔵 5 (first live slice)             |
| 6.3  | Employer dashboard + product tour                                | 2 d   |                                     |
| 6.4  | Employer onboarding (KYC)                                        | 1.5 d |                                     |
| 6.5  | Jobs: post (JD parse), list, detail/edit, applicants             | 4 d   | 🔵 6 (table + form patterns)        |
| 6.6  | Candidate pool, unlock, unlocked candidates                      | 3 d   |                                     |
| 6.7  | Candidate profile + scorecard views (both roles)                 | 2 d   |                                     |
| 6.8  | Billing (Razorpay) + invoices                                    | 2 d   |                                     |
| 6.9  | Team, shared links, employer profile                             | 2.5 d |                                     |
| 6.10 | Employee onboarding wizard (resume AI, photo, documents)         | 3 d   |                                     |
| 6.11 | Employee: profile, find jobs, applications, score cards, guide   | 3 d   |                                     |
| 6.12 | Assistant (chatbot) for both roles                               | 1 d   |                                     |
| 6.13 | App translation batch + readiness                                | 1 d   |                                     |
| 7.1  | Subdomain move: `app.letshyre.ai`                                | 2 d   | 🔵 7 (all routes on the new app)    |
| 8.1  | Decommission legacy, ADRs, `apps/admin` template doc             | 1.5 d |                                     |

**Total ≈ 8–9 weeks of engineering** for one engineer, plus UAT turnaround per slice. With the
incremental rollout, the first slice is live after about 2 weeks.

---

## Phase 5: App foundation

### 5.1 `apps/app` skeleton

- React Router 8, `ssr: false`, **no prerender** (SPA mode emits one `index.html`).
  `routes.ts` is explicit (no `flatRoutes()`), like marketing.
- Same toolchain as marketing: Tailwind 4 + `@workspace/ui`, ESLint `reactRouterApp` preset with
  boundaries, Vitest, Playwright (chromium, webkit, mobile), knip entry, `turbo.json` outputs.
- `root.tsx`: `<html lang dir>` from the resolved locale, `QueryClientProvider`, `Toaster`,
  `TooltipProvider`, global `ErrorBoundary`, `meta` = `noindex, nofollow` on every page.
- `entry.client.tsx`: hydrate after first paint (copied from marketing).
- `lib/env.ts` + `env.schema.ts` validated in `vite.config.ts` (marketing pattern).
  Vars: `VITE_ENV`, `VITE_APP_URL`, `VITE_SITE_URL` (links back to marketing), `VITE_API_BASE_URL`,
  `VITE_COOKIE_DOMAIN`. `preview.host = 127.0.0.1`.
- `scripts/postbuild.ts`: CSP hashes for `index.html` (reuses marketing's `csp.ts`, moved to
  `tooling/` once two apps use it), JS budget **measured on the first build, then ratcheted**.
  Policy: `script-src 'self' <hashes> https://checkout.razorpay.com`, `frame-src https://api.razorpay.com`,
  `connect-src 'self' <api>`, `img-src 'self' data: blob: <media host>`, `media-src 'self' blob:`.
- **Exit:** `pnpm --filter app build` and `dev` work; an empty dashboard route renders; CI runs it.

### 5.2 `@workspace/api`: what the dashboards need

Today the client has `get` and `post`, enough for marketing. Add:

- `put`, `patch`, `delete` (same envelope and error handling; only GET is retried).
- **Multipart:** `body instanceof FormData` skips JSON encoding and the content-type header.
  Upload progress (`fetch` has none): a small `xhrUpload()` for the three large uploads
  (resume, JD, KYC documents) that reports progress and supports abort.
- **Downloads:** `getBlob(path)` for the desktop installer and invoice PDFs.
- **Error copy:** port `lib/apiErrorMessages.js` + `authErrorMessages.js` as
  `errorMessageKey(error)` → i18n key, with their existing tests.
- Pagination envelope helper (`{ count, next, previous, results }`) with a Zod factory.
- **Exit:** unit tests for each method, multipart, abort, progress, 401 hook.

### 5.3 `@workspace/auth`

New package (app and future admin use it; marketing never loads it).

- **Session store:** reads and writes **the same `localStorage` keys as legacy** (`accessToken`,
  `refreshToken`, `user`) so old and new screens share one session during the rollout. Drops the
  `user.refresh_token` fallback; strips refresh tokens out of `user` on read.
- **Single-flight refresh:** concurrent 401s wait for one `login_refresh` call, rotated refresh
  token saved, bounded by a timeout. Port of `services/api.js` with its tests.
- `login`, `logout` (server revoke, then clear), `me`, `useSession()` (`useSyncExternalStore`),
  **cross-tab sync** via the `storage` event (sign out in one tab signs out all).
- Guards as `clientMiddleware`: `requireAuth({ roles })`, `requireGuest()`, employer onboarding gate,
  and the `/employer/billing` sign-in redirect with `?next=` (behaviour added in 4.5).
- `ROLES`, `roleHome()`, `safeNext()` (same-site path check, already proven in legacy tests).
- **Exit:** ≥ 90% coverage; legacy's `requireAuth.test`, `useAuth.test`, `api.test`,
  `authStorage.test` cases all ported and green.

### 5.4 App i18n

- No `/:lang` prefix. Locale = user choice → `lh_locale` cookie (shared with marketing) →
  `navigator.languages` → `en`.
- **Readiness is per app, not per page:** a locale is offered only when every app namespace is
  complete; otherwise the app falls back to English entirely. No mixed-language screens.
- Catalogs in `apps/app/app/locales/<lng>/<ns>.json`, lazy per namespace via the route `handle`.
- **Translation reuse:** extend `tooling/i18n/key-map.json` + `pnpm i18n:migrate` to the 13 app
  namespaces. Copy that is kept verbatim keeps all 18 translations; new copy goes through
  `pnpm i18n:apply` (step 6.13).
- **Exit:** typed keys for app namespaces; language switcher in the user menu writes the cookie.

### 5.5 Dashboard shell → 🔵 Gate 4

- `layouts/dashboard-layout.tsx` on shadcn `Sidebar` (collapsible to icons, `Sheet` on mobile),
  `SidebarInset`, topbar with breadcrumb, page title slot, credits balance (employer), user menu
  (profile, language, sign out with confirm).
- Two nav configs (employer, employee) as data, with active state from the route.
- Skip link, landmarks, focus moves to `<h1>` on route change, delayed progress bar (from blocks).
- **🔵 Gate 4:** you review the shell at 360/768/1280/1920 with one real page (employer dashboard
  cards) and decide D6 (rollout model).

### 5.6 App building blocks

In `apps/app/app/components/` (app-shared; moves to `@workspace/blocks` only if admin needs it):

- `DataTable` (D9): sorting, server pagination, column visibility, row actions, empty/error/loading
  rows, mobile card layout below `md`. Filters and page live in **search params**.
- `FileDropzone` with type/size validation, progress, retry, and an accessible fallback input.
- `Wizard` (stepper + per-step validation + persisted draft) for the two onboarding flows.
- `ConfirmDialog`, `StatusBadge` (job, application, unlock statuses), `CopyButton`, `PageHeader`,
  `QueryState` (loading skeleton / error with retry / empty) wrapping every query.
- **Exit:** each block has unit + axe tests and a Playwright check on mobile.

### 5.7 Test harness

- **API fixtures:** capture real responses from staging (B1) for each endpoint, scrub personal data,
  commit as `e2e/fixtures/<endpoint>.json`. Every Zod schema is tested against its fixture, so a
  backend shape change fails one clear test.
- Playwright: `mockApi(page, overrides)` (marketing pattern) plus **auth fixtures** that seed
  `localStorage` for each role (employer, employer-not-onboarded, employee, guest).
- Vitest: MSW for service and query tests.
- Per-slice smoke + axe across all routes; per-locale sweeps Chromium only (§1.2).
- **Exit:** a sample test signs in as each role and lands on its home.

### 5.8 Rollout infrastructure (incremental model)

- `apps/app/app/lib/live-routes.ts`: the list of path patterns served by the new app. The build writes
  `build/live-routes.map` from it.
- nginx (`infra/nginx/sites/letshyre.ai.conf`): a `map` from that file decides, per request, whether
  `/employer/*`, `/employee/*`, … go to `app/current/client/index.html` or the legacy shell. Assets:
  marketing → app → legacy fallback (hashed names never collide).
- `AppLink`: a client-side `<Link>` for live routes and a full page load (`reloadDocument`) for routes
  still on legacy.
- **One small legacy patch:** legacy navigates client-side, so it would keep rendering its own copy of
  a migrated screen. A `clientLoader` on each migrated legacy route, generated from the same manifest,
  does a full page load to that URL instead, so nginx hands it to the new app.
- Docker nginx test extended: each live route serves the new app, each other route the legacy shell.
- **Exit:** a dummy live route switches between apps by editing one line; tests cover both states.

---

## Phase 6: Features (one slice = one release)

**Every slice follows the same steps:**

1. **Parity list** from the legacy screen: every behaviour, state, validation rule and API call,
   plus its legacy tests. Written into the PR before coding.
2. Feature folder + thin routes, Zod schemas checked against fixtures, queries/mutations, page UI
   redesigned on shadcn defaults.
3. English copy, translations reused through the key map.
4. Tests: unit (schemas, services, lib), component tests for logic-heavy parts, Playwright main flow +
   axe at 360 and 1280, every loading/empty/error state.
5. UAT on staging with real test accounts (B1) → add the route to `live-routes.ts` → release →
   watch errors for 48 h. Rollback = remove the route from the manifest.

### 6.1 Pilot: public shared scorecard

`/shared-scorecard/:shareId`, read-only, no auth: the lowest-risk way to prove the build, nginx
switch, API client, error pages and CSP in production. `noindex`, `Referrer-Policy: no-referrer`.

### 6.2 Auth → 🔵 Gate 5

`/get-started` (role choice), sign-in (D7), employer and employee registration with email + mobile
OTP (`send_otp`, `verify_otp`, `mobile_send_otp`, `mobile_verify_otp`), password set, forgot password.
Keeps `?next=` and `state.from` returns. Resend timers, OTP paste/autofill (`autocomplete="one-time-code"`),
rate-limit messages. `CompleteRegistration` via B3.
**🔵 Gate 5:** first slice live for real users; you confirm the release and rollback process.

### 6.3 Employer dashboard + tour

Dashboard cards (`employer_dashboard_cards`), credits card, quick actions. Tour per D8, shown once,
restartable from the user menu, keyboard and screen-reader usable.

### 6.4 Employer onboarding (KYC)

The onboarding gate, company details, KYC document upload (`employer_kyc`), with the persisted wizard.

### 6.5 Jobs → 🔵 Gate 6

Post job with JD upload and AI parse (`employer_job_jd_ai/parse`), list with filters, job detail and
edit, applicants per job with AI match (`employer_job_ai/matching`), candidate management actions.
**🔵 Gate 6:** you approve the table and form patterns here; later slices reuse them unchanged.

### 6.6 Candidate pool, unlock, unlocked candidates

Pool search and filters, **unlock (spends credits)** with cost preview and confirm, insufficient-credit
path to billing, unlocked list. Port all unlock tests; unlock is money-adjacent.

### 6.7 Candidate profile + scorecard views

One `features/candidate` exporting `CandidateProfileView` and `ScorecardView` through its `index.ts`.
Used by the employer routes (unlocked candidate, applicant) and the employee routes (own scorecard),
composed in routes, so no feature imports another. Interview recording player, share link creation.

### 6.8 Billing + invoices

`/employer/billing?checkout=<key>` (contract from Phase 4), plan grid, top-ups, Razorpay Checkout
(`create_razorpay_order` → widget → `verify_razorpay_order`), price-changed and cancelled states,
invoices with PDF download. Razorpay script loaded on demand; CSP allows only its origins.
**Exit includes a real Razorpay test-mode purchase on staging** (the item open since Phase 4).

### 6.9 Team, shared links, employer profile

Invite and remove team members, seat limits from the plan, shared links list and revoke, company
profile edit with logo upload.

### 6.10 Employee onboarding wizard

Identity, **photo via camera** (`getUserMedia`, with upload fallback and clear permission-denied
help), resume upload with AI review polling (`candidate_resume_ai/upload` → `status/:id` →
`review_data/:id`, polled with TanStack `refetchInterval`, stopped on done/error/unmount), skills for
role, preferences, documents. Draft in Zustand `persist` without `File` objects (legacy behaviour).

### 6.11 Employee pages

Profile view and edit, find jobs (filters in the URL), my applications, score cards list + detail,
interview guide, link to the desktop app download (marketing page).

### 6.12 Assistant

Reuse marketing's assistant feature as a shared block (`@workspace/blocks` or a small package) in
signed-in mode (session id per user), in the sidebar as a page and a sheet.

### 6.13 App translation batch

Everything new or reworded since the key-map migration, through `pnpm i18n:apply`, reviewed by a
native speaker per locale before the locale is switched on (§5.4).

---

## Phase 7: Subdomain move

### 7.1 `app.letshyre.ai` → 🔵 Gate 7

Preconditions: every app route is in `live-routes.ts`, legacy serves nothing, B4 done (and ideally B5).

- New nginx server block for `app.letshyre.ai` (SPA fallback, CSP, `noindex`), HSTS with
  `includeSubDomains` once every subdomain is HTTPS.
- `letshyre.ai/{employer,employee,get-started,forgot-password,shared-scorecard,sign-in}/*` → **301**
  to the same path and query on `app.letshyre.ai`. Shared scorecard links already sent keep working.
- Marketing `VITE_APP_URL=https://app.letshyre.ai`, rebuild.
- **Session:** `localStorage` does not cross origins. Without B5, users sign in once more; an in-app
  banner a week before and a clear message on the sign-in page. With B5, the refresh cookie on
  `.letshyre.ai` signs them in silently.
- Monitor sign-in success rate and error rate for 7 days. Rollback: remove the 301s.

---

## Phase 8: Decommission

### 8.1 Cleanup

- Delete `apps/legacy`, `infra/nginx/legacy`, the interim routes and the live-routes map.
- ADRs for the decisions in this plan (`docs/adr/`).
- `docs/new-app.md`: how `apps/admin` starts from `apps/app` (shares `ui`, `blocks`, `i18n`, `api`,
  `auth`; own role guard, own subdomain).
- Backlog: httpOnly cookie auth if not done (B5), CSP enforce on the app, error monitoring (Sentry or
  similar) with web-vitals, TypeScript 7 when typescript-eslint supports it.

---

## Risks

| #   | Risk                                                                 | Mitigation                                                                                                 |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| R10 | Backend response shapes differ from what legacy assumed (no OpenAPI) | Fixtures captured from staging; each Zod schema tested against them; parse failures reported, not crashing |
| R11 | Money flows (unlock, checkout) regress                               | Ported tests, Razorpay test-mode purchase in every billing release, unlock confirm shows cost              |
| R12 | Users bounce between old and new screens during the rollout          | Same session keys; shell looks the same across slices; slices grouped by area, not single screens          |
| R13 | Camera, uploads or polling behave differently on real devices        | UAT on Android Chrome + iOS Safari + Windows Chrome per slice; upload fallback for denied camera           |
| R14 | No staging or test accounts (B1)                                     | Blocks UAT and the billing slice. Work up to 5.6 can proceed without it                                    |
| R15 | Translation quality in the app                                       | Native review before a locale is switched on; until then the app falls back to English entirely            |

---

## What I need from you (and when)

| Need                                                 | By step  |
| ---------------------------------------------------- | -------- |
| Approve this plan; decide D6 (incremental rollout)   | 5.1      |
| B1: staging API, Razorpay test keys, 4 test accounts | 5.7      |
| B2: OpenAPI schema, if the backend can expose one    | 5.2      |
| D9: data-table dependency                            | 5.6      |
| 🔵 4: shell design                                   | 5.5      |
| D7: one sign-in page                                 | 6.2      |
| D8: product tour approach                            | 6.3      |
| B3: Conversions API                                  | 6.2, 6.8 |
| Native translation review per locale                 | 6.13     |
| B4 (+ B5): CORS and refresh cookie for the subdomain | 7.1      |

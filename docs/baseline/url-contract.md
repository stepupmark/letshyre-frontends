# URL & handoff contract

The URLs the migration must keep working, how they change, and every link from marketing into the
dashboard app. Playwright (`e2e/url-contract.spec.ts`, `e2e/handoff.spec.ts`, `e2e/seo.spec.ts`)
asserts this file against `e2e/serve.ts`, a local server that follows [§5](#5-host-requirements);
the real host must meet §5 too. Changing it needs a deliberate edit here first.

## 1. Marketing URLs (letshyre.ai)

**The set of pages does not change:** 9 pages × 19 locales, same paths. Only the URL _form_ is fixed.

| Request                                   | Live today                | After launch                   | Why                                                      |
| ----------------------------------------- | ------------------------- | ------------------------------ | -------------------------------------------------------- |
| `/en/pricing` (canonical form)            | 301 → `/en/pricing/`      | **200**                        | Canonicals and sitemap already use this form (defect S1) |
| `/en/pricing/`                            | 200                       | 301 → `/en/pricing`            | One URL per page                                         |
| `/en`                                     | 301 → `/en/`              | **200**                        | Same as above                                            |
| `/`                                       | 200 app shell (`noindex`) | 301 → `/en`                    | Defect S4. Bots and first visits land on real content    |
| `/hi/pricing` (page not ready in `hi`)    | 200 empty shell           | 302 → `/en/pricing`            | Defect S3. 302 because it becomes 200 once translated    |
| `/xx/anything`, `/en/does-not-exist`      | 200 shell                 | **404** (prerendered 404 page) | Defect S2                                                |
| `/assets/<missing>`                       | 200 shell                 | 404                            | Defect S2                                                |
| `/sitemap.xml`, `/robots.txt`             | 200                       | 200 (regenerated each build)   |                                                          |
| `/og/*.jpg`, favicons, `site.webmanifest` | 200                       | 200 (same paths, new images)   | Social cards and bookmarks keep working                  |

Pages: `/:lang`, `/:lang/about`, `/:lang/contact`, `/:lang/download`, `/:lang/interview-guide`,
`/:lang/employer-guide`, `/:lang/candidate-guide`, `/:lang/employers` and `/:lang/candidates`
(English only for now), `/:lang/pricing`,
`/:lang/terms`, `/:lang/privacy-policy`, `/:lang/refund-policy`.
`/:lang/policy` moved to `/:lang/privacy-policy` (301).
`/:lang/how-it-works-interview` moved to `/:lang/interview-guide` (301).
`/:lang/interview-guide` moves to `/:lang/candidate-guide` (301) in each locale the candidate guide
ships in; today that's `en` only (`REPLACED_BY` in `app/lib/pages.ts`).
Locales: `en hi fr ja ar te ta es nl ru kn ml ur bn de pt it ko id`.

## 2. App routes

The app serves these on `letshyre.ai`, the same origin as marketing
([ADR 0004](../adr/0004-incremental-rollout.md)). The full list is in [§6](#6-app-urls-appsapp).

| Path                                       | Behaviour                                                       |
| ------------------------------------------ | --------------------------------------------------------------- |
| `/` (app root)                             | role choice, same page as `/get-started`; sign-out lands here   |
| `/get-started`                             | alias of the `/sign-in` role choice                             |
| `/forgot-password`                         | same path                                                       |
| `/employer/sign-in`, `/employee/sign-in`   | redirect to `/sign-in` ([ADR 0017](../adr/0017-auth-screens.md)) |
| `/employer/register`, `/employee/register` | same paths                                                      |
| `/employer/**`, `/employee/**`             | cleaned-up paths, old ones redirect ([§6](#6-app-urls-appsapp)) |
| `/shared-scorecard/:shareId`               | same path                                                       |

Links already sent to people (shared scorecards, password-reset emails) keep working. All app paths
keep `X-Robots-Tag: noindex, nofollow`. A move to `app.letshyre.ai` is deferred.

## 3. Marketing → app handoff links

All come from one module (`apps/marketing/app/lib/app-links.ts`) built from `VITE_APP_URL`.
`VITE_APP_URL` is `https://letshyre.ai` in production.

| Marketing CTA                                    | Path on `VITE_APP_URL`                 | Notes                                                                                                              |
| ------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Log in (header)                                  | `/get-started`                         | Role choice, then sign-in. Becomes `/sign-in` once the app has unified sign-in                                     |
| Get started (header), "I'm hiring", Start hiring | `/employer/register`                   |                                                                                                                    |
| "I'm looking for a job", Apply                   | `/employee/register`                   |                                                                                                                    |
| Pricing: Free plan "Start free"                  | `/employer/register`                   |                                                                                                                    |
| Pricing: buy plan / top-up                       | `/employer/billing?checkout=<key>`     | `<key>` = plan id or `<n>-credits`, same as today's `?checkout=` values. Signed-out users sign in and return here. |
| Pricing: Custom "Talk to sales"                  | marketing `/:lang/contact?topic=sales` | Stays on marketing                                                                                                 |
| Download page: "Sign in" mention                 | `/employee/sign-in`                    | Redirects to `/sign-in` in the new app                                                                             |

The language is carried across via the `lh_locale` cookie (`Domain=.letshyre.ai`), not the URL.

## 4. App → marketing links

The dashboards link to `/en/pricing`, `/en/terms`, `/en/policy` (301 to `/en/privacy-policy`), `/en/refund-policy`, `/en/contact`, `/en`.
These are served by the marketing build on the same origin.

## 5. Host requirements

The nginx config was removed and no host is chosen yet. Whatever serves `build/client` must:

- `/` → 301 `/en`.
- Moved and replaced pages → 301 to their new path. `build/redirects.map` lists them as nginx map
  lines.
- Trailing slash → 301 to the same path without it.
- A page not ready in a locale → 302 `/en/...`.
- Unknown paths → 404 with the prerendered `/404` page as the body.
- Prerender writes `en/pricing/index.html`. Serve it at `/en/pricing` with 200, without redirecting to
  `/en/pricing/` (many static hosts do this by default).
- Each HTML response gets its policy from `build/csp.map` as `Content-Security-Policy-Report-Only`
  (or `Content-Security-Policy` once enforced), with `frame-ancestors 'none'` appended; browsers
  ignore that directive in a meta tag.
- Every response sends `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and, on HTTPS,
  `Strict-Transport-Security: max-age=31536000; includeSubDomains`.

## 6. App URLs (`apps/app`)

Cleaned up 2026-10 ([ADR 0014](../adr/0014-app-route-config.md)). `app/routes.ts` is the source;
links are typed with `href()`.

| Area       | Paths                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth       | `/sign-in`, `/get-started`, `/forgot-password`, `/employer/register`, `/employee/register`                                                                                                                                                                                                                                                                                                                                               |
| Public     | `/shared-scorecard/:shareId`                                                                                                                                                                                                                                                                                                                                                                                                             |
| Onboarding | `/employer/onboarding`, `/employee/onboarding`                                                                                                                                                                                                                                                                                                                                                                                           |
| Employer   | `/employer/dashboard`, `/employer/jobs`, `/employer/jobs/new`, `/employer/jobs/:jobId`, `/employer/jobs/:jobId/edit`, `/employer/jobs/:jobId/applicants`, `/employer/candidates`, `/employer/candidates/unlocked`, `/employer/candidates/:candidateId`, `/employer/candidates/:candidateId/scorecard`, `/employer/billing`, `/employer/invoices`, `/employer/team`, `/employer/shared-links`, `/employer/company`, `/employer/assistant` |
| Employee   | `/employee/jobs`, `/employee/applications`, `/employee/scorecards`, `/employee/scorecards/:scorecardId`, `/employee/profile`, `/employee/interview-guide`, `/employee/assistant`                                                                                                                                                                                                                                                         |

Sign-in sends employers to `/employer/dashboard` and candidates to `/employee/jobs`. Any other
`/employer/*` or `/employee/*` path is a 404 inside the dashboard shell.

**Old URLs keep redirecting.** `routes/moved.tsx` redirects in the browser using the map in
`app/lib/moved.ts`; the query string is kept. A host can add 301s from the same map later. Never
remove an entry: these URLs are in bookmarks and sent emails.

| Old                                      | New                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `/employer/sign-in`, `/employee/sign-in` | `/sign-in`                                                                     |
| `/employer`                              | `/employer/dashboard`                                                          |
| `/employer/post-job`                     | `/employer/jobs/new`                                                           |
| `/employer/view-jobs`                    | `/employer/jobs`                                                               |
| `/employer/view-jobs/:jobId`             | `/employer/jobs/:jobId`                                                        |
| `/employer/view-jobs/:jobId?edit=1`      | `/employer/jobs/:jobId/edit`                                                   |
| `/employer/view-jobs/applicants/:jobId`  | `/employer/jobs/:jobId/applicants`                                             |
| `/employer/candidate-pool`               | `/employer/candidates`                                                         |
| `/employer/unlocked-candidates`          | `/employer/candidates/unlocked`                                                |
| `/employer/employee-profile?id=<id>`     | `/employer/candidates/<id>` (no id: `/employer/candidates/unlocked`)           |
| `/employer/employee-score-card?id=<id>`  | `/employer/candidates/<id>/scorecard` (no id: `/employer/candidates/unlocked`) |
| `/employer/invoice`                      | `/employer/invoices`                                                           |
| `/employer/your-team`                    | `/employer/team`                                                               |
| `/employer/profile`                      | `/employer/company`                                                            |
| `/employer/chatbot`                      | `/employer/assistant`                                                          |
| `/employee`, `/employee/find-jobs`       | `/employee/jobs`                                                               |
| `/employee/my-applications`              | `/employee/applications`                                                       |
| `/employee/score-cards-list`             | `/employee/scorecards`                                                         |
| `/employee/scorecard?id=<id>`            | `/employee/scorecards/<id>` (no id: `/employee/scorecards`)                    |
| `/employee/chatbot`                      | `/employee/assistant`                                                          |

Unchanged: `/employer/billing`, `/employer/shared-links`, `/employer/onboarding`, `/employer/register`,
`/employee/profile`, `/employee/interview-guide`, `/employee/onboarding`, `/employee/register`.
The `/employer` and `/employee` prefixes stay (`lib/app-paths.ts`, host routing); `/employee` is
not renamed to `/candidate` because backend emails and host config use it.

## Approved (Gate 1, 2026-10-03)

- No-slash URLs are canonical and served with 200. The trailing-slash form 301s to them.
- "Log in" goes to `/get-started` until the app has a unified sign-in.

# URL & handoff contract

The URLs the sites answer, and every link between marketing and the dashboard app. Playwright
(`e2e/url-contract.spec.ts`, `e2e/handoff.spec.ts`, `e2e/seo.spec.ts`) asserts this file against
`e2e/serve.ts`, a local server that follows [§5](#5-host-requirements); CloudFront
(`infra/cloudfront/`) follows the same rules. Changing it needs a deliberate edit here first.

The sites launch without redirects ([ADR 0022](../adr/0022-hosting-s3-cloudfront.md)): the old
`letshyre.ai` had fewer than 10 users, so its old URLs are 404s rather than mapped to new ones.

## 1. Marketing URLs (`beta.letshyre.ai`, later `letshyre.ai`)

| Request                                     | Answer                         | Why                                                   |
| ------------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| `/en/pricing` (canonical form)              | **200**                        | Canonicals and sitemap use this form                  |
| `/en/pricing/`                              | 301 → `/en/pricing`            | One URL per page                                      |
| `/en/pricing/index.html`, `/en/index.html`  | 301 → `/en/pricing`, `/en`     | Same as above                                         |
| `/en`                                       | **200**                        |                                                       |
| `/`, `/index.html`                          | 301 → `/en`                    | Bots and first visits land on real content            |
| `/hi/pricing` (page not published in `hi`)  | **404**                        | No fallback redirect; links only offer published ones |
| `/xx/anything`, `/en/does-not-exist`        | **404** (prerendered 404 page) |                                                       |
| `/en/policy`, `/en/home-v2` (old paths)     | **404**                        | Not redirected (ADR 0022)                             |
| `/assets/<missing>`                         | 404                            | Never the HTML shell                                  |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`  | 200 (regenerated each build)   |                                                       |
| `/og/*.jpg`, favicons, `site.webmanifest`   | 200                            |                                                       |
| Any host but the canonical one              | 301 → same path on it          | `www.`, the `cloudfront.net` name, later `beta.`      |

The query string is kept on every redirect.

Pages: `/:lang`, `/:lang/about`, `/:lang/contact`, `/:lang/download`, `/:lang/interview-guide`,
`/:lang/employer-guide`, `/:lang/candidate-guide`, `/:lang/employers` and `/:lang/candidates`
(English only for now), `/:lang/pricing`,
`/:lang/terms`, `/:lang/privacy-policy`, `/:lang/refund-policy`.
`/:lang/blogs` and `/:lang/blogs/:slug` ship only in locales with a published post; today that's `en`
only ([ADR 0021](../adr/0021-marketing-blog.md)). A post's slug never changes once published. Each of
those locales also has its RSS feed at `/:lang/blogs/feed.xml`, and a page per topic with a post,
`/:lang/blogs/topics/:topic`. Past ten posts the index runs on to `/:lang/blogs/page/:n`, nine
posts a page. A tag with three or more posts has `/:lang/blogs/tags/:tag`.
The glossary is `/:lang/blogs/glossary`, one page per entry at `/:lang/blogs/glossary/:term`, in
locales with an entry. Saved posts are a view of the index, `/:lang/blogs?saved=1`, kept in the
reader's browser.
`/:lang/interview-guide` is dropped in each locale the candidate guide ships in; today that's `en`
only (`REPLACED_BY` in `app/lib/pages.ts`), so `/en/interview-guide` is a 404.

The blog's URLs (`e2e/url-contract.spec.ts` checks each):

| Request                                               | Answer | Why                                      |
| ----------------------------------------------------- | ------ | ---------------------------------------- |
| `/en/blogs`, `/en/blogs/:slug`, `/en/blogs/feed.xml`  | 200    |                                          |
| `/en/blogs/topics/:topic` (topic has a post)          | 200    |                                          |
| `/en/blogs/page/:n` (2 up to the last page)           | 200    |                                          |
| `/en/blogs/tags/:tag` (tag has a post)                | 200    |                                          |
| `/en/blogs/glossary`                                  | 200    |                                          |
| `/en/blogs/glossary/:term`                            | 200    |                                          |
| `/hi/blogs/:slug` (post not written in `hi`)          | 404    | Same rule as any page not published there |
| `/en/blogs/topics`                                    | 404    |                                          |
| `/en/blogs/topics/:topic` (known topic, no post yet)  | 404    | Becomes a 200 once a post uses the topic |
| `/en/blogs/topics/nonsense`, `/en/blogs/no-such-post` | 404    |                                          |
| `/en/blogs/page/1`, a page past the last              | 404    | Page one is `/en/blogs`                  |

Post slugs `topics`, `tags`, `page`, `authors`, `feed`, `archive`, `glossary`, `saved` and `series` are
reserved and fail the build.

Locales: `en hi fr ja ar te ta es nl ru kn ml ur bn de pt it ko id`.

## 2. App routes (`app.letshyre.ai`)

The app has its own origin ([ADR 0022](../adr/0022-hosting-s3-cloudfront.md)). The full list is in
[§6](#6-app-urls-appsapp).

| Path                                       | Behaviour                                                       |
| ------------------------------------------ | --------------------------------------------------------------- |
| `/` (app root)                             | role choice, same page as `/get-started`; sign-out lands here   |
| `/get-started`                             | alias of the `/sign-in` role choice                             |
| `/forgot-password`                         |                                                                 |
| `/employer/sign-in`, `/employee/sign-in`   | each role's sign-in page ([ADR 0017](../adr/0017-auth-screens.md)) |
| `/employer/register`, `/employee/register` |                                                                 |
| `/employer/**`, `/employee/**`             | dashboard pages ([§6](#6-app-urls-appsapp))                      |
| `/shared-scorecard/:shareId`               | public scorecard                                                |

Every app response carries `X-Robots-Tag: noindex, nofollow`.

## 3. Marketing → app handoff links

All come from one module (`apps/marketing/app/lib/app-links.ts`) built from `VITE_APP_URL`.
`VITE_APP_URL` is `https://app.letshyre.ai` in production.

| Marketing CTA                                    | Path on `VITE_APP_URL`                 | Notes                                                                                           |
| ------------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Log in (header)                                  | `/get-started`                         | Role choice, then sign-in                                                                       |
| Get started (header), "I'm hiring", Start hiring | `/employer/register`                   |                                                                                                 |
| "I'm looking for a job", Apply                   | `/employee/register`                   |                                                                                                 |
| Pricing: Free plan "Start free"                  | `/employer/register`                   |                                                                                                 |
| Pricing: buy plan / top-up                       | `/employer/billing?checkout=<key>`     | `<key>` = plan id or `<n>-credits`. Signed-out users sign in and return here.                   |
| Pricing: Custom "Talk to sales"                  | marketing `/:lang/contact?topic=sales` | Stays on marketing                                                                              |
| Download page: "Sign in" mention                 | `/employee/sign-in`                    | The candidate sign-in page                                                                      |

The language is carried across via the `lh_locale` cookie (`Domain=.letshyre.ai`), not the URL.

## 4. App → marketing links

The dashboards link to marketing with absolute URLs from `apps/app/app/lib/site.ts`, built from
`VITE_SITE_URL`, in the reader's language: pricing, terms, privacy policy, refund policy, contact
and download, which ship in every locale. The guides ship in English only, so guide links go to
the English guide until a locale is added to `GUIDE_LOCALES` there.

## 5. Host requirements

docs/deployment.md has the CloudFront set-up. Whatever serves `build/client` must:

- `/` and `/index.html` → 301 `/en`; `…/index.html` → 301 to the path without it.
- Trailing slash → 301 to the same path without it.
- Any host but the canonical one → 301 to the same path on it.
- No other redirects.
- Prerender writes `en/pricing/index.html`. Serve it at `/en/pricing` with 200, without redirecting to
  `/en/pricing/` (many static hosts do this by default). Pages go up to four segments deep
  (`/en/blogs/glossary/<term>`).
- Unknown paths, and pages not published in the requested locale → 404 with the prerendered `/404`
  page as the body.
- Each HTML response gets its policy from `build/csp.map` as `Content-Security-Policy-Report-Only`
  (or `Content-Security-Policy` once enforced), with `frame-ancestors 'none'` appended; browsers
  ignore that directive in a meta tag.
- Every response sends `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and
  `Strict-Transport-Security: max-age=63072000; includeSubDomains`.

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

Sign-in sends employers to `/employer/dashboard` and candidates to `/employee/jobs`. The bare
`/employer` and `/employee` open those same pages. Any other `/employer/*` or `/employee/*` path is a
404 inside the dashboard shell, including the URLs from before the 2026-10 cleanup
(`/employer/view-jobs`, `/employee/find-jobs` and the rest); they aren't redirected.

The `/employee` prefix is not renamed to `/candidate` because backend emails use it.

## Approved (Gate 1, 2026-10-03; redirects removed 2026-11-18)

- No-slash URLs are canonical and served with 200. The trailing-slash form 301s to them.
- "Log in" goes to `/get-started` until the app has a unified sign-in.
- No redirects for old or missing URLs ([ADR 0022](../adr/0022-hosting-s3-cloudfront.md)).

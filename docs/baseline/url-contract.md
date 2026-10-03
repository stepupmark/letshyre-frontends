# URL & handoff contract (step 0.4)

The URLs the migration must keep working, how they change, and every link from marketing into the
dashboard app. Playwright (`e2e/handoff.spec.ts`, `e2e/seo.spec.ts`) and the nginx test (step 4.6)
assert this file. Changing it needs a deliberate edit here first.

## 1. Marketing URLs (letshyre.ai)

**The set of pages does not change:** 9 pages × 19 locales, same paths. Only the URL *form* is fixed.

| Request | Live today | After launch | Why |
|---|---|---|---|
| `/en/pricing` (canonical form) | 301 → `/en/pricing/` | **200** | Canonicals and sitemap already use this form (defect S1) |
| `/en/pricing/` | 200 | 301 → `/en/pricing` | One URL per page |
| `/en` | 301 → `/en/` | **200** | Same as above |
| `/` | 200 app shell (`noindex`) | 301 → `/en` | Defect S4. Bots and first visits land on real content |
| `/hi/pricing` (page not ready in `hi`) | 200 empty shell | 302 → `/en/pricing` | Defect S3. 302 because it becomes 200 once translated |
| `/xx/anything`, `/en/does-not-exist` | 200 shell | **404** (prerendered 404 page) | Defect S2 |
| `/assets/<missing>` | 200 shell | 404 | Defect S2 |
| `/sitemap.xml`, `/robots.txt` | 200 | 200 (regenerated each build) | |
| `/og/*.jpg`, favicons, `site.webmanifest` | 200 | 200 (same paths, new images) | Social cards and bookmarks keep working |

Pages: `/:lang`, `/:lang/about`, `/:lang/contact`, `/:lang/download`, `/:lang/how-it-works-interview`,
`/:lang/pricing`, `/:lang/terms`, `/:lang/policy`, `/:lang/refund-policy`.
Locales: `en hi fr ja ar te ta es nl ru kn ml ur bn de pt it ko id`.

## 2. App routes (served by the legacy build until Phase 7)

| Path | Interim (Phase 4 → 7) on `letshyre.ai` | Final on `app.letshyre.ai` |
|---|---|---|
| `/get-started` | legacy | same path (kept as an alias of `/sign-in` role choice) |
| `/forgot-password` | legacy | same path |
| `/employer/sign-in`, `/employee/sign-in` | legacy | same paths (redirect to `/sign-in` if unified, step 6.1) |
| `/employer/register`, `/employee/register` | legacy | same paths |
| `/employer/**`, `/employee/**` | legacy | same paths |
| `/shared-scorecard/:shareId` | legacy | same path |

From Phase 7: `letshyre.ai/<any app path>` → **301** `app.letshyre.ai/<same path + query>`. Links already
sent to people (shared scorecards, password-reset emails) keep working. All app paths keep
`X-Robots-Tag: noindex, nofollow`.

## 3. Marketing → app handoff links

All come from one module (`apps/marketing/app/lib/app-links.ts`) built from `VITE_APP_URL`.
Interim `VITE_APP_URL=https://letshyre.ai`. Final `VITE_APP_URL=https://app.letshyre.ai`.

| Marketing CTA | Path on `VITE_APP_URL` | Notes |
|---|---|---|
| Log in (header) | `/get-started` | Role choice, then sign-in. Becomes `/sign-in` once the app has unified sign-in |
| Get started (header), "I'm hiring", Start hiring | `/employer/register` | |
| "I'm looking for a job", Apply | `/employee/register` | |
| Pricing: Free plan "Start free" | `/employer/register` | |
| Pricing: buy plan / top-up | `/employer/billing?checkout=<key>` | `<key>` = plan id or `<n>-credits`, same as today's `?checkout=` values. Signed-out users sign in and return here. Needs the legacy patch (step 4.5) |
| Pricing: Custom "Talk to sales" | marketing `/:lang/contact?topic=sales` | Stays on marketing |
| Download page: "Sign in" mention | `/employee/sign-in` | |

The language is carried across via the `lh_locale` cookie (`Domain=.letshyre.ai`), not the URL.

## 4. App → marketing links (legacy, interim)

The legacy dashboards link to `/en/pricing`, `/en/terms`, `/en/policy`, `/en/refund-policy`, `/en/contact`, `/en`.
These are served by the new marketing build on the same origin, with no change needed.
Exception: "Buy credits" (`CreditUsageCard`, `Invoice`) is repointed to `/employer/billing` in step 4.5.

## Approved (Gate 1, 2026-10-03)

- No-slash URLs are canonical and served with 200. The trailing-slash form 301s to them.
- "Log in" goes to `/get-started` until the app has a unified sign-in.
- All content decisions in [content-inventory.md](./content-inventory.md) are approved as proposed.

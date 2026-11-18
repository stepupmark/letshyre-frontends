# 0022 · Hosting on S3 and CloudFront, three origins, no redirects

Accepted 2026-11-18. Supersedes [0004](./0004-incremental-rollout.md). Changes how
[0012](./0012-csp-hashes.md)'s policy reaches the browser, and drops the redirects in
[0021](./0021-marketing-blog.md).

## Context

Hosting was undecided (ADR 0012, url-contract §5), and 0004 had the app sharing `letshyre.ai`
with marketing until the backend offered a refresh cookie. The sites aren't public yet: the old
`letshyre.ai` has fewer than 10 users, so nobody depends on old URLs and a one-time re-login costs
little. DNS is at Hostinger; nobody on the team runs infrastructure-as-code.

## Decision

- **One CloudFront distribution and one private S3 bucket per app**: marketing on
  `beta.letshyre.ai` (later `letshyre.ai`), the app on `app.letshyre.ai`, admin on
  `adm.letshyre.ai`. Buckets are reached only through Origin Access Control.
- **The app moves to its own origin now.** Existing users sign in again once. Session tokens no
  longer share an origin with marketing's third-party scripts.
- **No redirects beyond URL normalisation**: HTTP → HTTPS, any other host → the canonical one,
  `/` → `/en`, a trailing slash, and `…/index.html`. Pre-launch marketing paths, the blog's topic
  redirects, the fallback from a missing locale to English and the app's pre-2026-10 dashboard
  URLs all became 404s. Only the bare `/employer` and `/employee` still open their home page.
- **Edge logic is CloudFront Functions** in `infra/cloudfront/`, tested with `pnpm test:edge`;
  `apps/marketing/e2e/serve.ts` follows the same rules so e2e tests them against the build.
- **CSP travels as S3 object metadata.** The deploy writes each HTML file's policy from `csp.map`
  into `x-amz-meta-csp`, and a viewer-response function turns it into the header, report-only or
  enforced by `x-amz-meta-csp-mode`. Enforcing is a deploy setting, no rebuild, so the meta-tag
  route (`CSP_ENFORCE=true`) isn't needed. Postbuild fails a policy over 1,800 bytes, since S3
  holds 2 KB of metadata.
- **Beta is production content that search engines skip**: `VITE_ENV=production` with
  `VITE_INDEXABLE=false`, plus an `X-Robots-Tag` from the edge.
- AWS is set up in the console; function code lives in the repo and distribution configs are
  committed as snapshots. GitHub Actions deploys through OIDC roles, one per app
  (`.github/workflows/deploy.yml`). The nightly build ADR 0021 needs is a schedule in that
  workflow, rebuilding the live commit, in place of `scheduled-build.yml` and its deploy hook.

docs/deployment.md has the full plan, the request-by-request behaviour and the runbook for the
move to `letshyre.ai`.

## Consequences

- Moving marketing from beta to the apex is a rebuild of marketing and the app, because
  `VITE_SITE_URL` is baked into both.
- A page that isn't published in a locale is a 404 there. Language links and hreflang only offer
  published locales, so only hand-typed URLs meet it.
- The 404 page is English for every locale: CloudFront allows one error page per status code.
- Once the site is public, removing or renaming a URL needs a decision of its own; there is no
  redirect map to add it to.
- Console-managed infrastructure can drift. The committed snapshots are the check; re-take one
  after every change.

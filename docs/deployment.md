# Deployment: S3 + CloudFront + GitHub Actions

Plan for hosting the three frontends on AWS. Status: proposed, 2026-11-18. Nothing here is built
yet; section 9 is the order to do it in. The four open decisions were settled on 2026-11-18
(section 11).

| App       | Domain now         | Domain later  | Build                                  | Bucket (proposed)             |
| --------- | ------------------ | ------------- | -------------------------------------- | ----------------------------- |
| marketing | `beta.letshyre.ai` | `letshyre.ai` | 250 prerendered HTML pages, 19 locales | `letshyre-prod-web-marketing` |
| app       | `app.letshyre.ai`  | same          | SPA, one `index.html`                  | `letshyre-prod-web-app`       |
| admin     | `adm.letshyre.ai`  | same          | SPA, one `index.html`                  | `letshyre-prod-web-admin`     |

`main` deploys production. Staging is out of scope for now, but every setting below is per GitHub
environment, so adding staging later means adding environments, not changing the design.

DNS stays where it is, at GoDaddy (`ns29/ns30.domaincontrol.com`). AWS resources are set up in the console; the edge function code and a
snapshot of each distribution's config live in the repo under `infra/cloudfront/`, so changes
still get reviewed.

---

## 1. What the builds need from a host

Read from the code, not assumed:

- **Marketing** (`apps/marketing/build/`)
  - `client/en/pricing/index.html` must answer `/en/pricing` with 200. No trailing slash; the
    slash form 301s to the bare form (url-contract §5).
  - `client/en/pricing.data` sits next to each page. React Router fetches it on client-side
    navigation. It is **not content-hashed**, so it caches like HTML, not like an asset.
  - `client/index.html` at the root is a `noindex` SPA fallback shell. It must never be served;
    `/` 301s to `/en`.
  - `csp.map`: 908 path → policy lines, 249 distinct policies, the longest ~900 bytes. The hashes
    change on every build, so the header is per page and per release.
  - Unknown URLs, and pages that don't ship in the requested locale, 404 with `/404/index.html`.
  - Non-HTML files: `sitemap.xml`, `robots.txt`, `llms.txt`, `en/blogs/feed.xml`,
    `en/blogs/search.json`, an IndexNow key file, `og/*`, favicons.
  - Postbuild uses `git log` for sitemap `lastmod`, so CI needs full history.
- **App and admin**: one `index.html` with a single CSP in `csp.map`. Every route path gets the
  shell; files under `/assets/` must be served as-is or 404, **never** the shell.
- **All three**: hash-based CSP shipped as `Content-Security-Policy-Report-Only` until enforced,
  plus `frame-ancestors 'none'`, HSTS, `nosniff`, `Referrer-Policy`, `X-Frame-Options`
  (ADR 0012, url-contract §5).

`apps/marketing/e2e/serve.ts` is the reference implementation of these rules; it changes with
problem 9 so it keeps matching the edge.

---

## 2. Problems found, and the fix for each

Ordered by how much they'd hurt. Items 1 to 6 block the first deploy. Problems 17 to 26, found in
a second pass over marketing, are in section 4.6; 17, 19 and 21 also block it.

| #   | Problem                                                                                                                                                                                                                                                                                                                                                                                             | Fix                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **The docs assume the app shares `letshyre.ai` with marketing.** ADR 0004, url-contract §2–§4 and `docs/launch-checklist.md` set `VITE_APP_URL=https://letshyre.ai` and say the subdomain move is deferred. You are deploying to `app.letshyre.ai`.                                                                                                                                                 | Amend ADR 0004: the subdomain move happens now, and the fewer than 10 existing users sign in again once. Update url-contract §2–§4 and the checklist. Side benefit: Meta Pixel on marketing no longer runs on the origin that holds session tokens, so ADR 0005's main risk goes away.                                                                                                   |
| 2   | **The app's navigation assumes a shared origin.** `apps/app/app/lib/app-paths.ts` lists the prefixes "the server sends to this app; everything else is the marketing site". `guard.ts` and `navigation.ts` turn any other path into a full page load of that path, which on `app.letshyre.ai` is the app's own 404. `/` (the app's role choice) isn't in the list either, so it does a full reload. | On its own origin every path is the app's. Any marketing destination must be an absolute URL from `site.ts` (`VITE_SITE_URL`). Audit callers of `go()` / `useGo()` for relative marketing paths, then make `isAppPath` test "relative URL" instead of a prefix list.                                                                                                                     |
| 3   | **`VITE_ENV` mixes three things**: indexability (robots meta, `robots.txt`, sitemap), blog drafts (`previewsOn` shows drafts and future-dated posts when `staging`) and analytics. A public beta needs production content but `noindex`. `VITE_ENV=staging` publishes drafts on the internet; `VITE_ENV=production` lets Google index `beta.letshyre.ai` with beta canonicals.                      | Add `VITE_INDEXABLE` (default: `VITE_ENV === "production"`) and use it in `root.tsx`, `renderRobots` and `seo-checks.ts`. Beta builds: `VITE_ENV=production`, `VITE_INDEXABLE=false`. The edge also sends `X-Robots-Tag: noindex` on `beta.` as a second guard.                                                                                                                          |
| 4   | **The host contract is written for nginx** (`csp.map`, `redirects.map`). CloudFront reads neither.                                                                                                                                                                                                                                                                                                  | Keep `csp.map`: the deploy script parses it with the existing `parseNginxMap` and writes each HTML file's policy into S3 object metadata (section 4.3). The redirect maps go away (problem 9).                                                                                                                                                                                           |
| 5   | **The common SPA recipe is wrong for these apps.** Most guides map CloudFront 403/404 errors to `/index.html` with 200. A missing `/assets/chunk-abc.js` then returns HTML with 200: "Failed to fetch dynamically imported module", a MIME error, and the wrong answer cached at the edge.                                                                                                          | A viewer-request function rewrites only route paths to `/index.html`; files under `/assets/` pass through and 404 honestly. No custom error responses on app and admin.                                                                                                                                                                                                                  |
| 6   | **No handling for stale chunks after a deploy.** Nothing listens for `vite:preloadError`. A tab opened before a deploy that lazy-loads a route after it gets a dead import.                                                                                                                                                                                                                         | Two parts: deploys never delete old `/assets/*` immediately (they're pruned after 30 days), and each app reloads once on `vite:preloadError` (guarded by a `sessionStorage` flag so it can't loop).                                                                                                                                                                                      |
| 7   | **URLs are baked into builds.** `VITE_SITE_URL` sits in every canonical, hreflang, sitemap entry, OG tag and `llms.txt`; the app links to marketing through it too.                                                                                                                                                                                                                                 | The beta → `letshyre.ai` move is a **rebuild of marketing and app**, not a DNS change. Section 10 is the runbook.                                                                                                                                                                                                                                                                        |
| 8   | **Buckets are named after domains** (`letshyre.ai`, `app.letshyre.ai`, `adm.letshyre.ai`). That's the old S3-website pattern. Behind CloudFront with OAC the name doesn't matter, dots break virtual-hosted HTTPS to S3, and the `letshyre.ai` bucket would first serve `beta.`.                                                                                                                    | They're empty, so replace them with the neutral names in the table above. Keep S3 website hosting off and Block Public Access on.                                                                                                                                                                                                                                                        |
| 9   | **Redirects you don't want.** Marketing: `MOVED_PATHS` (`/policy`, `/how-it-works-interview`, `/home-v2`, `/home-v3`), `REPLACED_BY` (`/en/interview-guide` → `/en/candidate-guide`), `/:lang/blogs/topics` → `/:lang/blogs`, the 302s for empty blog topics, and the 302 from a page missing in a locale to `/en/...`. App: `routes/moved.tsx` with 20 legacy dashboard URLs.                      | Delete them all (decision A). Postbuild stops writing `redirects.map` and `redirects-temporary.map`; those URLs 404. Update `serve.ts`, url-contract §1 and §6, and the e2e specs that assert those redirects. Language links and hreflang only point at locales a page ships in, so a 404 there only meets hand-typed URLs. Removing these also means marketing needs no KeyValueStore. |
| 10  | **The scheduled build calls `MARKETING_DEPLOY_HOOK`**, a Vercel/Netlify-style webhook that doesn't exist on AWS. Future-dated posts would never go live.                                                                                                                                                                                                                                            | The deploy workflow gets a `schedule` trigger that rebuilds and deploys marketing only. Delete `scheduled-build.yml`.                                                                                                                                                                                                                                                                    |
| 11  | **The default `*.cloudfront.net` domain serves a full copy of each site**, which is duplicate content for marketing.                                                                                                                                                                                                                                                                                | Every viewer-request function 301s any host that isn't the canonical one. This also covers `www.` and, later, `beta.` → apex.                                                                                                                                                                                                                                                            |
| 12  | **`index.html` duplicates**: `/en/pricing/index.html` and `/index.html` are reachable as their own URLs.                                                                                                                                                                                                                                                                                            | The marketing function 301s `…/index.html` to the bare path. The root `index.html` is excluded from the upload.                                                                                                                                                                                                                                                                          |
| 13  | **`.data`, `.webmanifest` and `.avif` get the wrong `Content-Type`** from `aws s3 sync` (`binary/octet-stream`).                                                                                                                                                                                                                                                                                    | The deploy script sets `Content-Type` from an explicit table copied from `serve.ts` (`.data` → `text/x-script`, and so on).                                                                                                                                                                                                                                                              |
| 14  | **HSTS `includeSubDomains` on `letshyre.ai` covers every subdomain**, including ones outside this repo: API, Hostinger webmail or email link-tracking hosts, the old site.                                                                                                                                                                                                                          | Before sending it from the apex, list every record in the Hostinger zone and confirm each `*.letshyre.ai` host serves HTTPS. Add `preload` only after a month without problems.                                                                                                                                                                                                          |
| 15  | **Small leftovers.** The app CSP allows images from `https://letshyre.com` (`.com`, for email logos): confirm that's still the API's logo host. The app has no `robots.txt` and relies on the meta tag.                                                                                                                                                                                             | Confirm the logo host. Send `X-Robots-Tag: noindex, nofollow` from the edge for app and admin (url-contract §2 already requires it).                                                                                                                                                                                                                                                     |
| 16  | **`/` → `/en` is a 301.** Browsers cache a 301 indefinitely, so detecting the language at the root later won't reach returning visitors.                                                                                                                                                                                                                                                            | Keep the 301 if `/en` stays the default forever (the contract approves it). If you might detect the language at the root later, switch to 302 now. The edge sends `Cache-Control: max-age=86400` on every redirect it generates, so a mistaken redirect doesn't stick.                                                                                                                   |

The only redirects left are URL normalisation: HTTP → HTTPS, wrong host → canonical host,
`/` → `/en`, trailing slash, and `…/index.html`.

---

## 3. Target architecture

```
                      GoDaddy DNS (letshyre.ai zone)
            beta.letshyre.ai      app.letshyre.ai      adm.letshyre.ai     CNAME → dXXXX.cloudfront.net
                  │                     │                     │            (apex later: ALIAS)
                  ▼                     ▼                     ▼
          ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
          │ CloudFront   │      │ CloudFront   │      │ CloudFront   │  ACM cert (us-east-1):
          │ marketing    │      │ app          │      │ admin        │  letshyre.ai, *.letshyre.ai
          │ WAF: rate    │      │ WAF: rate    │      │ WAF: rate    │  HTTP/2+3, IPv6, TLS 1.2+
          │ fn: request  │      │ fn: request  │      │ fn: request  │
          │ fn: response │      │ fn: response │      │ fn: response │
          └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
                 │ OAC (SigV4)         │ OAC                 │ OAC
                 ▼                     ▼                     ▼
          S3 marketing           S3 app                 S3 admin       private, versioned,
                                                                       SSE-S3, no website hosting
                 ▲                     ▲                     ▲
                 └──────── GitHub Actions (access keys of one IAM user)──────────┘
```

**Why three distributions, not one**: separate headers, functions, caches, WAF rules and
invalidations. A bad marketing deploy can't touch the dashboard. Separate origins also isolate
`localStorage` (the session tokens) from marketing's third-party scripts.

**Why no Lambda@Edge**: everything needed (rewrites, redirects, headers) fits in CloudFront
Functions, which run at every edge location in under a millisecond, cost a fraction as much, and
need no `us-east-1` Lambda deploys.

**Why no KeyValueStore**: once the redirects in problem 9 are gone, the edge needs no per-build
data. The canonical host is a constant in the function code and changes once, at the move to the
apex.

**Pricing plan.** The design uses only managed cache policies plus functions, so it works on
pay-as-you-go and on the flat-rate plans. Recommended:

| Distribution | Plan                      | Why                                                                    |
| ------------ | ------------------------- | ---------------------------------------------------------------------- |
| marketing    | Flat-rate **Pro**, $15/mo | Access logs (not in Free) for watching 404s after launch; 10M requests |
| app          | **Pay-as-you-go**         | No request cap; WAF and logs are optional and billed separately        |
| admin        | Flat-rate **Free**        | A few staff users                                                      |

On flat-rate plans a function can't be shared between distributions, so each distribution gets its
own (six functions in all). Custom cache policies and custom response headers policies need the
Business tier. That's why headers are set in the response function and caching is driven by
`Cache-Control` from S3 under the managed `CachingOptimized` policy.

---

## 4. CloudFront configuration

### 4.1 Distribution settings (all three)

| Setting             | Value                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Origin              | S3 **REST** endpoint of the bucket (not the website endpoint), Origin Access **Control**     |
| Viewer protocol     | Redirect HTTP to HTTPS                                                                       |
| Allowed methods     | GET, HEAD (forms post to the API, not to these hosts)                                        |
| Cache policy        | Managed `CachingOptimized`: honours S3 `Cache-Control`, ignores query/cookies, gzip + brotli |
| Origin request      | none (never forward `Host` to S3)                                                            |
| HTTP versions       | HTTP/2 and HTTP/3                                                                            |
| IPv6                | on                                                                                           |
| TLS                 | ACM cert in `us-east-1`; minimum `TLSv1.2_2021` or newer                                     |
| Default root object | empty (the functions decide)                                                                 |
| Logging             | marketing: standard logs → CloudWatch Logs, 90-day retention                                 |

Behaviors:

| App       | Path pattern | Viewer request     | Viewer response     | Custom error response                                         |
| --------- | ------------ | ------------------ | ------------------- | ------------------------------------------------------------- |
| marketing | `/assets/*`  | none               | `marketing-headers` | —                                                             |
| marketing | default `*`  | `marketing-router` | `marketing-headers` | 404 → `/404/index.html`, code 404, error TTL 60 s; 403 → same |
| app       | `/assets/*`  | none               | `app-headers`       | none                                                          |
| app       | default `*`  | `app-router`       | `app-headers`       | none                                                          |
| admin     | `/assets/*`  | none               | `admin-headers`     | none                                                          |
| admin     | default `*`  | `admin-router`     | `admin-headers`     | none                                                          |

The bucket policy grants the distribution `s3:GetObject` **and** `s3:ListBucket`. Without
`ListBucket`, S3 answers a missing key with 403, which makes real 404s harder to tell apart.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFrontRead",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::letshyre-prod-web-marketing",
        "arn:aws:s3:::letshyre-prod-web-marketing/*"
      ],
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT>:distribution/<DIST_ID>"
        }
      }
    }
  ]
}
```

### 4.2 `marketing-router` (viewer request)

Source: `infra/cloudfront/marketing-router.js`, runtime `cloudfront-js-2.0`. The rules in order:

| Step | Request                                                                   | Answer                                                       |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1    | `Host` isn't `HOST` (a constant: `beta.letshyre.ai`, later `letshyre.ai`) | 301 `https://<HOST><path><query>`                            |
| 2    | `/` or `/index.html`                                                      | 301 `/en`                                                    |
| 3    | ends in `/index.html`                                                     | 301 to the path without it                                   |
| 4    | ends in `/` (length > 1)                                                  | 301 to the path without it                                   |
| 5    | last segment has a known file extension                                   | pass through (assets, `.data`, `feed.xml`, `sitemap.xml`, …) |
| 6    | `/:lang` or `/:lang/rest` with `lang` one of the 19 locales               | rewrite the URI to `<path>/index.html` and fetch from S3     |
| 7    | anything else                                                             | pass through; S3 404 → the prerendered 404 page              |

A page that doesn't exist (including one not shipped in that locale) falls out of step 6 as an S3
404 and gets the 404 page. Every redirect keeps the query string (`?topic=sales`, `?saved=1`, UTM
tags) and carries `Cache-Control: max-age=86400`. Generated responses never reach the cache, so a
redirect costs one function invocation. They also skip the viewer-response function, so the router
adds `Strict-Transport-Security` to its own redirects.

### 4.3 `<app>-headers` (viewer response, one per distribution)

The deploy script writes each HTML file's policy into S3 object metadata:

```
x-amz-meta-csp       default-src 'self'; script-src 'self' 'sha256-…' …
x-amz-meta-csp-mode  report-only | enforce
```

The policy travels with the object it belongs to: no separate map to keep in sync, room to grow
(S3 allows 2 KB of user metadata; postbuild should fail above 1.8 KB), and each file's release is
atomic. The function:

- turns `x-amz-meta-csp` into `Content-Security-Policy-Report-Only` (or `Content-Security-Policy`
  when `csp-mode` is `enforce`) and appends `frame-ancestors 'none'`;
- deletes every `x-amz-*` header;
- adds the static headers in the next table.

Moving from report-only to enforced is a GitHub variable (`CSP_MODE=enforce`) and a redeploy. The
meta-tag route in ADR 0012 (`CSP_ENFORCE=true`) isn't needed any more; amend the ADR.

| Header                       | marketing                                                          | app                                                                          | admin               |
| ---------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------- |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains` (after the problem 14 audit) | same                                                                         | same                |
| `X-Content-Type-Options`     | `nosniff`                                                          | `nosniff`                                                                    | `nosniff`           |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                                  | same                                                                         | `no-referrer`       |
| `X-Frame-Options`            | `DENY`                                                             | `DENY`                                                                       | `DENY`              |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                      | `same-origin-allow-popups` (Razorpay may open a popup for UPI or netbanking) | `same-origin`       |
| `Permissions-Policy`         | `camera=(), microphone=(), geolocation=()`                         | `camera=(self), microphone=(self), geolocation=()` (interviews need both)    | all `()`            |
| `X-Robots-Tag`               | `noindex, nofollow` while `HOST` is `beta.`                        | `noindex, nofollow`                                                          | `noindex, nofollow` |

Test the app's `Permissions-Policy` and `Cross-Origin-Opener-Policy` against a Razorpay test-mode
payment and an interview recording before trusting them.

### 4.4 `app-router` and `admin-router` (viewer request)

1. `Host` isn't the canonical host → 301.
2. Path starts with `/assets/` or is a known root file (`/favicon.ico`, `/favicon.png`,
   `/icon.png`, `/robots.txt`) → pass through. A missing file is a real 404.
3. Anything else → rewrite to `/index.html`.

Step 2 uses an allowlist rather than "contains a dot", so a route parameter with a dot in it
(`/shared-scorecard/<token>`) still gets the shell.

### 4.5 WAF

All three get a rate-based rule (for example 1,000 requests per 5 minutes per IP, 300 on admin)
plus the AWS managed IP reputation list. Managed "common rule set" rules protect servers; there is
no server here, so they add false positives and little else.

Admin has no IP allowlist (decision B): anyone can load the admin bundle, and all admin data stays
behind staff sign-in at the API. That makes the API's admin-role checks the only real gate, so
they need to hold on every admin endpoint.

### 4.6 Marketing: every kind of request and its answer

Checked against the current build (250 pages, 251 `.data` files, deepest page four segments:
`/en/blogs/glossary/ctc`). This table is the smoke-test and function-test list.

| Request                                                                | Answer                                        | Why                                                              |
| ---------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| `http://beta.letshyre.ai/en`                                           | 301 to `https://`                             | viewer protocol policy                                           |
| `https://dXXXX.cloudfront.net/en/pricing?a=1`                          | 301 `https://beta.letshyre.ai/en/pricing?a=1` | router step 1                                                    |
| `www.letshyre.ai/…`, `beta.letshyre.ai/…` after the move               | 301 to the same path on `letshyre.ai`         | router step 1                                                    |
| `/`, `/?utm_source=x`, `/index.html`                                   | 301 `/en`, query kept                         | step 2                                                           |
| `/en/pricing/index.html`, `/en/index.html`                             | 301 `/en/pricing`, `/en`                      | step 3                                                           |
| `/en/`, `/en/pricing/`, `/en/pricing/?a=b`                             | 301 without the slash, query kept             | step 4                                                           |
| `/en`, `/hi`, `/ar`                                                    | 200, home in that locale                      | step 6                                                           |
| `/en/pricing`, `/en/blogs/glossary/ctc`, `/en/blogs/page/2`            | 200 when prerendered                          | step 6                                                           |
| `/hi/employers` (page not shipped in `hi`)                             | 404 page                                      | step 6, S3 404                                                   |
| `/en/blogs/page/1`, a page past the last, a tag with under 3 posts     | 404 page                                      | not prerendered                                                  |
| `/en/policy`, `/en/home-v2`, `/en/blogs/topics`, `/employer/dashboard` | 404 page                                      | redirects removed (decision A)                                   |
| `/xx/pricing`, `/EN/pricing`, `/en/Pricing`                            | 404 page                                      | not a locale; S3 keys are case-sensitive                         |
| `//en`, `/en//pricing`, `/404`                                         | 404 page                                      | no such key                                                      |
| `/en.data`, `/en/pricing.data`, `/404.data`                            | 200 `text/x-script`                           | step 5                                                           |
| `/hi/employers.data` (client navigation to a missing page)             | 404 with the HTML 404 page as body            | one error page per status; React Router shows its error boundary |
| `/en/blogs/feed.xml`, `/en/blogs/search.json`                          | 200 `application/rss+xml`, `application/json` | step 5                                                           |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/site.webmanifest`        | 200                                           | step 5                                                           |
| `/assets/root-<hash>.css`                                              | 200, `immutable`                              | `/assets/*` behavior                                             |
| `/assets/missing.js`                                                   | 404 (HTML body, but never a 200)              | `/assets/*` behavior                                             |
| `/en/contact?topic=sales`, `/en/blogs?saved=1`                         | 200, one cache entry for all query strings    | `CachingOptimized` drops the query                               |
| `HEAD` of any of the above                                             | same status and headers, no body              |                                                                  |
| `POST`, `PUT`, `DELETE`                                                | 403 from CloudFront                           | GET and HEAD only                                                |
| `/images/home/SOURCES.md`, `/en/blogs/feed.xml.data`                   | 404                                           | never uploaded (problems 17, 18)                                 |

Every HTML answer, the 404 page included, carries the page's CSP and the section 4.3 headers. The
smoke test checks the 404 response too, because it's the one that goes through CloudFront's error
page handling.

**More problems found in the marketing re-check**, continuing the section 2 numbering:

| #   | Problem                                                                                                                                           | Fix                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 17  | `public/images/home/SOURCES.md`, internal notes on where photos came from, is copied into the build and would be public.                          | Move it out of `public/` (next to the photos' source files, or `docs/`). The deploy script also refuses `.md` files.                                                                                                                                                                                                                                                                                               |
| 18  | The resource routes prerender stray `feed.xml.data` and `search.json.data` files nobody requests.                                                 | The deploy script skips `*.xml.data` and `*.json.data`.                                                                                                                                                                                                                                                                                                                                                            |
| 19  | **The nightly deploy skips CI.** If it built `main` HEAD, a commit that failed CI on push would still reach production at 00:30 UTC.              | The nightly run rebuilds the SHA of the last successful `marketing-production` deployment, never HEAD. Only the build date changes, so only the future-dated posts are new.                                                                                                                                                                                                                                        |
| 20  | A nightly deploy with nothing new would still re-upload every file and flush the edge cache every day.                                            | The deploy keeps each file's fingerprint (bytes, type, cache header, CSP) in a manifest in the bucket, uploads only files whose fingerprint changed, and skips the invalidation when nothing changed.                                                                                                                                                                                                              |
| 21  | `aws s3 sync` guesses content types and leaves out charsets; an unknown extension silently becomes `application/octet-stream`.                    | One table in the deploy script: `.html` `text/html; charset=utf-8`, `.data` `text/x-script`, `.txt` `text/plain; charset=utf-8`, `sitemap.xml` `application/xml; charset=utf-8`, `feed.xml` `application/rss+xml; charset=utf-8`, `.json`, `.webmanifest` `application/manifest+json`, `.avif`, `.webp`, `.jpg`, `.png`, `.svg`, `.ico`, `.woff2`, `.csv`, `.docx`, `.xlsx`. Any other extension fails the deploy. |
| 22  | `pnpm --filter marketing indexnow` reads URLs from the sitemap. Run on beta, it would announce `beta.letshyre.ai` URLs to Bing.                   | The script exits unless `VITE_INDEXABLE=true`; the workflow only calls it after the move to the apex.                                                                                                                                                                                                                                                                                                              |
| 23  | The 404 page is English for every locale: CloudFront allows one error page per status code.                                                       | Accepted. The page already links to the locales that are published. A localised 404 would need a prerendered `/:lang/404` and a smarter router; not worth it now.                                                                                                                                                                                                                                                  |
| 24  | Beta's `robots.txt` says `Disallow: /`, which stops crawlers from ever reading the `noindex`. If a beta link leaks, Google can list the bare URL. | Acceptable for a short beta nobody links to. The `X-Robots-Tag` covers every fetch that does happen. Don't submit beta to Search Console.                                                                                                                                                                                                                                                                          |
| 25  | A WAF rate limit set too low blocks the smoke tests and Lighthouse runs from GitHub's shared runner IPs, and burst crawls from social-card bots.  | Start marketing at 2,000 requests per 5 minutes per IP, and watch the WAF's blocked-request metric for the first week.                                                                                                                                                                                                                                                                                             |
| 26  | The `/` → `/en` redirect ignores the `lh_locale` cookie, so a returning Hindi reader still lands on English.                                      | Accepted for launch; the language switcher remembers the choice after that. Revisit together with problem 16 (a 302 that reads the cookie).                                                                                                                                                                                                                                                                        |

---

## 5. What goes into S3, and how it's cached

| Files                                                                                                               | `Cache-Control`                                         | Notes                                                                                   |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/assets/*` (hashed names)                                                                                          | `public, max-age=31536000, immutable`                   | Uploaded first. Never deleted in the same deploy                                        |
| HTML, `.data`, `sitemap.xml`, `robots.txt`, `llms.txt`, `feed.xml`, `search.json`, `site.webmanifest`, IndexNow key | `public, max-age=0, s-maxage=31536000, must-revalidate` | Browsers revalidate (304 via ETag); the edge keeps them until the deploy's invalidation |
| `og/*`, `images/*`, favicons (unhashed, from `public/`)                                                             | `public, max-age=86400, s-maxage=31536000`              | Edge refreshed by invalidation, browsers within a day                                   |

**Deploy order** (one script, `tooling/deploy/deploy.ts`, using AWS SDK v3; `aws s3 sync` can't
set per-file metadata or content types correctly):

Every deploy ends by writing `_deploy/manifest.json` to the bucket: the app it belongs to, the
commit, each file's fingerprint, and when each retired asset left the build. The routers keep it
from being served (`/_deploy/*` is a 404 on marketing and the shell on the SPAs).

1. Read the bucket listing and the last manifest. Stop if the manifest names another app, or if
   the bucket has files but no manifest (`--adopt` takes such a bucket over), so a mistyped
   `BUCKET` can't wipe the wrong site.
2. Upload in four phases, each finished before the next starts: `/assets/*` that aren't in the
   bucket yet (hashed names: same name, same bytes), public files, `.data`, then HTML with CSP
   metadata. Within a phase 16 uploads run at once, and after a failure no new one starts. Files
   other than assets go up only when their fingerprint differs from the manifest's (problem 20).
   The fingerprint covers the bytes, content type, cache header and CSP metadata, so switching
   `CSP_MODE` re-uploads every page. Skip the marketing root `index.html`, `*.md`,
   `*.xml.data` and `*.json.data` (problems 17, 18). Content types come from one table
   (problem 21).
3. Delete objects that left the build, **except** `/assets/*`.
4. If anything changed, invalidate `/*` and wait for it to finish. One wildcard path counts as
   one invalidation path.
5. Prune assets that left the build more than 30 days ago, counted from the deploy that dropped
   them, not from their upload.
6. Write the new manifest. A deploy that fails before this leaves the old one, so the next deploy
   re-uploads whatever might be half done.
7. Smoke test (section 7.3).

A tab that loaded the previous release keeps finding its chunks for 30 days, and problem 6's
reload covers anything older.

**Bucket settings**: Block Public Access on, Object Ownership "bucket owner enforced", SSE-S3,
versioning on, lifecycle rule "expire noncurrent versions after 30 days" (an emergency undo, not
the rollback path).

---

## 6. Environment per app

Values are GitHub **variables**, not secrets: `VITE_*` is public and inlined into the bundle
anyway. The only secrets are the deploy user's AWS access key pair (section 7.1).

**Repository variables**, read by the build job. Every app's build gets the same set and its
`env.schema.ts` reads what it needs. They aren't environment variables because a job that names an
environment records a deployment there, and the build isn't one.

| Variable             | Beta phase                 | After the move to the apex |
| -------------------- | -------------------------- | -------------------------- |
| `VITE_ENV`           | `production`               | same                       |
| `VITE_INDEXABLE`     | `false` (problem 3)        | `true`                     |
| `VITE_SITE_URL`      | `https://beta.letshyre.ai` | `https://letshyre.ai`      |
| `VITE_APP_URL`       | `https://app.letshyre.ai`  | same                       |
| `VITE_API_BASE_URL`  | `https://api.letshyre.ai`  | same                       |
| `VITE_COOKIE_DOMAIN` | `.letshyre.ai`             | same                       |
| `VITE_META_PIXEL_ID` | the pixel id               | same                       |
| `INDEXNOW_KEY`       | empty                      | 8–128 letters, digits, `-` |

**Environment variables**, on `marketing-production`, `app-production` and `admin-production`,
each limited to the `main` branch. Only the deploy job uses them.

| Variable            | marketing                               | app                     | admin                     |
| ------------------- | --------------------------------------- | ----------------------- | ------------------------- |
| `AWS_REGION`        | the buckets' region, e.g. `ap-south-1`  | same                    | same                      |
| `BUCKET`            | `letshyre-prod-web-marketing`           | `letshyre-prod-web-app` | `letshyre-prod-web-admin` |
| `DISTRIBUTION_ID`   | its distribution                        | its distribution        | its distribution          |
| `CLOUDFRONT_DOMAIN` | its `dXXXX.cloudfront.net` (smoke test) | same                    | same                      |
| `SITE_HOST`         | `beta.letshyre.ai`, later `letshyre.ai` | `app.letshyre.ai`       | `adm.letshyre.ai`         |
| `CSP_MODE`          | `report-only`, later `enforce`          | same                    | same                      |

**Outside this repo**, before the first real sign-in:

- API CORS allows `https://app.letshyre.ai`, `https://adm.letshyre.ai` and
  `https://beta.letshyre.ai` (contact form, newsletter), later `https://letshyre.ai`. No wildcard.
- The API's email templates (password reset, invitations, shared scorecards) use
  `https://app.letshyre.ai` as their link base.
- Razorpay dashboard: add `app.letshyre.ai` to the allowed website domains. Live mode refuses
  checkout on unlisted domains.
- Meta Pixel: allow `beta.letshyre.ai` and `letshyre.ai` in the pixel's traffic permissions.
- Any OAuth or social sign-in redirect URIs move to `app.letshyre.ai`.
- Tell the existing users (fewer than 10) the new address and that they'll sign in once more. Old
  dashboard bookmarks, password-reset emails and shared scorecard links stop working (decision A).

---

## 7. GitHub Actions

### 7.1 Trust: one IAM user for the three apps

The deploy job signs in as the IAM user `gha-deploy`, which has no console access. Its access key
pair is stored as the repository secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. Chosen
over OIDC roles to keep the IAM setup to one user and one policy. The costs: the key is long-lived,
so rotate it every 90 days (create the new key, update the secrets, run a deploy, then delete the
old key) and delete it at once if it leaks; and a leaked key reaches all three sites. A wrong
`BUCKET` variable isn't stopped by IAM, but `deploy.ts` still refuses a bucket whose manifest
names another app.

User permissions, an inline policy scoped to the three sites only:

- `s3:ListBucket` on the three buckets, and `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on
  `bucket/*` for each
- `cloudfront:CreateInvalidation`, `cloudfront:GetInvalidation` on the three distributions

The deploy job can't change functions, distributions or WAF. Those change by hand in the console
(section 9), and the change is committed to `infra/cloudfront/` in the same sitting.

### 7.2 The workflow: `.github/workflows/deploy.yml`

| Job      | Runs                                                                                                                                                                                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify` | Pushes and manual runs: the whole of `ci.yml`, called as a reusable workflow. The nightly run skips it, since it rebuilds a commit that passed already.                                                                                                                           |
| `plan`   | `tooling/deploy/affected.ts` picks the apps and the commit (below).                                                                                                                                                                                                               |
| `build`  | One job per app: `pnpm turbo run build --filter=<app>` with the repository variables; uploads `build/client` and `csp.map` as an artifact kept 30 days.                                                                                                                           |
| `deploy` | One job per app, side by side, each in its `<app>-production` environment: `preflight.ts` checks the settings, then it signs in to AWS, records a deployment, runs `tooling/deploy/deploy.ts`, marks the record live, then `smoke.ts`; on an indexable marketing build, IndexNow. |

What `plan` picks:

- **Push to `main`**: each app whose files changed since the commit of its last successful
  deployment, at the pushed commit. Shared code, the lockfile
  and the deploy tooling count for every app; docs, `infra/cloudfront` and CI-only changes don't.
  An app with no deployment yet always deploys. Comparing with the deployed commit, not `HEAD~1`,
  means a failed deploy is caught up by the next push.
- **Nightly (00:30 UTC)**: marketing only, rebuilt at the commit that's live, so future-dated
  posts appear and nothing that skipped CI ships (problem 19). If the build is unchanged, the
  deploy uploads nothing and skips the invalidation.
- **Run workflow** (manual): the chosen app, or all three, at the chosen branch's commit, after
  `verify` passes.

A push to `main` ships only after `verify` passes on that commit, so a commit pushed straight to
`main` gets the same checks as a pull request. `ci.yml` doesn't run on its own for `main`; its
result is the `verify` job of the Deploy run.

**Deployment records.** The deploy job's environment has `deployment: false`: GitHub's own record
would carry the workflow's commit, which for a nightly rebuild or a rollback isn't the one that
shipped. `tooling/deploy/record.ts` writes the record instead, with the built commit. It's marked
success as soon as the files are live, before the smoke test, because that's what's serving; a
failed smoke test fails the run without pretending the old build is back. A failed or cancelled
upload marks it failure, and the next deploy compares with the last success. A deploy that would
change neither the files nor the live commit, like most nightly rebuilds, writes no record.

Rules the workflow keeps:

- Every action is pinned to a full commit SHA with its version in a comment; Dependabot
  (`.github/dependabot.yml`) proposes updates after a 14-day cooldown.
- `permissions: {}` at the top; each job asks for what it uses, and only `deploy` gets
  `deployments: write`.
- The deploy job installs only the root's dependencies (`--filter letshyre`), which is all the
  deploy scripts use.
- One deploy at a time (`concurrency: deploy-production`, never cancelled halfway).
- The build has no AWS access; the deploy never builds. What ships is the artifact.
- One app's failed build doesn't hold back the others; only that app's deploy fails.

### 7.3 Smoke tests after every deploy

`tooling/deploy/smoke.ts` checks the live host through CloudFront with plain `fetch`, so the
deploy job needs no browser. It stops at once if the host doesn't resolve, and tries each request
three times, 10 seconds each, before calling it failed. The same rules are already covered before merge: the e2e suite runs
them against `serve.ts`, and `pnpm test:edge` runs the edge functions themselves. The smoke test
checks the wiring:

- marketing: `/`, `/?utm_source=…`, `/index.html`, `/en/` and `/en/pricing/index.html` 301 to
  the right place, query kept; `/en` and `/en/pricing` are 200 HTML with the CSP header,
  HSTS, `nosniff` and `X-Frame-Options`, plus `X-Robots-Tag: noindex` exactly when the build's
  `robots.txt` is closed; `/en.data` is `text/x-script`; `/en/does-not-exist` is a 404 that still
  carries the CSP; `/en/policy` and an English-only page in `hi` are 404s
- app and admin: `/`, a dashboard route and `/shared-scorecard/abc.def` get the shell with
  `X-Robots-Tag: noindex`
- all: a real asset is `immutable`; a missing asset is a 404 and, on the SPAs, not HTML; no
  `x-amz-meta-*` header leaks; `https://<CLOUDFRONT_DOMAIN>/en` 301s to the canonical host

A failing smoke test fails the run and notifies; it doesn't roll back on its own.

### 7.4 Rollback

- **Normal**: open the last good run of `Deploy` in GitHub and re-run its `deploy` job. It
  redeploys that run's artifact (kept 30 days) in about two minutes and records that run's
  commit as live.
- The nightly build rebuilds whatever commit is live, so a rollback stays rolled back until the
  next push to `main` deploys.
- **Edge function**: CloudFront keeps the previous function code; re-publish the last committed
  version from `infra/cloudfront/`.
- **Last resort**: S3 object versions (30 days).

---

## 8. Monitoring

- CloudWatch alarms per distribution: `5xxErrorRate` > 1% for 5 minutes, and `4xxErrorRate` on
  marketing jumping after a deploy (a broken function shows up as 404s first).
- Marketing standard logs for 90 days; check 404s by path in the first week after each launch
  (launch checklist, "First 7 days").
- CSP: reports go nowhere yet (ADR 0012). Until a `report-to` endpoint exists, check the browser
  console on the UAT pass. When there is an error-reporting service, add `report-to` in the
  response functions, with no rebuild needed.
- Cost: AWS Budgets alert at $30/month for the whole account.

---

## 9. Step-by-step implementation

Each phase ends in something you can check. Phase 0 (repo) and phases 1–2 (AWS console) can run in
parallel. Console names below are current as of late 2026; AWS moves buttons around, but the
settings don't change.

### Phase 0: repo changes (one PR per bullet group) — done 2026-11-18, not yet committed

1. `VITE_INDEXABLE` in marketing (problem 3), with schema, `.env.example` and `ci.yml`.
2. Remove the redirects (problem 9): `MOVED_PATHS`, `REPLACED_BY`'s redirect output, the topic
   redirects, the locale 302, the two redirect maps from postbuild, the branches in `serve.ts`,
   `routes/moved.tsx` and `app/lib/moved.ts` in the app; update the e2e specs. Fail postbuild if
   any CSP is over 1.8 KB.
3. App-origin fixes (problem 2) and the `vite:preloadError` reload in app and admin (problem 6).
4. Move `public/images/home/SOURCES.md` out of `public/` (problem 17); make the IndexNow script
   refuse to run unless `VITE_INDEXABLE=true` (problem 22).
5. `infra/cloudfront/`: the six functions (`marketing-router`, `marketing-headers`, `app-router`,
   `app-headers`, `admin-router`, `admin-headers`) and a test-case file for each, with the cases
   from sections 4.6 and 7.3.
6. Docs: amend ADR 0004 (subdomain now), ADR 0012 (CSP delivery via S3 metadata and the edge
   functions), url-contract §1–§6, the launch checklist; add an ADR "0022 · Hosting on S3 and
   CloudFront" and index it.

### Phase 1: AWS account, buckets and certificate (console)

1. **Account**: MFA on the root user, then stop using it. IAM Identity Center → create an admin
   user for yourself. CloudTrail → create a trail (management events). Billing → Budgets → $30
   monthly alert.
2. **Region**: pick one for the buckets, ap-south-1 (Mumbai) if most users are in India. It only
   affects origin fetches; viewers are served from the edge.
3. **S3** → delete the three empty buckets `letshyre.ai`, `app.letshyre.ai`, `adm.letshyre.ai`.
   Create `letshyre-prod-web-marketing`, `letshyre-prod-web-app`, `letshyre-prod-web-admin`, each
   with: ACLs disabled, **Block all public access** on, versioning enabled, default encryption
   SSE-S3. Then Management → lifecycle rule: permanently delete noncurrent versions after 30 days,
   and delete expired object delete markers. Leave "Static website hosting" off.
4. **ACM**: switch the console region to **US East (N. Virginia)** (CloudFront only reads
   certificates from there). Request a public certificate for `letshyre.ai` and
   `*.letshyre.ai`, DNS validation. ACM shows one CNAME name/value pair (shared by both names).
5. **GoDaddy** (the zone's nameservers are `ns29/ns30.domaincontrol.com`) → Domain → DNS → DNS
   Records:
   - If the zone has any **CAA** records, add `0 issue "amazon.com"`, or ACM can't issue (it had
     none on 19 Nov 2026).
   - Add the validation **CNAME**. GoDaddy appends the domain, so the name is only the part
     before `.letshyre.ai` (for example `_3f2a…`), and the target is ACM's value. Keep it: ACM
     renews with it.
6. Wait for the certificate to show **Issued** (usually 5–30 minutes).

Check: each bucket's Permissions tab says "Bucket and objects not public"; the certificate is
Issued.

### Phase 2: CloudFront (console), once per app

Do app first, then admin, then marketing. The steps below use admin's names; for the app, swap
in `app-router`, `app-headers`, `app.letshyre.ai` and the app bucket.

1. **Functions** → Create function `admin-router`, runtime `cloudfront-js-2.0`. Paste
   `infra/cloudfront/spa-router.js` with `HOST` set to `"adm.letshyre.ai"`, try a few cases in the
   **Test** tab, then **Publish**. Same for `admin-headers` from `infra/cloudfront/headers.js`,
   unchanged. Marketing uses `marketing-router.js`.
2. **Distributions** → Create:
   - Origin: choose the bucket from the list (the REST endpoint, not `s3-website`). Origin access:
     **Origin access control settings** → create a new OAC (sign requests).
   - Default behavior: Redirect HTTP to HTTPS; GET, HEAD; cache policy **CachingOptimized**; no
     origin request policy; no response headers policy; function associations: viewer request =
     `admin-router` (CloudFront Functions), viewer response = `admin-headers`.
   - Settings: alternate domain `adm.letshyre.ai`; the ACM certificate; security policy
     TLSv1.2_2021 or newer; HTTP/2 and HTTP/3; IPv6 on; default root object empty.
   - Security: enable WAF and add the rules from section 4.5.
   - Pricing plan: pay-as-you-go for app, Free for admin, Pro for marketing (section 3).
3. After creating, copy the bucket policy the console offers into the bucket's policy, then add
   `s3:ListBucket` on the bucket ARN (section 4.1).
4. **Behaviors** → add `/assets/*`: same origin, CachingOptimized, viewer response =
   `admin-headers`, no viewer request function.
5. Marketing only: **Error pages** → 404 → `/404/index.html`, response code 404, error caching TTL
   60; repeat for 403. Marketing logging: standard logs → CloudWatch Logs, 90-day retention.
6. **GoDaddy DNS**: add a CNAME `adm` → the distribution's `dXXXX.cloudfront.net`. Same later for
   `app` and `beta`. Remove any existing record with the same name first.
7. **Snapshot**: commit the configuration so it can be reviewed and rebuilt:

   ```bash
   aws cloudfront get-distribution-config --id <DIST_ID> --query DistributionConfig > infra/cloudfront/admin.distribution.json
   ```

   Re-run it after every console change to the distribution, and commit the diff.

Check: `https://adm.letshyre.ai` answers over HTTPS (404 from the empty bucket is fine), `http://`
redirects to HTTPS, and `https://dXXXX.cloudfront.net` 301s to `adm.letshyre.ai`.

### Phase 3: GitHub and IAM (console)

1. **IAM** → Users → create `gha-deploy`, without console access. Attach an inline policy with
   only the permissions in 7.1. Add each distribution's ID to it as the distribution is created.
2. **IAM** → `gha-deploy` → Security credentials → Create access key → "Third-party service".
   Copy the pair straight into step 3; it is shown once.
3. **GitHub** → Settings → Secrets and variables → Actions: the repository secrets
   `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from step 2, and the repository variables from
   section 6.
4. **GitHub** → Settings → Environments: create `marketing-production`, `app-production`,
   `admin-production`, each with deployment branch `main` only and its environment variables from
   section 6. Optionally require a reviewer on marketing while it's beta.
5. **GitHub** → branch protection on `main`: require the `ci` status check, require branches to be
   up to date before merging, and no direct pushes. The deploy trusts this: it doesn't re-run CI
   on a push to `main`.

### Phase 4: deploy tooling and workflow (repo) — done 2026-11-18

1. `tooling/deploy/`: `deploy.ts` (section 5), `smoke.ts` (7.3) and `affected.ts` (7.2), with
   `pnpm test:deploy` covering the content types, cache headers, skip list, upload phases,
   fingerprint comparison, asset retirement and prune, the bucket check, stopping after a failed
   upload, and which changes deploy which app. `record.ts` writes the deployment records.
2. `.github/workflows/deploy.yml` (section 7.2); `ci.yml` is callable for manual deploys;
   `scheduled-build.yml` is gone.

Try it locally against a build, with no AWS access:

```bash
node tooling/deploy/deploy.ts --app marketing --dry-run --offline
```

### Phase 5: first deploy

1. Run the workflow by hand with `app: admin`, the lowest risk. Check, then `app`, then
   `marketing`.
2. Run the staging UAT list from `docs/launch-checklist.md` against `beta.` and `app.`.
3. A week of report-only CSP with no violations in the console, then `CSP_MODE=enforce` app by
   app.

### Phase 6: `letshyre.ai`

Section 10.

---

## 10. Runbook: `beta.letshyre.ai` → `letshyre.ai`

1. **Two days before**: in Hostinger, lower the TTL of the apex and `www` records to the minimum
   (Hostinger says changes can take up to 24 hours otherwise). Turn off Hostinger's CDN for the
   domain if it's on: it holds the apex ALIAS and blocks changing it. List every record in the zone
   for the HSTS audit (problem 14). Email the existing users the date and the new app address.
2. **Build**: marketing gets `VITE_SITE_URL=https://letshyre.ai`, `VITE_INDEXABLE=true` and
   `INDEXNOW_KEY`; app gets `VITE_SITE_URL=https://letshyre.ai`; `SITE_HOST` becomes
   `letshyre.ai`. Deploy both. Pages now carry apex canonicals but still serve on `beta.`.
3. **Add aliases**: `letshyre.ai` and `www.letshyre.ai` on the marketing distribution (the
   certificate already covers them).
4. **Transition function**: publish a `marketing-router` that serves both `beta.letshyre.ai` and
   `letshyre.ai` without redirecting between them, and 301s `www` to the apex.
5. **Switch DNS in Hostinger**: delete the apex `A`/`AAAA` records that point at the old site; add
   a CNAME with name `@` and target `dXXXX.cloudfront.net` (Hostinger saves it as an ALIAS, one
   per zone); point `www` at the same target with a CNAME. Check with `dig letshyre.ai A` and
   `dig letshyre.ai AAAA` from a couple of networks.
6. **After propagation** (a day): publish the final `marketing-router` with `HOST = letshyre.ai`,
   so `beta.` and `www.` 301 to the apex and the `noindex` header stops.
7. **Verify**: smoke tests on the apex; Search Console and Bing verified by a DNS TXT record in
   Hostinger; submit `https://letshyre.ai/sitemap.xml`; run IndexNow; Rich Results Test (launch
   checklist, "Production"). Then cancel the old site's hosting.
8. **A month later**: HSTS `preload` if the problem 14 audit holds. Keep `beta.` redirecting for at
   least a year; links to it will be out there.

Rollback for this runbook: restore the old apex records in Hostinger, re-publish the beta-only
`marketing-router`, and re-run the previous marketing and app deploys.

---

## 11. Decisions (settled 2026-11-18)

- **A. Legacy redirects: none.** The old site has fewer than 10 users. They're told the new
  address and sign in again; all legacy and convenience redirects are removed (problem 9).
- **B. Admin access: API auth only.** No IP allowlist; a WAF rate-based rule only.
- **C. Infrastructure: AWS console**, no IaC tool. Function code and distribution config
  snapshots are committed under `infra/cloudfront/`.
- **D. DNS: stays put, Route 53 isn't used.** The zone turned out to be at GoDaddy, not
  Hostinger. CNAMEs for `beta`, `app`, `adm` and `www` work there. **Open:** GoDaddy can't put a
  CNAME or ALIAS on the apex, so the cutover runbook (section 10, written for Hostinger's ALIAS)
  needs the zone moved to a provider that can, or the apex redirected to `www`. Decide before the
  move to `letshyre.ai`.

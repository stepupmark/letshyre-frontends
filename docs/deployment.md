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

DNS stays at Hostinger. AWS resources are set up in the console; the edge function code and a
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
                      Hostinger DNS (letshyre.ai zone)
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
                 └──────── GitHub Actions (OIDC → one IAM role per app) ───────┘
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
| app          | Flat-rate **Free**        | Under 10 users today; 1M requests. Move to Pro when you need its logs  |
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
| 20  | A nightly deploy with nothing new would still re-upload every file and flush the edge cache every day.                                            | The deploy script compares each file's MD5 with the S3 ETag (files upload in one part, so the ETag is the MD5), uploads only changed files, and skips the invalidation when nothing changed.                                                                                                                                                                                                                       |
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

1. Upload `/assets/*` that aren't in the bucket yet. Hashed names mean same name = same bytes.
2. Upload public files, then `.data`, then HTML with CSP metadata, each only when its MD5
   differs from the S3 ETag (problem 20). Skip the marketing root `index.html`, `*.md`,
   `*.xml.data` and `*.json.data` (problems 17, 18). Content types come from one table
   (problem 21).
3. Delete objects that left the build, **except** `/assets/*`.
4. If anything changed, invalidate `/*` and wait for it to finish. One wildcard path counts as
   one invalidation path.
5. Prune `/assets/*` objects that aren't in this build **and** were last modified more than 30
   days ago.
6. Smoke test (section 7.3).

A tab that loaded the previous release keeps finding its chunks for 30 days, and problem 6's
reload covers anything older.

**Bucket settings**: Block Public Access on, Object Ownership "bucket owner enforced", SSE-S3,
versioning on, lifecycle rule "expire noncurrent versions after 30 days" (an emergency undo, not
the rollback path).

---

## 6. Environment per app

GitHub environments `marketing-production`, `app-production` and `admin-production`, each limited
to the `main` branch. Values are **variables**, not secrets: `VITE_*` is public and inlined into the
bundle anyway.

| Variable                    | marketing (beta phase)          | app                        | admin                 |
| --------------------------- | ------------------------------- | -------------------------- | --------------------- |
| `VITE_ENV`                  | `production`                    | `production`               | —                     |
| `VITE_INDEXABLE`            | `false` (new, problem 3)        | —                          | —                     |
| `VITE_SITE_URL`             | `https://beta.letshyre.ai`      | `https://beta.letshyre.ai` | —                     |
| `VITE_APP_URL`              | `https://app.letshyre.ai`       | `https://app.letshyre.ai`  | —                     |
| `VITE_API_BASE_URL`         | `https://api.letshyre.ai`       | same                       | same                  |
| `VITE_COOKIE_DOMAIN`        | `.letshyre.ai`                  | `.letshyre.ai`             | —                     |
| `VITE_META_PIXEL_ID`        | the pixel id                    | —                          | —                     |
| `CSP_MODE`                  | `report-only`                   | `report-only`              | `report-only`         |
| `AWS_ROLE_ARN`              | deploy role for marketing       | deploy role for app        | deploy role for admin |
| `BUCKET`, `DISTRIBUTION_ID` | per app                         | per app                    | per app               |
| `SITE_HOST`                 | `beta.letshyre.ai`              | `app.letshyre.ai`          | `adm.letshyre.ai`     |
| `INDEXNOW_KEY`              | only after the move to the apex | —                          | —                     |

Each app's `env.schema.ts` and `.env.example` gain `VITE_INDEXABLE` as CLAUDE.md requires, and
`ci.yml` gets the matching test value.

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

### 7.1 Trust: OIDC, no access keys

One IAM OIDC provider for `token.actions.githubusercontent.com`, and one role per app that only its
environment can assume:

```json
"Condition": {
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:<owner>/<repo>:environment:marketing-production"
  }
}
```

Role permissions, scoped to that app's resources only:

- `s3:ListBucket` on the bucket, and `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on
  `bucket/*`
- `cloudfront:CreateInvalidation`, `cloudfront:GetInvalidation` on the distribution

The deploy job can't change functions, distributions or WAF. Those change by hand in the console
(section 9), and the change is committed to `infra/cloudfront/` in the same sitting.

### 7.2 Workflow shape: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]
  schedule:
    - cron: "30 0 * * *" # marketing only: future-dated posts go live (ADR 0021)
  workflow_dispatch:
    inputs:
      app: { type: choice, options: [all, marketing, app, admin], default: all }

permissions: {}

concurrency:
  group: deploy-production
  cancel-in-progress: false # never stop a deploy halfway; queue the next one

jobs:
  verify:
    if: github.event_name == 'push'
    uses: ./.github/workflows/ci.yml # ci.yml gains `workflow_call` and drops `push: main`

  plan:
    # which apps changed since the SHA of each environment's last successful GitHub deployment
    # (GitHub records it per environment); dispatch → the input
    # schedule → marketing only, at the SHA of its last successful deployment, not HEAD (problem 19)
    # (turbo run build --filter=<app>...[<deployed sha>] --dry=json)

  build:
    needs: [verify, plan]
    strategy: { matrix: { app: ${{ fromJSON(needs.plan.outputs.apps) }} } }
    environment: ${{ matrix.app }}-production # for its vars; no AWS access here
    steps:
      # checkout with fetch-depth: 0 (sitemap lastmod reads git log)
      # pnpm + node from .nvmrc, pnpm install --frozen-lockfile
      # pnpm turbo run build --filter=${{ matrix.app }} --concurrency=1
      # upload-artifact build/ (retention-days: 30): this exact artifact is what deploys

  deploy:
    needs: build
    strategy: { matrix: …same apps…, max-parallel: 1 }
    environment:
      name: ${{ matrix.app }}-production
      url: https://${{ vars.SITE_HOST }}
    permissions: { id-token: write, contents: read }
    steps:
      # download-artifact
      # aws-actions/configure-aws-credentials with role-to-assume: ${{ vars.AWS_ROLE_ARN }}
      # node tooling/deploy/deploy.ts --app ${{ matrix.app }}
      # smoke tests (7.3)
      # marketing on the apex only: pnpm --filter marketing indexnow
```

Rules for this workflow:

- **Pin every action to a full commit SHA**, with the version in a comment, and let Dependabot
  update them. This job can write to production; a re-tagged action must not be able to.
- `permissions: {}` at the top; only the deploy job gets `id-token: write`.
- Build once, deploy that artifact. Rolling back re-runs an old deploy, never a rebuild (7.4).
- `if: github.event_name == 'push'` on `verify`, so the nightly marketing rebuild doesn't run the
  whole suite again. Its postbuild checks still run.
- The `plan` job compares against the **deployed** SHA, not `HEAD~1`. A failed or skipped deploy
  is then caught up by the next push.

### 7.3 Smoke tests after every deploy

Reuse the Playwright specs that already describe the contract: make `playwright.config.ts` accept
`BASE_URL` and skip the local web server when it's set, then run `url-contract.spec.ts` and
`seo.spec.ts` against the live host. Add header checks:

- `/` → 301 `/en`; `/en/pricing/` → 301 `/en/pricing`; `/en/pricing/index.html` → 301
- `/en/pricing` → 200, `text/html`, CSP header present, HSTS present, no `x-amz-*`
- `/en.data` → 200 `text/x-script`; `/en/blogs/feed.xml` → 200
- `/en/does-not-exist`, `/en/policy`, `/assets/nope.js` and a page in a locale it doesn't ship in
  → 404
- `https://<dist>.cloudfront.net/en` → 301 to the canonical host
- app and admin: `/employer/dashboard` → 200 HTML with `X-Robots-Tag`; `/assets/nope.js` → 404
  and not HTML
- beta: `robots.txt` is `Disallow: /`, `X-Robots-Tag: noindex` on every page

A failing smoke test fails the run and notifies; it doesn't roll back on its own.

### 7.4 Rollback

- **Normal**: open the last good run of `Deploy` in GitHub and re-run its `deploy` job. It
  redeploys that run's artifact (kept 30 days) in about two minutes.
- During a marketing incident, disable the schedule first (`gh workflow disable deploy.yml`), or
  the nightly build puts `main` back.
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
5. **Hostinger** → hPanel → Domains → `letshyre.ai` → DNS / Nameservers:
   - If the zone has any **CAA** records, add `0 issue "amazon.com"`, or ACM can't issue.
   - Add the validation **CNAME**. Hostinger appends the domain, so the name is only the part
     before `.letshyre.ai` (for example `_3f2a…`), and the target is ACM's value.
6. Wait for the certificate to show **Issued** (minutes to an hour; Hostinger can take longer).

Check: each bucket's Permissions tab says "Bucket and objects not public"; the certificate is
Issued.

### Phase 2: CloudFront (console), once per app

Do admin first, then app, then marketing.

1. **Functions** → Create function `admin-router`, runtime `cloudfront-js-2.0`. Paste
   `infra/cloudfront/admin-router.js`, run every case from its test file in the **Test** tab, then
   **Publish**. Same for `admin-headers`.
2. **Distributions** → Create:
   - Origin: choose the bucket from the list (the REST endpoint, not `s3-website`). Origin access:
     **Origin access control settings** → create a new OAC (sign requests).
   - Default behavior: Redirect HTTP to HTTPS; GET, HEAD; cache policy **CachingOptimized**; no
     origin request policy; no response headers policy; function associations: viewer request =
     `admin-router` (CloudFront Functions), viewer response = `admin-headers`.
   - Settings: alternate domain `adm.letshyre.ai`; the ACM certificate; security policy
     TLSv1.2_2021 or newer; HTTP/2 and HTTP/3; IPv6 on; default root object empty.
   - Security: enable WAF and add the rules from section 4.5.
   - Pricing plan: Free for app and admin, Pro for marketing (section 3).
3. After creating, copy the bucket policy the console offers into the bucket's policy, then add
   `s3:ListBucket` on the bucket ARN (section 4.1).
4. **Behaviors** → add `/assets/*`: same origin, CachingOptimized, viewer response =
   `admin-headers`, no viewer request function.
5. Marketing only: **Error pages** → 404 → `/404/index.html`, response code 404, error caching TTL
   60; repeat for 403. Marketing logging: standard logs → CloudWatch Logs, 90-day retention.
6. **Hostinger**: add a CNAME `adm` → the distribution's `dXXXX.cloudfront.net`. Same later for
   `app` and `beta`. Remove any existing record with the same name first.
7. **Snapshot**: commit the configuration so it can be reviewed and rebuilt:

   ```bash
   aws cloudfront get-distribution-config --id <DIST_ID> --query DistributionConfig > infra/cloudfront/admin.distribution.json
   ```

   Re-run it after every console change to the distribution, and commit the diff.

Check: `https://adm.letshyre.ai` answers over HTTPS (404 from the empty bucket is fine), `http://`
redirects to HTTPS, and `https://dXXXX.cloudfront.net` 301s to `adm.letshyre.ai`.

### Phase 3: GitHub and IAM (console)

1. **IAM** → Identity providers → add an OpenID Connect provider: URL
   `https://token.actions.githubusercontent.com`, audience `sts.amazonaws.com`.
2. **IAM** → Roles → create `gha-deploy-marketing`, `gha-deploy-app`, `gha-deploy-admin`: trusted
   entity "Web identity", that provider. Then edit each trust policy so `sub` is that app's
   environment (section 7.1), and attach an inline policy with only the permissions in 7.1.
3. **GitHub** → Settings → Environments: create `marketing-production`, `app-production`,
   `admin-production`, each with deployment branch `main` only and the variables from section 6.
   Optionally require a reviewer on marketing while it's beta.
4. **GitHub** → branch protection on `main`: CI required, no direct pushes.

### Phase 4: deploy tooling and workflow (repo)

1. `tooling/deploy/deploy.ts`: the steps in section 5, with a `--dry-run` that prints the plan,
   and unit tests for what's easy to get wrong: the content-type table, the skip list, the ETag
   comparison and the 30-day asset prune.
2. `.github/workflows/deploy.yml` (section 7.2); `ci.yml` becomes callable; delete
   `scheduled-build.yml`, and `MARKETING_DEPLOY_HOOK` from the checklist.
3. Smoke-test mode for Playwright (section 7.3).

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
- **D. DNS: stays at Hostinger.** CNAMEs for `beta`, `app`, `adm` and `www`; the apex uses
  Hostinger's ALIAS (a CNAME on `@`). Route 53 isn't used.

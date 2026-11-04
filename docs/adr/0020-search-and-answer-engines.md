# 0020 · Search and answer engines: what the build guarantees

Accepted 2026-11-04.

## Context

Marketing already prerendered every page with its title, description, canonical, hreflang, Open
Graph tags and JSON-LD, and `scripts/postbuild.ts` checked them. An audit of the built HTML, which is
what crawlers get (most AI crawlers don't run JS), found what was still wrong:

- 146 pages linked through a redirect: to `/<lang>` where that locale has no published home (a 302
  to `/en`), and from `/en/about` and `/en/contact` to `/en/interview-guide` (a 301).
- Home's sitemap `lastmod` moved whenever the home v2 preview changed.
- The JSON-LD nodes stood alone, and the desktop app was named after its download page.
- The app's `index.html` had no `<title>`, so shared links unfurled as a bare URL.

## Decision

- Links go to a page's final URL through `usePagePath`, and postbuild fails a page that links to a
  path that wasn't prerendered.
- `lastmod` comes from the page's own feature folder and locale files, minus preview code.
- One entity graph: Organization, WebSite (with `alternateName: letshyre.ai`, since titles end with
  the domain) and SoftwareApplication nodes with `@id`s that pages point at through `about`.
  Postbuild also checks that `og:url` is the canonical URL and `<html lang>` the page's locale.
- `/llms.txt` is generated from the page registry and English meta, like the sitemap. Google
  doesn't use it; it costs nothing to keep and can't go stale.
- `robots.txt` lets every crawler in, AI ones included. The site's job is to be found and cited.
- The app's shell carries a title and a link preview with no personal data. App pages stay
  `noindex` and crawlable, since crawlers must fetch a page to see its `noindex`; they have no
  descriptions because search never shows them.

## Not done, on purpose

- No `SearchAction` (Google retired the sitelinks search box in 2024) and no `HowTo` (retired 2023).
- FAQPage stays. Google shows it only for a few authoritative sites, but other engines read it,
  and the answers are on the page anyway.
- No `aggregateRating` or reviews until there are real ones to mark up.
- No `legalName`, address or founding date on the Organization. The site doesn't state them, and
  structured data must match the page.

## Open

- **Prices for crawlers that don't run JS.** Pro, Business and top-up prices load from the API in
  the browser, so the prerendered pricing page says "Loading current prices". A build-time snapshot
  would answer "how much does LetsHyre cost" for AI crawlers. The cost is a build that depends on
  the API, and a redeploy whenever prices change.
- **AI training crawlers.** Blocking training bots such as GPTBot, Google-Extended and CCBot while
  allowing search bots is a business and legal call, not a technical one.
- **IndexNow**, which pings Bing (and the AI search built on it) when pages change, once there is a
  host and a deploy step to run it from.

## Consequences

- A link to a page that isn't published in its locale fails the build. Link through `usePagePath`.
- A new page id must be given an `llms.txt` section, or `null`, before the scripts typecheck.
- Changing the app's `HydrateFallback` must keep its `<title>`; postbuild checks for it.

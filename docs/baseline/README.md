# Production baseline (captured 2026-10-03)

What `https://letshyre.ai` serves **before** the migration. The new marketing build is diffed against
these files (implementation plan step 4.2). Re-capture with:

```bash
node tooling/baseline/capture-seo.ts          # → seo-baseline.json
node tooling/baseline/capture-lighthouse.ts   # → lighthouse.json (needs Chrome)
```

| File | Contents |
|---|---|
| [seo-baseline.json](./seo-baseline.json) | 153 sitemap URLs (title, description, robots, canonical, hreflang, OG/Twitter, JSON-LD types, FAQ count, `h1` count, `lang`/`dir`) + 15 redirect/fallback probes |
| [lighthouse.json](./lighthouse.json) | Lighthouse 13, mobile preset, 11 pages |
| [content-inventory.md](./content-inventory.md) | Every marketing copy key with a keep/rewrite/drop proposal (step 0.3) |
| [url-contract.md](./url-contract.md) | URLs that must keep working, and marketing → app handoff links (step 0.4) |

## SEO: what's good (must be preserved)

- 153 indexable URLs: 8 pages × 19 locales, plus `/en/pricing` (English only).
- Every page has a title, description, self-canonical, hreflang set + `x-default`, OG/Twitter tags, JSON-LD and exactly one `h1`. `lang`/`dir` are correct (including `ar`/`ur` RTL).

## SEO: live defects (the new setup must fix, not reproduce)

| # | Defect | Evidence | Fix in the new setup |
|---|---|---|---|
| S1 | **Every canonical and sitemap URL 301-redirects.** Canonicals and `<loc>` use `/en/pricing`, but the server redirects that to `/en/pricing/`. Google reports these as "Page with redirect" and has to reconcile conflicting signals. | 153/153 sitemap URLs return 301 first | Serve the canonical (no trailing slash) directly with 200. A trailing slash 301s to no slash. This is what `deploy/nginx.conf` in the repo already intended, but production runs an older config. |
| S2 | **Soft 404s.** Unknown URLs return 200 with the app shell. | `/xx/nonsense`, `/en/does-not-exist`, `/assets/does-not-exist.js` → 200 | Real 404 with a prerendered 404 page. Missing assets → 404. |
| S3 | **Untranslated page serves an empty shell.** | `/hi/pricing` → 200, 4.7 KB, no title or canonical | 302 → `/en/pricing` until the page is ready in that locale. |
| S4 | `/` serves the app shell (`noindex`) instead of redirecting. | `/` → 200 | 301 → `/en`. |

Note: production nginx (`nginx/1.28.3 (Ubuntu)`) does **not** match `deploy/nginx.conf` in this repo. Treat the repo file as intent, not as the live config.

## Lighthouse (mobile preset)

| Page | Perf | A11y | Best Pr. | SEO | LCP | CLS | TBT | Weight |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| /en/ | 54 | 96 | 77 | 100 | 7.1 s | 0.017 | 352 ms | 1960 KB |
| /en/about/ | 64 | 100 | 77 | 100 | 5.9 s | 0 | 0 ms | 992 KB |
| /en/contact/ | 64 | 100 | 77 | 100 | 5.8 s | 0 | 0 ms | 844 KB |
| /en/download/ | 65 | 100 | 77 | 100 | 5.8 s | 0 | 0 ms | 805 KB |
| /en/how-it-works-interview/ | 63 | 100 | 77 | 100 | 5.8 s | 0 | 251 ms | 774 KB |
| /en/pricing/ | 56 | 100 | 77 | 100 | 7.1 s | 0 | 347 ms | 921 KB |
| /en/terms/ | 61 | 100 | 77 | 100 | 6.6 s | 0 | 1 ms | 959 KB |
| /en/policy/ | 62 | 100 | 77 | 100 | 6.4 s | 0 | 62 ms | 957 KB |
| /en/refund-policy/ | 48 | 100 | 77 | 100 | 6.6 s | 0 | 604 ms | 959 KB |
| /ar/ | 68 | 100 | 77 | 100 | 5.1 s | 0 | 60 ms | 1601 KB |
| /ar/about/ | 57 | 100 | 77 | 100 | 5.4 s | 0 | 414 ms | 815 KB |

**Targets for the new build** (migration plan §6): Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO = 100, LCP ≤ 2.0 s, CLS ≤ 0.05.

Findings:
- **Performance is the main gap.** LCP is 5–7 s on every page, and even text-only legal pages ship 950+ KB.
- **Best Practices = 77 everywhere** comes from one cause: Meta Pixel sets third-party cookies on load, without consent (`third-party-cookies`, `inspector-issues`). A consent-gated pixel (open decision O2) fixes this.
- **A11y:** only `/en/` fails one audit (`color-contrast`). Lighthouse covers a subset of WCAG, so the manual pass in Phase 4 still applies.
- Single runs; expect ±5 points of noise on Performance.

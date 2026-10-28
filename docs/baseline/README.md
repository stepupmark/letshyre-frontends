# Production baseline (captured 2026-10-03)

What `https://letshyre.ai` serves **before** the migration. The new marketing build is diffed against
this file. Re-capture with:

```bash
node tooling/baseline/capture-seo.ts          # → seo-baseline.json
```

| File | Contents |
|---|---|
| [seo-baseline.json](./seo-baseline.json) | 153 sitemap URLs (title, description, robots, canonical, hreflang, OG/Twitter, JSON-LD types, FAQ count, `h1` count, `lang`/`dir`) + 15 redirect/fallback probes |
| [url-contract.md](./url-contract.md) | URLs that must keep working, and marketing → app handoff links |

## SEO: what's good (must be preserved)

- 153 indexable URLs: 8 pages × 19 locales, plus `/en/pricing` (English only).
- Every page has a title, description, self-canonical, hreflang set + `x-default`, OG/Twitter tags, JSON-LD and exactly one `h1`. `lang`/`dir` are correct (including `ar`/`ur` RTL).

## SEO: live defects (the new setup must fix, not reproduce)

| # | Defect | Evidence | Fix in the new setup |
|---|---|---|---|
| S1 | **Every canonical and sitemap URL 301-redirects.** Canonicals and `<loc>` use `/en/pricing`, but the server redirects that to `/en/pricing/`. Google reports these as "Page with redirect" and has to reconcile conflicting signals. | 153/153 sitemap URLs return 301 first | Serve the canonical (no trailing slash) directly with 200. A trailing slash 301s to no slash. |
| S2 | **Soft 404s.** Unknown URLs return 200 with the app shell. | `/xx/nonsense`, `/en/does-not-exist`, `/assets/does-not-exist.js` → 200 | Real 404 with a prerendered 404 page. Missing assets → 404. |
| S3 | **Untranslated page serves an empty shell.** | `/hi/pricing` → 200, 4.7 KB, no title or canonical | 302 → `/en/pricing` until the page is ready in that locale. |
| S4 | `/` serves the app shell (`noindex`) instead of redirecting. | `/` → 200 | 301 → `/en`. |

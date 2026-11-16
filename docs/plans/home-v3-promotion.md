# Promote home-v3 to the landing page

Status: done 2026-11-16. Settles item 2b of `marketing-audit-2026-11.md`: home-v3 wins.

Goal: `/en` renders today's home-v3 page, pixel- and behaviour-identical, and the old home, home-v2
and every trace of the "v2/v3" naming are gone. The home-v3 components don't change in Phases 1–2;
Phase 3 renames only.

## What's there today

| Page     | URL        | Route                     | Feature                                           | Namespaces       | Locales |
| -------- | ---------- | ------------------------- | ------------------------------------------------- | ---------------- | ------- |
| `home`   | `/:lang`   | `_site.$lang._index.tsx`  | `features/home` (root `components/`, art)         | `home`           | en only |
| `homeV2` | `/home-v2` | `_site.$lang.home-v2.tsx` | `features/home/components/v2`, `home-v2-page.tsx` | `homeV2`, `home` | en only |
| `homeV3` | `/home-v3` | `_site.$lang.home-v3.tsx` | `features/home-v3`                                | `homeV3`, `home` | en only |

Things home-v3 leans on that live outside `features/home-v3`, and so must survive the cleanup:

- **`home` namespace.** `home-v3/components/faq.tsx` reads `home:faq`. The assistant
  (`assistant-launcher.tsx`, `launcher-greeting.tsx`, `panel-header.tsx`) reads `home:chatbot`.
  `homeJsonLd` and `pageMeta("home")` read `home:meta.*` and `home:faq.items`.
- **`homeJsonLd`** lives in `features/home/lib/home-json-ld.ts`. The route passes it to `pageMeta`;
  home-v3 has no JSON-LD of its own today because it's noindex.
- **Three photos in `public/images/home-v2/`.** `home-v3/components/journey.tsx` uses
  `home-v2/post-a-job`, `home-v2/review-interview` and `home-v2/reach-out`, and `photo.tsx` keeps a
  `"home-v2"` size set for them. Only `hiring-manager` and `video-interview` are v2-only.
- **The JS budget exemption.** `scripts/postbuild.ts` exempts `homeV3` from the 280 kB initial JS
  budget. Today's build measures roughly 291 kB gzip for `/en/home-v3` against 279 kB for `/en`.
  Moved to `/` without the exemption, the build fails.

`homeV3.meta.title` and `description` are identical to `home.meta`, so the SEO title and description
don't change.

## Decisions

1. **Translations: English first (decided 2026-11-16).** The page swaps without waiting for
   translations. See "What English-first means" below.
2. **JS budget.** Recommended: move the exemption from `homeV3` to `home` for the swap, so the page
   ships unchanged, and get it under 280 kB as a separate follow-up (the motion runtime is the bulk).
   The alternative is trimming before the swap, which means changing home-v3 code.
3. **Old preview URLs.** Recommended: 301 `/home-v2` and `/home-v3` to the home page through
   `MOVED_PATHS` — cheap, and a shared review link keeps working.

## What English-first means

Nothing changes for other languages. The old home was already English-only: the other 18
locales' `home.json` only ever held the assistant's `chatbot` copy, so `/hi`, `/ar` and the rest
already 302 to `/en` and the home page's hreflang is `en` and `x-default` alone. Header, footer
and 404 links go through `usePagePath()` and already point those locales at `/en`.

## Phase 1: swap the route (one commit)

No file under `features/home-v3` changes.

- `routes/_site.$lang._index.tsx`: render `HomeV3Page` from `@/features/home-v3`; keep
  `homeJsonLd` from `@/features/home` and `pageMeta("home", homeJsonLd)` for now.
- `app/lib/pages.ts`: `home.namespaces` becomes `["homeV3", "home"]`.
- `scripts/postbuild.ts`: `JS_BUDGET_EXEMPT` becomes `["home"]`, with the comment saying it waits
  on the budget follow-up. `SOURCES.home` becomes `["app/features/home-v3"]` so the sitemap
  `lastmod` follows the page that's actually served.
- `e2e/home.spec.ts`: the three existing tests should still pass as-is (same h1, same CTA labels,
  same FAQ copy from `home:faq`, same JSON-LD). Move the walk-through from `home-v3.spec.ts` into it
  — scroll every pinned scene and check each photo decodes, the "Go to step 3" button on chromium,
  "Skip the walkthrough" focusing `#pricing`, and no console or page errors — pointed at `/en`.
- The sitemap-driven `smoke`, `a11y` (axe) and `seo` specs now reach home-v3 for the first time.
  Expect this to surface anything axe or the SEO checks dislike; fix it here, it's live now.
- `header.spec.ts` (six tests), `assistant.spec.ts` and the newsletter test all open `/en`, so they
  now run against home-v3. `not-found.spec.ts` already falls back to `/en` when `/hi` isn't in the
  sitemap. `i18n.spec.ts` follows readiness and needs nothing.
- Lighthouse already measures `""`; performance is a warning, not a gate, so watch the report.

At this point `/`, `/home-v3` and the old code all build. Stop here if anything looks off.

## Phase 2: delete home and home-v2 (one commit)

Routes and pages:

- Delete `routes/_site.$lang.home-v2.tsx` and `routes/_site.$lang.home-v3.tsx`.
- `app/lib/pages.ts`: drop `homeV2` and `homeV3` from `PAGES`; `PREVIEW_PAGES` becomes `[]` (it's
  still read by `page-meta.ts` and `postbuild.ts`, keep it for the next preview); add
  `"/home-v2": ""` and `"/home-v3": ""` to `MOVED_PATHS` (decision 3). The redirect map writes
  `/$1` + `""`, so check `url-contract.spec.ts` expects `/en`, not `/en/`.
- `scripts/llms.ts`: drop the `homeV2` and `homeV3` keys (the record is typed over `PageId`, so
  typecheck points at them).
- `scripts/postbuild.ts`: drop `SOURCES.homeV2` and `SOURCES.homeV3`.
- `lighthouserc.cjs`: drop `"/home-v2"`.

Code:

- Move `features/home/lib/home-json-ld.ts` to `features/home-v3/lib/home-json-ld.ts` and export it
  from `features/home-v3/index.ts`. Point the `_index` route at it.
- Delete the rest of `features/home`: `home-page.tsx`, `home-v2-page.tsx`, `components/` (root
  sections, `art/`, `v2/`), `index.ts`.
- Run `pnpm knip` and delete what it reports from `app/components`, `app/hooks` and `app/lib` that
  only the old pages used. Don't touch what home-v3 imports (`section`, `cta-links`, `faq-list`,
  `art/score-ring`, `art/avatar`, `use-hydrated`, `lib/motion`, `lib/app-links`, `lib/pages`).

Copy:

- Delete `locales/en/homeV2.json` and its entry in `app/types/i18next.d.ts`.
- `locales/en/home.json`: remove the old page's sections (`hero`, `tension`, `how`, `evidence`,
  `professionals`, `pricing`, `final`). Keep `meta`, `faq` and `chatbot`. The other locales only
  hold `chatbot` and don't change.

Assets:

- Delete `public/images/home-v2/hiring-manager-*` and `video-interview-*` and their lines in that
  folder's `SOURCES.md`. Keep the three photos home-v3 uses.

Tests and docs:

- Delete `e2e/home-v2.spec.ts` and `e2e/home-v3.spec.ts` (their checks now live in `home.spec.ts`,
  and `seo.spec.ts` covers noindex and sitemap rules).
- `docs/baseline/url-contract.md`: list the two new 301s.
- `docs/plans/marketing-audit-2026-11.md`: mark 2b done.

## Phase 3: drop the "v3" naming (one commit, mechanical)

Output is identical; the e2e from Phase 1 proves it.

- `git mv features/home-v3 features/home`; `home-v3-page.tsx` → `home-page.tsx`, `HomeV3Page` →
  `HomePage`. Update the route import.
- Merge the `homeV3` namespace into `home` in every locale: its sections join `home`'s `faq`,
  `chatbot` and `meta` (the `meta` title and description are the same strings). Change
  `useTranslation("homeV3")` to `"home"` in the home components. Delete `homeV3.json`, its
  `i18next.d.ts` entry, and set `PAGES.home.namespaces` back to `["home"]`. Only English has the
  new sections, so the page stays English-only, as before.
- `scripts/postbuild.ts`: `SOURCES.home` becomes `["app/features/home"]`.
- Optional: move the photos to `public/images/home/` and collapse the `SETS` map in `photo.tsx`.
  It changes image URLs (a cache miss, nothing else). Skip it if you'd rather keep this commit
  text-only.

## Verification

After each phase:

```bash
pnpm --filter marketing typecheck
pnpm --filter marketing lint
pnpm --filter marketing build
pnpm --filter marketing exec playwright test e2e/home.spec.ts e2e/header.spec.ts e2e/assistant.spec.ts e2e/not-found.spec.ts e2e/seo.spec.ts e2e/url-contract.spec.ts e2e/a11y.spec.ts --project=chromium
```

After Phase 1, also check in the build that `sitemap.xml` lists the home page in `en` only.

After Phase 2 also run `pnpm knip` and `pnpm --filter marketing exec vitest run
app/features/assistant/assistant-launcher.test.tsx` (it loads `home.json` through `test/render.tsx`).
Before merging, compare `/en` side by side with the last `/en/home-v3` build at 360, 768, 1280 and
1920 px.

## Follow-ups (outside this change)

- Translate the home page. After Phase 3 that's one namespace: send the new sections of
  `locales/en/home.json` out for the 18 locales and apply with `pnpm i18n:apply`. Each locale's
  home republishes, with sitemap and hreflang, as soon as its catalog is complete. Check `ar` for
  RTL and `hi` for line length.
- Bring the home page under the 280 kB initial JS budget and drop the exemption.
- Move the assistant's `chatbot` copy from `home` into the `assistant` namespace, so the assistant
  doesn't depend on the home page's catalog.

# Marketing file-based routing

Move `apps/marketing` from the explicit `app/routes.ts` to file-based routing (`flatRoutes()` from
`@react-router/fs-routes`). No URL changes. Supersedes migration-plan decision A8 for marketing; the
app keeps its explicit `routes.ts` for now (see the appendix).

Status: docs done (step 7 and the host requirements in `docs/baseline/url-contract.md` §5).

## 1. Today

```ts
route("404", "routes/not-found.tsx"),
layout("layouts/site-layout.tsx", [
  ...prefix(":lang", [index("routes/home.tsx"), route("pricing", "routes/pricing.tsx"), …]),
]),
```

- 10 route modules in `app/routes/`, all under 30 lines, plus the layout route
  `app/layouts/site-layout.tsx` (loader + shell).
- `prerender.paths` comes from `readyPaths()` (translation readiness) plus `/404`. It doesn't read
  `routes.ts`, so it is unaffected.
- One thing depends on a route id: `site-layout.tsx` calls
  `useRouteLoaderData("layouts/site-layout")`. Route ids change with the file names.

## 2. Target layout

`.` is a path segment, `$lang` a param, `_site` a pathless layout, `_index` the index route.

| URL                             | Today                     | New file                                        |
| ------------------------------- | ------------------------- | ----------------------------------------------- |
| (layout)                        | `layouts/site-layout.tsx` | `routes/_site.tsx`                              |
| `/:lang`                        | `routes/home.tsx`         | `routes/_site.$lang._index.tsx`                 |
| `/:lang/pricing`                | `routes/pricing.tsx`      | `routes/_site.$lang.pricing.tsx`                |
| `/:lang/how-it-works-interview` | `routes/interview.tsx`    | `routes/_site.$lang.how-it-works-interview.tsx` |
| `/:lang/download`               | `routes/download.tsx`     | `routes/_site.$lang.download.tsx`               |
| `/:lang/contact`                | `routes/contact.tsx`      | `routes/_site.$lang.contact.tsx`                |
| `/:lang/about`                  | `routes/about.tsx`        | `routes/_site.$lang.about.tsx`                  |
| `/:lang/terms`                  | `routes/terms.tsx`        | `routes/_site.$lang.terms.tsx`                  |
| `/:lang/policy`                 | `routes/privacy.tsx`      | `routes/_site.$lang.policy.tsx`                 |
| `/:lang/refund-policy`          | `routes/refund.tsx`       | `routes/_site.$lang.refund-policy.tsx`          |
| `/404`                          | `routes/not-found.tsx`    | `routes/404.tsx`                                |

File names now match their URLs (`privacy.tsx` served `/policy`, `interview.tsx` served
`/how-it-works-interview`). The header and footer components stay in `app/layouts/`; only the layout
route module moves.

`app/routes.ts` becomes:

```ts
import type { RouteConfig } from "@react-router/dev/routes"
import { flatRoutes } from "@react-router/fs-routes"

export default flatRoutes() satisfies RouteConfig
```

## 3. Steps

All in one commit; nothing ships in between.

1. **Snapshot (before):** `pnpm --filter marketing exec react-router routes --json > before.json`,
   a build, and a sorted file list of `build/client` without hashed assets, plus `sitemap.xml`.
   Kept in the scratchpad, not committed.
2. **Dependency:** add `@react-router/fs-routes: 8.4.0` to the pnpm catalog and to
   `apps/marketing` devDependencies, then `pnpm install`.
3. **Move files** with `git mv` per the table, so history follows them.
4. **Fix what moved:**
   - `+types` imports: `./+types/pricing` → `./+types/_site.$lang.pricing`, and so on.
   - `useRouteLoaderData("layouts/site-layout")` → `"routes/_site"`, typed with
     `typeof loader` as now.
   - Relative imports in the moved layout (`./site-header` → `@/layouts/site-header`).
5. **`routes.ts`:** replace the config with `flatRoutes()`.
6. **Prove nothing changed:**
   - `react-router routes --json` again; paths, nesting and index flags must match `before.json`
     (only `id` and `file` differ).
   - Build: the `build/client` file list and `sitemap.xml` are identical to the snapshot, and the
     postbuild CSP map has the same paths.
   - `pnpm verify` (typecheck, lint, unit tests, knip, build) and the marketing e2e suite (URL
     contract, SEO, handoff, a11y) pass.
7. **Docs:**
   - ADR 0013 "File-based routing for marketing" (supersedes A8 for marketing, says why the app waits).
   - `migration-plan.md` A8 row: note it's superseded for marketing by 0013.
   - `apps/marketing/README.md`: one line on where a new page goes (`routes/_site.$lang.<slug>.tsx`
     plus its namespace in `locales/`).

Effort: about half a day.

## 4. Adding a page afterwards

1. `routes/_site.$lang.careers.tsx` with `loader` (`pageData(params.lang, "careers")`), `meta`
   (`pageMeta`) and the page component from `features/careers`.
2. A `careers` entry in `lib/pages.ts` (path, namespaces, OG image).
3. `locales/en/careers.json`. Readiness puts it in the prerender list and the sitemap per locale
   once its keys are complete; nothing else to register.

## 5. Tests

No new tests. The route manifest and build output diffs in step 6 are the one-time proof, and the
existing e2e URL-contract and SEO specs guard the URLs from then on.

## 6. Not in this change

- **URL changes.** The marketing URLs already follow the rules: locale first, lowercase kebab-case,
  no trailing slash, one URL per page, canonical and hreflang on every page, `/404` is `noindex` and
  not in the sitemap. `policy` and `how-it-works-interview` are weak slugs but indexed; renaming
  needs real 301s, which needs host config. Revisit when a host is chosen.
- **Host behaviour** (record in `docs/baseline/url-contract.md` as host requirements):
  - `/` → 301 `/en`; trailing slash → 301 no slash; a page not ready in a locale → 302 `/en/...`.
  - Prerender writes `en/pricing/index.html`. Many static hosts redirect `/en/pricing` to
    `/en/pricing/`, the opposite of the canonical. The host must serve the folder index without the
    slash, or postbuild also writes `en/pricing.html`.

## Appendix: app routing (done)

**Done 2026-10-06** ([ADR 0014](./adr/0014-app-route-config.md)): the app keeps `routes.ts`; the
URLs below were cleaned up with redirects, links are typed with `href()` and each role layout has a
not-found route. `lib/app-paths.ts` stays, since the prefixes didn't change. Original findings:

- Record ids in the query string (`employee-profile?id=`, `employee-score-card?id=`,
  `scorecard?id=`) instead of path params.
- `view-jobs/:jobId` vs `view-jobs/applicants/:jobId`; verbs in paths (`view-jobs`, `post-job`,
  `find-jobs`); job edit as `?edit=1`.
- Two URLs for one page (`/employer` and `/employer/dashboard`, `/employee` and
  `/employee/find-jobs`).
- Names: `invoice` (a list), `score-cards-list`, `your-team`, `profile` for the company, `chatbot`.
- No not-found route inside the role layouts.
- ~120 hard-coded path strings in 36 files; `href()` from `react-router` would type them.
- `lib/app-paths.ts` duplicates the top-level prefixes by hand.

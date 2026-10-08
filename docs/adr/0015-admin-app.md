# 0015 · The admin panel joins the monorepo as `apps/admin`

Accepted with the admin migration.

## Context

The admin panel was its own repo with its own copies of everything the monorepo already shares:
axios, Radix-based shadcn, a token store, nuqs for URL state, react-table v8 and a
Netlify-style `_headers` build. It is internal, English only, client-only and must never be
indexed. Its five ADRs described those choices.

## Decision

Move it into `apps/admin` with its git history and converge it fully on the shared packages:

- **UI:** `@workspace/ui` (base-nova on Base UI) with the brand theme and Outfit, plus
  `@workspace/blocks` for the theme provider, navigation progress, logo, skip link and error screen.
  The admin keeps a dark-mode toggle (`<ThemeProvider switchable>`); the other apps stay light.
- **Data:** `@workspace/api` for every request. Responses are still parsed with the admin's own
  `envelope()`, because not every admin endpoint sends `success`.
- **Auth:** `@workspace/auth` with an `Admin` role. The admin keeps its own `/sign-in` and passes
  `{ roles: [ROLES.admin] }` to `login()`, so any other role is refused before a session is saved.
  Refresh is shared across tabs with a Web Lock, since the backend rotates refresh tokens.
- **Routes:** flat file routes stay ([ADR 0013](./0013-marketing-file-routes.md) style). List
  filters live in the URL through `@workspace/api/table-params`; list routes skip their loaders
  when only the query string changes, and the page's debounced query fetches instead.
- **Tables:** the shared react-table v9 pattern ([ADR 0011](./0011-data-tables.md)), with the
  admin's own feature set (selection and column visibility; paging is server-side).
- **Copy:** English only, written inline. The `i18next/no-literal-string` rule is off for this app.
- **Build:** `scripts/postbuild.ts` checks `noindex` and `robots.txt`, writes the hash-based CSP
  ([ADR 0012](./0012-csp-hashes.md)) to `build/csp.map` and holds a 175 kB initial-JS budget.
  `pnpm preview` serves that policy as a header, so e2e runs under it. Nothing host-specific is
  generated, because hosting isn't chosen yet.

This supersedes the admin repo's ADRs 0001–0005. Its token-storage decision is the same as
[ADR 0005](./0005-session-storage.md).

## Consequences

- One set of components, client, guards and lint rules; a fix in a package reaches the admin too.
- The host must add what a page can't: `frame-ancestors 'none'` (or `X-Frame-Options: DENY`),
  HSTS, `X-Robots-Tag: noindex`, the SPA fallback to `index.html`, and long caching for `/assets/*`.
- The backend must allow the admin's origin in CORS before sign-in works outside e2e.

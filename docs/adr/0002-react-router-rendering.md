# 0002 · React Router 8: prerendered marketing, SPA app

Accepted 2026-10-03.

## Context

Marketing pages need to be indexed in 19 locales and load fast on slow phones. The dashboards sit
behind sign-in, are never indexed and talk to an existing Django API.

## Decision

Both apps use React Router 8 in framework mode with an explicit `routes.ts`.

- **Marketing:** `ssr: false` with `prerender`, so every page is static HTML.
- **App:** SPA mode. One `index.html`, `noindex`, data loaded in the browser through client
  middleware and TanStack Query.

## Consequences

- No Node server in production; a static host serves both builds.
- The app's first paint is the shell, so its JS budget (`apps/app/scripts/postbuild.ts`) is a hard
  build check.
- Typed routes in one file replace legacy's `flatRoutes()` naming and its double-layout bugs.

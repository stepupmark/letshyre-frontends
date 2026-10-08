# 0001: Client-only SPA on React Router 8

Status: accepted

## Context

The admin panel sits behind a login and is never indexed, so server rendering buys nothing. The old app used React Router as a library with a hand-written route config and guard components.

## Decision

Use React Router 8 in framework mode with `ssr: false`. Routes are files in `app/routes` (flat routes). Auth checks run as `clientMiddleware` on the layout routes, and each page prefetches its data in a `clientLoader`.

## Consequences

- The build is static files; any static host works.
- Route-level code splitting, typed route modules and error boundaries come for free.
- `clientLoader` must not await data, or navigation would block on the API. Loaders start the fetch and return `null`; the page shows skeletons.

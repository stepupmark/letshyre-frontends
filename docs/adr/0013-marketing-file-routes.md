# 0013 · File-based routing for marketing

Accepted 2026-10-06. Supersedes migration-plan A8 for `apps/marketing` only.

## Context

A8 chose an explicit `routes.ts` everywhere. In marketing that file only mapped one layout and ten
small pages, and file names had drifted from their URLs (`privacy.tsx` served `/policy`,
`interview.tsx` served `/how-it-works-interview`).

## Decision

Marketing uses `flatRoutes()` from `@react-router/fs-routes`. `routes/_site.tsx` is the pathless
layout, pages are `routes/_site.$lang.<slug>.tsx` (home is `_site.$lang._index.tsx`) and
`routes/404.tsx` is the not-found page. File names match URLs. The prerender list still comes from
translation readiness, not from the route files.

The app keeps its explicit `routes.ts` until its URL cleanup (see the appendix of
[routing-plan.md](../routing-plan.md)); moving it first would bake today's URLs into file names.

## Consequences

- A new page is a route file, its entry in `app/lib/pages.ts` and its namespace in
  `app/locales/en/`. There is no route config to edit.
- Route ids follow file names, so `useRouteLoaderData` uses `"routes/_site"`.
- URLs didn't change; the e2e URL-contract and SEO specs guard them.

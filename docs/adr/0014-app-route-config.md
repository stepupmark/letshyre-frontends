# 0014 · The app keeps its explicit route config

Accepted 2026-10-06. Closes the app appendix of [routing-plan.md](../routing-plan.md).

## Context

[0013](./0013-marketing-file-routes.md) moved marketing to `flatRoutes()` and left the app until its
URL cleanup. The app's URLs had record ids in the query string, verbs in paths, two URLs for one
page and no not-found route inside the dashboards.

## Decision

`apps/app` keeps `app/routes.ts`. File-based routing fits it badly:

- One module serves several URLs: `routes/auth/register.tsx` for both roles, `routes/moved.tsx` for
  every old URL. File routes need one file per URL.
- The dev-only `_lab` routes are dropped from production builds in `routes.ts`.
- Seven layouts (auth, public, two onboarding, two role shells, lab) would turn into long flat file
  names such as `_employer.employer.candidates.$candidateId.scorecard.tsx`.
- `routes.ts` is the URL contract on one screen, and shows each role layout as an auth boundary.

Instead the URLs were cleaned up: nouns, ids as path params (`/employer/jobs/:jobId/applicants`,
`/employee/scorecards/:scorecardId`), one URL per page. Old URLs redirect in the browser from the
map in `lib/moved.ts`, query string kept. Links use `href()` from `react-router`, so a wrong path or
a missing param is a type error. Unknown `/employer/*` and `/employee/*` paths render a 404 inside
the dashboard shell. The `/employer` and `/employee` prefixes stay, so `lib/app-paths.ts` and host
routing are unchanged; `/employee` is not renamed to `/candidate` because backend emails and host
config use it.

## Consequences

- A new page is an entry in `routes.ts` plus its module; `href()` picks it up after typegen.
- Old URLs must keep redirecting. Entries in `lib/moved.ts` are never removed, and a host can serve
  301s from the same map later.
- The URL list lives in [url-contract.md §6](../baseline/url-contract.md#6-app-urls-appsapp).

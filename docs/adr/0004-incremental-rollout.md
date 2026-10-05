# 0004 · Incremental rollout on `letshyre.ai`; subdomain later

Accepted at gate 5. Amended 2026-10-05: the subdomain move is deferred.

## Context

The first plan shipped the whole app at once on `app.letshyre.ai`: every screen, a domain move and a
forced re-login in one release.

## Decision

The new app took over `letshyre.ai`'s dashboard paths (`/employer`, `/employee`, `/sign-in`,
`/get-started`, `/forgot-password`, `/shared-scorecard`) one area at a time, with nginx routing each
path to legacy or the new app. Same origin and the same `localStorage` keys meant no re-login.

With legacy removed, nginx sends those paths to the app permanently. Moving to `app.letshyre.ai`
(plan step 7.1) is deferred until the backend offers an httpOnly refresh cookie on `.letshyre.ai`
(B5), so the move doesn't sign everyone out.

## Consequences

- Marketing and the app share an origin, so marketing's third-party scripts (Meta Pixel, after
  consent) run where the session tokens live. See [0005](./0005-session-storage.md).
- `apps/app/app/lib/app-paths.ts` and the nginx `location` must list the same prefixes.
- The move, when it happens, is a new server block plus 301s from these paths; app code doesn't
  change beyond `VITE_APP_URL`.

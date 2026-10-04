# nginx

`sites/letshyre.ai.conf` serves letshyre.ai until the app moves to app.letshyre.ai (Phase 7):
marketing pages from the marketing build, dashboard routes from the new app when they are
live, otherwise from the legacy build. `legacy/` is the config running today, kept for
rollback until launch.

## Moving a page to the new app

Add its path to `apps/app/app/lib/live-routes.ts`, release the app and reload nginx. The
build writes `live-routes.map` (nginx sends direct visits to the app) and
`client/live-routes.json` (legacy hands its own links over with a full page load). Rollback
is the same in reverse: remove the path, release, reload.

Sign-in goes first: the app's guards send signed-out visitors to `/sign-in`, which legacy
doesn't have, so the build refuses a live dashboard page without it. Move the auth pages
together: `/sign-in`, `/employer/sign-in`, `/employee/sign-in`, `/get-started`,
`/employer/register`, `/employee/register` and `/forgot-password`.

## Layout on the server

```
/etc/nginx/snippets/                      ← snippets/*.conf
/var/www/letshyre/marketing/current/      ← apps/marketing/build (client/ and csp.map)
/var/www/letshyre/marketing/assets/       ← every release's client/assets, added to, never replaced
/var/www/letshyre/app/current/            ← apps/app/build (client/, csp.map, live-routes.map)
/var/www/letshyre/app/assets/             ← same, for the app
/var/www/letshyre/legacy/current/         ← apps/legacy/build
/var/www/letshyre/legacy/assets/          ← same, for legacy
```

`csp.map` and `live-routes.map` are read when nginx loads, so reload after each marketing or
app release.

## CSP

Pages ship a report-only script policy with the hashes from the build. After a clean week,
build with `CSP_ENFORCE=true` (the policy moves into a meta tag on each page) and drop the
`Content-Security-Policy-Report-Only` line from `snippets/marketing-headers.conf`.

## Test

```bash
pnpm build && bash infra/nginx/test/run.sh
```

Starts `nginx:stable` in Docker with both builds mounted and runs `test/assert.ts`, which
checks the URL contract in `docs/baseline/url-contract.md`. CI runs it on every push.

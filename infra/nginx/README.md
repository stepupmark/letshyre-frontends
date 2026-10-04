# nginx

`sites/letshyre.ai.conf` serves letshyre.ai until the app moves to app.letshyre.ai (Phase 7):
marketing pages from the new build, app routes from the legacy one. `legacy/` is the config
running today, kept for rollback until launch.

## Layout on the server

```
/etc/nginx/snippets/                      ← snippets/*.conf
/var/www/letshyre/marketing/current/      ← apps/marketing/build (client/ and csp.map)
/var/www/letshyre/marketing/assets/       ← every release's client/assets, added to, never replaced
/var/www/letshyre/legacy/current/         ← apps/legacy/build
/var/www/letshyre/legacy/assets/          ← same, for legacy
```

`csp.map` is read when nginx loads, so reload after each marketing release.

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

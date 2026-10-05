# nginx

`sites/letshyre.ai.conf` serves letshyre.ai: marketing pages from the marketing build, and the
dashboard paths (`/employer`, `/employee`, `/sign-in`, `/get-started`, `/forgot-password`,
`/shared-scorecard`) from the app build. The app's `app/lib/app-paths.ts` lists the same prefixes,
so keep the two in step. Moving the app to `app.letshyre.ai` is deferred (ADR 0004).

## Layout on the server

```
/etc/nginx/snippets/                      ← snippets/*.conf
/var/www/letshyre/marketing/current/      ← apps/marketing/build (client/ and csp.map)
/var/www/letshyre/marketing/assets/       ← every release's client/assets, added to, never replaced
/var/www/letshyre/app/current/            ← apps/app/build (client/ and csp.map)
/var/www/letshyre/app/assets/             ← same, for the app
```

`csp.map` is read when nginx loads, so reload after each marketing or app release.

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

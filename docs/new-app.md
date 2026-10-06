# Starting a new app (e.g. `apps/admin`)

A new dashboard app starts as a copy of `apps/app`'s frame, not of its features. It shares every
package, has its own routes, role guard and address, and is held to the same checks.

## What it shares

| Package                        | Gives it                                                          |
| ------------------------------ | ----------------------------------------------------------------- |
| `@workspace/ui`                | shadcn components, theme CSS, status tokens (never edited)        |
| `@workspace/blocks`            | Logo, skip link, theme provider, error screen, assistant, consent |
| `@workspace/i18n`              | Catalog loader, readiness checks, locale cookie, typed keys       |
| `@workspace/api`               | The typed `ky` client, uploads, downloads, error copy             |
| `@workspace/auth`              | Session keys, refresh, guards, `safeNext`                         |
| `@workspace/eslint-config`     | `react-router-app` preset with feature boundaries and a11y rules  |
| `@workspace/typescript-config` | `react-router-app.json`                                           |

Also shared by convention: [app-design.md](./design/app-design.md) as the review checklist, the
motion tokens and rules ([ADR 0008](./adr/0008-motion.md)), and the ADRs in general.

## Steps

1. **Copy the frame from `apps/app`:** `package.json` (rename, keep only the dependencies you use),
   `vite.config.ts`, `react-router.config.ts`, `tsconfig.json`, `eslint.config.js`,
   `vitest.config.ts`, `playwright.config.ts`, `scripts/postbuild.ts`, `app/root.tsx`,
   `app/entry.client.tsx`, `app/styles/`, and from `app/lib/`: `env*.ts`, `i18n/`, `guard.ts`,
   `navigation.ts`, `query-client.ts`, `api.ts`, `motion.ts`, `app-paths.ts`.
2. **Set the dev port** in `package.json` and `vite.config.ts`, and the e2e port in
   `playwright.config.ts`, so it runs next to the other apps.
3. **Role:** add the role to `ROLES` and `ROLE_HOME` in `packages/auth/src`, and wrap the app's
   layout in `guard([ROLES.admin])`. Sign-in can stay on the main app and send the role home, or the
   new app gets its own `/sign-in` built from `features/auth`.
4. **Paths:** set `app-paths.ts` to the prefixes this app serves; everything else is a full page
   load to another app.
5. **Shell:** start `features/shell` from the main app's (sidebar, topbar, command palette, user
   menu) with this app's `nav.ts`. Copy, don't import across apps.
6. **Locales:** start `app/locales/en/` and `reviewed.json` as `["en"]`. Other locales come through
   `pnpm i18n:apply` once the copy settles ([ADR 0007](./adr/0007-i18n-readiness.md)).
7. **Env:** add the app's `.env.example`, and its URL to the other apps' env if they link to it.
8. **Hosting:** its own subdomain (`admin.letshyre.ai`) with the SPA fallback, the build's
   `csp.map` policies and `noindex`; backend CORS for the origin.
9. **Checks:** add it to `knip.json` if it needs entries, and to the commitlint scopes. CI picks it
   up through Turbo; give it its own JS budget in `postbuild.ts` from a first measurement.

## Rules that carry over

- Features talk to each other only through their `index.ts`; lint enforces it.
- Routes live in an explicit `routes.ts` ([ADR 0014](./adr/0014-app-route-config.md)); links use
  `href()`, and each role layout ends with a `*` not-found route.
- Every response is parsed with Zod; every visible string is a translation key.
- Tests cover what's critical (money, session, data loss), not counts.
- E2E mocks every API call; unknown calls fail the test.

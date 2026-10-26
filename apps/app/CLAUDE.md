# apps/app

The employer and candidate dashboards, sign-in and registration. A client-only SPA on React Router 8
(`ssr: false`). The root CLAUDE.md applies here too; this file adds what is specific to the app.

## Routes

Routes are declared in `app/routes.ts`, not by file name (ADR 0014). Route files are thin: a
`clientLoader` that prefetches, `meta`, and the default export from a feature's `index.ts`.

- Employers live under `/employer`, candidates under `/employee`. Each role layout in `app/layouts`
  is wrapped in `guard()` from `@/lib/guard` and ends with a `*` not-found route.
- Links use `href()` so a renamed route fails the type check.
- Old URLs from before the 2026-10 cleanup redirect through `lib/moved.ts`; keep that list working.
- Each role has its own sign-in and register page; `/sign-in` and `/` are the role choosers
  (ADR 0017).

## Features

`app/features/<name>/` uses only the layer folders it needs (ADR 0016): `components`, `hooks`,
`queries`, `mutations`, `services`, `schemas`, `lib`, `types.ts` and `index.ts`. Tests sit beside the
file they test. `features/shell` owns the sidebar, topbar and command palette.

Before writing something new, check what is already shared:

| Need                                 | Use                                             |
| ------------------------------------ | ----------------------------------------------- |
| Loading, error and retry for a query | `QueryState`, `LoadError` (`@/components`)      |
| Empty list or first-run screen       | `EmptyState`                                    |
| Top of a page                        | `PageHeader`                                    |
| Status, score band or count          | `StatusBadge`, `bandOf` / `toneOf`              |
| Multi-step form                      | `Wizard`, `Stepper`                             |
| Dates typed by hand                  | `DateField` with `@/lib/date`                   |
| Text inputs with validation          | `TextField`, `checkOnBlur` (`@/lib/forms`)      |
| File uploads                         | `FileDropzone`, `@/lib/file-rules`              |
| Destructive action                   | `ConfirmDialog`, or `undoToast` when reversible |
| Numbers that change after an action  | `AnimatedNumber`                                |
| Tables                               | `DataTable` (ADR 0011)                          |
| Form drafts that survive a reload    | `@/lib/draft`, `useAutosave` (`@/hooks`)        |

## Design

Screens are reviewed against docs/design/app-design.md. The patterns live in the design lab at
`/_lab` (dev only, `app/lab/`); add a pattern there when it becomes shared.

- Content `max-w-6xl`, forms `max-w-xl`, tables full width.
- `text-2xl` page title, `text-base` section, `text-sm` body and tables, `text-xs` meta. Sentence
  case.
- Setup help is a checklist and tips, not a modal tour (ADR 0010).
- Auth screens use drawn illustrations and one typeface (ADR 0017).

## i18n

Copy lives in `app/locales/<lang>/<namespace>.json`. A locale is offered only when every namespace
passes the readiness checks and it is listed in `app/locales/reviewed.json`; otherwise the app falls
back to English. Only shipping locales are bundled. `I18N_PREVIEW=1` builds every complete locale for
staging review.

## Tests

- E2E specs in `e2e/` use `test` and `expect` from `./fixtures`. `signInAs(role)` sets the session
  for a user in `USERS`; `api({...})` overrides responses. Fixture JSON lives in `e2e/api/`.
- Every API call must be mocked; the `api` fixture fails the test on any unmocked request.
- `pnpm fixtures:capture` refreshes fixtures from staging with personal data replaced.
- `e2e/serve.ts` serves the build on port 4180 with the CSP enforced, so a policy violation fails
  the run.

Build once, then run the one spec you need:

```bash
pnpm --filter app build
pnpm --filter app exec playwright test e2e/<spec>.spec.ts --project=chromium
```

## Budget

`scripts/postbuild.ts` fails the build when the initial JS passes 180 kB gzip. Locale catalogs,
calendars and anything behind a click load lazily.

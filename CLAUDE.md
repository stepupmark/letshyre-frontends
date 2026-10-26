@AGENTS.md

# CLAUDE.md

Working notes for this repository. Read this before changing anything. Rules that only apply inside
one app or package live in a `CLAUDE.md` next to that code: apps/app, apps/marketing, apps/admin,
packages/ui. The reasons behind most rules are in the ADRs (docs/adr/README.md).

## What this is

A pnpm + Turborepo monorepo for letshyre.ai, a hiring platform for employers and candidates.

- `apps/marketing` — the public site. Prerendered in 19 locales, no API access.
- `apps/app` — sign-in, registration and the employer and candidate dashboards. Client-only SPA.
- `apps/admin` — the internal admin panel. English only, never indexed.

Build what the task asks for. Don't invent features, screens or API fields to fill a page.

## Stack

React 19.2 · React Router 8.4 (`ssr: false`) · Vite 8 · TanStack Query 5 and Table · React Hook
Form + Zod 4 · Tailwind 4 (CSS-first) · shadcn/ui on Base UI · motion · i18next · Sonner · Vitest +
Testing Library · Playwright + axe · ESLint 10 + Prettier · pnpm 10 · Turborepo 2 · Node 24.

Versions shared by more than one workspace live in the `catalog:` in `pnpm-workspace.yaml`; reference
them as `"catalog:"` instead of repeating a version. React stays on `~19.2` because 19.3 puts
marketing over its JS budget. TypeScript is `~6.0.3`; don't upgrade it without checking that
`typescript-eslint` still supports it. Installs skip versions published in the last 24 hours.

## Layout

```
apps/marketing              public site, file-based routes
apps/app                    employer and candidate dashboards, explicit routes.ts
apps/admin                  admin panel
packages/ui                 shadcn components and theme (CLI-owned, never edited)
packages/blocks             shared app pieces: logo, theme provider, error screen, assistant, consent
packages/api                fetch client, uploads, error types, table params
packages/auth               session keys, refresh, role guards, safeNext
packages/i18n               catalog loader, readiness checks, locale cookie, typed keys
packages/analytics          consent-aware tracking
packages/eslint-config      base, react and react-router-app presets plus local rules
packages/typescript-config  shared tsconfigs
tooling/                    ui-drift, CSP hashing, i18n apply, baseline capture
docs/                       ADRs, design standard, baseline, security, new-app guide
```

A package exists because more than one app needs it or because it is a real boundary. Don't create
one for a single consumer, and don't add a `utils` or `types` grab-bag. Packages export TypeScript
source; the apps' Vite builds compile them. A new app follows docs/new-app.md.

## Boundaries

Inside an app, imports go `routes/layouts → features → components/hooks/lib`. ESLint enforces it.

- Routes and layouts import a feature only through its `index.ts`.
- Features never import each other. Shared pieces go in `app/components`, `app/hooks` or `app/lib`.
- Inside a feature, layers import downwards only:
  components → hooks → queries/mutations → services → schemas/lib/types (ADR 0016).
- Reach across folders with the `@/` alias, not `../../`.
- Imports come in three groups, a blank line apart: packages, `@/` aliases, relative paths
  (`import-x/order`, autofixed).
- Packages never read app config or create their own client; apps pass them in.

## Data

- HTTP calls live in a feature's `services/`, through the app's `@/lib/api`. Never fetch from a
  component.
- Every response is parsed with Zod at the edge. Form schemas sit next to them in `schemas/`.
- Query keys and `queryOptions` live in `queries/`; one `useMutation` hook per action in `mutations/`.
  No inline keys, and invalidate only what the mutation changed.
- Don't copy server data into context or state. Don't build a fetch layer from `useEffect` +
  `useState`.
- Every async surface handles loading, empty, error and retry on purpose.

## Styling

Tailwind 4, CSS-first. Tokens come from `@workspace/ui/globals.css`; each app's `app/styles/app.css`
adds only its own.

- Semantic tokens only (`bg-muted`, `text-muted-foreground`, `text-success`). Palette classes and
  hex values are blocked by lint.
- Logical properties only (`ms-4`, `pe-2`, `text-start`, `inset-s-0`) so Arabic and Urdu mirror.
  Directional icons flip with `rtl:-scale-x-100`.
- Classes stay inline on the element. Never collect them into a variable or object;
  `local/no-class-constants` fails it.
- No arbitrary values where a scale step or token exists.
- Borders, not shadows, and one card level. No one-sided accent borders (`border-s-4` callouts,
  coloured top bars); use a full border and an icon.
- Keep the default line heights. Use `tabular-nums` on numbers that change or sit in columns, and
  `text-balance` / `text-pretty` on headings and body copy.
- Build UI from `@workspace/ui` components before writing a styled `div`. Icons are lucide;
  icon-only controls need an `aria-label`.

Design work should look deliberate and specific to the product: real hierarchy, real copy, drawn
illustrations where they explain something. No gradient blobs, decorative noise or template layouts.

## i18n

- No literal strings in JSX; `i18next/no-literal-string` enforces it (off in admin only).
- English in `app/locales/en/` is the source. Keys are typed.
- New or changed copy goes into all 19 locales in the same change, through `pnpm i18n:apply` or
  `pnpm i18n:apply:app`, which validate placeholders and plurals.
- A locale ships whole and reviewed, or falls back to English (ADR 0007).

## Motion

Motion explains a change; it doesn't decorate (ADR 0008).

- Use `m` from `motion/react-m` inside `LazyMotion`. Lint blocks `framer-motion` and `motion`.
- Durations come from `@/lib/motion` (120, 200, 320 ms). Nothing in a work flow runs over 400 ms.
- Animate `transform` and `opacity` only. Respect reduced motion; CSS animations need
  `motion-reduce:` variants.

## Security and performance

- CSP is hash-based (ADR 0012). Don't add inline scripts or styles that need a new hash.
- Each app's `scripts/postbuild.ts` checks the CSP and an initial JS budget (gzip): marketing
  280 kB (plus 60 kB per HTML page), app 180 kB, admin 175 kB. Lazy-load anything a first screen
  doesn't need.
- Tokens stay in `localStorage` under the legacy keys (ADR 0005, docs/security/token-storage.md).
- User-supplied links go through `safeUrl` from `@workspace/api`; redirect targets through `safeNext`.

## Components and functions

Keep modules small and split on responsibility. Prefer components under ~300 lines. Compose instead
of adding props; use variants for real visual variation. A custom hook must hold real behaviour, not
wrap one React API. Before `useEffect`, check you are syncing with something outside React. Don't
add `useMemo`, `useCallback` or `memo` without a measured reason.

## Comments

The default is no comment. Add one only when the reason can't be read from the code: a non-obvious
constraint, where a number comes from, a workaround and what it dodges. One short, plain sentence.

No comments that restate the code, narrate steps, decorate sections or hedge. No JSDoc on obvious
functions. When you touch a file, delete existing comments that fail this bar.

## Environment

`VITE_*` variables are inlined at build time and are not secrets. Each app reads them through
`app/lib/env.ts`, validated by `env.schema.ts`, and fails fast. A new variable means updating the
schema, the app's `.env.example` and the `env` block in `.github/workflows/ci.yml`. Turbo already
hashes every `VITE_*` variable.

## Testing

Write the tests that guard what matters: money, credits, session, permissions, data loss, and logic
that is easy to get wrong (dates, parsing, scoring). No tests to raise a count, no snapshots, no
duplicates of what another test already proves. Delete redundant tests when you find them.

- Vitest + Testing Library, next to the code as `*.test.ts(x)`. Test behaviour, query by role.
- Packages mock HTTP with MSW. App e2e mocks every call with Playwright routes and the JSON in
  `e2e/api/`; an unmocked call fails the test.
- Playwright runs against production builds with axe, and fails on CSP violations. Critical journeys
  only.

Run only the tests for what you changed, never the whole suite:

```bash
pnpm --filter app exec vitest run app/lib/date.test.ts
pnpm --filter app build
pnpm --filter app exec playwright test e2e/interview-guide.spec.ts --project=chromium
```

## Commands

Run from the root so Turbo handles ordering and caching.

| Command                            | Does                                                       |
| ---------------------------------- | ---------------------------------------------------------- |
| `pnpm --filter <app> dev`          | One app's dev server                                       |
| `pnpm lint` / `typecheck` / `test` | Every workspace                                            |
| `pnpm build`                       | Every app, with CSP and JS budget checks                   |
| `pnpm test:e2e`                    | Playwright against the builds                              |
| `pnpm check`                       | lint + typecheck + test                                    |
| `pnpm verify`                      | Everything CI runs                                         |
| `pnpm format`                      | Prettier, which also sorts Tailwind classes                |
| `pnpm ui:drift`                    | Fails if a packages/ui component differs from the registry |
| `pnpm knip`                        | Unused files, exports and dependencies                     |

Don't claim a check passes without running it.

## Commits and CI

- Never commit or push unless asked.
- Conventional Commits with a lowercase subject, a scope from `commitlint.config.js` (`app`,
  `marketing`, `admin`, `ui`, `i18n`, …) and body lines of 100 characters or fewer.
- No mention of AI tools in commits or PRs, and no `Co-Authored-By` trailers for them.
- lefthook runs Prettier on staged files before a commit, commitlint on the message, and
  `lint typecheck --affected` before a push.
- CI (.github/workflows/ci.yml) runs lint, typecheck, build, test, `ui:drift`, `knip`, Playwright
  and Lighthouse. `knip` is a gate: fix the finding, don't silence it.
- Record a significant decision as an ADR in `docs/adr/` and add it to the index.

## Anti-patterns

- editing anything in `packages/ui/src` by hand
- literal strings in JSX, or copy added to English only
- palette colours, physical classes (`ml-*`, `left-*`, `text-left`), one-sided accent borders
- Tailwind classes collected into a variable
- importing another feature, or a feature's internals instead of its `index.ts`
- an HTTP call in a component, or a response used without Zod
- inline query keys, or invalidating everything after a mutation
- a dependency version in `package.json` that is already in the catalog
- a new package with one consumer
- motion from `framer-motion` or the non-lazy `motion` component
- tests written for coverage numbers, or running the whole suite to check one change
- comments that restate the code or read as generated

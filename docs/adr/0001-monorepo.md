# 0001 · pnpm + Turborepo monorepo

Accepted 2026-10-03.

## Context

Legacy was one React Router app holding the marketing site and both dashboards. The rewrite splits
them, and a future admin app will need the same UI, API client, auth and translations.

## Decision

pnpm workspaces with Turborepo (shadcn's own monorepo template), Node 24, TypeScript `strict`.
Apps live in `apps/` (`marketing`, `app`); shared code in `packages/` under the `@workspace/*` scope:
`ui` (shadcn), `blocks` (composed pieces both apps use), `i18n`, `api`, `auth`, `analytics`, and the
lint and TypeScript configs. Single-version dependencies come from the pnpm catalog.

## Consequences

- Turbo caches lint, typecheck, test and build, and CI can run `--affected`.
- Packages are the only way code is shared; an app never imports from another app.
- A new app starts from the existing packages (see [new-app.md](../new-app.md)).

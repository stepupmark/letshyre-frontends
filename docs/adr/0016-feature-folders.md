# 0016 · Features are split into layer folders

Accepted 2026-10-10.

## Context

Each app feature kept one flat folder, with an `api.ts` that mixed HTTP calls, Zod schemas,
`queryOptions`, query keys, types and small helpers. `auth` had grown to 33 files. The admin app
([0015](./0015-admin-app.md)) already split its features by layer.

## Decision

Every feature in `apps/app/app/features/<feature>/` uses the same folders as the admin app, and only
the ones it needs:

| Folder       | Holds                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| `components` | React components; large features group them (`auth/components/register`) |
| `hooks`      | React hooks that don't fetch (`use-flow`, `use-job-form`)                |
| `queries`    | `<feature>.queries.ts`: query keys and `queryOptions` factories          |
| `mutations`  | `use-<action>.ts`: one `useMutation` hook per action                     |
| `services`   | `<feature>.service.ts`: HTTP calls, parsed at the edge, no React         |
| `schemas`    | `<feature>.schema.ts`: Zod for responses and forms, with their types     |
| `lib`        | Pure helpers: formatting, masks, scoring, form value mapping             |
| `types.ts`   | Types that aren't inferred from a schema                                 |
| `index.ts`   | The public surface; routes and layouts import only this                  |

Tests sit beside the file they test. Imports inside a feature only go downwards: components → hooks
→ queries and mutations → services → schemas, lib and types. `apps/app/eslint.config.js` enforces
it, on top of the existing rule that features never import each other.

## Consequences

- Finding the request behind a screen means opening `services/`, never reading a component.
- Small features have more files than before; a folder only exists when it has something in it.
- Query keys did not change in the move, so caching and invalidation behave as before.

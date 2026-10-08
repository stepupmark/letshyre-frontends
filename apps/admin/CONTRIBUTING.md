# Contributing

## Workflow

- Branch from `main`, keep one topic per branch.
- Commits follow Conventional Commits: `feat(kyc): ...`, `fix(auth): ...`, `chore: ...`. Write the subject as what the change does for the app.
- Git hooks (lefthook) format and lint staged files on commit, and run `pnpm check` before push. Don't skip them; there is no CI behind them.
- Before opening a PR, run `pnpm build && pnpm size` if you added a dependency or a large component.

## Adding a page

1. Put the code in `app/features/<name>/` (see the structure in the README). Export only what routes need from `index.ts`.
2. Add `app/routes/dashboard.<name>.tsx` with:
   - a `clientLoader` that calls `void queryClient.prefetchQuery(...)` and returns `null`
   - `meta` with the page title (`<Page> · LetsHyre Admin`)
   - `handle = { breadcrumb: "..." }`, plus `parent` for detail pages
   - the shared `RouteErrorBoundary`
3. Add a sidebar entry in `app/config/navigation.ts` if it needs one.

## Conventions

**Data**

- Services parse every response with zod and take a `signal`. They don't catch errors; `ApiError` carries the server's message and status.
- Query keys come from the feature's key factory. Never write an inline string key.
- Mutations set `meta.successMessage` and `meta.invalidates`. Destructive or hard-to-undo actions go through `ConfirmDialog`.
- List filters, search and paging live in the URL via nuqs. Debounce search input by 300 ms.

**UI**

- Use shadcn components from `~/components/ui`. Add new ones with `pnpm dlx shadcn add <name>` rather than hand-writing them.
- Every data view handles loading (skeletons), empty and error (with retry) states.
- Use design tokens (`bg-muted`, `text-muted-foreground`, ...), not raw colours, so dark mode works.
- Check new pages at 375 px wide and in dark mode.

**Security**

- Render user-supplied links with `<ExternalLink>` or `safeExternalUrl()`.
- Mask personal identifiers with `<SensitiveValue>`.
- Only `lib/auth/token-store.ts` touches tokens.
- No new inline scripts; the CSP only allows the hashed ones in `index.html`.

**Code**

- No `any` and no `console` in app code.
- Comments explain a non-obvious why, in a line or two. Don't narrate what the code does.
- Remove code that is no longer used; `pnpm knip` will flag it.

## Decisions

Architecture decisions are recorded in [docs/adr](docs/adr). Add a new ADR when you change something another developer would otherwise have to rediscover.

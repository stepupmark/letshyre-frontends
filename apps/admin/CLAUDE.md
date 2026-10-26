# apps/admin

The internal admin panel: candidates, employers, KYC, jobs, payments, credits, coupons and platform
settings. Client-only SPA, English only, never indexed (ADR 0015). The root CLAUDE.md applies here
too; README.md has the page walkthrough and hosting needs.

## Differences from the other apps

- English only: copy is written inline and `i18next/no-literal-string` is off. Don't add locales.
- Routes are flat files; the file name is the URL. A list route re-exports `shouldRevalidate` from
  `@/lib/search-params` so typing in a filter doesn't rerun its loader.
- Filters live in the URL through each feature's `search-params.ts`.
- The shell gets the account menu and palette searches as props from `routes/dashboard.tsx`.
  Sidebar entries go in `app/lib/navigation.ts`.
- One module-level `queryClient` in `lib/query/query-client.ts`, not one per render as in the app.
  Loaders prefetch into it and `endSession()` clears it, and both run outside React.
- Toasts and invalidation come from mutation `meta` (`successMessage`, `errorMessage`,
  `invalidates`) through the client's `MutationCache`, so a mutation hook stays a few lines.
  `meta.invalidates` lists only the keys that mutation changed.

These differences are deliberate. Everything else, including import order, follows the app.

## Rules

- Mutations set `meta.successMessage` and `meta.invalidates`; destructive actions go through
  `ConfirmDialog`.
- Tables use `DataTable` with columns typed as `DataTableColumn<T>`.
- User links go through `<ExternalLink>` / `safeUrl()` from `@workspace/api`; personal identifiers through
  `<SensitiveValue>`.
- No new inline scripts: the CSP only allows the hashed ones in `index.html`.
- E2E covers access, session, money and the CSP smoke. Every API call is mocked.

## Budget

`scripts/postbuild.ts` fails the build over 175 kB of initial JS (gzip) and adds `noindex`.

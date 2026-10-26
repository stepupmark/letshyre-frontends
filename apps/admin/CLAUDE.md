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

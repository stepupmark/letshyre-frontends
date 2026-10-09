# admin

The internal LetsHyre admin panel: candidates, employers, KYC, jobs, payments, credits, coupons and
platform settings. A client-only SPA (React Router 8, `ssr: false`) on the shared `@workspace/*`
packages, English only and never indexed. Background in [ADR 0015](../../docs/adr/0015-admin-app.md).

```bash
cp .env.example .env
pnpm dev            # http://localhost:5176
pnpm build          # build/client, then postbuild checks
pnpm preview        # serves the build with its CSP as a header
pnpm test:e2e       # playwright + axe against the build
```

| Variable            | Notes                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | API root, `https://api.letshyre.ai/`. Must be https in production builds. |

## How a page works

```
app/features/<name>/
  components/        the page and its parts
  services/          API calls through `@/lib/api`, every response parsed with Zod
  queries/ mutations/ schemas/
  search-params.ts   reads the page's filters from the URL
  index.ts           the only import other code may use
app/routes/dashboard.<name>.tsx   clientLoader prefetch, meta, handle.breadcrumb
```

- Routes are flat files; the file name is the URL. A list route re-exports `shouldRevalidate` from
  `@/lib/search-params` so typing in a filter doesn't rerun its loader.
- Features never import each other. The shell (`features/shell`) gets the account menu and the
  palette searches as props from `routes/dashboard.tsx`; shared pieces go in `app/components`,
  `app/hooks` or `app/lib`. ESLint enforces this.
- Mutations set `meta.successMessage` and `meta.invalidates`; destructive actions go through
  `ConfirmDialog`.
- Tables use `DataTable` with columns typed as `DataTableColumn<T>`.
- Add sidebar entries in `app/lib/navigation.ts`.

## Rules

- UI comes from `@workspace/ui/components/*`, never edited. Use design tokens so dark mode works.
- User links go through `<ExternalLink>` / `safeExternalUrl()`; personal identifiers through
  `<SensitiveValue>`.
- No new inline scripts: the CSP only allows the hashed ones in `index.html`.
- E2E covers access, session, money and the CSP smoke. Every API call is mocked; an unknown call
  fails the test.

## Hosting

Not chosen yet, so the build is host-neutral. Wherever it goes, it needs:

- `index.html` for every unknown path; `/assets/*` cached for a year, `index.html` never cached.
- The policy from `build/csp.map` as `Content-Security-Policy-Report-Only`, enforced after a clean
  week ([ADR 0012](../../docs/adr/0012-csp-hashes.md)), plus `frame-ancestors 'none'`.
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Robots-Tag: noindex`.
- The admin origin allowed in the API's CORS settings.

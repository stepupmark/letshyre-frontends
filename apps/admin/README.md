# LetsHyre Admin

The internal admin panel for LetsHyre. Admins use it to review candidates, employers, KYC and job posts, manage payments, credits and coupons, and configure the platform.

It is a client-only single-page app (React Router SPA mode). All data comes from the LetsHyre API.

## Stack

- React 19, TypeScript 6, Vite 8
- React Router 8 in framework mode (`ssr: false`), file-based routes
- TanStack Query 5 for server state, nuqs for URL state
- Tailwind CSS 4 and shadcn/ui (Radix), lucide icons, sonner toasts
- react-hook-form and zod 4
- recharts, only on the dashboard and loaded lazily

## Getting started

Requires Node 22+ and pnpm 11 (`corepack enable` picks up the version from `package.json`).

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The dev server runs on http://localhost:5173.

### Environment

| Variable            | Required | Notes                                                                               |
| ------------------- | -------- | ----------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | yes      | API root, e.g. `https://api.letshyre.com/`. Must be `https` for production builds.  |
| `MEDIA_ORIGINS`     | no       | Build time only. Hosts allowed in the CSP `img-src`; defaults to any `https:` host. |

## Scripts

| Script         | What it does                                                           |
| -------------- | ---------------------------------------------------------------------- |
| `pnpm dev`     | Dev server with HMR                                                    |
| `pnpm build`   | Production build to `build/client`, plus `_headers` and `_redirects`   |
| `pnpm preview` | Serves the build with the production security headers                  |
| `pnpm size`    | Checks each route against the bundle budget (run after a build)        |
| `pnpm check`   | Typecheck, lint, format check and knip, the same gate as the git hooks |
| `pnpm format`  | Formats everything with Prettier                                       |

## Project structure

```text
app/
├── root.tsx              document shell, providers, root error boundary
├── routes/               one file per URL (flat routes); thin, they wire loaders to features
├── features/<name>/      everything for one area of the admin
│   ├── components/
│   ├── queries/          query key factory + queryOptions
│   ├── mutations/        useMutation hooks with toast and invalidation meta
│   ├── services/         API calls, validated with zod
│   ├── schemas/          zod schemas and inferred types
│   ├── search-params.ts  URL filters (nuqs parsers)
│   └── index.ts          the feature's public API
├── components/
│   ├── ui/               shadcn components, kept close to upstream
│   ├── layout/           sidebar, header, breadcrumbs
│   ├── feedback/         empty, error, confirm and coming-soon states
│   └── data-table/       TanStack Table wrapper with server pagination
├── lib/
│   ├── api/              axios client, ApiError, shared response schemas
│   ├── auth/             token store, single-flight refresh, cross-tab sign-out
│   └── query/            QueryClient with global toasts and invalidation
└── config/navigation.ts  sidebar items
scripts/                  build-time headers, preview server, bundle budget
docs/adr/                 architecture decisions
```

Routes import only from a feature's `index.ts`. Features don't import from each other, except through that index.

## How data flows

1. A route's `clientLoader` prefetches its queries and returns `null`, so the page renders straight away with skeletons.
2. Components read data with `useQuery(featureQueries.something(filters))`.
3. Services call the API through `http` (`lib/api/http-client.ts`) and parse every response with zod, so a changed backend shape fails loudly in one place.
4. Mutations declare `meta.successMessage` and `meta.invalidates`; the shared `QueryClient` shows the toast and refetches.
5. Filters, search and paging live in the URL, so every list view can be shared and survives a reload.

## Authentication

- The access and refresh tokens are kept in `localStorage`, behind `lib/auth/token-store.ts`. Moving the refresh token to an `HttpOnly` cookie needs backend work and is tracked separately.
- A 401 triggers one refresh, shared across tabs with the Web Locks API, because the backend rotates refresh tokens.
- Signing out, an expired session or 30 minutes of inactivity signs out every open tab.
- A token that gets a 403 from the admin profile endpoint is treated as a non-admin and signed out.

## Security

- `pnpm build` writes a strict Content-Security-Policy with a `sha256` hash for each inline script, plus HSTS, `nosniff`, `frame-ancestors 'none'`, `Referrer-Policy` and `Permissions-Policy`.
- The generated `_headers` and `_redirects` files work as-is on Netlify and Cloudflare Pages. On another host, copy the headers from `scripts/security-headers.mjs` and serve `index.html` for unknown paths.
- Hashed files under `/assets` are cached for a year; `index.html` is never cached.
- Links from user data go through `safeExternalUrl()` / `<ExternalLink>`, which only allow `http` and `https`.
- Personal data (Aadhaar, PAN, GST numbers, gateway secrets) is masked until an admin reveals it.
- The panel is marked `noindex` and `robots.txt` disallows crawling.

## Deployment

There is no CI pipeline. Build with the production API URL and upload `build/client` to a static host:

```bash
VITE_API_BASE_URL=https://api.letshyre.com/ pnpm build
```

Check the output with `pnpm preview` first; CSP violations show up in the browser console.

See [CONTRIBUTING.md](CONTRIBUTING.md) for conventions.

# marketing

letshyre.ai: static, prerendered pages in 19 locales. React Router 8 (`ssr: false`), Tailwind v4, shadcn via `@workspace/ui`.

```bash
cp .env.example .env
pnpm dev            # http://localhost:5173/en
pnpm build          # prerenders every ready /<lang>/<page>
pnpm preview        # serves build/client like production
pnpm test           # vitest
pnpm test:e2e       # playwright + axe against the build
```

## How a page works

- `app/lib/pages.ts` is the page manifest: path, namespaces and OG image per page.
- Copy lives in `app/locales/<lang>/<namespace>.json`. English is the source.
- A page is published in a locale only when its catalogs are complete there (readiness, see `@workspace/i18n`). Prerender paths, hreflang and the language switcher all come from that.
- Loaders run at build time only. The layout loader returns `common` + `seo`, each page loader returns its own namespace. The copy ends up in the HTML, and client navigation fetches the matching `.data` file.
- `meta` is `pageMeta("<id>")`. It reads `<ns>:meta.title`, `meta.description` and `meta.crumb`.

## Adding to a page

```
app/features/<page>/
  components/        one component per file, kebab-case
  <page>-page.tsx    composes the sections
  index.ts           the only import other code may use
  queries/ mutations/ schemas/ lib/ hooks/   only when the page needs them
app/routes/_site.$lang.<slug>.tsx  loader, meta, default export from the feature index
```

Routes are file-based (`flatRoutes()`, [ADR 0013](../../docs/adr/0013-marketing-file-routes.md)); the file name is the URL. A new page also needs its entry in `app/lib/pages.ts` and its namespace in `app/locales/en/`. Once its keys are complete in a locale, readiness adds it to the prerender list and the sitemap.

Routes and layouts import features through `index.ts` only. Features never import other features. Shared pieces go in `app/components`, `app/hooks` or `app/lib`. ESLint enforces all of this.

## Rules

- shadcn components come from `@workspace/ui/components/*` and are never edited. Compose them.
- Tailwind classes are written inline. No class strings in variables or objects.
- Theme tokens only (`bg-muted`, `text-muted-foreground`, `border`), no palette colors or hex values.
- Logical properties for the inline axis (`ms-4`, `ps-2`, `text-start`, `end-0`) so Arabic and Urdu mirror.
- No literal text in JSX. Every string is a catalog key, typed through `app/types/i18next.d.ts`.
- Links into the dashboard come from `app/lib/app-links.ts`.

## Design

Default shadcn look: neutral colors, Outfit, plenty of white space, no gradients or decorative blobs.

- Width: `Container` (`max-w-6xl`). Bands: `Section` (`py-16 sm:py-24`) with `SectionHeader`.
- Inner pages open with `PageHeader` (the only `h1`). Home has its own hero.
- Type scale: h1 `text-4xl sm:text-5xl` (home hero up to `lg:text-6xl`), h2 `text-3xl sm:text-4xl`, h3 `text-lg font-semibold`, body `text-base`, lead `text-lg text-muted-foreground`.
- Cards and lists use `Card`, `Item`, `Badge`, `Separator`. Borders over shadows.
- Mobile first, checked at 360, 768, 1280 and 1920 px, in English and Arabic.

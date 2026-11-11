# apps/marketing

letshyre.ai: static pages prerendered in 19 locales. React Router 8 (`ssr: false`), no API access at
runtime. The root CLAUDE.md applies here too; README.md has the page walkthrough.

## Pages

- Routes are file-based (`flatRoutes()`, ADR 0013). Pages are `routes/_site.$lang.<slug>.tsx`, home
  is `_site.$lang._index.tsx`. The file name is the URL.
- A new page also needs its entry in `app/lib/pages.ts` (path, namespaces, OG image) and its
  namespace in `app/locales/en/`.
- Loaders run at build time only. `meta` is `pageMeta("<id>")`, read from `<ns>:meta.*`.
- Links into the dashboard come from `app/lib/app-links.ts`.

## Locales

A page is published in a locale only when its namespaces are complete there. Prerender paths, the
sitemap, hreflang and the language switcher all come from that readiness, not from the route files.
Check new layouts in English and Arabic.

## URLs and SEO

The live site's URLs are a contract: docs/baseline/url-contract.md lists them and the e2e tests hold
the build to it. Don't rename or drop a URL without a redirect and an update to the contract.
docs/baseline/ holds the SEO baseline the build is compared against, and
docs/launch-checklist.md the steps before going live.

Postbuild fails any link to a path that wasn't prerendered. Link a page that isn't in every locale,
or is being replaced, with `usePagePath()` from `@/hooks/use-page-path`, or show the link only where
`usePublished()` says the page exists. The structured data, `llms.txt` and their checks are in
ADR 0020.

## Design

Default shadcn look: neutral colours, Schibsted Grotesk (set in `app.css`), generous white space, no
gradients or decorative blobs.

- Width through `Container` (`max-w-6xl`); bands through `Section` with `SectionHeader`.
- Inner pages open with `PageHeader`, the only `h1`. Home has its own hero.
- Mobile first, checked at 360, 768, 1280 and 1920 px.

## Budget

`scripts/postbuild.ts` fails the build over 280 kB of initial JS or 60 kB of HTML per page (gzip).
CI also runs Lighthouse (`pnpm --filter marketing lighthouse`).

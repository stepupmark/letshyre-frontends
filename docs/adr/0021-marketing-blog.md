# 0021 · The blog: MDX files, prerendered in marketing

Accepted 2026-11-08. Applies to `apps/marketing` only.

## Context

We want the site to rank for hiring and career questions. There is no backend for content, each
post has its own structure and images, and the marketing site is already prerendered on a static
host with hash-based CSP ([ADR 0002](./0002-react-router-rendering.md),
[ADR 0012](./0012-csp-hashes.md)).

## Decision

- **Prerendered, not SSR.** Posts change only when we publish, so a post is a static page like any
  other. SSR would need a server and nonce-based CSP for no reader-facing gain.
- **In `apps/marketing`, under `/<lang>/blog`.** A subfolder keeps the domain's authority, and the
  site chrome, consent, sitemap, `llms.txt` and postbuild checks already exist there. No new app or
  package.
- **MDX files in git.** A post is `content/blog/<slug>/<lang>.mdx` with YAML frontmatter, next to its
  images. `app/lib/blog/post.ts` validates the frontmatter with Zod and fails the build on a bad
  post. The slug is the URL and never changes once published.
- **A closed component set.** Posts may use Markdown, the components in
  `features/blog/components/mdx`, and imports of local images. `app/lib/blog/remark-guard.ts` fails
  the build on raw HTML, other imports, unknown components or images without alt text.
- **A post exists only in the locales it is written in.** The blog index ships in a locale only
  when its copy is complete there and at least one post is published in it, the same readiness
  rule as [ADR 0007](./0007-i18n-readiness.md). There are no machine-translated posts.
- **One reader per runtime.** Node (prerender list, postbuild) reads posts with `fs`; route loaders
  read them through `import.meta.glob`. Both go through the same parser, so a CMS can later replace
  the source behind them without touching routes.
- **Each post is its own chunk.** The post route loads the post's module lazily; the loader awaits
  it at build time so the prerendered HTML has the full post, and the client hydrates it when its
  chunk arrives. The JS budget doesn't grow with the number of posts. The post body has no Suspense
  boundary: React streams a large boundary out of place behind an inline script, which would hide
  the text from readers and crawlers without JavaScript. e2e checks the text is there without JS.
- **Drafts and future posts stay off production.** `draft: true` posts, and posts whose
  `publishedAt` (a UTC date) is after the build date, never reach production. Dev and staging builds show them with a badge, so they can be reviewed in place.
- **Headings are read twice, from the same rules.** rehype-slug gives the rendered h2s their ids;
  the parser reads the same ids from the source for the table of contents, so it is in the loader
  data at build time. A test compiles real MDX to keep the two in step.
- **Every post has an `audience` and a `topic`.** They pick the closing call to action and the
  related posts. There are no tag pages until there are enough posts to fill them.
- **Code is highlighted at build time** with Shiki in both themes, so no highlighter ships.
- **Feeds are RSS 2.0, one per locale** at `/<lang>/blog/feed.xml`, written by postbuild.
- **A post's share image is `<slug>/og.jpg`**, drawn from its page header by
  `pnpm --filter marketing blog:og` like the other pages' images. Without one, the default is used.
- **Authors are optional.** `app/lib/blog/authors.ts` lists the people who sign posts; an unsigned
  post is the team's and its structured data names the organization.
- **Photos become responsive at build time.** A PNG, JPEG or WebP imported by a post is turned into
  AVIF, WebP and JPEG at three widths by `vite-imagetools`; SVG stays as it is.
- **Video is a facade.** `<VideoEmbed>` shows a local poster that links to YouTube and swaps in the
  privacy-enhanced player on click. Only pages with one get `frame-src` for it.
- **IndexNow** is pinged after a production deploy with the pages whose `lastmod` changed
  (`scripts/indexnow.ts`). Google doesn't use it; the sitemap still serves Google.

## Not yet

- Tag and author pages, and search across posts.
- A git-based CMS (Keystatic or TinaCMS) once someone outside engineering writes posts.
- React Server Components. React Router 8.4 has them behind `unstable_` flags. Keep MDX components
  free of hooks and browser APIs so posts can move to server components once that ships stable.

## Consequences

- A new post is a folder under `content/blog/`. There is no route or registry to edit.
- Post URLs join the URL contract; renaming one needs a `MOVED_PATHS` entry.
- Scheduled posts go live with the first build on or after their date, so the deploy pipeline must
  rebuild at least daily (docs/launch-checklist.md).
- Blog chrome copy follows the usual rule: all 19 locales in the same change.

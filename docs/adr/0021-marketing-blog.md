# 0021 · The blog: MDX files, prerendered in marketing

Accepted 2026-11-08. Applies to `apps/marketing` only.

## Context

We want a blog to be found for hiring and career questions. There is no backend for content, each
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
  chunk arrives. The JS budget doesn't grow with the number of posts.
- `draft: true` posts render in dev and are never built.

## Not yet

- Feeds, tag pages, author pages, related posts and per-post OG images. Posts are attributed to the
  organization until there are named authors.
- Responsive raster images (`vite-imagetools` with AVIF/WebP). Posts use SVG until the first photo.
- A git-based CMS (Keystatic or TinaCMS) once someone outside engineering writes posts.
- React Server Components. React Router 8.4 has them behind `unstable_` flags. Keep MDX components
  free of hooks and browser APIs so posts can move to server components once that ships stable.

## Consequences

- A new post is a folder under `content/blog/`. There is no route or registry to edit.
- Post URLs join the URL contract; renaming one needs a `MOVED_PATHS` entry.
- Scheduled posts need a rebuild on the publish date; nothing publishes itself.
- Blog chrome copy follows the usual rule: all 19 locales in the same change.

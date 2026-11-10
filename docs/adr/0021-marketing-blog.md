# 0021 · The blog: MDX files, prerendered in marketing

Accepted 2026-11-08. Applies to `apps/marketing` only.

## Context

We want the site to rank for hiring and career questions, and a place to post hiring trends and
LetsHyre news. There is no backend for content, each post has its own structure and images, and
the marketing site is already prerendered on a static host with hash-based CSP ([ADR 0002](./0002-react-router-rendering.md),
[ADR 0012](./0012-csp-hashes.md)).

## Decision

- **Prerendered, not SSR.** Posts change only when we publish, so a post is a static page like any
  other. SSR would need a server and nonce-based CSP for no reader-facing gain.
- **In `apps/marketing`, under `/<lang>/blogs`.** A subfolder keeps the domain's authority, and the
  site chrome, consent, sitemap, `llms.txt` and postbuild checks already exist there. No new app or
  package.
- **MDX files in git.** A post is `content/blog/<slug>/<lang>.mdx` with YAML frontmatter, next to its
  images. `app/lib/blog/post.ts` validates the frontmatter with Zod and fails the build on a bad
  post. The slug is the URL and never changes once published.
- **A closed component set.** Posts may use Markdown, the components in
  `features/blog/components/mdx`, and imports of local images. `app/lib/blog/remark-guard.ts` fails
  the build on raw HTML, other imports, unknown components or images without alt text. A
  comment-only expression is allowed, for notes to the reviewer.
- **Writing is checked before the build.** `blog:new` scaffolds a valid draft, and `blog:check`
  lints posts in seconds: the build's own rules plus heading order, alt text, image sizes, internal
  links, description length and filler words. Errors block review; warnings guide it. The Blog
  workflow runs it on every PR that touches `content/blog`, with dead external links as warnings.
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
  related posts. Trends and news posts are for `everyone` and close with a way in for each side.
- **A topic has a page once it has a post.** `/<lang>/blogs/topics/<topic>` is prerendered for each
  topic with a post in that locale, so topic lists are real, indexable URLs rather than a client-side
  filter. The topic bar shows only once posts cover two topics; with one, it repeats the index.
- **URLs stay flat and stable.** A post is `/<lang>/blogs/<slug>` with no topic in it, so moving a
  post to another topic never breaks its link. Topic segments stay English in every locale, as
  slugs do. `topics`, `page`, `authors` and `feed` are reserved and fail a post's build, because
  the blog's own pages live at those segments now or will later. `/<lang>/blogs/topics` 301s to the
  index. A topic URL with no page in its locale, and no English page to fall back to, 302s to the
  nearest blog index (`build/redirects-temporary.map`), so a topic that loses its last post, or
  hasn't had one yet, never 404s; it's a 302 because a new post brings the page back.
- **Covers are drawn, not stock.** `<slug>/cover.svg`, with `cover-dark.svg` for the dark theme, is
  a diagram of the post's idea in brand colours. Without one, the card shows the topic's icon.
- **Code is highlighted at build time** with Shiki in both themes, so no highlighter ships.
- **Feeds are RSS 2.0, one per locale** at `/<lang>/blogs/feed.xml`, written by postbuild.
- **A post's share image is `<slug>/og.jpg`**, drawn from its page header by
  `pnpm --filter marketing blog:og` like the other pages' images. Without one, the default is used.
- **The index pages, ten posts then nine a page.** `/<lang>/blogs/page/<n>` is prerendered, never
  infinite scroll, so every post stays a crawlable link. Each page also carries every post's title
  and description, so search on it runs in the browser across the whole blog.
- **Sources are listed, not just linked.** The parser collects every external link and `<Stat>`
  source in reading order; the post numbers them in the text and lists them at the end.
- **Each blog route loads only its own page.** The Vite config marks the feature's `index.ts` as
  free of side effects, so a post doesn't ship the index's search and pagination, or the reverse.
- **Authors are optional.** `app/lib/blog/authors.ts` lists the people who sign posts; an unsigned
  post is the team's and its structured data names the organization.
- **Photos become responsive at build time.** A PNG, JPEG or WebP imported by a post is turned into
  AVIF, WebP and JPEG at three widths by `vite-imagetools`; SVG stays as it is.
- **Video is a facade.** `<VideoEmbed>` shows a local poster that links to YouTube and swaps in the
  privacy-enhanced player on click. Only pages with one get `frame-src` for it.
- **IndexNow** is pinged after a production deploy with the pages whose `lastmod` changed
  (`scripts/indexnow.ts`). Google doesn't use it; the sitemap still serves Google.

## Not yet

- Author pages, and search beyond titles and descriptions.
- A git-based CMS once someone outside engineering writes posts. Keystatic's router adapter
  supports Remix 1 and 2 only, so it would be its own small app with a server for GitHub sign-in;
  that needs hosting decided first.
- React Server Components. React Router 8.4 has them behind `unstable_` flags. Keep MDX components
  free of hooks and browser APIs so posts can move to server components once that ships stable.

## Consequences

- A new post is a folder under `content/blog/`. There is no route or registry to edit.
- Post URLs join the URL contract; renaming one needs a `MOVED_PATHS` entry.
- Scheduled posts go live with the first build on or after their date, so the deploy pipeline must
  rebuild at least daily (docs/launch-checklist.md).
- Blog chrome copy follows the usual rule: all 19 locales in the same change.

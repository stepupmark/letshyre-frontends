# Writing a post

## Quick start

```bash
pnpm --filter marketing blog:new
```

```bash
pnpm --filter marketing dev
```

```bash
pnpm --filter marketing blog:check <slug>
```

1. `blog:new` asks for a title, reader and topic, and creates the post as a draft.
2. Write it with the dev server open at `/en/blogs/<slug>`; it reloads as you save.
3. `blog:check` reports what to fix in seconds, without a build.
4. Open a PR with the blog post template (`?template=blog-post.md`); CI checks the post and its
   links.
5. When it's ready, remove `draft: true` and set `publishedAt`.

How to write it well is in [docs/blog-style.md](../../../../docs/blog-style.md). Every component in
use is in the `style-reference` draft, shown on dev and staging only. In VS Code, type
`frontmatter`, `figure`, `stat` and the other component names in an `.mdx` file for a snippet.

A post is a folder: `content/blog/<slug>/<lang>.mdx`, with its images beside it. The slug is the
URL (`/en/blogs/<slug>`) and never changes once published. Why it works this way is in
[ADR 0021](../../../../docs/adr/0021-marketing-blog.md).

## Frontmatter

```yaml
---
title: How to run a structured interview, step by step
metaTitle: How to Run a Structured Interview # optional, for the browser tab and search
description: One or two sentences, shown in search results and on the index.
publishedAt: 2026-11-08 # UTC; the post goes live with the first build on or after it
updatedAt: 2026-12-01 # optional, after a real revision
audience: employers # employers | candidates | everyone: picks the closing call to action
topic: interviewing # interviewing | hiring | careers | trends | news
author: priya # optional, an id from app/lib/blog/authors.ts; unsigned posts are the team's
draft: true # optional; drafts show on dev and staging only
featured: true # optional; leads the blog index instead of the newest post
---
```

A bad field fails the build with the file name.

## Body

Markdown with GitHub tables, plus these components. Raw HTML, code expressions, unknown components
and imports other than local images fail the build. A note for the reviewer goes in a comment,
`{/* like this */}`, which never renders.

| Component                                                  | For                                                                                                              |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `<Figure src={img} alt="…" width={720} height={400} />`    | An image. `srcDark`, `caption` and `wide` are optional                                                           |
| `<Callout tone="tip">…</Callout>`                          | An aside. Tone is `note` (default), `tip` or `warning`                                                           |
| `<Steps><Step title="…">…</Step></Steps>`                  | A numbered procedure                                                                                             |
| `<Compare avoid="…" prefer="…" />`                         | A weak example beside a better one                                                                               |
| `<Stat value="…" label="…" source="https://…" cite="…" />` | A number, always with the study it comes from                                                                    |
| `<Feature audience="candidates" />`                        | A link to the LetsHyre page for that reader, where the text leads to it. It replaces the mid-post call to action |
| `<Quote by="…" role="…">…</Quote>`                         | A quote from a real person who agreed to it                                                                      |
| `<VideoEmbed id="…" title="…" poster={img} />`             | A YouTube video (11-character id); nothing loads until it's played                                               |

External links and `<Stat>` sources are numbered and listed under the post as its sources.

Code fences are highlighted at build time; give them a language (` ```ts `).

## Images

Import images from the post's folder: `import chart from "./chart.svg"`.

- Diagrams as SVG. Draw a second one for dark mode and pass it as `srcDark`.
- Photos as JPEG, PNG or WebP at least 1440 px wide; the build makes AVIF and WebP sizes.
- Alt text says what the image shows. `width` and `height` are the image's own size.

## Cover

`cover.svg` in the post's folder is the card image on the index, topic pages and related posts. Draw
the post's idea in brand colours at 640 × 400 with no words, so it reads in every locale, and add
`cover-dark.svg` for the dark theme. Without one, the card shows the topic's icon. Start from
`cover-template.svg`, which has the palette and the safe area.

## Share image

`og.jpg` in the post's folder is used when the post is shared. Once the post is published, draw it
from the post's header and commit it:

```bash
pnpm --filter marketing blog:og <slug>
```

It builds the site, draws the image and stops. Without a slug it draws every published post that
has none.

## Translations

A translation is another file in the same folder, `de.mdx`, with the same slug. It ships when the
blog's interface copy is complete in that locale. `pnpm --filter marketing blog:translations` lists
each post's locales, and the translations older than the English they follow.

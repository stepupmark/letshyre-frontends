# Writing a post

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
and imports other than local images fail the build.

| Component                                                  | For                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `<Figure src={img} alt="…" width={720} height={400} />`    | An image. `srcDark`, `caption` and `wide` are optional             |
| `<Callout tone="tip">…</Callout>`                          | An aside. Tone is `note` (default), `tip` or `warning`             |
| `<Steps><Step title="…">…</Step></Steps>`                  | A numbered procedure                                               |
| `<Compare avoid="…" prefer="…" />`                         | A weak example beside a better one                                 |
| `<Stat value="…" label="…" source="https://…" cite="…" />` | A number, always with the study it comes from                      |
| `<Quote by="…" role="…">…</Quote>`                         | A quote from a real person who agreed to it                        |
| `<VideoEmbed id="…" title="…" poster={img} />`             | A YouTube video (11-character id); nothing loads until it's played |

Code fences are highlighted at build time; give them a language (` ```ts `).

## Images

Import images from the post's folder: `import chart from "./chart.svg"`.

- Diagrams as SVG. Draw a second one for dark mode and pass it as `srcDark`.
- Photos as JPEG, PNG or WebP at least 1440 px wide; the build makes AVIF and WebP sizes.
- Alt text says what the image shows. `width` and `height` are the image's own size.

## Cover

`cover.svg` in the post's folder is the card image on the index, topic pages and related posts. Draw
the post's idea in brand colours at 640 × 400 with no words, so it reads in every locale, and add
`cover-dark.svg` for the dark theme. Without one, the card shows the topic's icon.

## Share image

`og.jpg` in the post's folder is used when the post is shared. To draw it from the post's header,
build, start the preview server and leave it running, then run `blog:og` in a second terminal:

```bash
pnpm --filter marketing build
```

```bash
pnpm --filter marketing preview
```

```bash
pnpm --filter marketing blog:og
```

Then build again so the post picks it up.

## Translations

A translation is another file in the same folder, `de.mdx`, with the same slug. It ships when the
blog's interface copy is complete in that locale.

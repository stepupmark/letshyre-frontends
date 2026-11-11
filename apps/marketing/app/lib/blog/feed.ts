import { type Locale, localePath } from "@workspace/i18n"

import { feedPath, postPath } from "./paths"
import type { Post } from "./post"

const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c] ?? c
  )

const rfc822 = (date: string) => new Date(`${date}T00:00:00Z`).toUTCString()

export function renderFeed(
  site: string,
  lang: Locale,
  { title, description }: { title: string; description: string },
  posts: readonly Post[]
): string {
  const url = (path: string) => escape(`${site}${localePath(lang, path)}`)
  const items = posts.map(
    (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${url(postPath(post.slug))}</link>
      <guid isPermaLink="true">${url(postPath(post.slug))}</guid>
      <description>${escape(post.description)}</description>
      <pubDate>${rfc822(post.publishedAt)}</pubDate>
    </item>`
  )
  const updated = posts
    .map((post) => post.updatedAt ?? post.publishedAt)
    .sort()
    .at(-1)

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(title)}</title>
    <link>${url("/blogs")}</link>
    <atom:link href="${url(feedPath)}" rel="self" type="application/rss+xml"/>
    <description>${escape(description)}</description>
    <language>${lang}</language>
${updated ? `    <lastBuildDate>${rfc822(updated)}</lastBuildDate>\n` : ""}${items.join("\n")}
  </channel>
</rss>
`
}

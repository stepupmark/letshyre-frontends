import { isLocale, type Locale } from "@workspace/i18n"
import { data } from "react-router"

import { featuredFirst, pageCount, topicCounts } from "./blog/post"
import { ogImageOf } from "./blog/posts.server"
import { relatedPosts, seriesOf } from "./blog/related"
import { summarize } from "./blog/search"
import {
  indexPageLocales,
  loadMessages,
  postLocales,
  postsIn,
  readyLocales,
  topicLocales,
} from "./messages.server"
import { LAYOUT_NAMESPACES, PAGES, type PageId } from "./pages"

const notFound = () => data(null, { status: 404 })

/** Runs at build time only. */
export function layoutData(lang: string | undefined) {
  if (!isLocale(lang)) throw notFound()
  const published = (Object.keys(PAGES) as PageId[]).filter((id) =>
    readyLocales(id).includes(lang)
  )
  return { lang, messages: loadMessages(lang, LAYOUT_NAMESPACES), published }
}

export function pageData(lang: string | undefined, id: PageId) {
  const locales = readyLocales(id)
  if (!isLocale(lang) || !locales.includes(lang)) throw notFound()
  return { messages: loadMessages(lang, PAGES[id].namespaces), locales }
}

/** Every post goes to every index page, so search covers them all; the page shows its own slice. */
export function blogData(lang: string | undefined, pageParam?: string) {
  const { messages, locales } = pageData(lang, "blog")
  const posts = featuredFirst(postsIn(lang as Locale))
  const pages = pageCount(posts.length)
  const page = pageParam === undefined ? 1 : Number(pageParam)
  if (!Number.isInteger(page) || page > pages || (pageParam && page < 2))
    throw notFound()
  return {
    messages,
    locales: page === 1 ? locales : indexPageLocales(page),
    posts: posts.map(summarize),
    page,
    pages,
    topics: topicCounts(posts),
  }
}

// a topic this thin gets the newest posts from the others under it, so its page isn't a dead end
const THIN_TOPIC = 4

export function topicData(lang: string | undefined, topic: string | undefined) {
  const { messages } = pageData(lang, "blog")
  const all = postsIn(lang as Locale)
  const posts = featuredFirst(all.filter((post) => post.topic === topic))
  const current = posts[0]?.topic
  if (!current) throw notFound()
  return {
    messages,
    locales: topicLocales(current),
    topic: current,
    posts,
    others:
      posts.length < THIN_TOPIC
        ? all.filter((post) => post.topic !== current).slice(0, 3)
        : [],
    topics: topicCounts(all),
  }
}

export function postData(lang: string | undefined, slug: string | undefined) {
  if (!isLocale(lang)) throw notFound()
  const posts = postsIn(lang)
  const post = posts.find((p) => p.slug === slug)
  if (!post) throw notFound()
  const inTopic = posts.filter((p) => p.topic === post.topic)
  const at = inTopic.indexOf(post)
  const newer = inTopic[at - 1]
  const older = inTopic[at + 1]
  const series = seriesOf(post, posts)
  const shown = new Set([newer, older].map((p) => p?.slug))
  for (const part of series) shown.add(part.slug)
  return {
    messages: loadMessages(lang, PAGES.blog.namespaces),
    locales: postLocales(post.slug),
    post,
    newer,
    older,
    series,
    related: relatedPosts(
      post,
      posts.filter((p) => !shown.has(p.slug))
    ),
    ogImage: ogImageOf(post.slug),
  }
}

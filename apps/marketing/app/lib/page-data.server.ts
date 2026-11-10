import { isLocale, type Locale } from "@workspace/i18n"
import { data } from "react-router"

import {
  featuredFirst,
  pageCount,
  postsOnPage,
  LENGTHS,
  lengthOf,
  type Tag,
  topicCounts,
} from "./blog/list"
import { ogImageOf } from "./blog/posts.server"
import { relatedPosts, seriesOf } from "./blog/related"
import { summarize } from "./blog/search"
import {
  glossaryLocales,
  guideFor,
  indexPageLocales,
  loadMessages,
  postLocales,
  postsIn,
  readyLocales,
  tagLocales,
  termLocales,
  termsIn,
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
    posts: postsOnPage(posts, page).map(summarize),
    page,
    pages,
    topics: topicCounts(posts),
    glossary: termsIn(lang as Locale).length > 0,
    lengths: LENGTHS.filter((length) =>
      posts.some((post) => lengthOf(post.minutes) === length)
    ),
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
  const guide = guideFor(lang as Locale, current)
  const live = new Map(all.map((post) => [post.slug, post]))
  return {
    messages,
    locales: topicLocales(current),
    topic: current,
    guide: guide && {
      title: guide.title,
      description: guide.description,
      // a draft or an unpublished translation drops out of the path instead of breaking it
      reading: guide.reading.flatMap((slug) => {
        const post = live.get(slug)
        return post ? [summarize(post)] : []
      }),
    },
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
  const series = seriesOf(post, posts)
  // a series lists its own parts, so the topic neighbours would repeat them
  const inTopic = series.length
    ? []
    : posts.filter((p) => p.topic === post.topic)
  const at = inTopic.indexOf(post)
  const newer = inTopic[at - 1]
  const older = inTopic[at + 1]
  const shown = new Set([
    ...series.map((part) => part.slug),
    newer?.slug,
    older?.slug,
  ])
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
    terms: Object.fromEntries(
      termsIn(lang)
        .filter((term) => post.terms.includes(term.id))
        .map(({ id, term, short }) => [id, { term, short }])
    ),
  }
}

export function tagData(lang: string | undefined, tag: string | undefined) {
  const { messages } = pageData(lang, "blog")
  const posts = postsIn(lang as Locale).filter((post) =>
    post.tags.includes(tag as Tag)
  )
  if (!posts.length) throw notFound()
  return {
    messages,
    locales: tagLocales(tag as Tag),
    tag: tag as Tag,
    posts: posts.map(summarize),
  }
}

/** Every post, newest first, for the archive's month-by-month list. */
export function archiveData(lang: string | undefined) {
  const { messages, locales } = pageData(lang, "blog")
  return {
    messages,
    locales,
    posts: postsIn(lang as Locale).map(
      ({ slug, title, topic, publishedAt }) => ({
        slug,
        title,
        topic,
        publishedAt,
      })
    ),
  }
}

export function glossaryData(lang: string | undefined) {
  const { messages } = pageData(lang, "blog")
  const terms = termsIn(lang as Locale)
  if (!terms.length) throw notFound()
  return {
    messages,
    locales: glossaryLocales(),
    terms: terms.map(({ id, term, short }) => ({ id, term, short })),
  }
}

export function termData(lang: string | undefined, id: string | undefined) {
  const { messages } = pageData(lang, "blog")
  const term = termsIn(lang as Locale).find((entry) => entry.id === id)
  if (!term) throw notFound()
  return {
    messages,
    locales: termLocales(term.id),
    term,
    posts: postsIn(lang as Locale)
      .filter((post) => post.terms.includes(term.id))
      .map(summarize),
  }
}

/** Every post in the locale, for the index search, which fetches it on the first query. */
export function searchIndexData(lang: string | undefined) {
  if (!isLocale(lang) || !readyLocales("blog").includes(lang)) throw notFound()
  return featuredFirst(postsIn(lang)).map(summarize)
}

import { isLocale, type Locale } from "@workspace/i18n"
import { data } from "react-router"

import {
  featuredFirst,
  pageCount,
  postsOnPage,
  LENGTHS,
  lengthOf,
  type Tag,
  tagsOf,
  topicCounts,
  withBlogIndex,
} from "./blog/list"
import {
  glossaryPath,
  indexPagePath,
  postPath,
  tagPath,
  termPath,
  topicPath,
} from "./blog/paths"
import type { Post } from "./blog/post"
import {
  blogLocalesOf,
  guideFor,
  ogImageOf,
  posts as allPosts,
  postsIn,
  termsIn,
} from "./blog/posts.server"
import { renderFeed } from "./blog/feed"
import { relatedPosts } from "./blog/related"
import { summarize } from "./blog/search"
import { catalogReadiness, loadMessages } from "./messages.server"
import { LAYOUT_NAMESPACES, PAGES, type PageId } from "./pages"
import { SITE } from "./seo/site"

const notFound = () => data(null, { status: 404 })

const readiness = withBlogIndex(catalogReadiness, allPosts)

/** Locales the page is published in, for hreflang and the language switcher. */
const readyLocales = (id: PageId): Locale[] => readiness.get(id) ?? []

/** Who a topic's posts are written for; posts for everyone don't narrow it. */
function readersOf(
  posts: readonly Post[]
): "employers" | "candidates" | "both" {
  const audiences = new Set(posts.map((post) => post.audience))
  if (audiences.has("employers") && !audiences.has("candidates"))
    return "employers"
  if (audiences.has("candidates") && !audiences.has("employers"))
    return "candidates"
  return "both"
}

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
    locales: page === 1 ? locales : blogLocalesOf(indexPagePath(page)),
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
    locales: blogLocalesOf(topicPath(current)),
    readers: readersOf(posts),
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
    posts: posts.map(summarize),
    others:
      posts.length < THIN_TOPIC
        ? all
            .filter((post) => post.topic !== current)
            .slice(0, 3)
            .map(summarize)
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
  const link = (p: Post | undefined) => p && { slug: p.slug, title: p.title }
  const shown = new Set([newer?.slug, older?.slug])
  return {
    messages: loadMessages(lang, PAGES.blog.namespaces),
    locales: blogLocalesOf(postPath(post.slug)),
    post,
    newer: link(newer),
    older: link(older),
    related: relatedPosts(
      post,
      posts.filter((p) => !shown.has(p.slug))
    ).map(summarize),
    ogImage: ogImageOf(post.slug),
    tags: tagsOf(posts).filter((tag) => post.tags.includes(tag)),
    terms: Object.fromEntries(
      termsIn(lang)
        .filter((term) => post.terms.includes(term.id))
        .map(({ id, term, short }) => [id, { term, short }])
    ),
  }
}

export function tagData(lang: string | undefined, tag: string | undefined) {
  const { messages } = pageData(lang, "blog")
  const all = postsIn(lang as Locale)
  if (!tagsOf(all).includes(tag as Tag)) throw notFound()
  const posts = all.filter((post) => post.tags.includes(tag as Tag))
  return {
    messages,
    locales: blogLocalesOf(tagPath(tag as Tag)),
    tag: tag as Tag,
    posts: posts.map(summarize),
  }
}

export function glossaryData(lang: string | undefined) {
  const { messages } = pageData(lang, "blog")
  const terms = termsIn(lang as Locale)
  if (!terms.length) throw notFound()
  return {
    messages,
    locales: blogLocalesOf(glossaryPath),
    terms: terms.map(({ id, term, short }) => ({ id, term, short })),
  }
}

export function termData(lang: string | undefined, id: string | undefined) {
  const { messages } = pageData(lang, "blog")
  const term = termsIn(lang as Locale).find((entry) => entry.id === id)
  if (!term) throw notFound()
  return {
    messages,
    locales: blogLocalesOf(termPath(term.id)),
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

export function feedXml(lang: string | undefined) {
  if (!isLocale(lang) || !readyLocales("blog").includes(lang)) throw notFound()
  const copy = loadMessages(lang, ["blog"])[lang]?.blog as {
    meta: { name: string }
    index: { description: string }
  }
  return renderFeed(
    SITE.url,
    lang,
    { title: copy.meta.name, description: copy.index.description },
    postsIn(lang)
  )
}

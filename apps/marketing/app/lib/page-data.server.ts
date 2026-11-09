import { isLocale, type Locale } from "@workspace/i18n"
import { data } from "react-router"

import { ogImageOf } from "./blog/posts.server"
import { relatedPosts } from "./blog/related"
import {
  loadMessages,
  postLocales,
  postsIn,
  readyLocales,
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

export function blogData(lang: string | undefined) {
  const page = pageData(lang, "blog")
  return { ...page, posts: postsIn(lang as Locale) }
}

export function postData(lang: string | undefined, slug: string | undefined) {
  if (!isLocale(lang)) throw notFound()
  const posts = postsIn(lang)
  const post = posts.find((p) => p.slug === slug)
  if (!post) throw notFound()
  return {
    messages: loadMessages(lang, PAGES.blog.namespaces),
    locales: postLocales(post.slug),
    post,
    related: relatedPosts(post, posts),
    ogImage: ogImageOf(post.slug),
  }
}

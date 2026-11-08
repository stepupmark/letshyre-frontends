import { isLocale, type Locale } from "@workspace/i18n"
import { data } from "react-router"

import {
  loadMessages,
  postLocales,
  postsIn,
  readyLocales,
} from "./messages.server"
import { LAYOUT_NAMESPACES, PAGES, type PageId } from "./pages"

const notFound = () => data(null, { status: 404 })

/** Loader for the site layout. Runs at build time only. */
export function layoutData(lang: string | undefined) {
  if (!isLocale(lang)) throw notFound()
  const published = (Object.keys(PAGES) as PageId[]).filter((id) =>
    readyLocales(id).includes(lang)
  )
  return { lang, messages: loadMessages(lang, LAYOUT_NAMESPACES), published }
}

/** Loader for a page route: its copy and the locales it's published in. */
export function pageData(lang: string | undefined, id: PageId) {
  const locales = readyLocales(id)
  if (!isLocale(lang) || !locales.includes(lang)) throw notFound()
  return { messages: loadMessages(lang, PAGES[id].namespaces), locales }
}

/** Loader for the blog index: its copy plus the posts in this locale. */
export function blogData(lang: string | undefined) {
  const page = pageData(lang, "blog")
  return { ...page, posts: postsIn(lang as Locale) }
}

/** Loader for a post: the blog's copy, the post and the locales it's written in. */
export function postData(lang: string | undefined, slug: string | undefined) {
  if (!isLocale(lang)) throw notFound()
  const post = postsIn(lang).find((p) => p.slug === slug)
  if (!post) throw notFound()
  return {
    messages: loadMessages(lang, PAGES.blog.namespaces),
    locales: postLocales(post.slug),
    post,
  }
}

import { join } from "node:path"
import type { Locale } from "@workspace/i18n"
import { computeReadiness } from "@workspace/i18n/node"

import { blogBuild } from "./blog/build.ts"
import type { Term } from "./blog/glossary.ts"
import { withBlogIndex } from "./blog/list.ts"
import { blogModel } from "./blog/model.ts"
import { feedPath, searchIndexPath } from "./blog/paths.ts"
import type { Post } from "./blog/post.ts"
import { mdxFiles } from "./blog/read-posts.ts"
import type { BlogRoute } from "./blog/routes.ts"
import { PAGES, type PageId, pageNamespaces, withoutReplaced } from "./pages.ts"

export { checkTerms } from "./blog/model.ts"

const LOCALES_DIR = "app/locales"
export const BLOG_DIR = "content/blog"
export const GLOSSARY_DIR = "content/glossary"
export const GUIDES_DIR = "content/guides"
export const SERIES_DIR = "content/series"

/** Build-time only: the locales each page ships in, the posts and entries that ship, and the blog's routes. */
export function readiness(
  root: string,
  previews = false,
  date = blogBuild().date
): {
  pages: Map<PageId, Locale[]>
  posts: Post[]
  terms: Term[]
  routes: BlogRoute[]
} {
  const catalogs = withoutReplaced(
    computeReadiness({
      localesDir: join(root, LOCALES_DIR),
      pages: Object.fromEntries(
        Object.keys(PAGES).map((id) => [id, pageNamespaces(id as PageId)])
      ),
    }) as Map<PageId, Locale[]>
  )
  const { posts, terms, routes } = blogModel(
    {
      posts: mdxFiles(join(root, BLOG_DIR)),
      terms: mdxFiles(join(root, GLOSSARY_DIR)),
      // the prerender list doesn't need these, and the loaders parse them
      guides: [],
      series: [],
    },
    { previews, blogLocales: catalogs.get("blog") ?? [], date }
  )
  return { pages: withBlogIndex(catalogs, posts), posts, terms, routes }
}

/** Every `/<lang><path>` whose catalogs are complete, and every blog page. */
export function readyPaths(
  root: string,
  previews = false,
  date = blogBuild().date
): string[] {
  const { pages, routes } = readiness(root, previews, date)
  return [
    ...[...pages].flatMap(([id, locales]) =>
      locales.map((lang) => `/${lang}${PAGES[id].path}`)
    ),
    ...routes.map((route) => `/${route.lang}${route.path}`),
    ...(pages.get("blog") ?? []).flatMap((lang) => [
      `/${lang}${searchIndexPath}`,
      `/${lang}${feedPath}`,
    ]),
  ]
}

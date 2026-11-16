// Node loads this through react-router.config.ts, so no Vite-only imports. Both readers, `fs` for
// the prerender list and postbuild and `import.meta.glob` for the loaders, build the blog here.

import type { Locale } from "@workspace/i18n"

import {
  type Guide,
  parseGuide,
  parseSeries,
  parseTerm,
  type Series,
  type Term,
} from "./glossary.ts"
import { publishedPosts } from "./list.ts"
import { parsePosts, type Post } from "./post.ts"
import { type BlogRoute, blogRoutes } from "./routes.ts"

type Files = readonly (readonly [string, string])[]

interface BlogFiles {
  posts: Files
  terms: Files
  guides: Files
  series: Files
}

interface BlogModel {
  /** Newest first, in the locales whose blog copy is complete. */
  posts: Post[]
  /** Entries in the locales that have a post. */
  terms: Term[]
  guides: Guide[]
  series: Series[]
  routes: BlogRoute[]
}

/** Fails the build when a post's `<Term>` has no glossary entry in its locale. */
export function checkTerms(posts: readonly Post[], terms: readonly Term[]) {
  const known = new Set(terms.map((term) => `${term.lang}/${term.id}`))
  for (const post of posts)
    for (const id of post.terms)
      if (!known.has(`${post.lang}/${id}`))
        throw new Error(
          `content/blog/${post.slug}/${post.lang}.mdx: <Term id="${id}"> has no content/glossary/${id}/${post.lang}.mdx`
        )
}

export function blogModel(
  files: BlogFiles,
  {
    previews,
    blogLocales,
    date,
  }: {
    previews: boolean
    /** Locales whose blog copy is complete. */
    blogLocales: readonly Locale[]
    /** The UTC day the build treats as today. */
    date: string
  }
): BlogModel {
  const posts = publishedPosts(
    parsePosts(files.posts, previews, date),
    blogLocales
  )
  const langs = new Set(posts.map((post) => post.lang))
  const terms = files.terms
    .map(([file, source]) => parseTerm(file, source))
    .filter((term) => langs.has(term.lang))
  checkTerms(posts, terms)
  return {
    posts,
    terms,
    guides: files.guides.map(([file, source]) => parseGuide(file, source)),
    series: files.series.map(([file, source]) => parseSeries(file, source)),
    routes: blogRoutes(posts, terms),
  }
}

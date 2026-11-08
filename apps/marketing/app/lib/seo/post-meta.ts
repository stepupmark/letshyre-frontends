import type { Locale } from "@workspace/i18n"
import type { MetaArgs, MetaDescriptor } from "react-router"

import { type Post, postPath } from "../blog/post"
import { PAGES } from "../pages"
import { buildMeta } from "./meta"
import { metaContext } from "./page-meta"
import { blogPostingSchema, breadcrumbSchema, webPageSchema } from "./schema"
import { SITE } from "./site"

/** `meta` for a blog post, from its frontmatter. */
export function postMeta({ matches, params }: MetaArgs): MetaDescriptor[] {
  const data = matches.at(-1)?.loaderData as
    { post: Post; locales: Locale[] } | undefined
  if (!data) return []

  const { lang, t } = metaContext({ matches, params })
  const { post, locales } = data
  const path = postPath(post.slug)
  const modified = post.updatedAt ?? post.publishedAt

  return buildMeta({
    lang,
    path,
    title: `${post.metaTitle ?? post.title} | ${SITE.domain}`,
    description: post.description,
    locales,
    article: { published: post.publishedAt, modified },
    jsonLd: [
      breadcrumbSchema(lang, t("seo:homeCrumb"), [
        { name: t("blog:meta.crumb"), path: PAGES.blog.path },
        { name: post.title, path },
      ]),
      webPageSchema({
        lang,
        path,
        name: post.title,
        description: post.description,
        dateModified: modified,
      }),
      blogPostingSchema({
        lang,
        path,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: modified,
      }),
    ],
  })
}

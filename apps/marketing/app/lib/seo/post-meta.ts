import type { Locale } from "@workspace/i18n"
import type { MetaArgs, MetaDescriptor } from "react-router"

import { AUTHORS } from "../blog/authors"
import { postPath, seriesFeedPath, topicPath } from "../blog/paths"
import type { Post } from "../blog/post"
import { PAGES } from "../pages"
import { buildMeta, feedLink } from "./meta"
import { metaContext } from "./page-meta"
import { postFaqSchema } from "./blog-schema"
import { blogPostingSchema, breadcrumbSchema, webPageSchema } from "./schema"
import { SITE } from "./site"

export function postMeta({ matches, params }: MetaArgs): MetaDescriptor[] {
  const data = matches.at(-1)?.loaderData as
    | {
        post: Post
        locales: Locale[]
        ogImage?: string
        series: Pick<Post, "title">[]
      }
    | undefined
  if (!data) return []

  const { lang, t } = metaContext({ matches, params })
  const { post, locales, ogImage } = data
  const path = postPath(post.slug)
  const modified = post.updatedAt ?? post.publishedAt

  return [
    ...buildMeta({
      lang,
      path,
      title: `${post.metaTitle ?? post.title} | ${SITE.domain}`,
      description: post.description,
      locales,
      image: ogImage,
      article: { published: post.publishedAt, modified },
      jsonLd: [
        breadcrumbSchema(lang, t("seo:homeCrumb"), [
          { name: t("blog:meta.crumb"), path: PAGES.blog.path },
          { name: t(`blog:topics.${post.topic}`), path: topicPath(post.topic) },
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
          image: ogImage,
          author: post.author ? AUTHORS[post.author] : undefined,
        }),
        ...(post.faq.length ? [postFaqSchema(post.faq)] : []),
      ],
    }),
    feedLink(lang, t("blog:meta.name")),
    ...(post.series
      ? [
          feedLink(
            lang,
            data.series[0]?.title ?? post.title,
            seriesFeedPath(post.series)
          ),
        ]
      : []),
  ]
}

import type { Locale } from "@workspace/i18n"
import type { MetaArgs, MetaDescriptor } from "react-router"

import { postPath, topicPath } from "../blog/paths"
import type { Post, Topic } from "../blog/post"
import { PAGES } from "../pages"
import { buildMeta, feedLink } from "./meta"
import { metaContext } from "./page-meta"
import { breadcrumbSchema, postListSchema, webPageSchema } from "./schema"

export function topicMeta({ matches, params }: MetaArgs): MetaDescriptor[] {
  const data = matches.at(-1)?.loaderData as
    | {
        topic: Topic
        posts: Post[]
        locales: Locale[]
        guide?: { description: string }
      }
    | undefined
  if (!data) return []

  const { lang, t } = metaContext({ matches, params })
  const { topic, posts, locales } = data
  const path = topicPath(topic)
  const name = t(`blog:topics.${topic}`)
  const description =
    data.guide?.description ?? t(`blog:topicPage.description.${topic}`)

  return [
    ...buildMeta({
      lang,
      path,
      title: t("blog:topicPage.metaTitle", { topic: name }),
      description,
      locales,
      jsonLd: [
        breadcrumbSchema(lang, t("seo:homeCrumb"), [
          { name: t("blog:meta.crumb"), path: PAGES.blog.path },
          { name, path },
        ]),
        webPageSchema({
          type: "CollectionPage",
          lang,
          path,
          name,
          description,
          mainEntity: postListSchema(
            lang,
            posts.map((post) => ({
              path: postPath(post.slug),
              name: post.title,
            }))
          ),
        }),
      ],
    }),
    feedLink(lang, t("blog:meta.name")),
  ]
}

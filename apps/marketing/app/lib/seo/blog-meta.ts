import type { Locale } from "@workspace/i18n"
import type { MetaArgs, MetaDescriptor } from "react-router"

import { indexPagePath, postPath } from "../blog/paths"
import type { PostSummary } from "../blog/post"
import { PAGES } from "../pages"
import { buildMeta, feedLink } from "./meta"
import { metaContext, pageMeta } from "./page-meta"
import { breadcrumbSchema, postListSchema, webPageSchema } from "./schema"

interface IndexData {
  posts: PostSummary[]
  page: number
  locales: Locale[]
}

/** The blog index and its later pages; each page is its own canonical URL. */
export function blogIndexMeta(args: MetaArgs): MetaDescriptor[] {
  const data = args.matches.at(-1)?.loaderData as IndexData | undefined
  if (!data) return []
  const { lang, t } = metaContext(args)
  const { page } = data
  const path = indexPagePath(page)
  const collection = (name: string, description: string) =>
    webPageSchema({
      type: "CollectionPage",
      lang,
      path,
      name,
      description,
      mainEntity: postListSchema(
        lang,
        data.posts.map((post) => ({
          path: postPath(post.slug),
          name: post.title,
        }))
      ),
    })

  const meta =
    page === 1
      ? pageMeta("blog", ({ t }) => [
          collection(t("meta.name"), t("meta.description")),
        ])(args)
      : buildMeta({
          lang,
          path,
          title: t("blog:meta.pageTitle", { page }),
          description: t("blog:meta.description"),
          locales: data.locales,
          og: PAGES.blog.og,
          jsonLd: [
            breadcrumbSchema(lang, t("seo:homeCrumb"), [
              { name: t("blog:meta.crumb"), path: PAGES.blog.path },
              { name: t("blog:index.pageTitle", { page }), path },
            ]),
            collection(
              t("blog:index.pageTitle", { page }),
              t("blog:meta.description")
            ),
          ],
        })
  return [...meta, feedLink(lang, t("blog:meta.name"))]
}

import { type Locale, localePath } from "@workspace/i18n"
import type { MetaArgs, MetaDescriptor } from "react-router"

import type { Tag } from "../blog/list"
import {
  archivePath,
  glossaryPath,
  postPath,
  tagPath,
  termPath,
} from "../blog/paths"
import type { PostSummary } from "../blog/post"
import { PAGES } from "../pages"
import { buildMeta, feedLink } from "./meta"
import { metaContext } from "./page-meta"
import { definedTermSchema } from "./blog-schema"
import { breadcrumbSchema, postListSchema, webPageSchema } from "./schema"
import { absUrl } from "./site"

type WithLocales<T> = (T & { locales: Locale[] }) | undefined

const dataOf = (args: MetaArgs): unknown => args.matches.at(-1)?.loaderData

const blogCrumb = (t: ReturnType<typeof metaContext>["t"]) => ({
  name: t("blog:meta.crumb"),
  path: PAGES.blog.path,
})

export function tagMeta(args: MetaArgs): MetaDescriptor[] {
  const data = dataOf(args) as WithLocales<{ tag: Tag; posts: PostSummary[] }>
  if (!data) return []
  const { lang, t } = metaContext(args)
  const name = t(`blog:tags.${data.tag}`)
  const path = tagPath(data.tag)
  const description = t("blog:tagPage.description", { tag: name })

  return [
    ...buildMeta({
      lang,
      path,
      title: t("blog:meta.tagTitle", { tag: name }),
      description,
      locales: data.locales,
      jsonLd: [
        breadcrumbSchema(lang, t("seo:homeCrumb"), [
          blogCrumb(t),
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
            data.posts.map((post) => ({
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

export function archiveMeta(args: MetaArgs): MetaDescriptor[] {
  const data = dataOf(args) as WithLocales<object>
  if (!data) return []
  const { lang, t } = metaContext(args)
  const name = t("blog:archive.title")

  return buildMeta({
    lang,
    path: archivePath,
    title: t("blog:meta.archiveTitle"),
    description: t("blog:archive.description"),
    locales: data.locales,
    jsonLd: [
      breadcrumbSchema(lang, t("seo:homeCrumb"), [
        blogCrumb(t),
        { name, path: archivePath },
      ]),
    ],
  })
}

export function glossaryMeta(args: MetaArgs): MetaDescriptor[] {
  const data = dataOf(args) as WithLocales<{
    terms: { id: string; term: string; short: string }[]
  }>
  if (!data) return []
  const { lang, t } = metaContext(args)
  const name = t("blog:glossary.title")
  const description = t("blog:glossary.description")

  return buildMeta({
    lang,
    path: glossaryPath,
    title: t("blog:meta.glossaryTitle"),
    description,
    locales: data.locales,
    jsonLd: [
      breadcrumbSchema(lang, t("seo:homeCrumb"), [
        blogCrumb(t),
        { name, path: glossaryPath },
      ]),
      {
        ...webPageSchema({ lang, path: glossaryPath, name, description }),
        "@type": ["WebPage", "DefinedTermSet"],
        hasDefinedTerm: data.terms.map((term) => ({
          "@type": "DefinedTerm",
          name: term.term,
          description: term.short,
          url: absUrl(localePath(lang, termPath(term.id))),
        })),
      },
    ],
  })
}

export function termMeta(args: MetaArgs): MetaDescriptor[] {
  const data = dataOf(args) as WithLocales<{
    term: { id: string; term: string; short: string }
  }>
  if (!data) return []
  const { lang, t } = metaContext(args)
  const { id, term, short } = data.term
  const path = termPath(id)

  return buildMeta({
    lang,
    path,
    title: t("blog:meta.termTitle", { term }),
    description: short,
    locales: data.locales,
    jsonLd: [
      breadcrumbSchema(lang, t("seo:homeCrumb"), [
        blogCrumb(t),
        { name: t("blog:glossary.title"), path: glossaryPath },
        { name: term, path },
      ]),
      webPageSchema({ lang, path, name: term, description: short }),
      definedTermSchema({
        lang,
        path,
        glossary: glossaryPath,
        name: term,
        description: short,
      }),
    ],
  })
}

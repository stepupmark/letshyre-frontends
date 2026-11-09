import type { MetaArgs } from "react-router"

import { BlogIndexPage } from "@/features/blog"
import { blogData } from "@/lib/page-data.server"
import { feedLink } from "@/lib/seo/meta"
import { metaContext, pageMeta } from "@/lib/seo/page-meta"
import { webPageSchema } from "@/lib/seo/schema"

import type { Route } from "./+types/_site.$lang.blogs._index"

export const loader = ({ params }: Route.LoaderArgs) => blogData(params.lang)

const blogMeta = pageMeta("blog", ({ lang, t, path }) => [
  webPageSchema({
    type: "CollectionPage",
    lang,
    path,
    name: t("meta.name"),
    description: t("meta.description"),
  }),
])

export const meta = (args: MetaArgs) => {
  const { lang, t } = metaContext(args)
  return [...blogMeta(args), feedLink(lang, t("blog:meta.name"))]
}

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  return <BlogIndexPage posts={loaderData.posts} />
}

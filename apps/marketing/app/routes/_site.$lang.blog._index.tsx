import { BlogIndexPage } from "@/features/blog"
import { blogData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"
import { webPageSchema } from "@/lib/seo/schema"

import type { Route } from "./+types/_site.$lang.blog._index"

export const loader = ({ params }: Route.LoaderArgs) => blogData(params.lang)

export const meta = pageMeta("blog", ({ lang, t, path }) => [
  webPageSchema({
    type: "CollectionPage",
    lang,
    path,
    name: t("meta.name"),
    description: t("meta.description"),
  }),
])

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  return <BlogIndexPage posts={loaderData.posts} />
}

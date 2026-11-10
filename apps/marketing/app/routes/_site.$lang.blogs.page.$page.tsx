import { BlogIndexPage } from "@/features/blog"
import { blogData } from "@/lib/page-data.server"
import { blogIndexMeta } from "@/lib/seo/blog-meta"

import type { Route } from "./+types/_site.$lang.blogs.page.$page"

export const loader = ({ params }: Route.LoaderArgs) =>
  blogData(params.lang, params.page)

export const meta = blogIndexMeta

export default function BlogIndexLaterPage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <BlogIndexPage
      posts={loaderData.posts}
      page={loaderData.page}
      pages={loaderData.pages}
      topics={loaderData.topics}
    />
  )
}
